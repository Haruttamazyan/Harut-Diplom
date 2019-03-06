import { Component, Inject, BadRequestException } from '@nestjs/common';
import { Repository, EntityManager } from 'typeorm';
import {
  ICreateContactsListPayload,
  ISetContactsListBindingsPayload,
  IBindings,
  ISetContactsListBindingsResult,
  IParseRawContactsFileResult,
  IEditContactsListPayload,
  IGetContactsListsByCompanyPayload,
  IDeleteContactsPayload
} from './interfaces';
import { ContactsListEntity } from './contacts-list.entity';
import { ContactsFileEntity } from './contacts-file.entity';
import { ContactsInfoEntity } from './contacts-info.entity';

import { contactsListRepositoryToken, contactsFileRepositoryToken, contactsInfoRepositoryToken, contactsInfoEntityName, contactsFileEntityName, contactsListEntityName,oCampaignContactsListRelationName } from '../../constants';
import { CompanyEntity } from '../company/company.entity';
import {
  DuplicateBindingException,
  OutOfLimitBindingException,
  InvalidBindingTypeException,
  UnknownContactsListException,
  ParseException,
  AlreadyHasContactsException,
  UnknownContactException,
  DuplicateContactException
} from './exceptions';
import * as fs from 'fs';
import * as parse from 'csv-parse';
import { ContactService } from './modules/contact/contact.service';
import { IContact } from './modules/contact/interfaces';
import * as redis from 'redis';
import { IPromisifiedRedisClient, IPaginated,IPaginationQuery } from '../../interfaces';
import * as transform from 'stream-transform';
import { ContactsListFsService } from './contacts-list-fs.service';
//import { resolve, reject } from 'bluebird';
import { equal } from 'assert';
var bigInt = require("big-integer");

@Component()
export class ContactsListService {
  private readonly redisClient: IPromisifiedRedisClient = redis.createClient();

  constructor (
    @Inject(contactsListRepositoryToken)
    private readonly contactsListRepository: Repository<ContactsListEntity>,
    @Inject(contactsFileRepositoryToken)
    private readonly contactsFileRepository: Repository<ContactsFileEntity>,
    @Inject(contactsInfoRepositoryToken)
    private readonly contactsInfoRepository: Repository<ContactsInfoEntity>,
    private readonly contactService: ContactService,
    private readonly contactsListFsService: ContactsListFsService
  ) {}

  public async createContactsList (
    payload: ICreateContactsListPayload
  ): Promise<ContactsListEntity> {
    const contactsList = await this.contactsListRepository.save(
      this.contactsListRepository.create({
        company: new CompanyEntity({ id: payload.user.companyId }),
        contact_list_name: payload.contact_list_name
      })
    );
    delete contactsList.company;
    const filePath = await this.contactsListFsService.createFreeswitchContactsList(contactsList);   
    this.editContactsList(contactsList.id, {
      contact_file_url: filePath + ''
    });

    return contactsList;
  }

  public async ensureDoesNotHaveContacts (contactsListId: string): Promise<void> {
    if (await this.contactService.hasContacts(contactsListId)) {
      throw new AlreadyHasContactsException(contactsListId);
    }
  }

  public async editContactsList (
    id: string,
    payload: IEditContactsListPayload
  ): Promise<any> {
    if(!await this.isExistingContactsListId(id))
      throw new BadRequestException(`List with id ${id} does not exist`);
      
    await this.contactsListRepository.updateById(id, payload)
    const list:any = await this.contactsListRepository.findOneById(id);
    delete list.contact_file_count
    delete list.contact_file_column_count
    return list
  }

  public async importContactsFileIntoList(
    id: string,
    payload: IEditContactsListPayload
  ): Promise<any> {
    console.log(payload)
    if(!await this.isExistingContactsListId(id))
      throw new BadRequestException(`List with id ${id} does not exist`);
    
    const list:any = await  this.contactsListRepository.findOne({
      where: {
        id
      }
    })
   const ids =  await this.contactsListRepository.manager.connection.transaction(async manager => { 

      const contactsFile = await manager.save(
        this.contactsFileRepository.create({
          contactsList: list,
          contact_file_url: payload.contact_file_url
        })
      );
      
      const info_array = await this.parseFileToArray(payload.contact_file_url || '')
      console.log(info_array)     
      for(let j = 0; j < info_array.length; ++j) {
              
              if(info_array[j].phone_number.indexOf('E')>0){
             
              info_array[j].phone_number = bigInt(info_array[j].phone_number).toJSNumber() + '`'
            }
              for(let i = 0; i < info_array.length; ++i){
                
                if(j != i){
                  
                      if(info_array[j].phone_number == info_array[i].phone_number){
                        throw new BadRequestException(`Phone Number <<${info_array[j].phone_number}>> must be onique`,info_array[j])
                        
                      }
                    }
              }
              if(info_array[j].phone_number == ''){
                //throw new BadRequestException(`Phone Number must be not null <<${info_array[j].first_name},${info_array[j].middle_name},${info_array[j].last_name},${info_array[j].phone_number},${info_array[j].email},${info_array[j].address1},${info_array[j].address2},${info_array[j].zipcode},${info_array[j].city},${info_array[j].state},>>`)
                throw new BadRequestException(`Phone number must not be null in row ${j+1}`)
                //reject(`Phone Number must be onique`)
              } 
             /* const check = await this.contactsInfoRepository.findOne({
                where:{
                  phone_number:info_array[j].phone_number
               
                }
              })
                  if(check){
                    throw new BadRequestException(`Phone Number <<${info_array[j].phone_number}>> should be distinct`, info_array[j])
                  }*/
                    await manager.save(
                 this.contactsInfoRepository.create({
                   contactsList: list,
                   first_name: info_array[j].first_name,
                   middle_name: info_array[j].middle_name,
                   last_name: info_array[j].last_name,
                   phone_number: info_array[j].phone_number,
                   email: info_array[j].email,
                   address1: info_array[j].address1,
                   address2: info_array[j].address2,
                   zipcode: info_array[j].zipcode,
                   city: info_array[j].city,
                   state: info_array[j].state,
                   contactfile:contactsFile
                })
              );
            }  
      const allcount = list.contact_file_count + info_array.length;
      await this.editContactsList(id, {
          contact_file_count: allcount
        });
    await  this.contactsListFsService.apdateFreeswitchContactsList(info_array,id)
      return contactsFile.id
    })
    return { id : ids }
  }

  public async getContacts() {

  }

  private async isExistingContactsListId (id: string): Promise<boolean> {
    if(await this.contactsListRepository.findOne({ select: ['id'], where: { id } }))
      return true;
    else
      return false;  
  }

  private async parseFileToArray(contact_file_url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const columns = ["first_name", "middle_name", "last_name", "phone_number", "email", 
                   "address1", "address2", "zipcode", "city", "state"];
    
      require("csv-to-array")({
        file: contact_file_url,
        columns: columns
      }, function (err: any, array: any) {
       
        if(array)
          resolve(array.slice(1));
        else
          reject(err);
      });
    });
    
  }

  public uintToString(uintArray: any[]) {
    var encodedString = String.fromCharCode.apply(null, uintArray),
        decodedString = decodeURIComponent(escape(Buffer.from(encodedString, 'base64').toString()));
      
    return decodedString;
  }

  public async parseRawContactsFile (
    contact_file_url: string
  ): Promise<IParseRawContactsFileResult> {
    return new Promise<IParseRawContactsFileResult>((resolve, reject) => {
      const parser = parse();
      const contactsPreview: any[] = [];

      let count = 0;
       // console.log('test123154')
      parser.on('readable', () => {
        let record = parser.read();

        while (record) {
          if (count++ < 10) {
            contactsPreview.push(record);
          }

          record = parser.read();
        }
      });

      parser.on('finish', async () => {
        resolve({ contactsPreview, count });
      });

      parser.on('error', (error: Error) => {
        reject(new ParseException(error.message));
      });

      // Pipe data from file to parser.
      const src = fs.createReadStream(contact_file_url);

      src.on('data', chunk => {
        parser.write(chunk);
      });

      src.on('end', () => {
        parser.end();
      });

      src.on('error', () => {
        reject();
      });
    });
  }

  public async getContactsListsByCompany (
    payload: IGetContactsListsByCompanyPayload
  ): Promise<IPaginated<ContactsListEntity>> {

    const cc = await this.contactsListRepository.count({
      where:{
        company: payload.companyId
      }
    })
    const [items, count] = await this.contactsListRepository.findAndCount({
      select: ['id', 'contact_list_name', 'contact_file_count'],
      where: {
        company: payload.companyId
      },
      skip: payload.offset? payload.limit * (payload.offset):payload.offset,
      take: payload.limit
    });
    const returnObj: any = []
    
    Object.assign(returnObj, items)
    for(let i=0; i<returnObj.length; ++i){
      let contactsFileCount = returnObj[i].contact_file_count
    
      delete returnObj[i].contact_file_count
      
      returnObj[i].contact_count = contactsFileCount
      
    }

    return {items: returnObj, count:cc };
  }

  public async getContactsListByIdAndCompany (
    companyId: string,
    contactsListId: string,
    payload: IPaginationQuery
  ) {
    const contactsList = await this.contactsListRepository.findOneById(contactsListId, {
      where: {
        company: companyId
      }
      //relations: ['contacts_file', 'contacts_info']
    });

    if (!contactsList) {
      throw new UnknownContactsListException(contactsListId);
    }
    /*const contacts = await this.contactsInfoRepository.find({
      where:{
        contactsList
      }
    })*/
    console.log(payload)

    if(!payload.limit){
      console.log(2222)
      let contacts = await this.contactsInfoRepository.find({
        where:{
          contactsList
        }
      })
      return{items:contacts,count:contacts.length}
  } console.log(11111111111111)
      const cc = await this.contactsInfoRepository.count({
        where:{
          contactsList
        }
      })
  const [items, count] = await this.contactsInfoRepository.findAndCount({
      skip: payload.offset? payload.limit * (payload.offset):payload.offset,
      take: payload.limit,
      where:{
        contactsList
      }
    });
    return{items,count:cc}


    /*
    const returnObj: any = {}
    
    Object.assign(returnObj, contactsList)
    
    const contactsFileCount = contactsList.contact_file_count
    const contactsFileColumnCount = contactsList.contact_file_column_count

    delete returnObj.contact_file_count
    delete returnObj.contact_file_column_count    
    
    returnObj.contact_count = contactsFileCount
    returnObj.contact_column_count = contactsFileColumnCount
    
  

    return returnObj;*/
  }

  public async getContactsListById (
    contactsListId: string
  ): Promise<ContactsListEntity> {
    const contactsList = await this.contactsListRepository.findOneById(contactsListId);

    if (!contactsList) {
      throw new UnknownContactsListException(contactsListId);
    }

    delete contactsList.contact_file_column_count;
    contactsList.contact_count = contactsList.contact_file_count
    delete contactsList.contact_file_count

    return contactsList;
  }

  public async getContactsInfoById (
    contactsListId: string
  ): Promise<any> {
    const contactsList = await this.contactsListRepository.findOneById(contactsListId, {
      relations: ['contacts_info']
    });

    if (!contactsList) {
      throw new UnknownContactsListException(contactsListId);
    }

    return contactsList.contacts_info;
  }

  /**
   * @description This function will perform input validations, and then return
   * but remain as a closure to send events via redis and then websockets.
   */
  public async setContactsListBindings (
    payload: ISetContactsListBindingsPayload
  ) {
    const contactsList = await this.getContactsListByIdAndCompany(payload.companyId, payload.listId);

    this.validateBindings(payload.bindings, contactsList.contact_file_column_count);

    this.ensureDoesNotHaveContacts(contactsList.id);

    // Calculate these once instead of (probably) millions of times.
    const { bindings } = payload;
    const { firstName, lastName, phoneNumber, address, city, state, country, udf } = bindings;

    const hasLastName = typeof lastName === 'number';
    const hasAddress = typeof address === 'number';
    const hasCity = typeof city === 'number';
    const hasState = typeof state === 'number';
    const hasCountry = typeof country === 'number';
    const hasUdf = udf && typeof udf === 'object';
    const udfKeys = hasUdf && Object.keys(udf as object);
    const company = new CompanyEntity({ id: payload.companyId });

    const redisChannel = `contacts-list:${payload.companyId}`;

    const result: ISetContactsListBindingsResult = {
      contactsListId: contactsList.id,
      duplicate: 0,
      success: 0,
      error: 0,
      processed: 0,
      total: contactsList.contact_file_count
    };

    let messageInterval = 0;
    let roundCount = 0;

    if (contactsList.contact_file_count < 1000) {
      messageInterval = 25;
    } else
    if (contactsList.contact_file_count < 10000) {
      messageInterval = 250;
    } else
    if (contactsList.contact_file_count < 100000) {
      messageInterval = 1000;
    } else {
      messageInterval = 5000;
    }

    const src = fs.createReadStream(contactsList.contact_file_url);
    const parser = parse();

    const transformer = transform(async (record: any, callback: any) => {
      const contact: IContact = {
        firstName: record[firstName],
        phoneNumber: record[phoneNumber],
        udf: {}
      };

      if (hasLastName) {
        contact.lastName = record[lastName as any];
      }

      if (hasAddress) {
        contact.address = record[address as any];
      }

      if (hasCity) {
        contact.city = record[city as any];
      }

      if (hasState) {
        contact.state = record[state as any];
      }

      if (hasCountry) {
        contact.country = record[country as any];
      }

      if (hasUdf && udfKeys) {
        udfKeys.forEach(key => {
          (contact.udf as any)[key] = record[(udf as any)[key]];
        });
      }

      try {
        await this.contactService.createContact({
          contactsList,
          company,
          ...contact
        });
        result.success++;
      } catch (e) {
        if ((e.message as string).startsWith('duplicate')) {
          result.duplicate++;
        } else {
          result.error++;
        }
      } finally {
        if (++result.processed === result.total) {
          this.editContactsList(result.contactsListId, {
            contact_count: result.success
          });
          this.redisClient.publish(redisChannel, JSON.stringify({
            type: 'finish',
            ...result
          }));
        } else
        if (++roundCount % messageInterval === 0) {
          this.redisClient.publish(redisChannel, JSON.stringify({
            type: 'status',
            ...result
          }));
        }

        callback(null);
      }
    });

    src
      .on('error', (e) => {
        this.redisClient.publish(redisChannel, JSON.stringify({
          type: 'file-error',
          message: e.code === 'ENOENT' ? 'Contacts file does not exist' : 'Unknown error'
        }));
      })
      .pipe(parser)
      .on('error', (e: Error) => {
        this.redisClient.publish(redisChannel, JSON.stringify({
          type: 'parse-error',
          message: e.message
        }));
      })
      .pipe(transformer);
  }

  /**
   * @description Verify bindings object does not have non-numeric values
   * (only useful for udf, since other values must be validated in controller),
   * or duplicated bindings.
   */
  private validateBindings (payload: IBindings, limit: number): void {
    const values: number[] = [];

    const checkValues = (obj: any) => {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];

        // Will be true when dealing with udf
        if (typeof value === 'object') {
          checkValues(value);
        } else {
          if (typeof value !== 'number') {
            throw new InvalidBindingTypeException(key, typeof value);
          }

          if (values.includes(value)) {
            throw new DuplicateBindingException(key);
          }

          if (value < 0 || value >= limit) {
            throw new OutOfLimitBindingException(key, limit, value);
          }

          values.push(obj[key]);
        }
      });
    };

    checkValues(payload);
  }

  public async updateContact (payload: any) {
    const isExistingContact = await this.isExistingContact(
      payload.contactId
    );
    //console.log(isExistingContact)
    if (!isExistingContact) {
      throw new UnknownContactException(payload.contactId);
    }
    //console.log(payload.contact)
    if(payload.contact.phone_number){
      //console.log('---------->',payload.contact.phone_number)
      const unique = await this.contactsInfoRepository
          .createQueryBuilder('contactsInfo')
          .select()
          .where('contactsInfo.phone_number = :phone',{phone:payload.contact.phone_number})
          .andWhere('contactsInfo.id != :cont',{cont:payload.contactId})
          .getOne()
       // console.log(unique)
          if(unique){
            throw new BadRequestException(`Phone number must be unique`)
          }

    }
    try {
       await this.contactsInfoRepository.updateById(payload.contactId, payload.contact);
       return this.contactsInfoRepository.findOneById(payload.contactId)
    } catch (e) {
      if ((e.message as string).startsWith('duplicate')) {
        throw new DuplicateContactException(payload.contactsListId, payload.contact.phoneNumber as any);
      }

      throw e;
    }
  }

  public async isExistingContact (
    contactId: string
  ): Promise<boolean> {
    return !!(await this.contactsInfoRepository.findOneById(contactId));
  }


  public async deleteAll (contact_list: any) {
    await this.contactsInfoRepository
      .createQueryBuilder()
      .delete()
      .from(contactsInfoEntityName)
      .where('contactsList = :contactsList', { contactsList: contact_list })
      .execute();
    
      await this.contactsFileRepository
      .createQueryBuilder()
      .delete()
      .from(contactsFileEntityName)
      .where('contactsList = :contactsList', { contactsList: contact_list })
      .execute();
     await this.contactsListRepository.updateById(contact_list,{
        contact_file_count: 0
      })
      return this.contactsListRepository.findOneById(contact_list)
    }

    public async deleteContacts (payload: IDeleteContactsPayload) {
      await this.contactsInfoRepository
        .createQueryBuilder()
        .delete()
        .from(contactsInfoEntityName)
        .andWhere('contactsList = :contactsListId', { contactsListId: payload.contactsListId })
        .andWhereInIds(payload.contactsIds)
        .execute();
      const contacts: ContactsListEntity = await this.contactsListRepository.findOneById(payload.contactsListId)
       
    //console.log(contacts.contact_file_count, 'safdasfas', payload.contactsIds.length,'asffasf',contacts.contact_file_count - payload.contactsIds.length)
     await this.contactsListRepository.updateById(payload.contactsListId,{
        contact_file_count: contacts.contact_file_count - payload.contactsIds.length
      })
      
      return this.contactsListRepository.findOneById(payload.contactsListId)
    }
    public async getContactByListId(id1:string,id2:string){
        return  await this.contactsInfoRepository.findOne({
            where:{
              id:id2,
              contactsList:id1
            }
          })
         // return contact
    }
    public async deleteContactList(id:string){
         // console.log('iddd-->',id)
    await this.contactsListRepository.manager.connection.transaction(async manager => {
        await this.deleteontactListChildren(manager, id);
  
        await manager.createQueryBuilder()
          .delete()
          .from(contactsListEntityName)
          .where('id = :companyId', { companyId:id })
          .execute();
      });
      return {success:true}
    }
    private async deleteontactListChildren (manager: EntityManager, companyId: string) {
      // Time slot it's a dependency of both appointments config and campaign,
      // so it needs to be deleted first.
      await Promise.all([
        
        await this.deleteContactsListswithcontactId(manager,companyId),
        await this.deleteContactsListFile(manager,companyId),
        await this.deleteContactListContacts(manager,companyId)
      ]);
      return
    }

    private async deleteContactsListswithcontactId (manager: EntityManager, campaignId: string) {
      //await manager.getRepository(oCampaignContactsListRelationName).delete({contactsList})
      await  manager.createQueryBuilder()
        .delete()
        .from(oCampaignContactsListRelationName)
        .where('contactsListId = :campaignId', {campaignId: campaignId  })
        .execute();
        return
      }

      private async deleteContactsListFile (manager: EntityManager, campaignId: string) {
        await  manager.createQueryBuilder()
          .delete()
          .from(contactsFileEntityName)
          .where('contactsList = :campaignId', {campaignId: campaignId  })
          .execute();
          return
        }
        private async deleteContactListContacts (manager: EntityManager, campaignId: string) {
          await  manager.createQueryBuilder()
            .delete()
            .from(contactsInfoEntityName)
            .where('contactsList = :campaignId', {campaignId: campaignId  })
            .execute();
            return
          }

          public async updateContactsListById(id:string,name:string){
            const list:any = await this.contactsListRepository.findOneById(id)

              list.contact_list_name = name
              await this.contactsListRepository.save(list)
              return list
          }
    

}

import { Component, Inject, Post, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Fed_DncRepositoryToken, fed_dncEntityName } from '../../constants';
import { UserEntity } from '../user/user.entity'
import { FedDncEntity } from './fed_dnc.entity'
import * as fs from 'fs';
import { CONTACTS_STORAGE_PATH } from '../../config';
import { promisify } from 'util';


const readFile = promisify(fs.readFile);

const replaceAll = function(str: string, search: string, replacement: string) {
  var target = str;
  return target.replace(new RegExp(search, 'g'), replacement);
};


@Component()
export class FedDncService {
  constructor (
    @Inject(Fed_DncRepositoryToken)
    private readonly DNCRepository: Repository<FedDncEntity>

  ) {}

  public async addDnc(user:string,path:string){
    
    //const path = `${CONTACTS_STORAGE_PATH}/${campaign.id}___${contact_list.id}.json`
    const content = await readFile(path,'utf8')
      //content = replaceAll(content,'\r','')
    const array =  replaceAll(content,'\r','').split('\n')
      let res:any[] = []
      array.pop()
     // console.log(array)
      
  return   await  this.DNCRepository.manager.connection.transaction(async manager => {
       for(let i=0; i<array.length;++i){
         let fed = await manager.getRepository(fed_dncEntityName).findOne({
           number:array[i],
           user:user
         })
         console.log(fed)
         if(!fed){
      let did = new FedDncEntity()
      did.number = array[i]
      did.user = new UserEntity({id:user})
      
      res.push(await manager.save(did))
         } else{
           res.push(`number with ${array[i]} exists`)
         }
       }
       return res
    });
  }

  public async getfeds(user:string){

    return await this.DNCRepository.find({
      where:{
        user:user
      }
    })
  }

  public async deleteFed(user:string,number:string){
    const fed = await this.DNCRepository.findOne({
      where:{
        number:number,
        user:user
      }
    })
    if(!fed) throw new BadRequestException(`fed with this number ${number} does not exist`)

    await this.DNCRepository.remove(fed)
    return {success:true}
  }



}

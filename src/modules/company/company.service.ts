import { Component, Inject, forwardRef, NotAcceptableException } from '@nestjs/common';
import { companyRepositoryToken,imageRepositoryToken,companyPaymentRepositoryToken,textTTSRepositoryToken, companyEntityName,contactsFileEntityName, contactsInfoEntityName, oCampaignAppointmentsAndSalesPersonsRelationName, oCampaignCallerRelationName, oCampaignConnectedCallsAndAgentsRelationName, AppointmentsRelationName, oCampaignContactsListRelationName, companyProfileRepositoryToken, BillingPlanRepositoryToken,BillingPlanSysRepositoryToken, oCampaignRepositoryToken } from '../../constants';
import { Repository, EntityManager } from 'typeorm';
import { CompanyEntity } from './company.entity';
import { companyProfileEntity } from './compnay-profile.entity';
import { STATUS_PENDING, STATUS_ACCEPTED } from './types';
import { UserService } from '../user/user.service';
import { CompanyClass4Service } from './company.class4';
import { UserEntity } from '../user/user.entity';
import {                                    
  ICreateCompanyPayload,
  IGetCompaniesPayload,
  ISetStatusPayload
} from './interfaces';
import { IPaginated } from '../../interfaces';
import { UnknownCompanyException } from './exceptions';
import { BadRequestException } from '@nestjs/common';
import { UnacceptedCompanyException, NotACompanyAdminException, NoOverwriteException, } from '../../exceptions';
import { ROLE_SYS_ADMIN, ROLE_COMPANY_ADMIN, UserRole, ROLE_AGENT } from '../user/types';
//import { DenovolabService } from '../denovolab/denovolab.service';
import { NotASysAdminException } from '../../exceptions';
import { OCampaignQuestionEntity } from '../campaign/outbound/entities/o-campaign-question.entity';
import { OCampaignEntity } from '../campaign/outbound/entities/o-campaign.entity';
import { OCampaignOrderTakenFormEntity } from '../campaign/outbound/entities/o-campaign-order-taken-form.entity';
import { PlaybackEntity } from '../playback/playback.entity'
import { OCampaignAppointmentConfigEntity } from '../campaign/outbound/entities/o-campaign-appointment-config.entity';
import { OCampaignTimeSlotEntity } from '../campaign/outbound/entities/o-campaign-time-slot.entity';
import { OCampaignConnectedCallsConfigEntity } from '../campaign/outbound/entities/o-campaign-connected-calls-config.entity';
import { BillingPlanEntity } from '../billing-plan/billing-plan.entity'
import { BillingPlanSysEntity } from '../billing-plan/billing-plan-sys.entity';
import { ImageEntity } from '../image/image.entity'
import { companypaymentEntity } from './company-payment.entity'
import { DNL_HOST,MEDIAS_STORAGE_PATH } from '../../config'
import { SIGTERM } from 'constants';
import * as txtomp3  from 'text-to-mp3';
import { ContactsListService } from '../contacts-list/contacts-list.service';
import { textTTSEntity } from './textTTS.entity'
let mcd_helper = require('../../ws/mcdhelper');


@Component()
export class CompanyService {
  constructor (
    @Inject(companyRepositoryToken)
    private readonly companyRepository: Repository<CompanyEntity>,
    @Inject(companyProfileRepositoryToken)
    private readonly companyProfileRepository: Repository<companyProfileEntity>,
    @Inject(companyPaymentRepositoryToken)
    private readonly companyPaymentRepository: Repository<companypaymentEntity>,
    @Inject(BillingPlanRepositoryToken)
    private readonly bilingPlanRepository: Repository<BillingPlanEntity>,
    @Inject(BillingPlanSysRepositoryToken)
    private readonly bilingPlanSysRepository: Repository<BillingPlanSysEntity>,
    @Inject(textTTSRepositoryToken)
    private readonly textTTSRepository: Repository<textTTSEntity>,
    @Inject(imageRepositoryToken)
    private readonly imageRepository: Repository<ImageEntity>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    //private readonly dnlService: DenovolabService,
    @Inject(forwardRef(() => ContactsListService))
    private readonly ContactsListService:ContactsListService,

    @Inject(oCampaignRepositoryToken)
    private readonly oCampaignRepository: Repository<OCampaignEntity>,
    private readonly companyClass4Service: CompanyClass4Service
  
  ) {}

  public async create (payload: ICreateCompanyPayload){
    //console.log('data---->',payload)
    const user = await this.userService.findById(payload.company.user_uuid, {
      relations: ['company']
    });
  
    const validRoles: UserRole[] = [ROLE_SYS_ADMIN, ROLE_COMPANY_ADMIN];

    if (!validRoles.includes(user.role)) {
      throw new NotACompanyAdminException();
    }

    if (user.company) {
      throw new NoOverwriteException('company');
    }

    const company = await this.companyRepository.manager.transaction(async manager => {
      // Create the company row first to ensure there are no issues with the values.
      const company = await manager.save(
        CompanyEntity,
        manager.create(CompanyEntity, {
          ...payload.company,
          owner: new UserEntity({ id: payload.company.user_uuid }),
          status: STATUS_PENDING,
          dnl_client_id: 0,
          reseller: ''
        })
        
      );

      await manager.save(
        companyProfileEntity,
        manager.create(companyProfileEntity, {
          ...payload.company,
          first_name:user.first_name,
          last_name:user.last_name,
          company: company 
        })
        
      );

        delete company.object_id

      return company;
    });
    await this.sendMail(user.email, 'congrats !! company has been created successfully')

    return {company: company, user:user}
  }

  public async setCompanyObjectId(companyId: string, objectId: number) {
    return await this.companyRepository.updateById(companyId, {
      object_id: objectId
    });
  }

  public async getAll (payload: IGetCompaniesPayload, user: any): Promise<IPaginated<CompanyEntity>> {

   await this.userService.ensureIsSystemAdmin(
      await this.userService.findById(user.id)
    )

    const query = this.companyRepository.createQueryBuilder('company')
      .skip(payload.offset)
      .take(payload.limit);

    const conditions = [];
    const params: any = {};

    if (payload.status) {
      conditions.push('status = :status');
      params.status = payload.status;
    }

    if (payload.range.from) {
      conditions.push('created >= :from');
      params.from = payload.range.from;
    }

    if (payload.range.to) {
      conditions.push('created <= :to');
      params.to = payload.range.to;
    }

    if (conditions.length) {
      query.where(conditions.join(' AND '));
      query.setParameters(params);
      
    }
    query.leftJoinAndSelect('company.owner','ownerId');
    const [items, count] = await query.getManyAndCount();
     //const countL = payload.limit?payload.limit:count
    return { items,count: payload.limit?payload.limit< count?payload.limit:count:count };
  }

  public async setStatus (payload: ISetStatusPayload) {
    this.userService.ensureIsSystemAdmin(
      await this.userService.findById(payload.userId)
    );
    
    const company:any = await this.companyRepository.findOneById(payload.companyId,{
      relations:['owner']
    })
   // console.log(company)
        if(company.status === STATUS_ACCEPTED){
          throw new BadRequestException(`Company with Id ${payload.companyId} status also is ${STATUS_ACCEPTED}, you can not change it`)
        }
    //console.log('owner--->',company.owner.email)
     await this.companyRepository.updateById(payload.companyId, {
      status: payload.status,
      Registered_On:new Date()
    });
    await this.sendMail(company.owner.email,`your company status changed ${payload.status}`)
    return {status: 'success'}
  }

  public async findCompanyById (id: string): Promise<CompanyEntity> {
    const company = await this.companyRepository.findOne({
      where: {
        id
      }
    });

    if (!company) {
      throw new UnknownCompanyException();
    }

    return company;
  }

  public async ensureIsAccepted (id: string) {
    const company = await this.findCompanyById(id);

    if (company.status !== STATUS_ACCEPTED) {
      throw new UnacceptedCompanyException(company.id, company.status);
    }

    return company;
  }

  public async deleteCompany (
    user: any,
    companyId: string
  ) {
    //console.log(user, companyId)
    
    if(user.role != ROLE_SYS_ADMIN){
    const owner = await this.userService.findById(user.id, {
      relations: ['company']
    });

    await this.userService.ensureCanPerformCompanyAction({
      user,
      action: 'deleteCompanes'
    });
    
   // await this.oCampaignService.getCampaignIdsByCompanyId(companyId)

    if (owner.company.id !== companyId) {
      throw new BadRequestException("User can't delete company");
    }
  }
    await this.companyRepository.manager.connection.transaction(async manager => {
      await this.deleteCompanyChildren(manager, companyId);

      await manager.createQueryBuilder()
        .delete()
        .from(companyEntityName)
        .where('id = :companyId', { companyId })
        .execute();
    });
    return {success:true}
  }

  public async deleteCompanyWithUserRole (
    user: any,
    manager:EntityManager,
    companyId:string
  ) {
        const company:any = await manager.getRepository('company').findOne({
          where:{
            id:companyId
          },
          relations:['owner']
        })
        if(!company){
          return
        }
    
      await this.deleteCompanyChildren(manager, company.id);

      await manager.createQueryBuilder()
        .delete()
        .from(companyEntityName)
        .where('id = :companyId', { companyId: company.id })
        .execute();
    
    return {success:true}
  }

  private async deleteCompanyChildren (manager: EntityManager, companyId: string) {
    // Time slot it's a dependency of both appointments config and campaign,
    // so it needs to be deleted first.
    await this.deleteCampaigns(manager,companyId),
    
    
    await Promise.all([
      
      await this.deletePlan(companyId),
     await this.deleteContact_list(manager,companyId),
     await this.deleteRecording(manager,companyId),
     await this.deleteCompanyProfile(manager,companyId),
     await this.deletePlayback(manager,companyId),
     await this.deleteUser(companyId,manager)
    ]);
  }

  private async deleteContact_list(manager: EntityManager, companyId: string){
      const contacts:any = await manager.getRepository('contactsList')
      .createQueryBuilder("contactsList")
      .select()
      .where('contactsList.company = :campaignId', { campaignId: companyId })
      .getMany();
     // console.log(contacts.length)
      if(contacts.length){
        for(let i=0; i<contacts.length;++i){
          //  console.log('testststst')
            await this.ContactsListService.deleteContactList(contacts[i].id)
        }
       
      }
    /*await manager.createQueryBuilder()
      .delete()
      .from('contactsList')
      .where('company = :companyId', { companyId })
      .execute();*/
      return
  }


  private async deleteRecording(manager: EntityManager, companyId: string){
    await manager.createQueryBuilder()
      .delete()
      .from('recording')
      .where('company = :companyId', { companyId })
      .execute();
  }
  private async deletePlayback(manager: EntityManager, companyId: string){
    await manager.createQueryBuilder()
      .delete()
      .from('playback')
      .where('company = :companyId', { companyId })
      .execute();
  }

  private async deleteCompanyProfile(manager: EntityManager, companyId: string){
    await manager.createQueryBuilder()
      .delete()
      .from('companyProfile')
      .where('company = :companyId', { companyId })
      .execute();
  }

  private async deleteCampaigns(manager: EntityManager, companyId: string){
      const campaigns:any[] = await manager
      .getRepository(OCampaignEntity)
      .createQueryBuilder("outboundCampaign")
      .where("outboundCampaign.company = :id", { id: companyId })
      .getMany();
      //console.log("campaign",campaigns)

        for(let i=0; i<campaigns.length; ++i){
         
      await this.deleteCampaign(manager,campaigns[i].id)
     };
     return
       
      
  }


  public async deleteCampaign (
    manager: EntityManager,
     campaignId : string
  ) {
      await this.deleteCampaignChildren(manager, campaignId);
      await manager.createQueryBuilder()
        .delete()
        .from(OCampaignEntity)
        .where('id = :campaignId', { campaignId })
        .execute();
    
    return {success:true}
  }

  private async deleteCampaignChildren (manager: EntityManager, campaignId: string) {
    // Time slot it's a dependency of both appointments config and campaign,
    // so it needs to be deleted first.
    await this.deleteTimeSlots(manager, campaignId);
    await  this.deleteAppointmentsConfig(manager, campaignId),
    await  this.deleteQuestions(manager, campaignId),
    await  this.deleteContactsLists(manager, campaignId),
    await  this.deleteCaller(manager,campaignId),
    await  this.deleteConnectedCallsConfig(manager, campaignId),
    await  this.deleteOrderTakenForm(manager, campaignId),
    await  this.deletePlaybacks(manager, campaignId),
    await  this.deleteAppointment(manager, campaignId)
    
  }

  private async deleteCaller (manager: EntityManager, campaignId: string) {
    await manager.createQueryBuilder()
      .delete()
      .from(oCampaignCallerRelationName)
      .where('outboundCampaignId = :campaignId', { campaignId })
      .execute();
  }

  private async deleteOrderTakenForm (manager: EntityManager, campaignId: string) {
   
    await manager.createQueryBuilder()
      .delete()
      .from(OCampaignOrderTakenFormEntity)
      .where('campaign = :campaignId', { campaignId })
      .execute();
  }

  private async deleteAppointment (manager: EntityManager, campaignId: string) {
    
    await manager.createQueryBuilder()
      .delete()
      .from(AppointmentsRelationName)
      .where('campaign = :campaignId', { campaignId })
      .execute();
  }

  private async deleteContactsLists (manager: EntityManager, campaignId: string) {
    await manager.createQueryBuilder()
      .delete()
      .from(oCampaignContactsListRelationName)
      .where('outboundCampaignId = :campaignId', { campaignId })
      .execute();
  }

  private async deleteQuestions (manager: EntityManager, campaignId: string) {
    await manager.createQueryBuilder()
      .delete()
      .from(OCampaignQuestionEntity)
      .where('campaign = :campaignId', { campaignId })
      .execute();
  }

  private async deletePlaybacks (manager: EntityManager, campaignId: string) {
    await manager.createQueryBuilder()
      .delete()
      .from(PlaybackEntity)
      .where('campaign = :campaignId', { campaignId })
      .execute();
  }

  private async deleteAppointmentsConfig (manager: EntityManager, campaignId: string) {
    const appointmentsConfigId = (await manager.findOne(OCampaignAppointmentConfigEntity, {
      where: {
        campaign: campaignId
      }
    }) as any);

    if(appointmentsConfigId && appointmentsConfigId.hasOwnProperty('id')) {
      await manager.createQueryBuilder()
      .delete()
      .from(oCampaignAppointmentsAndSalesPersonsRelationName)
      .where('outboundCampaignAppointmentsConfigId = :id', { id: appointmentsConfigId.id })
      .execute();
    }

    await manager.createQueryBuilder()
      .delete()
      .from(OCampaignAppointmentConfigEntity)
      .where('campaign = :campaignId', { campaignId })
      .execute();
  }

  private async deleteTimeSlots (manager: EntityManager, campaignId: string) {
    await manager.createQueryBuilder()
      .delete()
      .from(OCampaignTimeSlotEntity)
      .where('campaign = :campaignId', { campaignId })
      .execute();
  }

  private async deleteConnectedCallsConfig (manager: EntityManager, campaignId: string) {
    const connectedCallsConfig:any = await manager.find(OCampaignConnectedCallsConfigEntity, {
      where: {
        campaign: campaignId
      }
    });
    //console.log('conf---------->',connectedCallsConfig)

    if (!connectedCallsConfig) {
      return;
    }

    await manager.createQueryBuilder()
      .delete()
      .from(oCampaignConnectedCallsAndAgentsRelationName)
      .where('outboundCampaignConnectedCallsConfigId IN (:id)', { id: connectedCallsConfig.map((e:any) =>{return e.id}) })
      .execute();

     // await manager.getRepository(OCampaignConnectedCallsConfigEntity).deleteById(connectedCallsConfig.id)

      await manager.createQueryBuilder()
      .delete()
      .from(OCampaignConnectedCallsConfigEntity)
      .where('id IN (:id)', { id: connectedCallsConfig.map((e:any) =>{return e.id}) })
      .execute();
    /*await manager.createQueryBuilder()
      .delete()
      .from(OCampaignConnectedCallsConfigEntity)
      .where('id = :id', { id: connectedCallsConfig.id })
      .execute();*/
     
      return
  }

  public async updateCompany( 
    user: any,
    companyId: string,
    company: any ){

    const owner = await this.userService.findById(user.id, {
      relations: ['company']
    });    

    await this.userService.ensureCanPerformCompanyAction({
      user: user,
      action: 'updateCompanes'
    });

    if (!owner.company && owner.role != "system-admin") {
      throw new BadRequestException(`this User with id:${user.id} don't have Company`);
    }
      if( owner.role != "system-admin"){
        if (owner.company.id !== companyId) {
          throw new BadRequestException("User can't update company");
        }
      }

    
      
    return this.companyRepository.updateById(companyId, company);
  }
  public async getCompanyProfile(companyId:string){
        const company:any = await this.companyRepository.findOneById(companyId,{
          relations:['bilingPlan', 'bilingPlanSys','owner']
        })
         // console.log(company)
         //const plan =  await this.getCompanyBilingPlan(companyId)
         //console.log(plan)
       const profile:any =   await this.companyProfileRepository.findOne({
          where:{company}
        })
        profile.owner = company.owner
        if(!profile)
        throw new BadRequestException(`this Company don't have Profile`);
        profile.billing_plan = company.bilingPlanSys?company.bilingPlanSys:company.bilingPlan?company.bilingPlan:[]
        profile.SIP_IP = DNL_HOST
        return profile

  }


  public async updateCompanyProfile(companyId:string, data:any){
    
    const company = await this.companyRepository.findOneById(companyId)
        const profile:any = await this.companyProfileRepository.findOne({
          where:{company}
        })
          if(data.avatar_Id){
      const avatar:any = await this.imageRepository.findOneById(data.avatar_Id)
         // console.log('avatart--->',avatar)
          delete data.avatar_Id
          await this.companyProfileRepository.updateById(profile.id, {...data,avatar:avatar.url})
          }else{
            await this.companyProfileRepository.updateById(profile.id, {...data})
          }

       
        const com = data
         delete com.city
        // console.log('-->',com,Object.keys(com).length)
         if(Object.keys(com).length){
          await this.companyRepository.updateById(companyId,com);
         }
        //await this.companyRepository.updateById(companyId,data)
        

         //console.log('dad2',updateDate)
        return 
  }

  public async AssignBilingPlan(id1:string,id2:string){
  
    const company:any = await this.companyRepository.findOneById(id1,
    {
      relations:['owner']
    })
    if(!company){
      throw new BadRequestException(`this Company with id:${id1} does not exist`);
    }
      
    const aa = JSON.parse(JSON.stringify(company.owner))
    if(aa.reseller_uuid ){
      const ss:any =  await this.bilingPlanRepository.findOne({
        where:{
          company
        },
        relations:['company']
      })
      if(ss){
      
         ss.company = null
         ss.assigned_on = null
         await this.bilingPlanRepository.save(ss)
      }
      const plan:any = await this.bilingPlanRepository.findOneById(id2)
      if(!plan){
        throw new BadRequestException(`this Plan with id:${id2} does not exist in Billing Plan table`);
      }

      plan.company = company
      plan.assigned_on = new Date()
   const plans =   await this.bilingPlanRepository.save(plan)
        
    return plans
    /*{ "assigned_on": new Date(),
    "company_uuid":id1,
    "billing_plan_uuid":id2
    }*/
  } else {
   const ss:any =  await this.bilingPlanSysRepository.findOne({
     where:{
       company
     },
     relations:['company']
   })
   if(ss){
   
      ss.company = null
      ss.assigned_on = null
      await this.bilingPlanSysRepository.save(ss)
   }
    const plan:any = await this.bilingPlanSysRepository.findOneById(id2)
    //console.log('asfdasfas',plan)
      if(!plan){
        throw new BadRequestException(`this Plan with id:${id2} does not exist in Billing Plan System table`);
      }

      plan.company = company
      plan.assigned_on = new Date() 

  const plans =   await this.bilingPlanSysRepository.save(plan)
    return plans
    /* { "assigned_on": new Date(),
    "company_uuid":id1,
    "billing_plan_sys_uuid":id2
    }*/


  }

  }

  public async getCompanyBilingPlan(id:string){
    const plan:any = await this.companyRepository.findOneById(id,{
      relations:['owner']
    })
    if(!plan){
      throw new BadRequestException(`this Company with id:${id} does not exist`);
    }

    const aa = JSON.parse(JSON.stringify(plan.owner))

    if(aa.reseller_uuid){
     const res:any =  await this.userService.getresellerUser(aa.reseller_uuid)
   return   await this.bilingPlanRepository.find({
     where:{
      belongsTo: res.id
     }
   })
    } else{
      return await this.bilingPlanSysRepository.find({})
    }
  }

  public async getCompanyBilingPlanbyId(user_id:string,id:string){
    const plan:any = await this.companyRepository.findOneById(user_id,{
      relations:['owner']
    })
    if(!plan){
      throw new BadRequestException(`this Company with id:${user_id} does not exist`);
    }
    const aa = JSON.parse(JSON.stringify(plan.owner))

    if(aa.reseller_uuid){
   return   await this.bilingPlanRepository.findOneById(id)
    } else{
      return await this.bilingPlanSysRepository.findOneById(id)
    }
  }

  public async deletePlan(id:string){
    const company:any = await this.companyRepository.findOneById(id,
    {
      relations:['owner']
    })
    //console.log(company)
    if(!company){
      throw new BadRequestException(`this Company with id:${id} does not exist`);
    }
    if(company.owner){
    const aa = JSON.parse(JSON.stringify(company.owner))
    if(aa.reseller_uuid ){
      const plan:any = await this.bilingPlanRepository.findOne({
        where:{
          company:company
        }
      })
     // console.log(plan)
      if(!plan){
        return
      }

      plan.company = null
      plan.assigned_on = null

    await this.bilingPlanRepository.save(plan)

    return
  } else {

    const plan:any = await this.bilingPlanSysRepository.findOne({
      where:{
        company:company
      }
    })
    //console.log(plan)
      if(!plan){
        return
      }
      plan.company = null
      plan.assigned_on = null

    await this.bilingPlanSysRepository.save(plan)

    return


  }
}else return

  }


  public async deleteUser(id:string,manager:EntityManager){
    const company:any = await this.companyRepository.findOneById(id,
    {
      relations:['users']
    })
    if(!company){
      throw new BadRequestException(`this Company with id:${id} does not exist`);
    }
    if(!company.users.length)
      return
    /*const aa = JSON.parse(JSON.stringify(company.owner))
    company.ownerId = null
    manager.save(company)*/
      for (let i=0; i< company.users.length; ++i){
    await this.userService.deleteCompanyfromUser(company.users[i],manager)
  }
    //await this.userService.deleteCompanyfromUser(aa.id,manager)
      return

  }

      public async finduser(id:string){


        return await this.userService.findById(id)
      }

  private async sendMail(email:string,sub:string){
    const sgMail = require('@sendgrid/mail');

   sgMail.setApiKey(process.env['SENDGRID_API_KEY']);


   const msg = {
     to: email,
     from: 'noreply@extremedialer.com',
     subject: `${sub}`,
     text: `${sub}`,
     //html: `congrats !! company has been created successfully html`,
   };
    // console.log('msg send',email)
   sgMail.send(msg)
  }

  public async getCompanyWithOwner(id:string){
    return await this.companyRepository.findOneById(id,{
      relations:['owner']
    })
  }
  

  public async getCompanyRecords (start_time: any, end_time: any, campaign_uuid: any = null, user: any) {
    try {
     // console.log("start_time",start_time);
     // console.log("end_time",end_time);
     // console.log("campaign_uuid",campaign_uuid);
     // console.log("userID", user.id);

      // let verifyToken = await authHelper.getCompaignIdFromAdminToken(req.headers["token"]);
      // await list.isUserAdmin(verifyToken);

      // if(!this.isValidDate(start_time) || !this.isValidDate(end_time)) {
      //   throw new BadRequestException(`Please insert correct start and end date. Date should be in format yyyy-mm-dd and should be valid date.`);
      // }

      // start_time = await this.parseTimeIntoMS(start_time);
      // end_time = await this.parseTimeIntoMS(end_time);
      //console.log("parsedTime", start_time, end_time);

      let company_id = user.companyId;
      // let campaign:any = await this.getDnlIngressByCampaignUUID(company_id, campaign_uuid);
      // console.log("dnl_ingress_id", campaign.dnl_ingress_id)
      
      // let token = await class4.getTokenClass4From15ServerCallback();
      // const class4:any = await this.companyClass4Service.endpointRecord(start_time, end_time, campaign.dnl_ingress_id);
        

      //const class4: any = await this.FreeSwitchService.endpointRecord(start_time, end_time, campaign.dnl_ingress_id);
      //console.log('calss4-->',class4);

      const rec = await mcd_helper.Record(start_time, end_time, campaign_uuid);
      //console.log('rec-->',rec);
      const callsCount = await mcd_helper.CallMandeForOutbound(user.id);
      //console.log('callsCount-->', callsCount);
      const minutesSum = await mcd_helper.MinutesForOutbound(user.id);
      //console.log('minutesSum-->', minutesSum);
      const workedToday = await mcd_helper.WorkedToday(user.id);
      //console.log('workedToday-->', workedToday);
      
      // let start_time = await db_actions.parseTimeIntoMS(req.params.start_time);
      // let end_time = await db_actions.parseTimeIntoMS(req.params.end_time);

      // let response = await class4.endpointRecordCallback(start_time, end_time, token, dnl_ingress_id);
      // return res.status(200).json({response: response})

      return rec

    } catch (err) {
      // return 
    }
  };

  public async getDnlIngressByCampaignUUID (company_id: string, campaign_uuid: string) {
    // const company = this.companyRepository.findOneById(company_id);
    return await this.oCampaignRepository.findOne({
      where: {
        id: campaign_uuid,
        company:company_id
      }
    });
  };

  private isValidDate(dateString: string): boolean {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if(!dateString.match(regEx)) return false;  // Invalid format
    var d = new Date(dateString);
    if(!d.getTime() && d.getTime() !== 0) return false; // Invalid date
    return d.toISOString().slice(0,10) === dateString;
  }

  private async parseTimeIntoMS (time: any) {
    let date = new Date(time);
    return await date.getTime() / 1000;
  };


  public async getCompanyDashboard(id:string,start:string,end:string,hour:number,month:boolean){

    const start_date =new Date(start) //await this.parseTimeIntoMS(start);
    const end_date = new Date(end) //await this.parseTimeIntoMS(end)
    //console.log('hour--->',hour)
    const campaigns = await this.oCampaignRepository.find({
      where:{
        company:id
       }
    })
    //console.log('campaigns-->',campaigns)
    if(!campaigns.length) throw new BadRequestException(`You dont have campaign`)
    const mcdArray = await this.getCampaingStartResponsesFromCampaigns(campaigns)
    let response:any[] = []
    let asenq
    if(month){
    while(end_date.getTime() >= start_date.getTime()){
     // console.log('+')
      let data = new Date(start_date)
     start_date.setHours(start_date.getHours() + hour)
      asenq = await mcd_helper.totalCallsTest(mcdArray,data.toISOString(),start_date.toISOString())
      response.push({
        "start_time":data.toUTCString(),
        "end_time": start_date.toUTCString(),
        ...asenq
      })
      //start_date.setHours(start_date.getHours() - hour)
    }
    } else {
      while(end_date.getTime() >= start_date.getTime()){
        //console.log('+')
        let data = new Date(start_date)
        start_date.setMonth(start_date.getMonth() + hour)
        asenq = await mcd_helper.totalCallsTest(mcdArray,data.toISOString(),start_date.toISOString())
        response.push({
          "start_time":data.toUTCString(),
        "end_time": start_date.toUTCString(),
          ...asenq
        })
        //start_date.setMonth(start_date.getMonth() + hour)
      }

    }
    /*start_date.setHours(start_date.getHours() + hour)
    const test = await mcd_helper.totalCallsTest(mcdArray,start_date.toISOString())*/
    //console.log('array-->',end_date)
   
    return response
  }

  private async  getCampaingStartResponsesFromCampaigns(campaigns:any[]) {
    let row = '';
    if (campaigns.length !== 0) {
      await campaigns.forEach((campaign) => {
        row += `'${campaign.MCD_id}',`
      });
      return row.slice(0, row.length - 1)
    }
    return row;
  }

  private async  getAgentSipUsernameResponsesFromCampaigns(agents:any[]) {
    let row = '';
    if (agents.length !== 0) {
      await agents.forEach((agent) => {
        row += `'user/${agent.sipUsername}',`
      });
      return row.slice(0, row.length - 1)
    }
    return row;
  }

  public async getCompanyTop(id:string,top:string){
    
    if(top == 'agent'){
      const agents = await this.userService.findMany({
        where:{
          role: ROLE_AGENT,
          company_users:id
        }
      })
     // console.log('agents-->',agents)
      const agent_row = await this.getAgentSipUsernameResponsesFromCampaigns(agents)

    const topAgents:any = await mcd_helper.gettopAgents(agent_row)

    for(let i =0; i<topAgents.length;++i){
      topAgents[i].agent = await this.userService.findOneforhavayi({
        where:{
          sipUsername:topAgents[i].connected_to_agent_url.substring(5,topAgents[i].connected_to_agent_url.length)
        }
      })
    }
    return topAgents
  } else{

    const campaign = await this.oCampaignRepository.find({
      where:{
        company:id
       }
    })
    //console.log('campaigns-->',campaigns)
    if(!campaign.length) throw new BadRequestException(`You dont have campaign`)
    const mcdArray = await this.getCampaingStartResponsesFromCampaigns(campaign)
    //console.log('array-->',mcdArray)

    const topCampaigns:any = await mcd_helper.getTopCampaigns(mcdArray)


    for(let i =0; i<topCampaigns.length;++i){
      topCampaigns[i].campaign = await this.oCampaignRepository.findOne({
        where:{
          MCD_id:topCampaigns[i].campaign_uuid
        }
      })
    }
    return topCampaigns
  }

  }


  public async addPayment(id:string,payload:any){
    const company = await this.companyRepository.findOneById(id)
    //console.log(company)
    const class4:any = await this.companyClass4Service.addPaymentClass4(company,payload)
    //console.log('class4-->',class4.object_id)
   
   /* const payment = new companypaymentEntity()

    payment.company = id
    payment.amount = payload.amount
    payment.note = payload.note
    payment.paid_on = new Date()
    payment.payment_type = payload.payment_type*/
    const companysss = await this.companyRepository.manager.transaction(async manager => {
      // Create the company row first to ensure there are no issues with the values.
      const company = await manager.save(
        companypaymentEntity,
        manager.create(companypaymentEntity, {
          ...payload,
          company: new UserEntity({ id: id })
        })
        
      );

      return company;
    });
    

     //await this.companyPaymentRepository.save(payload)

     return {
       ...companysss,class4
     }
  }

  public async getPayment (id:string){

    return await this.companyPaymentRepository.find({
      where:{
        company:id
      }
    })

  }

  public async getBalance(id:string){
    const company:any = await this.companyRepository.findOneById(id,{
      relations:['owner']
    })
   // console.log(company)
        const res = await mcd_helper.getBalanceFromC4(company.object_id)
    return res //await this.companyClass4Service.getBalance(company.id,company.owner)

  }

  public async allAgentCampaigns(companyId:string, agent_id:string){
     const campaign_ids = await this.userService.getCampaignAssignedAgents(companyId,agent_id)

     //console.log('ids--->',campaign_ids)
     const unique = [...new Set(campaign_ids)]
    //console.log('unique ids--->',unique)
     const campaigns = await this.oCampaignRepository.findByIds(unique,{
       where:{
         company:companyId
       }
     })

     return campaigns

     
  }

  public async allUnassignedAgentCampaigns(companyId:string, agent_id:string){
    const campaign_ids = await this.userService.getCampaignAssignedAgents(companyId,agent_id)

    
    /*const campaigns = await this.oCampaignRepository.findByIds(campaign_ids,{
      where:{
        company:companyId
      }
    })*/
    const unique = [...new Set(campaign_ids)]
    //console.log('unique ids--->',unique)

    const campaigns:any = await this.oCampaignRepository
       .createQueryBuilder('outboundCampaign')
       .select()
       .where("outboundCampaign.id NOT IN (:confIds)",{confIds:unique})
       .andWhere("outboundCampaign.company = :id",{id:companyId})
       .getMany();

    return campaigns

    
 }

 public async textToTTS (company_id:string,payload:any){
   const textTTS = new textTTSEntity();
    textTTS.Created_By = new CompanyEntity({id:company_id})
    textTTS.status = payload.status
     await this.textTTSRepository.save(textTTS)

  const mp3path = await txtomp3.saveMP3(payload.text, `${MEDIAS_STORAGE_PATH}/${textTTS.id}.mp3`).then(function(absoluteFilePath:any){ 
    console.log("File saved :", absoluteFilePath); //"File saved : /home/enrico/WebstormProjects/textToMp3/FileName.mp3"
    return absoluteFilePath
  })
  .catch(function(err){
    console.log("Error", err);
    throw new BadRequestException(err)
  });
  textTTS.path = mp3path
  await this.textTTSRepository.save(textTTS)

  return textTTS

 }
}


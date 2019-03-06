import { Component, Inject, BadRequestException, BadGatewayException } from '@nestjs/common';
import {
  oCampaignRepositoryToken,
  oCampaignConnectedCallsAndAgentsToken,
  oCampaignConnectedCallsConfigToken,
  oCampaignAppointmentsConfigToken,
  oCampaignConnectedSalesToken,
  oCampaignConnectedMediaToken,
  oCampaignConnectedDNCToken,
  didRepositoryToken,
  userRepositoryToken,
  answerRepositoryToken,
  recordingRepositoryToken,
  contactsListRepositoryToken,
  oCampaignAppointmentsAndSalesPersonsRelationName,
  oCampaignConnectedCallsAndAgentsRelationName,
  oCampaignAppointmentsConfigRelationName,
  oCampaignContactsListRelationName,
  oCampaignQuestionRelationName,
  questionRepositoryToken,
  didEntityName,
  playbackRepositoryToken,
  AppointmentsRelationName,
  oCampaignCallerRelationName,
  oCampaignTimeSlotEntityName,
  oCampaignEntityName
} from '../../../constants';
import { Repository, EntityManager } from 'typeorm';
import { OCampaignEntity } from './entities/o-campaign.entity';
import { ContactsListEntity } from '../../contacts-list/contacts-list.entity';
import { OCampaignQuestionEntity } from './entities/o-campaign-question.entity';
import { OCampaignAnswerEntity } from './entities/o-campaign-answer.entity';
import { OCampaignAppointmentConfigEntity } from './entities/o-campaign-appointment-config.entity';
import { UserEntity } from '../../user/user.entity';
import { OCampaignTimeSlotEntity } from './entities/o-campaign-time-slot.entity';
import { OCampaignOrderTakenFormEntity } from './entities/o-campaign-order-taken-form.entity';
import { OCampaignConnectedSalesEntity } from './entities/o-campaign-connected-sales.entity';
import { OCampaignConnectedMediaEntity } from './entities/o-campaign-connected-media.entity';
import { OCampaignConnectedDNCEntity } from './entities/o-campaign-connected-dnc.entity'
import {
  IQuestion,
  IAppointmentsConfig,
  ITimeSlot,
  IOrderTakenForm,
  IConnectedCallsConfig,
  IConnectedCallsAndAgentsConfig,
  IConnectedSalesConfig,
  IDeleteOutboundCampaignPayload,
  IGetOutboundCampaignsPayload,
  ICreateOutboundCampaignPayload,
  IOutboundCampaign,
  IUpdateOutboundCampaignPayload,
  IJoinContactsListToOutboundCampaignPayload,
  IJoinQuestionToOutboundCampaignPayload,
  IAnswer
} from './interfaces';
import { OCampaignConnectedCallsConfigEntity } from './entities/o-campaign-connected-calls-config.entity';
import { OCampaignConnectedCallsAndAgentsEntity } from './entities/o-campaign-connected-calls-and-agents.entity';
import { CompanyEntity } from '../../company/company.entity';
import { UserService } from '../../user/user.service';
import { RecordingEntity } from '../../recording/recording.entity';
import { IPaginated } from '../../../interfaces';
import { UnknownCampaignException } from './exceptions';
import { OCampaignFsService } from './o-campaign-fs.service';
//import { DenovolabService } from '../../denovolab/denovolab.service';
import { CompanyService } from '../../company/company.service';
//import { AgentEntity } from '../../user/agent.entity';
import {getConnection} from "typeorm";
import { CampaignClass4Service } from "./o-campaign.class4";
import { STATUS_NEW, STATUS_STARTED, STATUS_PAUSED, STATUS_DONE,STATUS_STOPED } from './types/campaign-status';
import { signToken } from '../../../utilities/jwt';
import { DidEntity } from '../../user/did.entity';
import { PlaybackEntity } from '../../playback/playback.entity'
var csv = require('csv-array');
//import { CAMPAIGNS_JSON_PATH,DNL_HOST } from '../../../config';
import * as fs from 'fs';
import { ROLE_AGENT, ROLE_SALES } from '../../user/types';
let mcd_helper = require('../../../ws/mcdhelper')



@Component()
export class OCampaignService {
  constructor (
    @Inject(oCampaignRepositoryToken)
    private readonly oCampaignRepository: Repository<OCampaignEntity>,
    
    @Inject(oCampaignConnectedCallsAndAgentsToken)
    private readonly oCampaignConnectedCallsAndAgentsRepository: Repository<OCampaignConnectedCallsAndAgentsEntity>,    
    
    @Inject(oCampaignConnectedCallsConfigToken)
    private readonly oCampaignConnectedCallsConfigRepository: Repository<OCampaignConnectedCallsConfigEntity>,    
    
    @Inject(oCampaignAppointmentsConfigToken)
    private readonly oCampaignAppointmentsConfigRepository: Repository<OCampaignAppointmentConfigEntity>,

    @Inject(oCampaignConnectedSalesToken)
    private readonly oCampaignConnectedSalesRepository: Repository<OCampaignConnectedSalesEntity>,

    @Inject(oCampaignConnectedMediaToken)
    private readonly oCampaignConnectedMediaRepository: Repository<OCampaignConnectedMediaEntity>,

    @Inject(oCampaignConnectedDNCToken)
    private readonly oCampaignConnectedDncRepository: Repository<OCampaignConnectedDNCEntity>,

    @Inject(userRepositoryToken)
    private readonly userRepository: Repository<UserEntity>,

    @Inject(recordingRepositoryToken)
    private readonly recordingRepository: Repository<RecordingEntity>,
    
    @Inject(didRepositoryToken)
    private readonly didRepository: Repository<DidEntity>,

    @Inject(contactsListRepositoryToken)
    private readonly contactsListRepository: Repository<ContactsListEntity>,

    @Inject(questionRepositoryToken)
    private readonly questionRepository: Repository<OCampaignQuestionEntity>,

    @Inject(answerRepositoryToken)
    private readonly answerRepository: Repository<OCampaignAnswerEntity>,

    @Inject(playbackRepositoryToken)
    private readonly playbackRepository: Repository<PlaybackEntity>,

    private readonly userService: UserService,
    private readonly oCampaignFsService: OCampaignFsService,
    //private readonly dnlService: DenovolabService,
    private readonly companyService: CompanyService,
    private readonly campaignClass4Service: CampaignClass4Service
  ) {}

  public async createOutboundCampaign (
    payload: ICreateOutboundCampaignPayload
  ): Promise<OCampaignEntity> {
    console.log(payload)
    await this.userService.ensureCanPerformCompanyAction({
      user: payload.user,
      action: 'createOutboundCampaigns'
    });

    try {
      return await this.oCampaignRepository.manager.connection.transaction(async manager => {
        const newCampaign = this.getBaseCampaign(payload.user.companyId as string, payload.campaign);
        
      
       /* const userToken = signToken({
          id: payload.user.id,
          role: payload.user.role
        })*/
        await manager.save(newCampaign);
       
        const company = await this.companyService.findCompanyById(payload.user.companyId as string);
        const DNL:any = await this.campaignClass4Service.campaignClass4(newCampaign, company);
            
              newCampaign.prefix = DNL.prefix
              newCampaign.dnl_ingress_id = DNL.class4.object_id
              
            await manager.save(newCampaign);
        
        await this.createCampaignRelations(manager, payload.campaign, newCampaign);
       
        delete newCampaign.company;
        return {
          ...newCampaign,
          calss4_response:DNL.class4
        };
      });
    } catch (e) {
      this.checkIsFkViolation(e);

      throw e;
    }
  }

  public async isExistingAgentId (id: string): Promise<boolean> {
    if(await this.userRepository.findOne({ select: ['id'], where: { id } }))
      return true;
    else
      return false;
  }

  public async getAgentsOfCampaign(campaignId: string, companyId: string): Promise<UserEntity[]> {
    const campaign = await this.oCampaignRepository.findOneById(campaignId,{
      relations:['connectedCallsConfig']
    });
    
    if(!campaign)
      throw new UnknownCampaignException(campaignId);

    const agents: any = await this.userRepository.find({
      where: {
        role: ROLE_AGENT,
        company_users: companyId
      }
    })
    
    const realtion = campaign.connectedCallsConfig.find((item)=> (item.action === 'direct-to-agent'))
    
    if(!realtion){
      
      return agents.map((item:any) => {
        item.assign_to_campaign = false
        return item
      })
    }

      const conf = await this.oCampaignConnectedCallsAndAgentsRepository.find({
        select:['userId'],
        where:{
          outboundCampaignConnectedCallsConfigId:realtion.id
        }
      })
     
      const conf_array = conf.map(e => e.userId)
      

      const res =  agents.map( (item: any) => {
        if (conf_array.includes(item.id)) {
          console.log(item)
          item.assign_to_campaign = true
          return item
        } else {
          item.assign_to_campaign = false
          return item
        }

        //return item
      })
      return res
  }


  public async getAssignedAgentsOfCampaign(id:string,comanyId:string){

    const campaign = await this.oCampaignRepository.findOneById(id,{
      where:{
        company:comanyId
      },
      relations:['connectedCallsConfig']
    });


    if(!campaign)
      throw new UnknownCampaignException(id);

      const rel = await this.oCampaignConnectedCallsAndAgentsRepository.find({
        where:{
          campaignId:id
        }
      })
      const agentIds = await rel.map((e:any) =>{return e.userId})
console.log(agentIds)
      return await this.userRepository.findByIds(agentIds,{
        where:{
          company_users:comanyId
        }
      })



  }

  public async getUnassignedAgentsOfCampaign(campaignId: string,user:string): Promise<UserEntity[]> {
    //console.log('campaignnnnnn', campaignId)
    const campaign  = await this.oCampaignRepository.findOneById(campaignId,{
      relations:['connectedCallsConfig','company']
    });

   
    if(!campaign)
      throw new UnknownCampaignException(campaignId);

    let all: any[] = await this.oCampaignConnectedCallsConfigRepository
                          .createQueryBuilder('outboundCampaignConnectedCallsConfig')
                          .leftJoinAndSelect('outboundCampaignConnectedCallsConfig.campaign', 'campaignId')
                          .getMany();

    all = await all.map(elem => {
      if(elem.campaign.id === campaignId)
        return elem;
    });
   
    let confIds = await all.map(elem => {
      if(elem)
        return elem.id;
      else
        return;
    });   
    confIds = await confIds.filter(function(e){return e});
    const agents = await this.oCampaignConnectedCallsAndAgentsRepository
        .createQueryBuilder('outboundCampaignConnectedCallsAndAgents')
        .where("outboundCampaignConnectedCallsAndAgents.outboundCampaignConnectedCallsConfigId IN (:confIds)", {confIds})
        .getMany();

        
    if(agents.length == 0) 
    return await this.userRepository
    .createQueryBuilder('user')
    .select()
    .where('user.role = :company',{company :'agent'})
    .andWhere('user.belongsTo = :user',{user})
    .getMany();
    
      
    const onlyUnique = (value: any, index: any, self: any) => { 
      return self.indexOf(value) === index;
    }
   
    let agentIds: any[];

    agentIds = agents.map(elem => {
      if(elem)
        return elem.userId;
    });

    agentIds = agentIds.filter(onlyUnique);
  
    return this.userRepository
      .createQueryBuilder('user')
      .select()
      .where('user.id NOT IN (:agentIds)', {agentIds})
      .andWhere('user.role = :company',{company :'agent'})
      .andWhere('user.belongsTo = :user',{user})
      .getMany();
  }

  private cleanArray(actual: any) {
    var newArray = new Array();
    for (var i = 0; i < actual.length; i++) {
      if (actual[i]) {
        newArray.push(actual[i]);
      }
    }
    return newArray;
  }

  public async getSalesOfCampaign(campaignId: string,comanyId:string): Promise<any> {
    const campaign = await this.oCampaignRepository.findOneById(campaignId);
    
    if(!campaign)
      throw new UnknownCampaignException(campaignId);

      const sales = await this.userRepository.find({
        where:{
          role:ROLE_SALES,
          company_users:comanyId
        }
      })
     // console.log('sales--->',sales)

   const all = await this.oCampaignConnectedSalesRepository.find({
     where:{
       outboundCampaignId:campaignId
     },
    relations:['sales']
  }) 
  if(all.length == 0){
    return sales.map((item:any) =>{
      item.assign_to_campaign = false
      return item
    }) 
  }
 // console.log('sales_conf-->',all)
  const conf_array = all.map(e => e.sales.id)
  //console.log('conf_array--->',conf_array)
    
    return     sales.map((item:any) =>{
      if(conf_array.includes(item.id)){
        item.assign_to_campaign = true
        return item
      }
      item.assign_to_campaign = false
      return item
    })   //allSales ? allSales : [];
  }

  public async getUnassignedSalesOfCampaign(campaignId: string): Promise<any> {
    const campaign = await this.oCampaignRepository.findOneById(campaignId);
    
    if(!campaign)
      throw new UnknownCampaignException(campaignId);

    let salesIds: any = await this.oCampaignConnectedSalesRepository.find({
      where: {
        outboundCampaignId: campaignId
      },
      relations:['sales']
    });
    salesIds = salesIds ? salesIds.map((item: any) => {
      return item.sales.id
    }) : null;
   
    const all = await this.userService.getUnssignedSalesbyIds(salesIds)

    return  all ? all : [];
  }
  


  public async assignAgentToOutboundCampaign (
    payload: string[],
    campaignID: string,
    user:string
  ) {
    const campaign = await this.oCampaignRepository.findOneById(campaignID,{
      relations:['connectedCallsConfig']
    });
    //console.log(campaign)
    if(!campaign){
      throw new UnknownCampaignException(campaignID);
    }
    const tt:any[] = []
    var config: any;
    if(!campaign.connectedCallsConfig.find((item)=>{return item.action == 'direct-to-agent'})){
      const connectedCallsConfig = new OCampaignConnectedCallsConfigEntity();
    connectedCallsConfig.action = 'direct-to-agent';

        connectedCallsConfig.campaign = campaign;
       
    await this.oCampaignRepository.manager.connection.transaction(async manager => { 
        config = await manager.save(connectedCallsConfig);
    });
    } else config = campaign.connectedCallsConfig.find((item)=>{return item.action == 'direct-to-agent'})
    for(let i=0; i<payload.length; ++i){
    
        
    if(!await this.userService.isExistingAgentId(payload[i])) {
      throw new BadRequestException(`Agent with this id ${payload[i]} does not exist`);
    }
    const agent:any = await this.userRepository.findOneById(payload[i])

    
    /*await this.oCampaignFsService.joinFreeswitchAgent(campaign,agent.sipUsername)
    .then(async (res)=>{*/
      
   tt[i] =    await this.oCampaignConnectedCallsAndAgentsRepository.manager.connection.transaction(async manager => {
    const conftest = await manager.getRepository(oCampaignConnectedCallsAndAgentsRelationName).findOne({
        where:{
          userId : payload[i],
          campaignId:campaignID
        }
    }) 
    if(conftest){
      return conftest
    }else{
    const connectedAgentsConfig = new OCampaignConnectedCallsAndAgentsEntity();
      connectedAgentsConfig.userId = payload[i]
      connectedAgentsConfig.outboundCampaignConnectedCallsConfigId = config.id;
      connectedAgentsConfig.belongsTo = user
      connectedAgentsConfig.campaignId = campaignID
      //connectedAgentsConfig.MCD_uuid = `${res}`

      return await manager.save(connectedAgentsConfig);
    }
    });
    delete tt[i].id
    tt[i].agent_id = tt[i].userId
    delete tt[i].userId
    delete tt[i].outboundCampaignConnectedCallsConfigId
    tt[i].campaign_id = campaignID

    /*})
    .catch((err)=>{
      throw new BadGatewayException(err)
    })*/
    
  }
    return tt
  }

  public async importMediaFileToCampaign(file: any,campaignID: string) {
    

    const campaign = await this.oCampaignRepository.findOneById(campaignID);
    
    if(!campaign)
      throw new UnknownCampaignException(campaignID);

    this.oCampaignConnectedMediaRepository.manager.connection.transaction(async manager => {
      const connectedMedia = new OCampaignConnectedMediaEntity();
      connectedMedia.campaign_id = campaignID
      connectedMedia.media_file_url = file.path;

      return await manager.save(connectedMedia);
    });
  }

  public async importDNCFileToCampaign(file: any, 
    campaignID: string) {
    const campaign = await this.oCampaignRepository.findOneById(campaignID);
    
    if(!campaign)
      throw new UnknownCampaignException(campaignID);

  return  await this.oCampaignConnectedDncRepository.manager.connection.transaction(async manager => {
      const connectedDnc = new OCampaignConnectedDNCEntity();
      connectedDnc.campaign_id = campaignID
      connectedDnc.dnc_file_url = file.path;

      return await manager.save(connectedDnc);
    });
  }

  public async getCampaignDNCFiles(campaignID: string) {
    const campaign = await this.oCampaignRepository.findOneById(campaignID);
    
    if(!campaign)
      throw new UnknownCampaignException(campaignID);
      

    return await this.oCampaignConnectedDncRepository.find({
        where: {
          campaign_id: campaignID
        }
      })
    
  }

  public async getCampaignMediaFiles(campaignID: string) {
    const campaign = await this.oCampaignRepository.findOneById(campaignID);
    
    if(!campaign)
      throw new UnknownCampaignException(campaignID);

    return this.oCampaignConnectedMediaRepository.find({
      where: {
        campaign_id: campaignID
      }
    })
  }

  public async joinContactsListToOutboundCampaign(
    payload: IJoinContactsListToOutboundCampaignPayload,
    campaignID: string): Promise<void> {
      
    try {
      return await this.oCampaignRepository.manager.connection.transaction(async manager => {
        const relation = await manager
          .getRepository(oCampaignContactsListRelationName)
          .query(`
            SELECT * FROM "outboundCampaignContactsList"
            WHERE "outboundCampaignId"='${campaignID}' AND "contactsListId"= '${payload.contactsListId}'`);

        if(relation.length) {
          throw new BadRequestException(`Relation already exists.`);
        } 
        const campaign = await this.oCampaignRepository.findOne({
          relations: ['contactsLists'],
          where: {
            id: campaignID
          }
        });
        
        
        if(!campaign)
          throw new UnknownCampaignException(campaignID);

        const contactsList = await this.contactsListRepository.findOne({
          where: {
            id: payload.contactsListId
          },
          relations: ['contacts_file','contacts_info']
        });

        if(!contactsList)
          throw new BadRequestException(`Contacts list with this id ${payload.contactsListId} does not exist`);

     return   await this.oCampaignFsService.joinFreeswitchContactsList(campaign, contactsList ? contactsList : '')
      .then(async (lead_id)=>{
        //console.log('resr-->',lead_id)
        await this.oCampaignRepository.updateById(campaignID,{
          lead_id:lead_id.toString()
        })
        
         
               /*
         campaign.contactsLists.push(contactsList);
       
         const contactsListIds = campaign.contactsLists.map(item => {
           return item.id;
         });*/
         
         /*await manager.createQueryBuilder()
           .delete()
           .from(oCampaignContactsListRelationName)
           .where("outboundCampaignId = :campaignId", {campaignId: campaignID})
           .execute();*/
           await manager.createQueryBuilder()
                 .insert()
                  .into(oCampaignContactsListRelationName)
                 .values({
                  outboundCampaignId: campaignID,
                   contactsListId: payload.contactsListId
                 })
                 .execute();
        
        return {'success':true, "lead_id":lead_id}
      })
      .catch((err)=>{
        throw new BadRequestException(err)
      })
      
      });
    } catch (e) {
      this.checkIsFkViolation(e);

      throw e;
    }
  }


  public async unassignContactsListToOutboundCampaign(payload:IJoinContactsListToOutboundCampaignPayload,campaign_id:string){
    try {

      return await this.oCampaignRepository.manager.connection.transaction(async manager => {
      const campaign = await this.oCampaignRepository.findOneById(campaign_id);

      if(!campaign)
          throw new UnknownCampaignException(campaign_id);

          const contactsList = await this.contactsListRepository.findOne({
            where: {
              id: payload.contactsListId
            },
            relations: ['contacts_file','contacts_info']
          });
  
          if(!contactsList)
            throw new BadRequestException(`Contacts list with this id ${payload.contactsListId} does not exist`);

          const relation = await manager
          .getRepository(oCampaignContactsListRelationName)
          .query(`
            SELECT * FROM "outboundCampaignContactsList"
            WHERE "outboundCampaignId"='${campaign_id}' AND "contactsListId"= '${payload.contactsListId}'`);

        if(!relation.length) {
          throw new BadRequestException(`Relation does not exists.`);
        } 

        

          await manager.createQueryBuilder()
          .delete()
          .from(oCampaignContactsListRelationName)
          .where('outboundCampaignId = :campaignId', { campaignId:campaign_id })
          .andWhere('contactsListId = :contactId',{contactId:payload.contactsListId})
          .execute();

          return {success:true} 


      })
    } catch (e) {
      this.checkIsFkViolation(e);

      throw e;
    }
  }

  public async GetUnassignContactsListToOutboundCampaign(id:string,companyId:string){
    return await this.oCampaignRepository.manager.connection.transaction(async manager => { 
      const campaign = await this.oCampaignRepository.findOneById(id,{
          where:{
            company:companyId
          }
      });

      if(!campaign)
          throw new UnknownCampaignException(id);

          const relation = await manager
          .getRepository(oCampaignContactsListRelationName)
          .query(`
            SELECT * FROM "outboundCampaignContactsList"
            WHERE "outboundCampaignId"='${id}'`);
          console.log(relation)

          const ids = await relation.map((e:any) =>{return e.contactsListId})
          console.log(ids)
          return await manager
          .getRepository('contactsList')
          .createQueryBuilder('contactsList')
          .select()
          .where("contactsList.id NOT IN (:confIds)",{confIds:ids})
          .andWhere("contactsList.company = :id",{id:companyId})
          .getMany();

    })
  }

  public async joinQuestionToOutboundCampaign(
    payload: IJoinQuestionToOutboundCampaignPayload,
    campaignID: string,
    user:any
    ) {

    try {
      const campaign = await this.oCampaignRepository.findOneById(campaignID);

      if(!campaign)
          throw new UnknownCampaignException(campaignID);

      const question = new OCampaignQuestionEntity();
      
      if(campaign)
        question.campaign = campaign;

      question.label = payload.label;
      question.label_default = payload.label_default;
      question.type = payload.type
      
      if(payload.choices)
        question.choices = payload.choices

      var ques: any;

      await this.questionRepository.manager.connection.transaction(async manager => {
             ques =   await manager.save(question);
      });
         
      let tt: any = await this.questionRepository.findOneById(ques.id);
      tt.campaign_id = campaignID;
      delete tt.campaign;
      delete tt.label_default;
      tt.company_id = user.companyId
        
      return tt
    } catch (e) {
      this.checkIsFkViolation(e);

      throw e;
    }
  }

  public async getQuestionOfOutboundCampaign(campaignID: string,userId:string): 
    Promise<OCampaignQuestionEntity[]> {
    const campaign = await this.oCampaignRepository.findOneById(campaignID);
    
    if(!campaign)
      throw new UnknownCampaignException(campaignID);

    const questions = await this.questionRepository.find({
      where: {
        campaign
      }
    })

    questions.map(item => {
      item.campaign_id = campaignID;
      item.question = item.label? item.label: item.label_default;
      item.userId = userId;
      item.question_type = item.type;
      const id = item.id
      
      delete item.id;
      item.question_uuid = id;
      
      delete item.type;
      delete item.label;
      delete item.label_default;
      return item
    })

    return questions
  }

  public async postAnswerOutboundCampaign(payload: IAnswer, company_id:string) {
    const questions:any = await this.questionRepository.findOne({
      where: {
       id: payload.question_uuid
      },
      relations:['campaign']
    })
  
    const answer = new OCampaignAnswerEntity()

    if(!await this.ifExistingQuestionId(payload.question_uuid)) {
      throw new BadRequestException(`Question with id ${payload.question_uuid} does not exist.`);      
    }

    answer.question_uuid = payload.question_uuid
    answer.answer = payload.answer
   
    var ans:any = await this.answerRepository.save(answer)
    ans.question = questions.label;
    ans.campaign_id = questions.campaign.id
    ans.company_id = company_id
    return ans
  }

  public async getAnswersOfOutboundCampaign(campaignID: string,company_id:string) {
    const campaign = await this.oCampaignRepository.findOneById(campaignID);
    
    if(!campaign)
      throw new UnknownCampaignException(campaignID);

    const questions = await this.questionRepository.find({
      where: {
        campaign
      }
    })

    const question_ids: string[] = questions.map(item => item.id)

    const answer:any = await this.answerRepository
      .createQueryBuilder('answer')
      .where("answer.question_uuid IN (:ids)", { ids: question_ids })
      .getMany()
     const res:any =  answer.map((item:any) =>{
        questions.map((e:any)=>{
          if(item.question_uuid == e.id){
            item.question = e.label;
            item.campaign_id = campaignID;
            item.company_id = company_id;
            return
          } else 
          return
        })
        return item

     })
     return res
  }

  public async joinCallerToOutboundCampaign(
    callerID: string,
    campaignID: string): Promise<DidEntity[]> {     
    try {
      const campaign = await this.oCampaignRepository.findOne({
        relations: ['callerIds'],
        where: {
          id: campaignID
        }
      });
      
      if(!campaign)
        throw new UnknownCampaignException(campaignID);

      const dids = await this.didRepository.findOne({
        where: {
          id: callerID
        }
      });

      if(!dids)
        throw new BadRequestException(`Caller with this id ${callerID} does not exist`);


      return await this.oCampaignRepository.manager.connection.transaction(async manager => {
        const relation = await manager
          .getRepository(oCampaignCallerRelationName)
          .query(`
            SELECT * FROM "outboundCampaignCaller"
            WHERE "outboundCampaignId"='${campaignID}' AND "didId"= '${callerID}'`);

        if(relation.length) {
          throw new BadRequestException(`Relation already exists.`);
        } 

          await manager.createQueryBuilder()
                .insert()
                 .into(oCampaignCallerRelationName)
                .values({
                 outboundCampaignId: campaignID,
                  didId: callerID
                })
                .execute();
       
       return {'success':true}
      });
    } catch (e) {
      this.checkIsFkViolation(e);

      throw e;
    }
  }

  public async deleteQuestion(questionId: string) {
    if(!await this.ifExistingQuestionId(questionId))
      throw new BadRequestException(`Question with this id ${questionId} does not exist`);

    await this.questionRepository.deleteById(questionId);

    return { "status": "success" };
  }

  public async joinSalesToOutboundCampaign (
    payload: string[],
    campaignID: string,
    user: string
  ): Promise<any> {
    
    const campaign = await this.oCampaignRepository.findOneById(campaignID);
    
    if(!campaign)
      throw new UnknownCampaignException(campaignID);
      const result :any[]=[]
      //console.log('length-------->',payload.length)
    for(let i=0; i<payload.length; ++i){
      //console.log('iddd-------->',payload[i])
    if(!await this.userService.isExistingSalesId(payload[i])) {
      throw new BadRequestException(`Sales person with this id ${payload[i]} does not exist`);
    }

    const connectedSales = new OCampaignConnectedSalesEntity();
    
    connectedSales.outboundCampaignId = campaignID;
    connectedSales.sales = new UserEntity({ id: payload[i] });
    connectedSales.belongsTo = user

    const row = await this.oCampaignConnectedSalesRepository.findOne({
      where: {
        outboundCampaignId: connectedSales.outboundCampaignId,
        sales: connectedSales.sales
      }
    });
    //console.log('row---->',row)
      
    if(row) {
      throw new BadRequestException(`Sales person with id ${payload[i]} is already joined to this campaign`);
    } else {
       result[i] = await  this.oCampaignConnectedSalesRepository.manager.connection.transaction(async manager => {
        return await manager.save(connectedSales);
      });
    }
    delete result[i].id
  }
    return result;
  }

  public async unassignAgentFromCampaign(
    payload: string[],
    campaignID: string) {
      //console.log('asf',payload)
      const campaign = await this.oCampaignRepository.findOneById(campaignID)
      if(!campaign) throw new BadRequestException(`Campaign with this id ${campaignID} does not exist`)
      let all: any[] = await this.oCampaignConnectedCallsConfigRepository
    .createQueryBuilder('outboundCampaignConnectedCallsConfig')
    .leftJoinAndSelect('outboundCampaignConnectedCallsConfig.campaign', 'campaignId')
    .getMany();

    const confIds = all.map(elem => {
      if(elem.campaign.id === campaignID)
        return elem.id;
    });
    //var agents:any[] = []
      for(let k = 0; k<payload.length; k++){
        const agent = await this.userRepository.findOneById(payload[k])
      if(!agent) throw new BadRequestException(`Agent with this id ${payload[k]} does not exist`)
       const Conf = await this.oCampaignConnectedCallsAndAgentsRepository
      .createQueryBuilder('outboundCampaignConnectedCallsAndAgents')
      .where("outboundCampaignConnectedCallsAndAgents.outboundCampaignConnectedCallsConfigId IN (:confIds)", {confIds})
      .andWhere("outboundCampaignConnectedCallsAndAgents.userId = :userId", {userId: payload[k]})
      .getOne();
      if(!Conf){
        throw new BadRequestException(`Realtion with this agent Id ${payload[k]} does not exist`)
      }
      if(Conf.MCD_uuid) throw new BadRequestException(`Agent with this id ${payload[k]} already joined please leave`)
       await this.oCampaignConnectedCallsAndAgentsRepository.deleteById(Conf.id)
      
    }
    //console.log('agents-->',agents)
  /*    for (let i = 0; i<agents.length;++i){
            await this.oCampaignFsService.leaveFreeswitchAgent(campaign,agents[i].agent.sipUsername)
            .then(async (data)=>{
              return await this.oCampaignConnectedCallsAndAgentsRepository.deleteById(agents[i].conf.id)//remove(agents[i].Conf);
            })
            .catch((err)=>{
              throw new BadRequestException(err)
            })
      }*/

   return {success:true}
  }

  public async leaveAgentFromCampaign(id:string,agentId:string){
    const agent_user:any = await this.userRepository.findOneById(agentId)

    const campaign = await this.oCampaignRepository.findOneById(id,{
      relations:['connectedCallsConfig']
    })

    if(!campaign) throw new BadRequestException(`Campaign with this id ${id} does not exist`)
    
    const confing:any = campaign.connectedCallsConfig

    const realtion:any = await this.oCampaignConnectedCallsAndAgentsRepository
        .createQueryBuilder('outboundCampaignConnectedCallsAndAgents')
        .where("outboundCampaignConnectedCallsAndAgents.outboundCampaignConnectedCallsConfigId = :confIds", {confIds:confing.find((item:any)=>{return item.action == 'direct-to-agent'}).id})
        .andWhere("outboundCampaignConnectedCallsAndAgents.userId = :id",{id:agentId})
        .getOne();

       // console.log('agentRelation--->',realtion)

        if(!realtion) throw new BadRequestException(`this user isn't assigned to campaign with id ${id}`)

      if(!realtion.MCD_uuid){
        throw new BadRequestException(`You haven't join to this campaign`)
      }
        
      await this.oCampaignFsService.leaveFreeswitchAgent(campaign,agent_user.sipUsername)
              .then(async (data)=>{
                realtion.MCD_uuid = null
                   return await this.oCampaignConnectedCallsAndAgentsRepository.save(realtion)//remove(agents[i].Conf);
              })
               .catch((err)=>{
                  throw new BadRequestException(err)
               })

               return {success:true}
  }

  public async startCampaign(campaignID: string) {
    const campaign:OCampaignEntity = await this.oCampaignRepository.findOneById(campaignID)
    const response:any = await this.oCampaignFsService.startFreeswitchCampaign(campaign.MCD_id)
    .then(async (response)=>{
      console.log('service start->',response)
        //if(response.success){
      await this.oCampaignRepository
        .createQueryBuilder('outboundCampaign')
        .update(OCampaignEntity)
        .set({ status: STATUS_STARTED})
        .where("id = :id", { id: campaignID})
        .execute();
       // }
      
        return  response //this.oCampaignRepository.findOneById(campaignID)
    })
    .catch((err)=>{
      console.log('start errr',err)
        throw new BadGatewayException(err)
    })
    return response
    
  }

  public async stopCampaign(campaignID: string) {
    const campaign:OCampaignEntity = await this.oCampaignRepository.findOneById(campaignID)
    const response:any = await this.oCampaignFsService.stopFreeswitchCampaign(campaign.MCD_id)
      .then(async (response:any)=>{
        // console.log(response.toString())
        if(response.success){
        await this.oCampaignRepository
        .createQueryBuilder('outboundCampaign')
        .update(OCampaignEntity)
        .set({ status: STATUS_STOPED})
        .where("id = :id", { id: campaignID})
        .execute();
        }

    return response   //this.oCampaignRepository.findOneById(campaignID)
   })
   .catch((err)=>{
     throw new BadGatewayException(err)
   })
    
    
   return response
  }

  public async pauseCampaign(campaignID: string) {
    const campaign:OCampaignEntity = await this.oCampaignRepository.findOneById(campaignID)
    const response:any = await this.oCampaignFsService.pauseFreeswitchCampaign(campaign.MCD_id)
        .then(async (response:any)=>{
          if(response.success){
          await this.oCampaignRepository
        .createQueryBuilder('outboundCampaign')
        .update(OCampaignEntity)
        .set({ status: STATUS_PAUSED})
        .where("id = :id", { id: campaignID})
        .execute();
          }
    
      return response  //this.oCampaignRepository.findOneById(campaignID)
   })
   .catch((err)=>{
    throw new BadGatewayException(err)
  })
  return response
  }

  public async changeAgentStatusInCampaign(
    payload: IConnectedCallsAndAgentsConfig,
    status: 'hold' | 'unhold', 
    campaignID: string): Promise<any> {
    const campaign  = await this.oCampaignRepository.findOneById(campaignID);
    
    if(!campaign)
      throw new UnknownCampaignException(campaignID);

    let all: any[] = await this.oCampaignConnectedCallsConfigRepository
    .createQueryBuilder('outboundCampaignConnectedCallsConfig')
    .leftJoinAndSelect('outboundCampaignConnectedCallsConfig.campaign', 'campaignId')
    .getMany();

    const confIds = all.map(elem => {
      if(elem.campaign.id === campaignID)
        return elem.id;
    });
    
    let agents: any[] = await this.oCampaignConnectedCallsAndAgentsRepository
        .createQueryBuilder('outboundCampaignConnectedCallsAndAgents')
        .where("outboundCampaignConnectedCallsAndAgents.outboundCampaignConnectedCallsConfigId IN (:confIds)", {confIds})
        .andWhere("outboundCampaignConnectedCallsAndAgents.userId = :userId", {userId: payload.agentId})
        .getMany();

    agents.forEach(elem => {
      elem.status = status;
    });

    return await this.oCampaignConnectedCallsAndAgentsRepository.save(agents);
  } 

  private checkIsFkViolation (error: any) {
    // 23503 means foreign key violation.
    if (error.code !== '23503') {
      return;
    }

    const [, property = '', id = ''] = /\((.*)\)=\((.*)\)/.exec(error.detail) || [];
    throw new BadRequestException(`Unknown id "${id}" in property "${property}".`);
  }

  public async updateOutboundCampaign (
    payload: IUpdateOutboundCampaignPayload
  ) {
    await this.userService.ensureCanPerformCompanyAction({
      user: payload.user,
      action: 'editOutboundCampaigns'
    });

    const { campaignId } = payload;
    const data = payload.campaign

    try {

      return await this.oCampaignRepository.manager.connection.transaction(async manager => {
        const campaign:OCampaignEntity = await manager.getRepository(oCampaignEntityName).findOneById(campaignId,{
          where:{
            company:payload.user.companyId
          }
        })
        console.log(campaign)
        await this.deleteCampaignChildrenforUpdateCampaign(manager, campaignId, payload.campaign);

       /* const baseCampaign = this.getBaseCampaign(payload.user.companyId as string, payload.campaign);
        baseCampaign.id = campaignId;*/
        if(data.name) campaign.name = data.name
        if(data.strategy) campaign.strategy = data.strategy
        if(data.script) campaign.script = data.script
        if(data.callRatio) campaign.callRatio = data.callRatio
        if(data.breakTimeBetweenCalls) campaign.breakTimeBetweenCalls = data.breakTimeBetweenCalls
        if(data.type) campaign.type = data.breakTimeBetweenCalls



       

      // const baseCampaign =  await manager.updateById(OCampaignEntity, campaignId, payload.campaign);
      //const baseCampaign = await this.oCampaignRepository.updateById(campaignId,payload.campaign)
      const baseCampaign = await manager.save(campaign)
      console.log('new campaign--->',campaign)

        await this.createCampaignRelations(manager, payload.campaign, baseCampaign,true);

        
        delete baseCampaign.company;

        return baseCampaign;
      });

      //  await this.oCampaignRepository.updateById(campaignId, payload.campaign);
      //  return await this.oCampaignRepository.findOneById(campaignId);
    } catch (e) {
      this.checkIsFkViolation(e);

      throw e;
    }
  }

  public async getCampaignAppointment(id: string): Promise<any> {
    return await this.oCampaignAppointmentsConfigRepository
      .createQueryBuilder('outboundCampaignAppointmentsConfig')
      .where('outboundCampaignAppointmentsConfig.campaign.id = :id', {id})    
      .leftJoinAndSelect('outboundCampaignAppointmentsConfig.campaign', 'campaignId')
      .getMany();
  }

  public async getCampaignAppointments(): Promise<any> {
    return await this.oCampaignAppointmentsConfigRepository
      .createQueryBuilder('outboundCampaignAppointmentsConfig')
      .leftJoinAndSelect('outboundCampaignAppointmentsConfig.campaign', 'campaignId')
      .getMany();
  }

  public async createCampaignAppointment(user: any, campaignID: string, payload: any): Promise<any> {
    return await this.oCampaignAppointmentsConfigRepository
      .createQueryBuilder('outboundCampaignAppointmentsConfig')
      .leftJoinAndSelect('outboundCampaignAppointmentsConfig.campaign', 'campaignId')
      .getMany();
  }

  private async createCampaignRelations (
    manager: EntityManager,
    payload: IOutboundCampaign,
    campaign: OCampaignEntity,
    update?:boolean
  ): Promise<void> {
    if(payload.questions)
      campaign.questions = await this.createQuestions(
        manager, payload.questions, campaign
      );
     
    if(payload.callerIds)
      campaign.callerIds = await this.createDids(
        manager, campaign, payload.callerIds
      ); 
  
     
    if(payload.appointmentsConfig)
      campaign.appointmentsConfig = await this.createAppointmentsConfig(
        manager, payload.appointmentsConfig, campaign
      );
     
    
    campaign.timeSlot = await this.createTimeSlot(
      manager, payload.timeSlot?payload.timeSlot:null,payload.AutoExecutionControl, campaign
    );
    if(payload.connectedCallsConfig)
    campaign.connectedCallsConfig = await this.createConnectedCallsConfig(
      manager, payload.connectedCallsConfig, campaign
    );
    

    if(payload.orderTakenForm)
      campaign.orderTakenForm = await this.createOrderTakenForm(
        manager, payload.orderTakenForm, campaign
      );
    
    if(update){
      await this.createcmdcampaign(campaign, manager, payload,true)
    } else{
      await this.createcmdcampaign(campaign, manager, payload)
    }
     
    if(payload.contactsListsIds)
      campaign.contactsLists = await this.createContactsLists(
        manager, campaign, payload.contactsListsIds
      );
    if(payload.assignAgents)
      campaign.Agents = await this.assignAgent(manager, payload.assignAgents, campaign,payload.connectedCallsConfig)
  }

  private getBaseCampaign (
    companyId: string,
    campaign: IOutboundCampaign
  ): OCampaignEntity {
    let result
    if(campaign.type == 'broadcast-dialing'){
       result = this.oCampaignRepository.create({
        company: new CompanyEntity({ id: companyId }),
        type: campaign.type,
        name: campaign.name,
        status: STATUS_NEW,
        //strategy: campaign.strategy,
        //breakTimeBetweenCalls: campaign.breakTimeBetweenCalls,
        //MCIStrategy: campaign.MCIStrategy || 'round-robin',
        //callRatio: campaign.callRatio,
       // script: campaign.script
      });
    }else{

     result = this.oCampaignRepository.create({
      company: new CompanyEntity({ id: companyId }),
      type: campaign.type,
      name: campaign.name,
      status: STATUS_NEW,
      strategy: campaign.strategy,
      breakTimeBetweenCalls: campaign.breakTimeBetweenCalls,
      MCIStrategy: campaign.MCIStrategy || 'round-robin',
      callRatio: campaign.callRatio,
      script: campaign.script
    });
  }

    if (campaign.abandonedMessageId) {
      result.abandonedMessage = new RecordingEntity({ id: campaign.abandonedMessageId });
    }

    return result;
  }

  private async createContactsLists (
    manager: EntityManager,
    campaign: any,
    contactsListsIds: string[]
  ): Promise<ContactsListEntity[]> {
    await manager.createQueryBuilder()
      .insert()
      .into(oCampaignContactsListRelationName)
      .values(contactsListsIds.map(listId => ({
        outboundCampaignId: campaign.id,
        contactsListId: listId
      })))
      .execute();
      const contacts_lists = await this.contactsListRepository.find({
        where:{
          id:contactsListsIds.map(listId => { return listId})
        },
        relations: ['contacts_file','contacts_info']
      })
          
     // const campaign = await this.oCampaignRepository.findOneById(campaignID)
      for(let i =0; i< contacts_lists.length; ++i){
      let lead = await this.oCampaignFsService.joinFreeswitchContactsList(campaign,contacts_lists[i])
      .then(async (lead)=>{
        console.log('lead_response-->',lead)
        campaign.lead_id = lead.toString()
        await manager.save(campaign)
        
      })
      .catch((err)=>{
        throw new BadRequestException(err)
      })
     
      }
   

    return contactsListsIds.map(listId => new ContactsListEntity({ id: listId }));
  }

  private async createDids (
    manager: EntityManager,
    campaignId: OCampaignEntity,
    didIds: string[]
  ) {
   // const dids = await manager.getRepository(DidEntity);
    
   //const rightDids = didIds.map((item) => "'" + item + "'")

   /* await manager.query(`UPDATE "did"
                         SET "campaignId"='${campaignId}'
                         WHERE "id" in (${rightDids});`);*/

    for (let i = 0; i < didIds.length; ++i){
      let did:DidEntity = await manager.getRepository(didEntityName).findOneById(didIds[i])
      if(!did)
         throw new BadRequestException(`Did with this id ${didIds[i]} does not exist`);
      /*await manager.getRepository(didEntityName).updateById(didIds[i],{
        campaign:campaignId })*/
   }

   await manager.createQueryBuilder()
      .insert()
      .into(oCampaignCallerRelationName)
      .values(didIds.map(listId => ({
        outboundCampaignId: campaignId.id,
        didId: listId
      })))
      .execute();
    return   await manager.getRepository(didEntityName).findByIds(didIds) //didIds.map(id => new DidEntity({ id }));
  }

  private async createQuestions (
    manager: EntityManager,
    payload: IQuestion[],
    campaign: OCampaignEntity,
    orderTakenForm?: OCampaignOrderTakenFormEntity
  ): Promise<OCampaignQuestionEntity[]> {
    const questionRepo = manager.getRepository(OCampaignQuestionEntity);

    const promises = payload.map(item => {
      const question = new OCampaignQuestionEntity();
      question.type = item.type;
      question.label = item.label;
      question.campaign = campaign;
      question.label_default = item.label_default;

      if (orderTakenForm) {
        question.orderTakenForm = orderTakenForm;
      }

      if (question.type === 'multiple-choice') {
        if (!item.choices || item.choices.length < 2) {
          throw new BadRequestException(
            'Questions of type "multiple-choice" must have at least two choices.'
          );
        }

        question.choices = item.choices;
      }

      return questionRepo.save(question);
    });

    const result = await Promise.all(promises);

    // Map to avoid circular references in returned object.
    return result.map(question => {
      delete question.campaign;
      delete question.orderTakenForm;
      return question;
    });
  }

  private async createAppointmentsConfig (
    manager: EntityManager,
    payload: IAppointmentsConfig,
    campaign: OCampaignEntity
  ): Promise<OCampaignAppointmentConfigEntity> {
    const appointmentsConfig = new OCampaignAppointmentConfigEntity();
    appointmentsConfig.campaign = campaign;
    appointmentsConfig.isEnabled = payload.isEnabled;
    // TODO: Get all users and verify all of them are sales persons.
   /* appointmentsConfig.assignedSalesPersons = payload.assignedSalesPersonsIds.map(userId => {
        return new UserEntity({ id: userId });
    });*/

    const config = await manager.save(appointmentsConfig);

    appointmentsConfig.timeSlot = await this.createTimeSlot(manager, payload.timeSlot,false, campaign, config);

    delete config.campaign;
    delete config.id;

    return config;
  }
  private async createTimeSlot (
    manager: EntityManager,
    payload: ITimeSlot | null,
    AutoExecutionControl:boolean,
    campaign: OCampaignEntity,
    appointmentsConfig?: OCampaignAppointmentConfigEntity
  ): Promise<OCampaignTimeSlotEntity> {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    const timeSlot = new OCampaignTimeSlotEntity();
    timeSlot.campaign = campaign;
  
    if (appointmentsConfig) {
      timeSlot.campaignAppointmentsConfig = appointmentsConfig;
      if(isNaN(Date.parse(payload.start_date)))
      throw new BadRequestException(
        'start_date should be valid date string'
      );

    if(isNaN(Date.parse(payload.end_date)))
      throw new BadRequestException(
        'end_date should be valid date string'
      );  
    
    const timeRegExp = new RegExp("^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$");

    if(!timeRegExp.test(payload.start_time))
      throw new BadRequestException(
        'start_time should be valid time string'
      );  

    if(!timeRegExp.test(payload.end_time))
      throw new BadRequestException(
        'end_time should be valid time string'
      );
      
    timeSlot.start_date = payload.start_date;
    timeSlot.end_date = payload.end_date;
    timeSlot.start_time = payload.start_time;
    timeSlot.end_time = payload.end_time;
    
    for(const day of days) {
      timeSlot[day.toString()] = payload[day.toString()];
    }

    let result = await manager.save(timeSlot);

    delete result.id;
    delete result.campaign;
    delete result.campaignAppointmentsConfig;

    return result;
    }
    if(AutoExecutionControl){
      
      const d = new Date() 
      timeSlot.start_date = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
      timeSlot.end_date = "2030/01/01";
      timeSlot.start_time = "00:00:00";
      timeSlot.end_time = "23:59:59";

      for(const day of days) {
        timeSlot[day.toString()] = true;
      }

      let result = await manager.save(timeSlot);

    delete result.id;
    delete result.campaign;
    delete result.campaignAppointmentsConfig;

    return result;
    } else if(!appointmentsConfig){

    if(isNaN(Date.parse(payload.start_date)))
      throw new BadRequestException(
        'start_date should be valid date string'
      );

    if(isNaN(Date.parse(payload.end_date)))
      throw new BadRequestException(
        'end_date should be valid date string'
      );  
    
    const timeRegExp = new RegExp("^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$");

    if(!timeRegExp.test(payload.start_time))
      throw new BadRequestException(
        'start_time should be valid time string'
      );  

    if(!timeRegExp.test(payload.end_time))
      throw new BadRequestException(
        'end_time should be valid time string'
      );
      
    timeSlot.start_date = payload.start_date;
    timeSlot.end_date = payload.end_date;
    timeSlot.start_time = payload.start_time;
    timeSlot.end_time = payload.end_time;
    
    for(const day of days) {
      timeSlot[day.toString()] = payload[day.toString()];
    }

    let result = await manager.save(timeSlot);

    delete result.id;
    delete result.campaign;
    delete result.campaignAppointmentsConfig;

    return result;
    }
  }

  private async createOrderTakenForm (
    manager: EntityManager,
    payload: IOrderTakenForm,
    campaign: OCampaignEntity
  ): Promise<OCampaignOrderTakenFormEntity> {
    const orderTakenForm = new OCampaignOrderTakenFormEntity();
    orderTakenForm.campaign = campaign;
    orderTakenForm.canBeTakenByAgent = payload.canBeTakenByAgent;
    orderTakenForm.canBeTakenBySalesPerson = payload.canBeTakenBySalesPerson;
    orderTakenForm.submitAsPostUrl = payload.submitAsPostUrl;

    await manager.save(orderTakenForm);

    orderTakenForm.questions = await this.createQuestions(manager, payload.questions, campaign, orderTakenForm);

    delete orderTakenForm.campaign;
    delete orderTakenForm.id;

    return orderTakenForm;
  }

  private async createConnectedCallsConfig (
    manager: EntityManager,
    payload: IConnectedCallsConfig,
    campaign: OCampaignEntity
  ) {
   /* if(payload.action == 'direct-to-agent'){
      throw new BadRequestException(`action must be one of the following values: playback,ivr`)
    }*/
    const connectedCallsConfig = new OCampaignConnectedCallsConfigEntity();
    connectedCallsConfig.campaign = campaign;
    connectedCallsConfig.action = payload.action;

   

    if (payload.action === 'playback') {
      if (payload.playbackAudioId) {
       /* throw new BadRequestException(
          'connectedCallsConfig.playbackAudioId must be specified if connectedCallsConfig.action is "playback".'
        );*/
      
      const playback = await this.playbackRepository.findOneById(payload.playbackAudioId)
          if(!playback)
              throw new BadRequestException(`playbackAudioId with this id ${payload.playbackAudioId} does not exist`)
      connectedCallsConfig.playbackAudio = playback //await this.playbackRepository.findOneById(payload.playbackAudioId) //new RecordingEntity({ id: payload.playbackAudioId });
      } else if(payload.message){
        const path:any = await this.campaignClass4Service.uploadMessage(payload.message)
        //console.log("asfasdgsadg--->",path)
        connectedCallsConfig.file = path
      } else{
        throw new BadRequestException(
          'connectedCallsConfig.playbackAudioId or connectedCallsConfig.message must be specified if connectedCallsConfig.action is "playback".'
        );
      }
    }

    if (payload.action === 'ivr') {
      if (payload.playbackAudioId) {
        /*throw new BadRequestException(
          'connectedCallsConfig.playbackAudioId must be specified if connectedCallsConfig.action is "ivr".'
        );*/
      
        const playback = await this.playbackRepository.findOneById(payload.playbackAudioId)
        if(!playback)
            throw new BadRequestException(`playbackAudioId with this id ${payload.playbackAudioId} does not exist`)
          connectedCallsConfig.playbackAudio = playback
      } else if(payload.message){
        const path:any = await this.campaignClass4Service.uploadMessage(payload.message)
        //console.log("asfasdgsadg--->",path)
        connectedCallsConfig.file = path
      } else {
        throw new BadRequestException(
          'connectedCallsConfig.playbackAudioId or connectedCallsConfig.message must be specified if connectedCallsConfig.action is "ivr".'
        );
      }
    }

    if (payload.action === 'ivr') {
      if (!payload.dtmf || payload.dtmf.length < 1) {
        throw new BadRequestException(
          'At least one DTMF must be specified if connectedCallsConfig.action is "ivr".'
        );
      }

      connectedCallsConfig.dtmf = payload.dtmf;
    }
    await manager.save(connectedCallsConfig);
    console.log('configPayload--->',payload)
    if(payload.action == 'direct-to-agent'){
      const tt: any[] = []
      for(let i=0; i<payload.agentsIds.length; ++i) {

        if(!await this.userService.isExistingAgentId(payload.agentsIds[i])) {
          throw new BadRequestException(`Agent with this id ${payload.agentsIds[i]} does not exist`);
        }
            
        let connectedAgentsConfig = new OCampaignConnectedCallsAndAgentsEntity();
        connectedAgentsConfig.userId = payload.agentsIds[i]
        connectedAgentsConfig.outboundCampaignConnectedCallsConfigId = connectedCallsConfig.id;
        //connectedAgentsConfig.belongsTo = userId
        connectedAgentsConfig.campaignId = campaign.id
        //connectedAgentsConfig.MCD_uuid = `${res}`
    
        await manager.save(connectedAgentsConfig);
        tt[i] = connectedAgentsConfig
        delete tt[i].id
        tt[i].agent_id = tt[i].userId
        delete tt[i].userId
        delete tt[i].outboundCampaignConnectedCallsConfigId
        //tt[i].campaign_id = campaign.id
    
        
        
      }
     /* const ccconf = await manager.getRepository(OCampaignConnectedCallsConfigEntity).findByIds([connectedCallsConfig.id])

      return {OCampaignConnectedCallsConfig:ccconf,Agents:tt}*/
    }

    delete connectedCallsConfig.campaign;
    const aa = connectedCallsConfig.id;

   

    return await manager.getRepository(OCampaignConnectedCallsConfigEntity).findByIds([aa],{
      relations:['playbackAudio']
    }) //connectedCallsConfig;
  }

  public async assignAgent(
    manager: EntityManager,
    agentIds: string[],
    campaign: OCampaignEntity,
    CallsConf?:IConnectedCallsConfig
  ) {
    //console.log('for COnfsss--->',campaign.connectedCallsConfig)
    var config: any;
    if(!campaign.connectedCallsConfig.find((item)=>{return item.action == 'direct-to-agent'})){
      
      const connectedCallsConfig = new OCampaignConnectedCallsConfigEntity();
    connectedCallsConfig.action = 'direct-to-agent';

        connectedCallsConfig.campaign = campaign;
       
     
        config = await manager.save(connectedCallsConfig);
    
    } else config = campaign.connectedCallsConfig.find((item)=>{return item.action == 'direct-to-agent'})
   /* const connectedCallsConfig = new OCampaignConnectedCallsConfigEntity();
    connectedCallsConfig.campaign = campaign;
    connectedCallsConfig.action = 'direct-to-agent';

    await manager.save(connectedCallsConfig);*/

    //console.log('for section agent-->',config)


    const tt: any[] = []

    for(let i=0; i<agentIds.length; ++i) {
      if(!await this.userService.isExistingAgentId(agentIds[i])) {
        throw new BadRequestException(`Agent with this id ${agentIds[i]} does not exist`);
      }

      if(CallsConf && CallsConf.agentsIds && CallsConf.agentsIds.includes(agentIds[i])){

       /* let reletion = await this.oCampaignConnectedCallsAndAgentsRepository.findOne({
          where:{
            userId:agentIds[i],
            campaignId:campaign.id
          }
        })
        console.log('sam--->',reletion)
        tt[i] = reletion
      delete tt[i].id
      tt[i].agent_id = tt[i].userId
      delete tt[i].userId
      delete tt[i].outboundCampaignConnectedCallsConfigId*/

      } else {

      
      let connectedAgentsConfig = new OCampaignConnectedCallsAndAgentsEntity();
      connectedAgentsConfig.userId = agentIds[i]
      connectedAgentsConfig.outboundCampaignConnectedCallsConfigId = config.id;
      //connectedAgentsConfig.belongsTo = userId
      connectedAgentsConfig.campaignId = campaign.id
      //connectedAgentsConfig.MCD_uuid = `${res}`
  
      await manager.save(connectedAgentsConfig);
      tt[i] = connectedAgentsConfig
      delete tt[i].id
      tt[i].agent_id = tt[i].userId
      delete tt[i].userId
      delete tt[i].outboundCampaignConnectedCallsConfigId
      //tt[i].campaign_id = campaign.id
        
      }
      
      
    }
    //const res =  await manager.getRepository(OCampaignConnectedCallsConfigEntity).findByIds([aa])
    return tt
  }

  public async isExistingCampaign (campaignId: string, companyId: string): Promise<boolean> {
    return !!(await this.oCampaignRepository.findOneById(campaignId, {
      select: ['id'],
      where: {
        company: companyId
      }
    }));
  }
  
  public async getCampaignIdsByCompanyId(companyId: string) {
    const campaignsIds = await this.oCampaignRepository.find({
      where: {
        companyId
      },
      select: ['id']
    })

  }


  public async deleteCampaign (
    { user, campaignId }: IDeleteOutboundCampaignPayload
  ) {
    await this.userService.ensureCanPerformCompanyAction({
      user,
      action: 'deleteOutboundCampaigns'
    });

    if (!(await this.isExistingCampaign(campaignId, user.companyId as string))) {
      throw new UnknownCampaignException(campaignId);
    }

     await this.oCampaignRepository.manager.connection.transaction(async manager => {
       const campaign:OCampaignEntity = await this.oCampaignRepository.findOneById(campaignId)
      await this.deleteCampaignChildren(manager, campaignId);
      console.log(`api mcd campaign delete ${campaign.MCD_id}`)
      await this.oCampaignFsService.TelNet(`api mcd campaign delete ${campaign.MCD_id}`)
      .then((res)=>{
        console.log(res)
        if(res.toString().indexOf('OK')){
          return res
        
        }else throw new BadRequestException(res)
       
         
        
      }).catch((err)=>{
        throw new BadRequestException(err)
      })

      await manager.createQueryBuilder()
        .delete()
        .from(OCampaignEntity)
        .where('id = :campaignId', { campaignId })
        .execute();
    });
    return {success:true}
  }



  private async deleteCampaignChildren (manager: EntityManager, campaignId: string) {
    // Time slot it's a dependency of both appointments config and campaign,
    // so it needs to be deleted first.
    await this.deleteTimeSlots(manager, campaignId);
      //console.log(1111111111111111111111)
    await Promise.all([
      this.deleteAppointmentsConfig(manager, campaignId),
      this.deleteQuestions(manager, campaignId),
      this.deleteContactsLists(manager, campaignId),
      this.deleteConnectedCallsConfig(manager, campaignId),
      this.deleteOrderTakenForm(manager, campaignId),
      //this.deletePlaybacks(manager, campaignId),
      this.deleteAppointment(manager, campaignId),
      this.deleteCaller(manager,campaignId)
    ]);
  }

  private async deleteCampaignChildrenforUpdateCampaign (manager: EntityManager, campaignId: string, payload:IOutboundCampaign) {
    // Time slot it's a dependency of both appointments config and campaign,
    // so it needs to be deleted first.
    if(payload.timeSlot)
      await this.deleteTimeSlots(manager, campaignId);
      //console.log(1111111111111111111111)
   
      if(payload.appointmentsConfig)
        await this.deleteAppointmentsConfig(manager, campaignId)
      if(payload.questions)
        await this.deleteQuestions(manager, campaignId)
      if(payload.contactsListsIds)
        await this.deleteContactsLists(manager, campaignId)
      if(payload.connectedCallsConfig)
        await this.deleteConnectedCallsConfig(manager, campaignId)
      if(payload.orderTakenForm)
        await this.deleteOrderTakenForm(manager, campaignId)
      
     // await this.deletePlaybacks(manager, campaignId)

      if(payload.appointmentsConfig)
        await this.deleteAppointment(manager, campaignId)
      if(payload.callerIds)
        await this.deleteCaller(manager,campaignId)
}

  private async deleteCaller (manager: EntityManager, campaignId: string) {


    await manager.createQueryBuilder()
      .delete()
      .from(oCampaignCallerRelationName)
      .where('outboundCampaignId = :campaignId', { campaignId })
      .execute();
      return
  }

  private async deleteOrderTakenForm (manager: EntityManager, campaignId: string) {
   
    await manager.createQueryBuilder()
      .delete()
      .from(OCampaignOrderTakenFormEntity)
      .where('campaign = :campaignId', { campaignId })
      .execute();
      return
  }

  private async deleteAppointment (manager: EntityManager, campaignId: string) {
    
    await manager.createQueryBuilder()
      .delete()
      .from(AppointmentsRelationName)
      .where('campaign = :campaignId', { campaignId })
      .execute();
      return
  }

  private async deleteContactsLists (manager: EntityManager, campaignId: string) {
    await manager.createQueryBuilder()
      .delete()
      .from(oCampaignContactsListRelationName)
      .where('outboundCampaignId = :campaignId', { campaignId })
      .execute();
      return
  }

  private async deleteQuestions (manager: EntityManager, campaignId: string) {
    await manager.createQueryBuilder()
      .delete()
      .from(OCampaignQuestionEntity)
      .where('campaign = :campaignId', { campaignId })
      .execute();
      return
  }

  private async deletePlaybacks (manager: EntityManager, campaignId: string) {
    await manager.createQueryBuilder()
      .delete()
      .from(PlaybackEntity)
      .where('campaign = :campaignId', { campaignId })
      .execute();
      return
  }

  private async deleteAppointmentsConfig (manager: EntityManager, campaignId: string) {
    const appointmentsConfigId = (await manager.findOne(OCampaignAppointmentConfigEntity, {
      where: {
        campaign: campaignId
      }
    }) as any);

   /* if(appointmentsConfigId && appointmentsConfigId.hasOwnProperty('id')) {
      await manager.createQueryBuilder()
      .delete()
      .from(oCampaignAppointmentsAndSalesPersonsRelationName)
      .where('outboundCampaignAppointmentsConfigId = :id', { id: appointmentsConfigId.id })
      .execute();
    }*/
    console.log(appointmentsConfigId,'-------->')
    if(appointmentsConfigId){
       await manager.getRepository(oCampaignTimeSlotEntityName).delete({
     where:{
         campaignAppointmentsConfig:appointmentsConfigId.id
     }
   })
  }
    

    await manager.createQueryBuilder()
      .delete()
      .from(OCampaignAppointmentConfigEntity)
      .where('campaign = :campaignId', { campaignId })
      .execute();
      return
  }

  private async deleteTimeSlots (manager: EntityManager, campaignId: string) {
    await manager.getRepository(OCampaignTimeSlotEntity).delete({ campaign: campaignId })
    // await manager.createQueryBuilder()
    //   .delete()
    //   .from(OCampaignTimeSlotEntity)
    //   .where('campaign = :campaignId', { campaignId })
    //   .execute();
    //   return
  }

  private async deleteConnectedCallsConfig (manager: EntityManager, campaignId: string) {
    const connectedCallsConfig:any = await manager.find(OCampaignConnectedCallsConfigEntity, {
      where: {
        campaign: campaignId
      }
    });
    console.log('conf---------->',connectedCallsConfig)

    if (!connectedCallsConfig) {
      return;
    }

    await manager.createQueryBuilder()
      .delete()
      .from(oCampaignConnectedCallsAndAgentsRelationName)
      //.where('outboundCampaignConnectedCallsConfigId IN (:id)', { id: connectedCallsConfig.map((e:any) =>{return e.id}) })
      .where('campaignId = :campaignId', { campaignId })
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

  public async getCampaigns (
    payload: IGetOutboundCampaignsPayload
  ): Promise<IPaginated<OCampaignEntity>> {
    let items,count
    if(payload.status){
     [items, count] = await this.oCampaignRepository.findAndCount({
      where: {
        company: payload.companyId,
        status:payload.status
      },
     // skip: payload.offset,
      //take: payload.limit,
      relations: ['callerIds','contactsLists']
    });
  } else{
     [items, count] = await this.oCampaignRepository.findAndCount({
      where: {
        company: payload.companyId
      },
     // skip: payload.offset,
      //take: payload.limit,
      relations: ['callerIds','contactsLists']
    });

  }

    for(let i=0; i<items.length; ++i){
      var contactsFileCount:number = 0;
      if(items[i].contactsLists.length > 0){
        for(let j=0; j<items[i].contactsLists.length; ++j){
           contactsFileCount += items[i].contactsLists[j].contact_file_count
        }
    } 
    let agent  = await this.oCampaignConnectedCallsAndAgentsRepository
    .createQueryBuilder('outboundCampaignConnectedCallsAndAgents')
    .select()
    .where("outboundCampaignConnectedCallsAndAgents.MCD_uuid != :confIds",{confIds:'null'})
    .andWhere("outboundCampaignConnectedCallsAndAgents.campaignId = :id",{id:items[i].id})
    .getOne();
    
      items[i].join_to_campaign = agent?true:false
      delete items[i].contactsLists
      items[i].total_contacts = contactsFileCount?contactsFileCount:0;
      items[i].Campaign_type = "outbound"
      items[i].Average_Calls_per_Hour=0
      items[i].Total_Calls=0
      items[i].Answered_Calls=0
      items[i].Abandoned_Calls=0
      items[i].No_route_calls=0
      items[i].Not_Answered=0
      items[i].Busy_Calls=0
      items[i].Month_wise_total_calls=0
    }

    /*try {
      const campaigns = await this.oCampaignFsService.getFreeswitchCampaigns();
     // console.log('campaigns77777:', campaigns);
    } catch(error) {
     // console.error(error);
    }*/
   
    return { items, count };
  }
  public async getCampaign(
    id: string
  ) {
    const campaign:any = await this.oCampaignRepository.findOneById(id, {
      relations: ['callerIds','contactsLists','timeSlot','abandonedMessage','questions']
    })

    const connectedCallsConfig:any = await this.oCampaignConnectedCallsConfigRepository.find({
      where:{
        campaign:id
      },
      relations:['playbackAudio']
    })
     
  //  console.log('campaign99999:', campaign)
  //const lead_statistics = await this.oCampaignFsService.getCampaignStatByMCD(campaign.MCD_id);
    var contactsFileCount:number = 0;
    var contactsListIds:string[]= []
    if(campaign.contactsLists.length > 0){
      for(let j=0; j<campaign.contactsLists.length; ++j){
         contactsFileCount += campaign.contactsLists[j].contact_file_count
         contactsListIds.push(campaign.contactsLists[j].id)
      }
  }
    if(!campaign)
      return new UnknownCampaignException(id)

      for(let i=0; i<connectedCallsConfig.length;++i){
        if(!connectedCallsConfig[i].dtmf)
          delete connectedCallsConfig[i].dtmf

        if(!connectedCallsConfig[i].file)
          delete connectedCallsConfig[i].file
        
        if(connectedCallsConfig[i].action == 'direct-to-agent'){
          let conf = await this.oCampaignConnectedCallsAndAgentsRepository.find({
            select:['userId','outboundCampaignConnectedCallsConfigId'],
            where:{
              outboundCampaignConnectedCallsConfigId:connectedCallsConfig[i].id
            }
          })
        
          let conf_array = await conf.map(e=>  e.userId)
          
          connectedCallsConfig[i].agents = await this.userRepository.findByIds(conf_array,{
            select:['id','first_name']
          })
        }
       /* if(connectedCallsConfig[i].action == 'playback' || connectedCallsConfig[i].action == 'ivr'){
          delete connectedCallsConfig[i].agents
        }*/

      }


      campaign.connectedCallsConfig = connectedCallsConfig
    delete campaign.contactsLists
    campaign.contacts_lists_ids = contactsListIds
    campaign.total_contacts = contactsFileCount?contactsFileCount:0;
    campaign.Campaign_type = "outbound"
    campaign.Average_Calls_per_Hour=0
    campaign.Total_Calls=0
    campaign.Answered_Calls=0
    campaign.Abandoned_Calls=0
    campaign.No_route_calls=0
    campaign.Not_Answered=0
    campaign.Busy_Calls=0
    campaign.Month_wise_total_calls=0
   
    return campaign;
  }


  public async getLiveCampaigns (
    payload: IGetOutboundCampaignsPayload
  ): Promise<IPaginated<OCampaignEntity>> {
    const [items, count] = await this.oCampaignRepository.findAndCount({
      where: {
        company: payload.companyId,
        status: [STATUS_NEW]
      },
      skip: payload.offset,
      take: payload.limit
    });

    return { items, count };
  }

  private async ifExistingQuestionId(id: string): Promise<boolean> {
    return !!(await this.questionRepository.findOne({ select: ['id'], where: { id } }));
  }

  private async createcmdcampaign(newCampaign:OCampaignEntity,manager:EntityManager,payload: IOutboundCampaign,update?:boolean){
  
    if(payload.abandonedMessageId){
    var abandon_playback_url:any = await this.recordingRepository.findOne({ select: ['url'], where: { id:payload.abandonedMessageId } });
    }
        
        const data = await this.oCampaignFsService.createFreeswitchCampaign(newCampaign,abandon_playback_url?abandon_playback_url.url:null,update?true:false)
        .then(async (res)=>{
          console.log('create res-->',res)
          newCampaign.MCD_id = res.toString()
          
          await manager.save(newCampaign);
          
          return
        })
        .catch(async (err)=>{
         // console.log('ERROR-->',err)
              throw new BadGatewayException(err)
        })
        return
          //console.log('idds',data.toString())
         // newCampaign.MCD_id = data.toString()
          //await manager.save(newCampaign);
  }

  public async stats(company_id:string){
    const campaigns:any = await this.oCampaignRepository.find({
      where:{
        company:company_id
      },
      relations: ['contactsLists']
    })
    if(!campaigns.length)
    throw new BadRequestException(`You dont have campaign`)

    const ids =  await campaigns.map((e:any) =>{return e.MCD_id})
       // return this.oCampaignFsService.getstats(campaign.MCD_id)
       console.log('ids-->',ids)
      const mcdCampaign = await this.oCampaignFsService.getRealTimeStats(ids)

      const returnObj:any= {}
      var contactsFileCount:number = 0;

      await campaigns.map((campaign:any) =>{
        if(campaign.contactsLists.length > 0){
          for(let j=0; j<campaign.contactsLists.length; ++j){
             contactsFileCount += campaign.contactsLists[j].contact_file_count
          }
      } 
  
      returnObj.Total_Lead_Count = contactsFileCount
      })
      returnObj.Total_Call_Count = 0;
      returnObj.Total_Answered_Count = 0;
      returnObj.Total_Recycled_Count = 0;
      returnObj.Total_Duration = 0;

      console.log('mcd respi--->',mcdCampaign.length)
      if(mcdCampaign.length){
       await mcdCampaign.map(async (item:any)=>{

          console.log('check-->',item.campaign_stats.call_stats.made)
    
          returnObj.Total_Call_Count += item.campaign_stats.call_stats.made?item.campaign_stats.call_stats.made:0
          returnObj.Total_Answered_Count += item.campaign_stats.call_stats.connected?item.campaign_stats.call_stats.connected:0
          returnObj.Total_Recycled_Count += item.campaign_stats.call_stats.redialled?item.campaign_stats.call_stats.redialled:0
          returnObj.Total_Duration += item.campaign_stats.runtime?item.campaign_stats.runtime:0
          

        })
        

        const liveAgent = await this.oCampaignFsService.ShowRegistrations()
          if(liveAgent.includes('0 total.')){
            returnObj.Number_of_Live_Agent = '0 total.'
          } else{
            returnObj.Number_of_Live_Agent = parseInt(liveAgent.substring(liveAgent.indexOf('total')-2,liveAgent.indexOf('total')))
          }
      
     

      return returnObj
    } else return {}

  }

  public async summary(id:any){
    const campaigns:any = await this.oCampaignRepository.find({
      where:{
        company:id
       }
    })
    if(!campaigns.length)
    throw new BadRequestException(`You dont have campaign`)
    //console.log(campaigns)
   let mcd_ids = campaigns.map(item => item.MCD_id)
   console.log('mcd-ids--->',mcd_ids)
      let response:any
        await this.oCampaignFsService.summary()
        .then((res)=>{
            response = res
            
        })
        .catch((err)=>{
          throw new BadRequestException(err)
        })
     const res = await response.map((item:any)=>{
         // console.log('bollean -->',mcd_ids.includes(item.uuid))
          if(mcd_ids.includes(item.uuid) ){
            console.log(item.uuid)
            return item
          }

        })
        
        return res.filter(function (el) {
          return el != null;
        });
  }
  public async outgoing(id:string){
    const campaign:any = await this.oCampaignRepository.findOneById(id)
    //console.log('cam--->',campaign)
    if(!campaign)
    throw new BadRequestException(`campaign with id ${id} does not exist`)
      
        return await mcd_helper.outgoing(campaign.MCD_id)
        //return this.oCampaignFsService.outgoing(campaign.MCD_id)
  }
  public async allcam(id:string){
    const campaign:any = await this.oCampaignRepository.findOneById(id)
    if(!campaign)
    throw new BadRequestException(`campaign with id ${id} does not exist`)
    return await this.oCampaignFsService.allcam(campaign.MCD_id)
      /*  if(this.oCampaignFsService.allcam(campaign.MCD_id)){
          console.log("promiseasfasfasf")
          return await new Promise(async (resolve, reject) =>{
            await csv.parseCSV(`${CAMPAIGNS_JSON_PATH}//${campaign.MCD_id}.csv`, function(data:any){
             const  obj =   JSON.parse(JSON.stringify(data))
             obj.shift();
             //fs.unlinkSync(`${CAMPAIGNS_JSON_PATH}/${campaign.MCD_id}.csv`);
            console.log(2165465465,typeof obj);
            //console.log(87987987987, obj[0])
            resolve(obj)
            });
         })
        }*/
  }

  public async test(id:string){
      return new Promise(async (resolve, reject) =>{
         await csv.parseCSV("C:\\Users\\user\\Desktop\\ed-v2\\campaigns\\test.csv", function(data:any){
          const  obj =   JSON.parse(JSON.stringify(data))
          obj.shift();

         resolve(obj)
         });
      })
 //return await this.oCampaignFsService.test()
  }

  public async getCampaignStatistics(
    id: string
  ) {
    const campaign:any = await this.oCampaignRepository.findOneById(id)  
    if(!campaign)
      return new UnknownCampaignException(id)
   const lead_statistics = await this.oCampaignFsService.getCampaignStatByMCD(campaign.MCD_id);
   const calls = await this.oCampaignFsService.callsStatistics(campaign.MCD_id);

   const json_parsed_data = await JSON.parse(calls);
        if (json_parsed_data.active_leads.length === 0) return ({
            lead_statistics: lead_statistics,
            calls: json_parsed_data,
            other_data: {}
        });
        const parked_calls = await this.oCampaignFsService.getParkedCalls(json_parsed_data);
        const live = await this.oCampaignFsService.getLiveVariableForResponse(json_parsed_data);
        const active_calls = await this.oCampaignFsService.countAgentUuid(json_parsed_data);
        return ({
          lead_statistics: lead_statistics,
          calls: calls,
          other_data: {
              originated_call: json_parsed_data.active_leads.length,
              parked_calls: parked_calls,
              live: live,
              active_calls: active_calls
          }
      })
    
  }

  public async getCampaignRecords(start_date:string,end_date:string){
    const start = await this.parseTimeIntoMS(start_date);
    const end = await this.parseTimeIntoMS(end_date)
    //console.log('start->',start,'end->',end)

    return this.campaignClass4Service.getCampaignRecords(start,end)
  }


  private async  parseTimeIntoMS  (time:string)  {
    let date = new Date(time);
    return await date.getTime() / 1000;
  };


  public async joinAgentToOutboundCampaign(id:string,agentId:string){
    const agent_user = await this.userRepository.findOneById(agentId)
    //console.log('agent_user--->',agent_user)
      //const agents = await this.getAgentsOfCampaign(id)
       //console.log('agents--->',agents)
       const agent_join:any = await this.oCampaignConnectedCallsAndAgentsRepository
       .createQueryBuilder('outboundCampaignConnectedCallsAndAgents')
       .select()
       .addSelect('outboundCampaignConnectedCallsAndAgents.outboundCampaignConnectedCallsConfigId')
       .where("outboundCampaignConnectedCallsAndAgents.MCD_uuid != :confIds",{confIds:'null'})
       .andWhere("outboundCampaignConnectedCallsAndAgents.userId = :id",{id:agentId})
       .getOne();

       /*const agent_join:any = await this.oCampaignConnectedCallsAndAgentsRepository.findOne({

       })*/
      console.log('agent_join-->',agent_join)
      const campaign:any = await this.oCampaignRepository.findOneById(id,{
        relations:['connectedCallsConfig']
      })
      if(!campaign) throw new BadRequestException(`Campaign with id ${id} does not exist`)
      const confing:any = campaign.connectedCallsConfig

      const realtion:any = await this.oCampaignConnectedCallsAndAgentsRepository
        .createQueryBuilder('outboundCampaignConnectedCallsAndAgents')
        .where("outboundCampaignConnectedCallsAndAgents.outboundCampaignConnectedCallsConfigId = :confIds", {confIds:confing.find((item)=>{return item.action == 'direct-to-agent'}).id})
        .andWhere("outboundCampaignConnectedCallsAndAgents.userId = :id",{id:agentId})
        .getOne();
        
        console.log('agentRelation--->',realtion)

        if(!realtion) throw new BadRequestException(`this user isn't assigned to campaign with id ${id}`)

      if(agent_join && agent_join.MCD_uuid == realtion.MCD_uuid) throw new BadRequestException(`you are already joined to this campaign!`)
       
      if(agent_join) throw new BadRequestException(`You are alraedy joined to another campaign, pls leave that and join this`)
      
     // console.log('campaign--->',campaign)
      
      if(!campaign){
        throw new UnknownCampaignException(id);
      }
      console.log(campaign)
     
        if(realtion.MCD_uuid != null) {
          throw new BadRequestException(`you are already joined to this campaign!`)
          }
        /*   const conf:any = await this.oCampaignConnectedCallsAndAgentsRepository
        .createQueryBuilder('outboundCampaignConnectedCallsAndAgents')
        .where("outboundCampaignConnectedCallsAndAgents.outboundCampaignConnectedCallsConfigId = :confIds", {confIds:confing.find((item)=>{return item.action == 'direct-to-agent'}).id})
        .andWhere("outboundCampaignConnectedCallsAndAgents.userId = :id",{id:agents[i].id})
        .getOne();*/
       // console.log('conf--->',conf)
       let response:any
        await this.oCampaignFsService.joinFreeswitchAgent(campaign,agent_user.sipUsername)
          .then(async (res)=>{
         
            realtion.MCD_uuid = res
            response = await this.oCampaignConnectedCallsAndAgentsRepository.save(realtion)
           })
          .catch((err)=>{
            throw new BadRequestException(err)
          })
          
        return {...response,"in_campaign":true}
  }

  public async getCampaignMcdDnc(id:string){
    const campaigns = await this.oCampaignRepository.find({
      where:{
        company:id
       }
    })
    //console.log('cam--->',campaign)
    if(!campaigns)
    throw new BadRequestException(`You dont have campaign`)

    const mcdArray = await this.getCampaingStartResponsesFromCampaigns(campaigns)
     
      
        return await mcd_helper.DNC(mcdArray)
  }

  public async getCampaignexport(id:string,start:string,end:string,email?:string){
    const start_date =new Date(start) 
    const end_date = new Date(end)

    const campaigns = await this.oCampaignRepository.find({
      where:{
        company:id
       },
       relations:['contactsLists']
    })
    console.log(campaigns.length,'cam--->',campaigns[0])
    if(!campaigns.length)
    throw new BadRequestException(`You dont have campaign`)

    const mcdArray = await this.getCampaingStartResponsesFromCampaigns(campaigns)
     
        const mcd = await mcd_helper.getoutgoingCampaigns(mcdArray,start_date.toISOString(),end_date.toISOString())
        console.log('data--->',mcd[0])
      await  campaigns.map(async (campaign: any) => {  

       /* let item = mcd.find((item:any)=>{return item.campaign_uuid == campaign.MCD_id})

        if(!item){
          return
        }*/

       await   mcd.map(async(item:any)=>{
           
              if(campaign.MCD_id == item.campaign_uuid){
                let ag = item.connected_to_agent_url
                if(ag && ag.slice(5).length<9){
                  let agent:any = await this.userRepository.findOne({
                      where:{
                        sipUsername:ag.slice(5)
                      }
                  })
                 // console.log(agent)
                  if(!agent){
                    console.log('Agent Deleted')
                    item.connected_to_agent_uuid = 'Agent Deleted'
                  item.connected_to_agent_url = 'Agent Deleted'
                  }
                  //console.log('testttttt/n')
                  item.connected_to_agent_uuid= agent.first_name
                  item.connected_to_agent_url= agent.last_name
                }
                  item.campaign_uuid = campaign.name
                  item.batch_uuid = campaign.contactsLists[0].contact_list_name
                  item.dnis = await item.dnis.slice(21, item.dnis.length)
                  }
                  return item

                })
           })
           await this.waiting()
       
        return await this.oCampaignFsService.exportMCD(id,mcd,email)
      
        //return {path:path}

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

  private async waiting() {

    await new Promise((rsl, rjc) => {
      console.log('Waiting 3sec..');
      setTimeout(() => {
        rsl();
      }, 3000);
    });
        return
       
     }

  
}

import { Component, Inject, forwardRef, BadRequestException, Body, Response } from '@nestjs/common';
import { Repository, FindOneOptions, EntityManager, Index } from 'typeorm';
import { UserEntity } from './user.entity';
//import { AgentEntity } from './agent.entity';
import { DidEntity } from './did.entity';
import {
  ROLE_COMPANY_ADMIN,
  ROLE_COMPANY_USER,
  ROLE_SYS_ADMIN,
  ROLE_RESELLER,
  UserRole,
  ROLE_AGENT,
  ROLE_SALES,
  AssignableUserRole,
  AssignableUserRoleArr,
  ROLE_AGENT_MANAGER
} from './types';
import { userRepositoryToken, contactsInfoRepositoryToken, oCampaignRepositoryToken, didRepositoryToken, userPermissionsRepositoryToken, oCampaignConnectedCallsConfigEntityName,oCampaignConnectedCallsAndAgentsRelationName, userEntityName, oCampaignConnectedSalesName,userPermissionsEntityName, oCampaignCallerRelationName, didEntityName } from '../../constants';
import { encrypt } from '../../utilities/encryption';
import { CompanyEntity } from '../company/company.entity';
import {
  ICreateUserPayload,
  ICreateCompanyUserPayload,
  ILoginPayload,
  IFindByCompanyPayload,
  IUserWithPassword,
  IEditUserPayload,
  IEnsureCanPerformActionPayload,
  IEditAgentPayload
 } from './interfaces';
import {
  UnknownUserException,
  NotASysAdminException,
  NoCompanyException,
  NoPermissionException,
  DuplicatedEmailException,
  UnknownAgentException
} from '../../exceptions';
import { IPaginated, IAuthTokenContent } from '../../interfaces';
import { UserPermissionsEntity } from './user-permissions.entity';
import * as shortid from 'shortid';
import { STATUS_ACCEPTED } from '../company/types';
import { UnacceptedCompanyException } from '../../exceptions';
import { CompanyService } from '../company/company.service';
import { OCampaignConnectedCallsConfigEntity } from '../campaign/outbound/entities/o-campaign-connected-calls-config.entity';
import { OCampaignConnectedCallsAndAgentsEntity } from '../campaign/outbound/entities/o-campaign-connected-calls-and-agents.entity';
import { OCampaignConnectedSalesEntity } from '../campaign/outbound/entities/o-campaign-connected-sales.entity';
import { oCampaignConnectedCallsConfigToken, resellerRepositoryToken, oCampaignConnectedCallsAndAgentsToken, oCampaignConnectedSalesToken } from '../../constants';
import { ResellerEntity } from '../reseller/reseller.entity';
import { ContactsInfoEntity } from '../contacts-list/contacts-info.entity'
import { OCampaignEntity } from '../campaign/outbound/entities/o-campaign.entity'
import { DNL_HOST } from '../../config'
import { OCampaignFsService } from './../campaign/outbound/o-campaign-fs.service'
const child_process = require('child_process')
let mcd_helper = require('../../ws/mcdhelper');
@Component()
export class UserService {
  constructor (
    @Inject(userRepositoryToken)
    private readonly userRepository: Repository<UserEntity>,

    @Inject(didRepositoryToken)
    private readonly didRepository: Repository<DidEntity>,

   /* @Inject(agentRepositoryToken)
    private readonly agentRepository: Repository<AgentEntity>,*/

    @Inject(resellerRepositoryToken)
    private readonly resellerRepository: Repository<ResellerEntity>,

    @Inject(contactsInfoRepositoryToken)
    private readonly ContactsInfoRepository: Repository<ContactsInfoEntity>,

    @Inject(userPermissionsRepositoryToken)
    private readonly userPermissionsRepository: Repository<UserPermissionsEntity>,

    @Inject(oCampaignRepositoryToken)
    private readonly oCamapignRepository: Repository<OCampaignEntity>,

    @Inject(forwardRef(() => CompanyService))
    private readonly companyService: CompanyService,

    @Inject(forwardRef(() => OCampaignFsService))
    private readonly OCampaignFsService: OCampaignFsService,
    
    @Inject(oCampaignConnectedCallsConfigToken)
    private readonly oCampaignConnectedCallsConfigRepository: Repository<OCampaignConnectedCallsConfigEntity>, 
    
    @Inject(oCampaignConnectedSalesToken)
    private readonly oCampaignConnectedSalesRepository: Repository<OCampaignConnectedSalesEntity>,
    
    @Inject(oCampaignConnectedCallsAndAgentsToken)
    private readonly oCampaignConnectedCallsAndAgentsRepository: Repository<OCampaignConnectedCallsAndAgentsEntity> 
  ) {}

  /**
   * @throws { DuplicatedEmailException }
   */
  private async create (payload: ICreateUserPayload): Promise<UserEntity> {
    /*const emaildup = await this.userRepository.findOne({
      where:{email:payload.email}
    })
    console.log('DuplicatedEmail--->', emaildup)*/
    if (await this.isExistingEmail(payload.email)) {
      throw new DuplicatedEmailException();
    }

    payload.password = encrypt(payload.password);
    if(payload.role != ROLE_COMPANY_ADMIN){
      delete payload.reseller_uuid
    }
    if(payload.role === ROLE_COMPANY_ADMIN || payload.role === ROLE_AGENT || payload.role === ROLE_AGENT_MANAGER){
      let sipPassword:string = '';
    let sipUsername:string = '';
    for(let i = 0; i < 8; i++) {
      sipPassword += Math.floor(Math.random() * 10).toString();
      sipUsername += Math.floor(Math.random() * 10).toString();
    }
      payload.sipUsername = sipUsername
      payload.sipPassword = sipPassword
    }

    return await this.userPermissionsRepository.manager.connection.transaction(async manager => {
      let newUser
      if(payload.role === ROLE_COMPANY_ADMIN || payload.role === ROLE_SYS_ADMIN){
       // console.log(1)
       newUser = await manager.save(
        this.userRepository.create({
          ...payload,
          company: payload.company
        })
      );
    } else {
      //console.log(2)
       newUser = await manager.save(
        this.userRepository.create({
          ...payload,
          company_users: payload.companyUsers
        })
      );

    }

      if (payload.permissions) {
        await manager.save(
          this.userPermissionsRepository.create({
            ...payload.permissions,
            user: newUser
          })
        );
      }

      delete newUser.password;
      delete newUser.company;

      return newUser;
    });
  }

  public async createAgent(payload: ICreateCompanyUserPayload, belongsToUser: any, is_manager?: boolean): Promise<UserEntity> {
    if (await this.isExistingEmail(payload.email)) {
      throw new DuplicatedEmailException();
    }

    payload.permissions = {
      createAgents: false,
      editAgents: false,
      createContactsLists: true,
      editContactsLists: true,
      createOutboundCampaigns: false,
      editOutboundCampaigns: false,
      deleteOutboundCampaigns: false
    };

    const user_with_company: any = await this.userRepository.findOne({
      where: {id: belongsToUser.id},
      relations: ['company']
    });

    payload.belongsTo = user_with_company.id;
    payload.companyUsers = user_with_company.company;
    payload.register_type = '0'
    if(is_manager)
      payload.role = ROLE_AGENT_MANAGER;
    else
      payload.role = ROLE_AGENT;
   
    const user = await this.create(payload);
    return user
/*
    payload.password = encrypt(payload.password);

    let sipPassword:string = '';
    let sipUsername:string = '';
    for(let i = 0; i < 8; i++) {
      sipPassword += Math.floor(Math.random() * 10).toString();
      sipUsername += Math.floor(Math.random() * 10).toString();
    }

    return await this.userPermissionsRepository.manager.connection.transaction(async manager => {
      const newUser = await manager.save(
        this.agentRepository.create({
          ...payload,
          sipPassword: sipPassword, //shortid.generate(),
          sipUsername:sipUsername,
          is_online: true,
          agent_manager: is_manager ? true : false,
          user,
          belongsToUser
        })
      );
      
      delete newUser.password;
      delete newUser.company;

      return user;
    });*/
  }

  public async allAgentCampaigns(agentId: string): Promise<any> {
   /* let all: any[] = await this.oCampaignConnectedCallsConfigRepository
    .createQueryBuilder('outboundCampaignConnectedCallsConfig')
    .leftJoinAndSelect('outboundCampaignConnectedCallsConfig.campaign', 'campaignId')
    .getMany();*/
     
    if(!await this.isExistingAgentId(agentId)) {
      throw new BadRequestException(`Agent with this id ${agentId} does not exist`);
    }

    //const agents = await this.oCampaignConnectedCallsAndAgentsRepository.query(`SELECT * FROM "outboundCampaignConnectedCallsAndAgents" WHERE "userId"='` + agentId + `'`);
   const conAngent = await this.oCampaignConnectedCallsAndAgentsRepository.find({
     where:{
       userId:agentId
     }
   })
    if(!conAngent) return {}
   //console.log('conAngent--->',conAngent)
   const campaignIds = conAngent.map(item => item.campaignId)
   console.log(campaignIds)
    /*const agent_campaigns = conAngent.map((elem: any) => {
      return all.find(function(n){  if(n.id === elem.outboundCampaignConnectedCallsConfigId) return n.campaign });
    });*/   
    
    //return agent_campaigns.map((item:any )=>{ return item.campaign});
    const campaigns:any = await this.oCamapignRepository.findByIds(campaignIds)
    const joinCam:any = await conAngent.find((item)=> ( item.MCD_uuid !== null))
    console.log('111--->',joinCam)
    for(let i=0; i<campaigns.length; ++i){
    
      if(joinCam && campaigns[i].id == joinCam.campaignId){
        campaigns[i].join_to_campaign= true
      } else {
        campaigns[i].join_to_campaign = false
      }

    }
    return campaigns
  }

  public async createCompanyAdmin (payload: IUserWithPassword): Promise<UserEntity> {
    return this.create({
      ...payload,
      role: ROLE_COMPANY_ADMIN
    });
  }

  public async createCompanyReseller (payload: IUserWithPassword): Promise<UserEntity> {
    return this.create({
      ...payload,
      role: ROLE_RESELLER
    });
  }

  public async createCompanyAgent (payload: any, user: any): Promise<UserEntity> {
    const userToCreate = await this.userRepository.findOne({
      where: {
        id: user.id
      },
      relations:['permissions']
    });
   // console.log(userToCreate);
    if(!userToCreate || (userToCreate.role !== 'company-admin' && userToCreate.role !== 'system-admin' && !userToCreate.permissions.createAgents)) {
      throw new NoPermissionException('Only company admins can create agents');
    }

    await this.ensureCanCreateUserOrAgent(user.id);

    const is_agent_manager:boolean = payload.agent_manager ? true : false;

    return this.createAgent({
      ...payload,
      is_agent: true
    }, userToCreate, is_agent_manager);
  }

  public async createCompanySalesPerson (payload: any, user: any): Promise<UserEntity> {
    const user_with_company: any = await this.userRepository.findOne({
      where: {id: user},
      relations: ['company']
    });

    payload.companyUsers = user_with_company.company;
    return this.create({
      ...payload,
      belongsTo: user,
      role: ROLE_SALES
    });
  }

  public async deleteCompanyUser (id: any, user: any): Promise<UserEntity> {
   //console.log("user------------------->",user)
    
    if(!await this.isExistingUserId(id)) {
      throw new BadRequestException(`User with id ${id.target} does not exist`);
    }
    const delUser:any = await this.userRepository.findOneById(id,{
      relations:['company']
    })
   // console.log('company--->',delUser)

    if(user.id !== id && user.role !='system-admin' && delUser.belongsTo != user.id) {
      throw new BadRequestException('User can delete only himself');      
    }   

    return await this.userRepository.manager.connection.transaction(async manager => {
          const use:any = await manager.getRepository('user')
      const Userr:any = await use.findOneById(id)
      if(delUser.company){
      await this.companyService.deleteCompanyWithUserRole(Userr,manager,user.companyId)
      }
      if(delUser.role == ROLE_COMPANY_ADMIN){
        await this.deleteCompanyUsers(id,manager)
      }
      
      return await this.deleteUser(Userr,manager)
      //return await this.userRepository.query(`DELETE FROM "user" WHERE "id"='${id}'`);
    })
          
    //await this.userRepository.query(`DELETE FROM "company" WHERE "ownerId"= '${id}'`);
    
  }
  private async deleteCompanyUsers(id:string,manager:EntityManager){
    const users:any[] = await manager
          .getRepository('user')
          .createQueryBuilder('user')
          .select()
          .where('user.belongsTo = :userid', {userid : id })
          .andWhere('user.role NOT IN (:role)',{role: [ROLE_AGENT, ROLE_AGENT_MANAGER]})
          .getMany()

          //console.log('company-users--->',users)
      if(!users.length){
        return
      }
      for (let i=0; i<users.length; ++i){
        await manager.createQueryBuilder()
        .delete()
        .from(userEntityName)
        .where('id = :companyId', { companyId: users[i].id })
        .execute();
      }
      return


  }

  private async deleteUser (
    user: any,
    manager:EntityManager
  ) {
      await this.deleteUserChildren(manager, user.id);
      await manager.createQueryBuilder()
        .delete()
        .from(userEntityName)
        .where('id = :companyId', { companyId: user.id })
        .execute();
    return {success:true}
  }

  private async deleteUserChildren (manager: EntityManager, user: any) {
    await Promise.all([
      await this.deleteAgent(manager,user),
    ]);
  }

  private async deleteAgent (manager: EntityManager, user: any) {
        const agents:any[] = await this.userRepository
        .createQueryBuilder('user')
        .select()
        .where('user.role IN (:salesidd)', {salesidd:[ROLE_AGENT, ROLE_AGENT_MANAGER]})
        .andWhere('user.belongsTo = :belongsTo',{belongsTo:user})
        .getMany();
        //console.log("agentttttttt-------->", agents)
        for(let i=0; i<agents.length; ++i){
          //console.log(agents[i])
         // await this.deleteCompanyAgent(agents[i].id)
        await  manager.createQueryBuilder()
               .delete()
               .from('userPermissions')
               .where('user = :user', {user : agents[i].id })
               .execute();
  
            await   manager.createQueryBuilder()
               .delete()
               .from('user')
               .where('id = :email', {email : agents[i].id })
               .execute();
        }
          return 
    }

  public async deleteUserSale (id: any): Promise<UserEntity> {
    
    if(!await this.isExistingUserId(id)) {
      throw new BadRequestException(`Sale with id ${id} does not exist`);
    }
  return  await this.userRepository.manager.connection.transaction(async manager => {
     /* await manager.createQueryBuilder()
      .delete()
      .from(OCampaignConnectedSalesEntity)
      .where('salesId = :campaignId', {campaignId:id })
      .execute();*/
      await this.oCampaignConnectedSalesRepository.delete({sales:id})
    return manager
    .createQueryBuilder()
    .delete()
    .from(UserEntity)
    .where('role = :role', { role: 'sales' })
    .andWhere('id = :id', { id: id })
    .execute();
    
        })

  } 
  public async deleteAllUserSales ( user: any): Promise<UserEntity> {
    
    
    return this.userRepository
    .createQueryBuilder()
    .delete()
    .from(UserEntity)
    .where('role = :role', { role: 'sales' })
    .andWhere('belongsTo = :id', { id: user })
    .execute();
    
  }

  public async deleteCompanySales(): Promise<UserEntity> {
    return this.userRepository
      .createQueryBuilder()
      .delete()
      .from(UserEntity)
      .where('role = :role', { role: 'sales' })
      .execute();
  }

  // TASK
  public async deleteCompanyAgent (id: any) {
      const agentt = await this.userRepository.findOneById(id)

        if(!agentt) throw new BadRequestException(`this Agent does not exist`)

     await this.userRepository.manager.connection.transaction(async manager => {
      const userPermissions:any = await manager.getRepository('userPermissions'),
        user:any = await manager.getRepository('user')
      
      await userPermissions.delete({ user: agentt })
      await user.deleteById(id)
    })
      return {success:true}
  }

  public async createCompanyUser (
    payload: ICreateCompanyUserPayload,
    requestUserId: string
  ) {
    const validRoles: UserRole[] = [ROLE_SYS_ADMIN, ROLE_COMPANY_ADMIN];

    const currentUser = await this.findById(requestUserId, {
      select: ['role'],
      relations: ['company', 'permissions']
    });

    const { company, permissions, role } = currentUser;

    if (!company) {
      throw new NoCompanyException();
    }

    if (company.status !== STATUS_ACCEPTED) {
      throw new UnacceptedCompanyException(company.id, company.status);
    }

    if (!validRoles.includes(role) && !permissions.createAgents) {
      throw new NoPermissionException();
    }

    await this.ensureCanCreateUserOrAgent(requestUserId);

    const newUser = payload;

    newUser.role = ROLE_COMPANY_USER;


    const user = await this.create({
      ...newUser,
      belongsTo:requestUserId,
      permissions: payload.permissions,
      companyUsers: new CompanyEntity({ id: company.id })
    });

    return await this.userRepository
      .createQueryBuilder('user')
      .select()
      .addSelect('user.password')
      .where('user.id = :salesidd', {salesidd:user.id})
      .getOne();
  }

  public async getAgents(user: any, fullName: string): Promise<UserEntity[] | undefined> {
    let agents:any[]
    if(fullName !== undefined) {
      const name = fullName.split(' ');
      if(name.length > 0) {
        if(name.length === 1) {
          agents = await this.userRepository.query(`
            SELECT * FROM "user"
            WHERE LOWER("first_name") LIKE LOWER('${name[0]}%') 
            OR LOWER("last_name") LIKE LOWER('${name[0]}%')`);
        } else {  
          agents = await this.userRepository.query(`
            SELECT * FROM "user" 
            WHERE LOWER("first_name") LIKE LOWER('%${name[0]}%') 
            AND LOWER("last_name") LIKE LOWER('%${name[1]}%')`);       
        }
      } else {
        agents = await this.userRepository
        .createQueryBuilder('user')
        .select()
        .addSelect('user.password')
        .where('user.role IN (:salesidd)', {salesidd:[ROLE_AGENT, ROLE_AGENT_MANAGER]})
        .andWhere('user.belongsTo = :belongsTo',{belongsTo:user.id})
        .getMany();
      } 
    } else {
      agents = await this.userRepository
      .createQueryBuilder('user')
      .select()
      .addSelect('user.password')
      .where('user.role IN (:salesidd)', {salesidd:[ROLE_AGENT, ROLE_AGENT_MANAGER]})
      .andWhere('user.belongsTo = :belongsTo',{belongsTo:user.id})
      .getMany();
    } 

  const conf =  await this.oCampaignConnectedCallsAndAgentsRepository.find({
      select:['userId'],
    })

    const conf_array = conf.map(e=>  e.userId)
      //console.log("conf_array-->",conf_array)
      agents.map((item:any) =>{
        if(conf_array.includes(item.id)){
          item.assign_campaign = true
          return item
        }
        item.assign_to_campaign = false
        return item
      })

      return agents
  }

  public async getSales(userid:string) {
   /* const sales:any = await this.userRepository.find({
      where: {
        role: 'sales',
        belongsTo: userid
      }
    });*/
      const sales:any = await this.userRepository
      .createQueryBuilder('user')
      .select()
      .addSelect('user.password')
      .where('user.role = :salesidd', {salesidd:'sales'})
      .andWhere('user.belongsTo = :belongsTo',{belongsTo:userid})
      .getMany();
   // console.log(sales)
    //console.log(sal)
    if(!sales)
      return `no sales in user ${userid}`;
      
      const tt = await this.userRepository.query(`SELECT  s.*, ca."type" AS type, ca."name" AS name
        FROM      "user" AS s INNER JOIN
        "outboundCampaignConnectedSales" AS pp ON s.id = pp."salesId" INNER JOIN
        "outboundCampaign" AS ca ON pp."outboundCampaignId" = ca.id
        WHERE      s."role" = 'sales' AND s."belongsTo" = '${userid}'`)
       
      sales.map((item:any)=>{
          tt.map((e:any)=>{
            if(item.id == e.id){
              item.Campaign_type = "outbound";
              item.Type = e.type;
              item.Campaign_Name = e.name
              //console.log(item)
            }
          })
          return item
      })


    return sales
  }

  public async getSalesbyId(salesidd:string[]) {
    const sales:any = await this.userRepository.findByIds(salesidd)
    //console.log(sales)
    if(!sales)
      return `no sales in user ${salesidd}`;


    return sales
  }

  public async getUnssignedSalesbyIds(salesidd:string[]) {
    let sales:any
    if(salesidd.length == 0){
      sales = await this.userRepository.find({
        where:{
          role:'sales'
        }
      })
    } else{
       sales = await this.userRepository
      .createQueryBuilder("user")
      .select()
      .where('user.id NOT IN (:salesidd)', {salesidd})
      .andWhere('user.role = :sale',{sale:'sales'})
      .getMany();
    if(!sales)
      return `no sales in user ${salesidd}`;

    }
    return sales
  }

  public async editCompanyUser (
    id: { target: string, requester: string },
    payload: IEditUserPayload,
    avatar?:string
  ) {
    if(!await this.isExistingUserId(id.target)) {
      throw new BadRequestException(`User with id ${id.target} does not exist`);
    }
    
    const userCurrentCredentials:any = await this.userRepository.findOne({
      where: {
        id: id.target
      }
    });
    const currentEmail = userCurrentCredentials.email;

    if( payload.email !== currentEmail){
      if (payload.email && await this.isExistingEmail(payload.email)) {
        throw new DuplicatedEmailException();
      }
    }    
   
    /*if (await this.isExistingAgentEmail(payload.email)) {
      throw new DuplicatedEmailException();
    }*/
    
    if (id.target !== id.requester) {
      const [target, requester] = await this.findManyById([id.target, id.requester], {
        relations: ['company']
      });

      //console.log('test3')
      if (payload.newPassword) {
        throw new NoPermissionException('Password can only be changed by the same user');
      }
    }
     
    if(Object.keys(payload).length === 0)
      return;
     
    if (payload.newPassword) {
      const user = await this.userRepository.findOne({
        where: {
          id: id.target,
          password: encrypt(payload.oldPassword)
        }
      });

      if (!user) {
        throw new NoPermissionException('password:invalid');
      }
    }
   
    var updateDate:any 
            if(avatar){
         updateDate = {
          first_name:payload.first_name?payload.first_name:null,
          last_name:payload.last_name?payload.last_name:null,
          email:payload.email?payload.email:null,
          phone:payload.phone?payload.phone:null,
          state:payload.state?payload.state:null,
          city:payload.city?payload.city:null,
          address:payload.address?payload.address:null,
          //is_active:payload.is_active?payload.is_active:null,
          //country: payload.is_company_admin?payload.is_company_admin:null,
          role:payload.role?payload.role:null,
          reseller_uuid:payload.reseller_uuid?payload.reseller_uuid:null,
         //password : payload.newPassword?encrypt(payload.newPassword):null,
          avatar:avatar

        }
      } else {
         updateDate = {
          first_name:payload.first_name?payload.first_name:null,
          last_name:payload.last_name?payload.last_name:null,
          email:payload.email?payload.email:null,
          phone:payload.phone?payload.phone:null,
          state:payload.state?payload.state:null,
          city:payload.city?payload.city:null,
          address:payload.address?payload.address:null,
          //is_active:payload.is_active?payload.is_active:null,
          //country: payload.is_company_admin?payload.is_company_admin:null,
          role:payload.role?payload.role:null,
          reseller_uuid:payload.reseller_uuid?payload.reseller_uuid:null,
          //password : payload.newPassword?encrypt(payload.newPassword):null,
        }

      }
         
        Object.keys(updateDate).forEach(function (key) {
          if( updateDate[key] == null){
             delete updateDate[key];
           }
         });
        
         if(payload.newPassword){
    updateDate.password = encrypt(payload.newPassword);
         }
    //updateDate = JSON.parse(JSON.stringify(updateDate))
    await this.userRepository.updateById(id.target, updateDate);
    return await this.userRepository.findOneById(id.target)
  }

  public async editCompanySales (
    id: { target: string, requester: string },
    payload: IEditUserPayload
  ){

    if (id.target !== id.requester) {
      const [target] = await this.findManyById([id.target, id.requester], {
        relations: ['company']
      });

      if (target.role === ROLE_SYS_ADMIN) {
        throw new NoPermissionException('System admins can only be updated by themselves');
      }

      if (payload.newPassword) {
        throw new NoPermissionException('Password can only be changed by the same user');
      }
    }

    if (payload.newPassword) {
      const user = await this.userRepository.findOne({
        where: {
          id: id.target,
          password: encrypt(payload.oldPassword)
        }
      });

      if (!user) {
        throw new NoPermissionException('password:invalid');
      }
    }
    
    if(Object.keys(payload).length === 0)
      return;

    await this.userRepository.updateById(id.target, payload);
    return await this.userRepository.findOneById(id.target);
  }

  public async editCompanyAgent (
    id: { target: string, requester: string },
    payload: IEditAgentPayload
  ) {
    if(!await this.isExistingAgentId(id.target)) {
      throw new BadRequestException(`Agent with id ${id.target} does not exist`);
    }

    if (id.target !== id.requester) {
      const [target] = await this.findManyById([id.target, id.requester], {
        relations: ['company']
      });

      if (target.role === ROLE_SYS_ADMIN) {
        throw new NoPermissionException('System admins can only be updated by themselves');
      }

      if (payload.newPassword) {
        throw new NoPermissionException('Password can only be changed by the same user');
      }
    }

    if (payload.newPassword) {
      const user = await this.userRepository.findOne({
        where: {
          id: id.target,
          password: encrypt(payload.oldPassword)
        }
      });

      if (!user) {
        throw new NoPermissionException('password:invalid');
      }
    }
    
    if(Object.keys(payload).length === 0)
      return;

    if(payload.agent_manager) {
      await this.userRepository
        .createQueryBuilder()
        .update(UserEntity)
        .set({ role: ROLE_AGENT_MANAGER })
        .where("id = :id", { id: id.target })
        .execute();

    } else {
      await this.userRepository
        .createQueryBuilder()
        .update(UserEntity)
        .set({ role: ROLE_AGENT })
        .where("id = :id", { id: id.target })
        .execute();
    }
    delete payload.agent_manager
    //console.log(payload)
    if (!Object.keys(payload).length) {
      return await this.userRepository.findOneById(id.target)
    }

    return this.userRepository.updateById(id.target, payload);
  }

  public async addDid(user: any, didNumber: number, name: string) {
    if(await this.isExistingDid(didNumber))
      throw new BadRequestException(`Did number ${didNumber} already exist`)
      
   return await  this.didRepository.manager.connection.transaction(async manager => {
      const did = new DidEntity()
      did.did = didNumber
      did.user = user
      did.name = name

      return await manager.save(did)
    });
  }

  public async getDids(user: any) {
    const found:any = await this.userRepository.findOne({
      relations: ['user_did'],
      where: {
        id: user.id,
        
      }
    })

    return found.user_did
  }

  public async getDid(user: any, user_Id:string) {
    return await this.didRepository.findOneById(user,{
      where:{
        user:user_Id
      }
    })
  }

  public async deleteDid(user: string) {

    await this.didRepository.manager.connection.transaction(async manager => {
      await manager.createQueryBuilder()
      .delete()
      .from(oCampaignCallerRelationName)
      .where('didId = :user', { user })
      .execute();
    return  await manager.getRepository(didEntityName).deleteById(user)
    })
     return {success:true}
  }

  public async findByCredentials (payload: ILoginPayload): Promise<UserEntity | undefined> {
    return await this.userRepository.findOne({
      relations: ['company'],
      where: {
        email: payload.email,
        password: encrypt(payload.password)
      }
    });
  }

  

  public async getagentsss(email:string){
    return await this.userRepository.findOne({
      where:{
        email:email
      }
    })
  }

  public async findByCompany (payload: IFindByCompanyPayload): Promise<IPaginated<UserEntity>> {
    await this.companyService.ensureIsAccepted(payload.companyId);

    let result: any = this.userRepository
      .createQueryBuilder('user')
      .where('user.company_users.id = :id', { id: payload.companyId });

   
      result = result.andWhere('user.belongsTo = :role', { role: payload.userId });
    

    result = await result
      .skip(payload.offset)
      .take(payload.limit)
      .getManyAndCount();

    return {
      items: result[0],
      count: result[1]
    };
  }

  public async isExistingDid(didNumber: number): Promise<boolean> {
    const arr = await this.didRepository.find({
      where: {did: didNumber}
    })

    if(arr.length > 0)
      return true
    else
      return false
  }

  public async findByIdAndCompany (companyId: string, userId: string) {
    //console.log('ste--->',userId)
    const user = await this.userRepository
     .createQueryBuilder('user')
      .select()
      .addSelect('user.password')
      .where('user.id = :salesidd', {salesidd:userId})
      .getOne();
      if(!user) throw new BadRequestException(`user with this id ${userId} does not exist`)
    return user
  }

  public findByIdAndRole (role: string, userId: string,user:any) {
    return this.findOne({
      where: {
        id: userId,
        belongsTo: user,
        role
      }
    });
  }

  public async findOne (options: any) {
    const user = await this.userRepository.findOne(options);

    if (!user) {
      throw new UnknownUserException();
    }

    return user;
  }

  public async findOneforhavayi (options: any) {
    const user = await this.userRepository.findOne(options);

    if (!user) {
      return 'This user does not exist.'
    }

    return user;
  }

  public async isExistingAgentId (id: string): Promise<boolean> {
    if(await this.userRepository.findOne({ select: ['id'], where: { id } }))
      return true;
    else
      return false;  
  }

  /**
   * @throws { UnknownUserException }
   */
  public async findById (id: string, options?: FindOneOptions<UserEntity>): Promise<UserEntity> {
    
    const user = await this.userRepository.findOneById(id, options);
     
    if (!user) {
      throw new UnknownUserException();
    }
      
    return user;
  }

  public async findAgentById(id: string, options?: FindOneOptions<UserEntity>): Promise<UserEntity> {
    const agent = await this.userRepository.findOneById(id, options);
    
    if (!agent) {
      throw new BadRequestException('This agent does not exist.');
    }

    return agent;
  }

  public async findUserByResellerId(id:string){
    return await this.userRepository.find({
      where:{
        reseller_uuid:id
      },
      relations: ['company']
    })
  }

  public async findManyById (ids: string[], options?: FindOneOptions<UserEntity>): Promise<UserEntity[]> {
    const users = await this.userRepository.findByIds(ids, options);

    if (users.some(v => !v)) {
      throw new UnknownUserException();
    }

    return users;
  }

  public async findMany (options?: FindOneOptions<UserEntity>): Promise<UserEntity[]> {
    const users = await this.userRepository.find(options);

    if (users.some(v => !v)) {
      throw new UnknownUserException();
    }

    return users;
  }



  public async isExistingEmail (email: string): Promise<boolean> {
    return !!(await this.userRepository.findOne({ select: ['id'], where: { email } }));
  }

  public async isExistingSalesId (id: string): Promise<boolean> {
    return !!(await this.userRepository.findOne({ select: ['id'], where: { role: 'sales', id} }));
  }

  public async isExistingUserId (id: string): Promise<boolean> {
    return !!(await this.userRepository.findOne({ select: ['id'], where: { id } }));
  }

  public async isExistingAgentEmail (email: string): Promise<boolean> {
    return !!(await this.userRepository.findOne({ select: ['id'], where: { email } }));
  }

  public async ensureCanPerformCompanyAction (payload: IEnsureCanPerformActionPayload): Promise<void> {
    // System admins and company admins can do everything in a company.
    if (payload.user.role === ROLE_SYS_ADMIN || payload.user.role === ROLE_COMPANY_ADMIN) {
      return;
    }
    

    if (!payload.user.companyId) {
      throw new Error('Company id must be provided.');
    }

    const user = await this.findById(payload.user.id, {
      select: ['id'],
      relations: ['permissions'],
      where: {
        company: payload.user.companyId
      }
    });

    if (!user.permissions[payload.action]) {
      throw new NoPermissionException('User does not have permission to perform this action.');
    }
  }

  public async ensureCanCreateUserOrAgent (userID: string): Promise<void> {
    const user = await this.findById(userID, {
      select: ['id'],
      relations: ['company', 'permissions'],
    });

    if(user.company && user.company.status !== STATUS_ACCEPTED) {
      throw new NoPermissionException('User company must have status "accepted" to create user or agent, not "pending" or "rejected"');
    }
  }

  /**
   * @throws { NotASysAdminException }
   */
  public ensureIsSystemAdmin (user: UserEntity): void {
    if (user.role !== ROLE_SYS_ADMIN) {
      throw new NotASysAdminException();
    }
  }

  public async deleteCampaignFromAgent(agentId: string, campaignId:string): Promise<any> {
   /* let all: any[] = await this.oCampaignConnectedCallsConfigRepository
    .createQueryBuilder('outboundCampaignConnectedCallsConfig')
    .leftJoinAndSelect('outboundCampaignConnectedCallsConfig.campaign', 'campaignId')
    .getMany();*/
     //console.log(agentId,campaignId)
    if(!await this.isExistingAgentId(agentId)) {
      throw new BadRequestException(`Agent with this id ${agentId} does not exist`);
    }

    const agents = await this.oCampaignConnectedCallsAndAgentsRepository.query(`SELECT * FROM "outboundCampaignConnectedCallsAndAgents" WHERE "userId"='` + agentId + `'`);
   
    const config:any =  await  this.oCampaignConnectedCallsConfigRepository
      .createQueryBuilder('outboundCampaignConnectedCallsConfig')
      .select()
      .where('outboundCampaignConnectedCallsConfig.campaign = :campaignId', { campaignId: campaignId })
      .andWhereInIds(agents.map((elem:any) => { return elem.outboundCampaignConnectedCallsConfigId}))
      .getOne();

     await  this.oCampaignConnectedCallsConfigRepository
      .createQueryBuilder()
      .delete()
      .from(oCampaignConnectedCallsConfigEntityName)
      //.where('id = :configId', { configId: agents.map((elem:any) => { return elem.outboundCampaignConnectedCallsConfigId}) })
      .where('campaign = :campaignId', { campaignId: campaignId })
      .andWhereInIds(agents.map((elem:any) => { return elem.outboundCampaignConnectedCallsConfigId}))
      .execute();

      await this.oCampaignConnectedCallsAndAgentsRepository
        .createQueryBuilder()
        .delete()
        .from(oCampaignConnectedCallsAndAgentsRelationName)
        .where('outboundCampaignConnectedCallsConfigId = :confId', { confId: config.id })
        .execute();
      
    return this.allAgentCampaigns(agentId)
  }

  public async changeForgetPasswordToken(email:string,token:string){
      return  await this.userRepository
                  .createQueryBuilder()
                  .update(UserEntity)
                  .set({ forget_password_token: token })
                  .where("email = :email", { email: email })
                  .execute();

       }

       public async resetPassword(token:string, password:string){
        // console.log(password)
            const token_user:any = await this.userRepository.findOne({
              where:{
                forget_password_token : token
              }
            })
            if(!token_user){
              throw new BadRequestException(`Token invalid`);
            }
           // console.log(token_user)

            token_user.password = encrypt(password);
            token_user.forget_password_token = null;

            await this.userRepository.save(token_user)
            return 'Your password succesfuly changed'

       }

       public async deleteCompanyfromUser(user:UserEntity,manager:EntityManager){
        //const user:any =   await this.userRepository.findOneById(id)
       // user.company = null
        //return await this.userRepository.save(user)
        if(user.role == ROLE_AGENT || user.role == ROLE_AGENT_MANAGER){
            await this.deleteCompanyAgent(user.id)
        } else if(user.role == ROLE_SALES){
            await this.deleteUserSale(user.id)
        } /*else if(user.role == ROLE_COMPANY_USER){
              await this.deleteCompanyUser(user.id)
        }*/

      return  await manager
              .createQueryBuilder()
              .update(userEntityName)
              .set({ company_users: null })
              .where("id = :id", { id :user.id })
              .execute();
       }

  public async getAllAgents(){
    return await this.userRepository.find({
      where:{
        role:ROLE_AGENT
      }
    })
  }

  public async getresellerUser(id:string){
      const res:any = await this.resellerRepository.findOneById(id);

      return await this.userRepository.findOne({
        where:{
          email:res.email
        }
      })
  }


  public async checkSip(id:string){
    
    const command = 'api show registrations';
   return await this.OCampaignFsService.TelNet(command)
      .then(async (response)=>{
        let value =  response.toString();
        let isInclude =  value.includes('0 total.');

        if (isInclude === false) {
          let sip_usernames_array = await this.parserForLiveResponse(value);
          let sip = await this.arrayIntoString(sip_usernames_array);
          //let response = await live.findUserByEmailCompIdAndSipUsername(verifyToken.company_id, verifyToken.email, sip);
          return ({success: true,response: response})
      }

      return({success: false, response:response})
      })
      .catch((err)=>{
        throw new BadRequestException(err)
      })
  }

  public async getagentcalls(id:string){
    if(!await this.isExistingAgentId(id)) {
      throw new BadRequestException(`Agent with this id ${id} does not exist`);
    }
      const campaigns = await this.allAgentCampaigns(id)
      console.log('campaigns----->', campaigns.length)
      if(!campaigns.langth){
        return {}
      }
      const MCD = await this.getCampaignUuidRowForAgent(campaigns)
      console.log('mcd--->',MCD)
      const MCD_response = await mcd_helper.getMcd(MCD)
      //console.log('MCD_response----->', MCD_response.length)
      if(!MCD_response.langth){
        return {}
      }

      const parse_response_from_cdr = await this.parseCdrResponseForAgentCallsCdrResponse(MCD_response);
      const phones = await this.getPhonesListForGettingContactField(parse_response_from_cdr)
     // console.log('phon-->',phones)
        const contacts = await this.ContactsInfoRepository
        .createQueryBuilder()
        .select()
        .where('phone_number IN (:campaignId)', { campaignId: phones })
        .getMany();
          
        //console.log('contacts-->',contacts)
        const data_with_Name = await this.getCampaignNamesFromTwoArrysForCallsAgentSection(parse_response_from_cdr,campaigns)
        const response = await this.parseDataWithCampaignNameFieldAndLeadsForGettingContactNameFields(data_with_Name,contacts)
        return response


  }

  public async registeragent(user: any, type: string) {
    const agentId = user.id

    if(!await this.isExistingAgentId(agentId)) {
      throw new BadRequestException(`Agent with this id ${agentId} does not exist`);
    }

    await this.userRepository
            .createQueryBuilder()
            .update(UserEntity)
            .set({ register_type : type })
            .where("id = :id", { id: agentId })
            .execute();

    return await this.userRepository.findOneById(agentId);
  }


  private async sendCommandToCmdPromise  (command:string)  {
    return new Promise((resolve, reject) => {
        child_process.exec(command, (error:any, stdout:any, stderr:any) => {
         // console.log(error,'---',stdout, '--*-', stderr)
            if (error) return reject(error);
            if (stderr) return reject(stderr);
            return resolve(stdout)
        })
    })
};

private async parserForLiveResponse (response:string) {
  let object = response.split(",");
  let array:any = [];
  await object.forEach(async (res) => {
      let s = res;
      if (res.startsWith("sofia/external/sips:")) {
          let value = await s.replace("sofia/external/sips:", "");
          let res = await value.substring(0, value.indexOf('@'));
          await array.push(res)
      } else if (res.startsWith("sofia/internal/sips:")) {
          let value = await s.replace("sofia/internal/sips:", "");
          let res = await value.substring(0, value.indexOf('@'));
          await array.push(res)
      }else if (res.startsWith("sofia/internal/sip:")) {
          let value = await s.replace("sofia/internal/sip:", "");
          let res = await value.substring(0, value.indexOf('@'));
          await array.push(res)
      }else if (res.startsWith("sofia/external/sip:")) {
          let value = await s.replace("sofia/internal/sip:", "");
          let res = await value.substring(0, value.indexOf('@'));
          await array.push(res)
      }
  });
  return array;
}

    private async arrayIntoString (array:any[]) {
      if (array.length === 0) {
          return '';
      }
      let response = '';
      await array.forEach((sip_username) => {
          response += `'${sip_username}',`
      });
      if (response.length === 0) {
          return '';
      }
      return response.slice(0, response.length - 1)
    };

    private async  getCampaignUuidRowForAgent  (data:any[]) {
      let response:any[] = [];
      await data.forEach((entity) => {
        response.push(entity.MCD_id)
      });
      let row = '';
      await response.forEach((campaign_start_response) => {
        row += `'${campaign_start_response}',`
      });
      return row.slice(0, row.length - 1)
    };

    private async  parseCdrResponseForAgentCallsCdrResponse  (cdr_response:any[]) {
      let response = [];
      for (let i = 0; i < cdr_response.length; i++) {
        let phone = await this.getPhoneFromDnisFieldInCRDForAgentsSection(cdr_response[i].dnis);
        await response.push({
          phone: phone,
          duration: cdr_response[i].duration,
          date: cdr_response[i].timestamp,
          MCD_id: cdr_response[i].campaign_uuid,
          result: cdr_response[i].auto_disposition
        })
      }
      return response;
    };

    private async  getPhoneFromDnisFieldInCRDForAgentsSection  (dnis:string) {
      let value = await dnis.slice(21, dnis.length);
      return await value.replace(`@${DNL_HOST}:5060`, '')
    };

    private async  getPhonesListForGettingContactField  (array:any[])  {
      let row:any[] = [];
      await array.forEach((value) => {
         row.push(value.phone)
        
      });
      return row
    };

    private async  getCampaignNamesFromTwoArrysForCallsAgentSection  (parse_response_from_cdr:any[], campaigns:any[])  {
      for (let i = 0; i < parse_response_from_cdr.length; i++) {
        for (let j = 0; j < campaigns.length; j++) {
          if (parse_response_from_cdr[i].MCD_id === campaigns[j].MCD_id) {
            parse_response_from_cdr[i].campaign_name = campaigns[j].name;
          }
        }
      }
      return parse_response_from_cdr;
    };

    private async  parseDataWithCampaignNameFieldAndLeadsForGettingContactNameFields  (data_with_campaign_name_field:any[], leads_array:any[])  {
      for (let i = 0; i < data_with_campaign_name_field.length; i++) {
        for (let j = 0; j < leads_array.length; j++) {
          if (data_with_campaign_name_field[i].phone === leads_array[j].phone_number) {
            data_with_campaign_name_field[i].contact = {
              middle_name: (leads_array[j].middle_name) ? leads_array[j].middle_name : 'unknown',
              first_name: (leads_array[j].first_name) ? leads_array[j].first_name : 'unknown',
              last_name: (leads_array[j].last_name) ? leads_array[j].last_name : 'unknown'
            };
          }
        }
      }
      return data_with_campaign_name_field
    };

    public async getAgentDushboard(user:any){
      const agent:any = await this.userRepository.findOneById(user.id)
      const conf:any = await this.oCampaignConnectedCallsAndAgentsRepository
      .createQueryBuilder('outboundCampaignConnectedCallsAndAgents')
      .where("outboundCampaignConnectedCallsAndAgents.MCD_uuid != :confIds",{confIds:'null'})
      .andWhere("outboundCampaignConnectedCallsAndAgents.userId = :id",{id:agent.id})
      .getOne();
     // console.log(conf)
      if(!conf.MCD_uuid) throw new BadRequestException(`you haven't join any campaign`)
      return  await mcd_helper.CallsMadeforOutbound(conf.MCD_uuid)
    }

    public async getAgentStatisticsforCampaign(id:string,companyId:string){
      const agent = await this.userRepository.findOneById(id)

      if(!agent) throw new BadRequestException(`Agent with id ${id} does not exist`)

      const campaign_ids = await this.getCampaignAssignedAgents(companyId,id)

     //console.log('ids--->',campaign_ids)
     const unique = [...new Set(campaign_ids)]
    console.log('unique ids--->',unique) 
     const campaigns = await this.oCamapignRepository.findByIds(unique,{
       where:{
         company:companyId
       }
     })

      /*const campaign = await this.oCamapignRepository.findOneById(campaign_id)

      if(!campaign) throw new BadRequestException(`Campaign with id ${campaign_id} does not exist`)*/
      const response:any[] = [];
      const res:any[] = await mcd_helper.getCountAgentCallsPerCampaign(agent.sipUsername)
     // console.log('mcd res--->',res)
     await campaigns.map((item:any,index:number)=>{
      // console.log('index-->',index)
       //console.log('item-->',item)
       response[index] = {};
       let find = res.find((item:any)=> (item.campaign_uuid === item.MCD_id))
        //console.log('find--->',find)
      if(find){
        response[index].campaign_name = item.name
        response[index].count = find.count

      } else{
        response[index].campaign_name = item.name
        response[index].count = 0
      }
      return
     })

      return response

    }

    public async getAgentStatisticsbyTime(id:string,interval:number,hourly:boolean){
      const start_date =new Date() //await this.parseTimeIntoMS(start);
     
      const agent = await this.userRepository.findOneById(id)
     
      if(!agent) throw new BadRequestException(`You dont have campaign`)
      let response:any[] = []
      let asenq;
      let n:number = 0;
      if(hourly){
      while(interval > n){
       // console.log('+')
      // console.log('now-->',start_date)
       start_date.setHours(start_date.getHours() - 1)
       start_date.setMinutes(0)
       start_date.setMilliseconds(0)
       let data = new Date(start_date)
        data.setHours(start_date.getHours() +1)
       //console.log(`${n} jam araj-->`,start_date)
      // console.log(`${n} jam araj en mek@-->`,data)
        asenq = await mcd_helper.getCountCallsforAgent(agent.sipUsername,start_date.toISOString(),data.toISOString())
        response.push({
          "time":start_date.toUTCString(),
          ...asenq
        })
        //start_date.setHours(start_date.getHours() - hour)
        n++
      }
      } else {
        while(interval > n){
          //console.log('+')
          //console.log('now-->',start_date)
          start_date.setDate(start_date.getDate() - 1)
          let data = new Date(start_date)
          data.setDate(start_date.getDate() +1)
       //console.log(`${n} or araj-->`,start_date)
       //console.log(`${n} or araj en mek@-->`,data)

          asenq = await mcd_helper.getCountCallsforAgent(agent.sipUsername,start_date.toLocaleDateString(),data.toLocaleDateString())
          response.push({
            "time":start_date.toDateString(),
            ...asenq
          })
         n++
        }
  
      }
     
      return response
    }


    public async logoutCompanyAgent(id:string){
      const agent_user:any = await this.userRepository.findOneById(id)

    const realtion:any = await this.oCampaignConnectedCallsAndAgentsRepository
        .createQueryBuilder('outboundCampaignConnectedCallsAndAgents')
        .select()
        .where("outboundCampaignConnectedCallsAndAgents.MCD_uuid IS NOT NULL")
        .andWhere("outboundCampaignConnectedCallsAndAgents.userId = :id",{id})
        .getOne();
    

        console.log('agentRelation--->',realtion)
       

        if(!realtion) throw new BadRequestException(`you are not joined in any campaign`)
        
      const campaign:any = await this.oCamapignRepository.findOneById(realtion.campaignId)
      console.log('cam--->',campaign)
        let Response
      await this.OCampaignFsService.leaveFreeswitchAgent(campaign,agent_user.sipUsername)
              .then(async (data)=>{
                Response = data
                realtion.MCD_uuid = null
                   return await this.oCampaignConnectedCallsAndAgentsRepository.save(realtion)//remove(agents[i].Conf);
              })
               .catch((err)=>{
                  throw new BadRequestException(err)
               })

               return {success:true,Response}
     }

    public async findLoginUser(user:IAuthTokenContent){
        const data:any =  await this.userRepository.findOneById(user.id)
        data.SIP_IP = DNL_HOST
        return data

    }


    public async getCampaignAssignedAgents(company_id:string,agent_id:string){
      const agent = await this.findAgentById(agent_id,{
        where:{
          company_users:company_id
        }
       });

       const conf = await this.oCampaignConnectedCallsAndAgentsRepository.find({
         where:{
           userId:agent_id
         }
       })
       //console.log('confs--->',conf)

       return await conf.map((e:any) =>{return e.campaignId})
    }
  
}
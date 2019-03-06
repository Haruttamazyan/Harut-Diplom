import { Component, Inject, Post, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { userRepositoryToken, resellerRepositoryToken, pricingRepositoryToken } from '../../constants';
import { UserService } from '../user/user.service';
import { ICreateResellerPayload } from '../user/interfaces';
import { UserEntity } from '../user/user.entity';
import { ResellerEntity } from './reseller.entity';
import { encrypt } from '../../utilities/encryption';
import { ROLE_RESELLER, ROLE_SYS_ADMIN } from '../user/types';
import { IEditUserPayload } from '../user/interfaces';
import { NoPermissionException, DuplicatedEmailException } from '../../exceptions';
import { PricingEntity } from './pricing.entity';
import { NoCompanyException } from '../../exceptions';
import { SIGTERM } from 'constants';
import { CompanyEntity } from '../company/company.entity';
import { signToken, forgetToken } from '../../utilities/jwt';
import { BilingPlanService } from '../billing-plan/billing-plan.service'
import {  IPaginationQuery } from '../../interfaces';

@Component()
export class ResellerService {
  constructor (
    @Inject(resellerRepositoryToken)
    private readonly resellerRepository: Repository<ResellerEntity>,
    @Inject(pricingRepositoryToken)
    private readonly pricingRepository: Repository<PricingEntity>,

    private readonly userService: UserService,
    private readonly bilingService:BilingPlanService
  ) {}

  public async createReseller (
     user: any,
     payload: ICreateResellerPayload
  ): Promise<ResellerEntity> {
    // Ensure user is a member of a certain company
    // TODO: Check user has permissions to add recordings.

    payload.permissions = {
      "createAgents":true,
      "editAgents":true,
      "createContactsLists": false,
  "editContactsLists": false,
  "createOutboundCampaigns": false,
  "editOutboundCampaigns": false,
  "deleteOutboundCampaigns": false,
    },
    
    
    await this.userService.createCompanyReseller(payload);

    payload.password = encrypt(payload.password);
   
    return this.resellerRepository.manager.connection.transaction(async manager => {
      const newReseller = await manager.save(
        this.resellerRepository.create({
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: payload.email,          
          avatar: payload.avatar,
          phone: payload.phone,
          password: payload.password,
          role: ROLE_RESELLER
        })
      );

      delete newReseller.password;
      delete newReseller.company;

      return newReseller;
    });
  }

  public async getAllResellers(payload:IPaginationQuery) {
    let skip = 0;
    if(payload.offset && payload.limit){
      skip = payload.offset * payload.limit - payload.limit;
    } 
    // let skip = 0;
    // if(payload.offset == 1){
    //   skip = 0;
    // } else {
    //   skip = (payload.offset - 2) + payload.limit;
    // }

    const [items, count] = await this.resellerRepository//find({});
                  .createQueryBuilder("reseller")
                  .skip(skip)
                  .take(payload.limit)
                  .select()
                  .addSelect("reseller.password")
                  .getManyAndCount()
    
    
    for (let i=0; i < items.length; ++i){
      let company = await this.getResellerCompanies(items[i].id)
      items[i].numberOfCompany = company.count;
      items[i].balance = null;
     delete items[i].forget_password_token
     items[i].creditLimit = null;
    }

    // let c = 0;
    // console.log("count", !payload.offset);
    // console.log("payload", skip)
    // if(payload.offset == 0){
    //   c = count
    // } else {
    //   if(payload.limit > count - skip) {
    //     c = count - skip;
    //   } else {
    //     c = payload.limit
    //   }
    // }

    return { items, count: payload.offset ? payload.limit > count - skip ? count - skip : payload.limit : count }

    // return { items,count: c }
  }

  public async editReseller (
    id: { target: string, requester: string },
    payload: IEditUserPayload
  ){
    if (await this.userService.isExistingAgentEmail(payload.email)) {
      throw new DuplicatedEmailException();
    }

    if (id.target !== id.requester) {
      const [target] = await this.userService.findManyById([id.target, id.requester], {
        relations: ['company']
      });

      if (target.role !== ROLE_SYS_ADMIN) {
        throw new NoPermissionException('System admins can only be updated by themselves');
      }

      if (payload.newPassword) {
        throw new NoPermissionException('Password can only be changed by the same user');
      }
    }

    if (payload.newPassword) {
      const user = await this.resellerRepository.findOne({
        where: {
          id: id.target,
          password: encrypt(payload.oldPassword)
        }
      });

      if (!user) {
        throw new NoPermissionException('password:invalid');
      }
    }

    payload.permissions = {
      createAgents: true,
      editAgents: true
    }

    await this.resellerRepository.updateById(id.target, payload);
    return await this.resellerRepository.findOneById(id.target)
  }

  public async deleteReseller(id: string): Promise<ResellerEntity[]>{
    await this.resellerRepository
      .createQueryBuilder()
      .delete()
      .from(ResellerEntity)
      .where('id = :id', { id })
      .execute();

    return this.resellerRepository.find({});
  }
  
  public async addPricing(id:string, payload:any ){
      const reseler = await this.resellerRepository.findOneById(id);

      const pricing = new PricingEntity();
        pricing.reseler = reseler;
        pricing.country = payload.country? payload.country: null;
        pricing.rate_per_min = payload.rate_per_min? payload.rate_per_min: null;
        pricing.codes = payload.codes? payload.codes: null;
        
       return await this.pricingRepository.save(pricing)

  }

  public async getPricing(id:string){
    const reseler = await this.resellerRepository.findOneById(id);
    return await this.pricingRepository.find({
      where:{
          reseler
      }
    })
  }

  public async getResellerCompanies(id:string){
    const user = await this.userService.findUserByResellerId(id)
   const company = user.map(e => {return e.company})
            return {"companies":company,"count":company.length}

  }


  public async getResellerCompaniesbyreseller(id:string){
    const resl =  await this.userService.findById(id)

    const reseller:any =  await this.resellerRepository.findOne({
      where:{
        email:resl.email
      }
    })

    const user = await this.userService.findUserByResellerId(reseller.id)
   // const plan = await this.bilingService.getBillingPlansList(id)
   const plan = {
    "plan_name": "Sanu",
    "allowed_country_code": 226,
    "monthly_fee_per_day_per_agent":
    
    { "price": 10, "is_active": true }
    ,
    "yearly_fee_per_month_per_agent":
    
    { "price": 20, "is_active": true }
    ,
    "agent_fee_year_per_agent":
    
    { "price": 30, "is_active": true }
    ,
    "belongsTo": "9f5bfc29-7759-41e9-a374-e2102e014f6f",
    "id": "ae126741-9401-4745-91c6-9e3336b9cbff",
    "assigned_on": null
    }
   const company = user.map(e => {return e.company})
            return {"companies":company,"BillingPlans":plan,"count":company.length}



  }

  public async setresellerObjectId(id:string, objectid:number,rate:number){
    return await this.resellerRepository.updateById(id, {
      object_id: objectid,
      rate_table_id:rate
    });
  }

  public async getAllResellerTerminationRoute(id:string){
    return {
      "gateway IP":'',
      "tech_prefix":''
    }
  }

  public async getAllResellerOriginationRoute(id:string){
    return {
      "gateway IP":'',
      "tech_prefix":''
    }
  }

  public async getAllResellerDIDfees(id:string){

    return {
      "Country":"",
      "Rate":""
      
    }
  }

  public async getAllResellerTerminationfees(id:string){

    return {
      "Country":"",
      "Rate":""
      
    }
  }

  public async getAllResellerSMSfees(id:string){

    return {
      "Country":"",
      "Rate":""
      
    }
  }


  public async loginReseller(id:string){
    const res:any = await this.resellerRepository.findOneById(id)
    
    const user = await this.userService.findOne({email:res.email});

    if (!user) {
      throw new BadRequestException(`reseller with ID ${id} does not exist `);
    }

    const company = user.company ? user.company : new CompanyEntity();

    delete user.company;
    delete user.forget_password_token
   
      delete user.reseller_uuid;
      return {
        user,
        token: signToken({
          id: user.id,
          role: user.role,
          companyId: company && company.id
        })
      };
    
  }


  public async getResellerbyId(id:string){


    return await this.resellerRepository.findOneById(id)
  }


  public async addFee(id:string){
    const reseller = await this.resellerRepository.findOneById(id)
    
    if(!reseller) throw new BadRequestException(`reseller with ID ${id} does not exist `);

    return reseller.rate_table_id



  }
  

}

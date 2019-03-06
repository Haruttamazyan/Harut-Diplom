import { Component, Inject, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BillingPlanEntity } from './billing-plan.entity';
import { BillingPlanSysEntity } from './billing-plan-sys.entity'
import { BillingPlanRepositoryToken, BillingPlanSysRepositoryToken } from '../../constants';
import * as countries from 'i18n-iso-countries'
import {  IPaginationQuery } from '../../interfaces';




@Component()
export class BilingPlanService {
  constructor (
    @Inject(BillingPlanRepositoryToken)
    private readonly billingPlanRepository: Repository<BillingPlanEntity>,
    @Inject(BillingPlanSysRepositoryToken)
    private readonly billingPlanSysRepository: Repository<BillingPlanSysEntity>
  ) {}


    public async AddPlan(user_id:string,plan:any){
         if(!countries.isValid(plan.allowed_country_code)){
                   throw new BadRequestException(`Enter allowed country code in ISO standards`)
          }
                
        plan.belongsTo = user_id;
        const contactsList = await this.billingPlanRepository.save(
            this.billingPlanRepository.create(plan)
          );
            return contactsList
    }

    public async getcountries(){

        const codes: any = await countries.getNumericCodes()
            let all:any = [];
            let i =0;
                for (var obj in codes) {
                    if(codes[obj] !=  'XK'){
                       // console.log(countries.getName(obj, "en"),'12', codes[obj])
                   all[i] = {
                       "country": countries.getName(obj, "en"),
                       "code": codes[obj],
                       "iso_code" : obj
                   }
                   ++i
                    }
                    
            
                }
       return all
    }
    public async getBillingPlansList(user_id:string){
        return await this.billingPlanRepository.find({
            where:{
                belongsTo:user_id
            }
        })
    }

    public async getBillingPlansbyId(user_id:string, id:string){
        return await this.billingPlanRepository.findOne({
            where:{
                belongsTo:user_id,
                id:id
            }
        })
    }

    public async editBillingPlansbyId(id:string,data:any){
        if(data.allowed_country_code && !countries.isValid(data.allowed_country_code)){
            throw new BadRequestException(`Enter allowed country code in ISO standards`)
                 }
        return await this.billingPlanRepository.updateById(id,data)

    }

    public async AddPlanSys(plan:any){
        const PLanSys = await this.billingPlanSysRepository.save(
            this.billingPlanSysRepository.create(plan)
                 );

             return PLanSys

    }

    public async getBillingPlansListSys(payload: IPaginationQuery){
        //return await this.billingPlanSysRepository.find()
        if(!payload.limit){
            let plan = await this.billingPlanSysRepository.find()
            return{items:plan,count:plan.length}
        } 
            const cc = await this.billingPlanSysRepository.count()
        const [items, count] = await this.billingPlanSysRepository.findAndCount({
            skip: payload.offset? payload.limit * (payload.offset):payload.offset,
            take: payload.limit,
          });
          return{items,count:cc}
    }

    public async getBillingPlanSysById(id:string){
        return await this.billingPlanSysRepository.findOne({
            where:{
                id:id
            }
        })

    }

    public async editBillingPlansbyIdsys(id:string,data:any){
        return await this.billingPlanSysRepository.updateById(id,data)

    }

    public async deleteBillingPlansbyIdsys(id:string){
        return await this.billingPlanSysRepository.deleteById(id)
    }

}

import { Component, Inject, BadRequestException, MethodNotAllowedException } from '@nestjs/common';
import { Repository } from 'typeorm';
//import { AgentEntity } from '../user/agent.entity';
import { oCampaignRepositoryToken, userRepositoryToken} from '../../constants';
import { OCampaignFsService } from '../campaign/outbound/o-campaign-fs.service'
import { ROLE_SYS_ADMIN, ROLE_COMPANY_ADMIN,ROLE_AGENT } from '../user/types';
import { UserEntity } from '../user/user.entity'
import { OCampaignEntity } from '../campaign/outbound/entities/o-campaign.entity';
import { UserService } from '../user/user.service'
@Component()
export class LiveService {
  constructor (
    @Inject(oCampaignRepositoryToken)
    private readonly oCampaignRepository: Repository<OCampaignEntity>,
    @Inject(userRepositoryToken)
    private readonly userRepository: Repository<UserEntity>,
    private readonly FreeSwitchService: OCampaignFsService,
    private readonly UserService: UserService,
  ) {}

    public async isSipRegistered (user:any){
            console.log('user-->',user)
        const value =  await this.FreeSwitchService.ShowRegistrations()
        const isInclude = await value.includes('0 total.');
        if (isInclude) return {response: false}

        const sip_usernames_array = await this.parserForLiveResponse(value);
        console.log('parserForLiveResponse-->',sip_usernames_array)
        const sip = await this.arrayIntoString(sip_usernames_array);
        console.log('sips-->',sip.substring(1, sip.length - 1))
        let ss = sip.substring(1, sip.length - 1)
        if(user.role === ROLE_COMPANY_ADMIN){
        const users = await this.userRepository
        .createQueryBuilder("user")
        .select()
        .where('user.id = :email',{email:user.id})
        .andWhere('user.sipUsername  IN (:sip)', {sip:sip_usernames_array})
        .getOne();
        if(!users) return {response: false}
        return {response: users}
        }
        if(user.role === ROLE_AGENT){
            const auser:any = await this.userRepository.findOneById(user.id) 
        const agents = await this.userRepository
        .createQueryBuilder("user")
        .select()
        .where('user.email = :email',{email:auser.email})
        .andWhere('user.sipUsername  IN (:sip)', {sip:sip_usernames_array})
        .getOne();
        if(!agents) return {response: false}
        return {response: agents}
        }
    }
        public async getAgents(user:any){

            const value =  await this.FreeSwitchService.ShowRegistrations()
        const isInclude = await value.includes('0 total.');
        if (isInclude) return {response: "No agent is online at the moment"}

        const sip_usernames_array = await this.parserForLiveResponse(value);
        console.log('parserForLiveResponse-->',sip_usernames_array)
        const agent = await this.userRepository
        .createQueryBuilder("user")
        .select()
        .where('user.sipUsername  IN (:sip)', {sip:sip_usernames_array})
        .getMany();
        return {response: agent}

        }


    private async  parserForLiveResponse  (response:string) {
        let object = response.split(",");
        let array:any[] = [];
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
    };

    private async  arrayIntoString (array:any[]) {

            if (array.length === 0) {
                return '';
            }
            let response = '';
            let array2:any[] = [];
            await array.forEach((sip_username) => {
                response += `${sip_username},`
                array2.push(sip_username.substring(1, sip_username.length - 1))
            });
            if (response.length === 0) {
                return '';
            }
            console.log('array2-->',array2)
            return response.slice(0, response.length - 1)
            };

    public async getCalls(user:any){
        if(user.role == ROLE_COMPANY_ADMIN){
        const campaigns = await this.oCampaignRepository.find({
            where:{
                company:user.companyId
            },
            relations:['company']
        })
        //console.log(campaigns)
        if (campaigns.length === 0) throw new BadRequestException('You do not have campaigns');

        let response = await this.parseNumbersFotLiveCalls(campaigns);
        return response
    } else {
        const agent_campaigns = await this.UserService.allAgentCampaigns(user.id)
        console.log('campaigns----?',agent_campaigns)
        if (agent_campaigns.length === 0) throw new BadRequestException('You do not have assigned campaigns');
            
        let response = await this.parseNumbersFotLiveCalls(agent_campaigns,user.id);
        return
    }


    }

    private async parseNumbersFotLiveCalls(campaigns:any[],agentId?:string){
        let res = [];
    for (let campaign of campaigns) {
      const response = await this.FreeSwitchService.getListOfActiveCallsForLive(campaign.MCD_id);
      console.log('-------->',response)
      if (response.length !== 0) {
          console.log('test--->',response[0])
        let eachCampaign:any[] = [];
        //response.map(async (entity:any) =>
        for(let i=0; i<response.length;++i) {
            console.log('test--->',response[i])
          let user:any =await this.userRepository.findOne({
              where:{
                  sipUsername:response[i].agent_url.replace('user/', '')
              }
          })  //await helper.getAgentBySipUsername(entity.agent_url.replace('user/', ''), campaign.company_id);
          if(!agentId){
          let number = await this.getPhoneNumberFromDnisCallsCallsSecond(response[i].lead_url);
          let status = '';
          if (response[i].called_at) {
            status = 'calling'
          }
          if (response[i].rang_at) {
            status = 'ringing'
          }
          if (response[i].answered_at) {
            status = 'connected'
          }
          if (response[i].answered_at && !response[i].agent_url) {
            status = 'waiting for agent'
          }
          if (response[i].agent_url) {
            status = 'talking'
          }
          console.log('11232323--->',number)
          eachCampaign.push({
            number: number,
            campaign_name: campaign.campaign_name,
            status: status,
            agent: user
            
          })
        } else {
            if(user.id != agentId){
            let number = await this.getPhoneNumberFromDnisCallsCallsSecond(response[i].lead_url);
          let status = '';
          if (response[i].called_at) {
            status = 'calling'
          }
          if (response[i].rang_at) {
            status = 'ringing'
          }
          if (response[i].answered_at) {
            status = 'connected'
          }
          if (response[i].answered_at && !response[i].agent_url) {
            status = 'waiting for agent'
          }
          if (response[i].agent_url) {
            status = 'talking'
          }
          console.log('11232323--->',number)
          eachCampaign.push({
            number: number,
            status: status,
            campaign: campaign
            
          })
            }
        }
        };
        console.log('22--->',eachCampaign)
        res.push(eachCampaign)
      }
    }
    console.log('333--->',res)
    return res
    }

    private async  getPhoneNumberFromDnisCallsCallsSecond(dnis:string) {
        if (dnis.length !== 0) {
          let value = await dnis.replace('sofia/internal/', '');
          let next_value = value.slice(6, value.length);
          return await next_value.substring(0, next_value.indexOf('@'));
        }
        return ''
      };


}

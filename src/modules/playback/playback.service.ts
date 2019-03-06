import { Component, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PlaybackEntity } from './playback.entity';
import { playbackRepositoryToken, oCampaignRepositoryToken, companyRepositoryToken } from '../../constants';
import { OCampaignEntity } from '../campaign/outbound/entities/o-campaign.entity'
import { CompanyEntity } from '../company/company.entity'

@Component()
export class PlaybackService {
  constructor (
    @Inject(oCampaignRepositoryToken)
    private readonly oCampaignRepository: Repository<OCampaignEntity>,

    @Inject(playbackRepositoryToken)
    private readonly playbackRepository: Repository<PlaybackEntity>,

    @Inject(companyRepositoryToken)
    private readonly companyRepository: Repository<CompanyEntity>,
  ) {}
  
  public async createPlayback (
    payload: { url: string, companyId:string,fileName:string, campaignId?: string }
  ): Promise<PlaybackEntity> {
   // console.log('here 3')
   const company = await this.companyRepository.findOneById(payload.companyId)
    
    if(payload.campaignId) {
    //console.log('here 4')
      
      const campaign = await this.oCampaignRepository.findOne({
        where: {
          id: payload.campaignId
        }
      })

      //console.log('campaign777:::', campaign)

      const playback = await this.playbackRepository.save(
        this.playbackRepository.create({
          url: payload.url,
          company:company,
          fileName:payload.fileName,
          campaign:campaign
        })
      );

      return playback;
    } else {
      const playback = await this.playbackRepository.save(
        this.playbackRepository.create({
          url: payload.url,
          company:company,
          fileName:payload.fileName
        })
      );

      return playback;      
    }
  }

  public async getPlaybacks (
    payload: any,
    companyid:string
  ) {
    console.log(payload,!payload.limit)
    const company = await this.companyRepository.findOneById(companyid)
    if(!payload.limit){
      let plan = await this.playbackRepository.find({
        where: {
          company: company
        }
      })
      return{items:plan,count:plan.length}
      } 
      const cc = await this.playbackRepository.count({
        where: {
          company: company
        }
      })
  const [items, count] = await this.playbackRepository.findAndCount({
      where: {
        company: company
      },
      skip: payload.offset? payload.limit * (payload.offset):payload.offset,
      take: payload.limit,
    });
    return{items,count:cc}


    //return await this.playbackRepository.find({});
   // const company = await this.companyRepository.findOneById(companyid)
   /* const [items, count] = await this.playbackRepository.findAndCount({
      where: {
        company: company
      },
      skip: payload.offset,
      take: payload.limit
    });

    return { items, count };*/
  }
}

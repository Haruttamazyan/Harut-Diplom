import { Component, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ImageEntity } from './image.entity';
import { imageRepositoryToken } from '../../constants';

@Component()
export class ImageService {
  constructor (
    @Inject(imageRepositoryToken)
    private readonly iamgeRepository: Repository<ImageEntity>,
  ) {}
  
  public async createImage (
    payload: { url: string, companyId?:string, campaignId?: string }
  ): Promise<ImageEntity> {
   // console.log('here 3')
   //const company = await this.companyRepository.findOneById(payload.companyId)
    
    
      const playback = await this.iamgeRepository.save(
        this.iamgeRepository.create({
          url: payload.url
        })
      );

      return playback;      
    
  }

  public async getPlaybacks (
    payload: any,
    companyid:string
  ) {
    //return await this.playbackRepository.find({});
    const company = await this.companyRepository.findOneById(companyid)
    const [items, count] = await this.playbackRepository.findAndCount({
      where: {
        company: company
      },
      skip: payload.offset,
      take: payload.limit
    });

    return { items, count };
  }
}

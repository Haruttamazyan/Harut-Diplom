import { Component, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RecordingEntity } from './recording.entity';
import { recordingRepositoryToken } from '../../constants';
import { UserService } from '../user/user.service';
import { CompanyEntity } from '../company/company.entity';
import { IGetRecordingsPayload } from './interfaces';

@Component()
export class RecordingService {
  constructor (
    @Inject(recordingRepositoryToken)
    private readonly recordingRepository: Repository<RecordingEntity>,
    private readonly userService: UserService
  ) {}

  public async createRecording (
    payload: { companyId: string, userId: string, url: string,fileName:string }
  ): Promise<RecordingEntity> {
    // Ensure user is a member of a certain company
    // TODO: Check user has permissions to add recordings.
    await this.userService.findById(payload.userId, {
      where: {
        company: payload.companyId
      }
    });

    const recording = await this.recordingRepository.save(
      this.recordingRepository.create({
        company: new CompanyEntity({ id: payload.companyId }),
        url: payload.url,
        fileName:payload.fileName
      })
    );

    delete recording.company;

    return recording;
  }

  public async getRecordings (
    payload: IGetRecordingsPayload
  ) {
    console.log(payload,!payload.limit)

    if(!payload.limit){
      let plan = await this.recordingRepository.find({
        where: {
          company: payload.companyId
        }
      })
      return{items:plan,count:plan.length}
      } 
      const cc = await this.recordingRepository.count({
        where: {
          company: payload.companyId
        }
      })
  const [items, count] = await this.recordingRepository.findAndCount({
      where: {
        company: payload.companyId
      },
      skip: payload.offset? payload.limit * (payload.offset):payload.offset,
      take: payload.limit,
    });
    return{items,count:cc}

   /* return await this.recordingRepository.find({
      where: {
        company: payload.companyId
      },
      skip: payload.offset,
      take: payload.limit
    });*/
  }
  
}

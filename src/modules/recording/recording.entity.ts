import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { CompanyEntity } from '../company/company.entity';
import { OCampaignEntity } from '../campaign/outbound/entities/o-campaign.entity';
import { recordingEntityName } from '../../constants';
import {
  OCampaignConnectedCallsConfigEntity
} from '../campaign/outbound/entities/o-campaign-connected-calls-config.entity';

@Entity(recordingEntityName)
export class RecordingEntity {
  constructor (payload?: { id?: string }) {
    if (payload && payload.id) {
      this.id = payload.id;
    }
  }

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(() => CompanyEntity, company => company.recordings, { nullable: true })
  public company: CompanyEntity;

  @OneToMany(() => OCampaignEntity, c => c.abandonedMessage)
  public oCampaignAbandonedMessage: OCampaignEntity;

  @OneToMany(() => OCampaignConnectedCallsConfigEntity, c => c.playbackAudio)
  public oCampaignPlaybackAudio: OCampaignConnectedCallsConfigEntity;
/*
  @OneToMany(() => OCampaignConnectedCallsConfigEntity, c => c.introAudio)
  public oCampaignIntroAudio: OCampaignConnectedCallsConfigEntity;*/

  @Column()
  public url: string;

  @Column({ nullable: true })
  public fileName: string;
}

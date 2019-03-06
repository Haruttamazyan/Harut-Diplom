import { Entity, PrimaryGeneratedColumn,OneToMany, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { OCampaignEntity } from '../campaign/outbound/entities/o-campaign.entity'
import { playbackEntityName } from '../../constants';
import { CompanyEntity } from '../company/company.entity';

import {
  OCampaignConnectedCallsConfigEntity
} from '../campaign/outbound/entities/o-campaign-connected-calls-config.entity';
@Entity(playbackEntityName)

export class PlaybackEntity {
  constructor (payload?: { id?: string }) {
    if (payload && payload.id) {
      this.id = payload.id;
    }
  }

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  /*@OneToOne(() => OCampaignEntity, v => v.playback, { nullable: true })
  @JoinColumn()
  public campaign: OCampaignEntity;*/

  @OneToMany(() => OCampaignConnectedCallsConfigEntity, c => c.playbackAudio)
  public oCampaignPlaybackAudio: OCampaignConnectedCallsConfigEntity;

  @ManyToOne(() => CompanyEntity, company => company.playbacks, { nullable: true })
  public company: CompanyEntity;

  @Column()
  public url: string;

  @Column({ nullable: true })
  public fileName: string;
}

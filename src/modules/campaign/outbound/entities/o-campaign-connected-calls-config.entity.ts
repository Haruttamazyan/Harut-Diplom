import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { OCampaignEntity } from './o-campaign.entity';

import { ConnectedCallAction } from '../types';
import {
  oCampaignConnectedCallsConfigEntityName,
  oCampaignConnectedCallsAndAgentsRelationName
} from '../../../../constants';
import { IDtmf } from '../interfaces';
import { PlaybackEntity } from '../../../playback/playback.entity'


@Entity(oCampaignConnectedCallsConfigEntityName)
export class OCampaignConnectedCallsConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(() => OCampaignEntity, v => v.connectedCallsConfig, { nullable: false })
  @JoinColumn()
  public campaign: OCampaignEntity;


  @Column({ type: 'varchar' })
  public action: ConnectedCallAction;

  // For action "playback & ivr".
  @ManyToOne(() => PlaybackEntity, r => r.oCampaignPlaybackAudio)
  public playbackAudio: PlaybackEntity;


  // For action "ivr"
  @Column({ type: 'jsonb', nullable: true })
  public dtmf: IDtmf[];

  @Column({ type: 'varchar', nullable: true  })
  public file: string;
}

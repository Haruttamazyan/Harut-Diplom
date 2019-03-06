import {
  Entity,
  PrimaryGeneratedColumn,
  Column
} from 'typeorm';

import {
  oCampaignConnectedMediaName
} from '../../../../constants';

@Entity(oCampaignConnectedMediaName)
export class OCampaignConnectedMediaEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ nullable: true })
  public campaign_id: string;

  @Column({ nullable: true })
  public media_file_url: string;
}

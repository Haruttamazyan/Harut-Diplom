import {
  Entity,
  PrimaryGeneratedColumn,
  Column
} from 'typeorm';

import {
  oCampaignConnectedDNCName
} from '../../../../constants';

@Entity(oCampaignConnectedDNCName)
export class OCampaignConnectedDNCEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ nullable: true })
  public campaign_id: string;

  @Column({ nullable: true })
  public dnc_file_url: string;
}

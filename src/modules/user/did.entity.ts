import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany,OneToOne} from 'typeorm';

import { didEntityName } from '../../constants';
import { UserEntity } from './user.entity';
import { OCampaignEntity } from '../campaign/outbound/entities/o-campaign.entity'
import { DidGroupEntity } from '../did-group/did-gropu.entity'

@Entity(didEntityName)
export class DidEntity {
  constructor (payload?: { id?: string }) {
    if (payload && payload.id) {
      this.id = payload.id;
    }
  }

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar' })
  public did: number;

  @Column({ type: 'varchar' })
  public name: string;

  @ManyToMany(() => OCampaignEntity, o => o.callerIds)
  public campaign: OCampaignEntity[];

  @ManyToOne(() => UserEntity, u => u.user_did)
  public user: UserEntity;

  @ManyToOne(() => DidGroupEntity, u => u.dids)
  public group: DidGroupEntity;
}
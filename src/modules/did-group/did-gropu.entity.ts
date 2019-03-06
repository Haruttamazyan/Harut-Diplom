import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToMany,OneToMany} from 'typeorm';

import { didGroupEntityName } from '../../constants';
import { DidEntity } from '../user/did.entity';
import { OCampaignEntity } from '../campaign/outbound/entities/o-campaign.entity'

@Entity(didGroupEntityName)
export class DidGroupEntity {

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar' })
  public name: string;

  @OneToMany(() => DidEntity, o => o.group)
  public dids: DidEntity[];

//   @ManyToOne(() => UserEntity, u => u.user_did)
//   public user: UserEntity;
}
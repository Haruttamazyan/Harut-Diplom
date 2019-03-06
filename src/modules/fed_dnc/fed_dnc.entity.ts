import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn} from 'typeorm';

import { fed_dncEntityName } from '../../constants';
import { UserEntity } from '../user/user.entity'

@Entity(fed_dncEntityName)
export class FedDncEntity {

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public number: string;

  @CreateDateColumn()
  public created_on: Date;

  @ManyToOne(() => UserEntity, o => o.fed_dnc)
  @JoinColumn()
  public user: UserEntity;

}
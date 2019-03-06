import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { userPermissionsEntityName } from '../../constants';
import { UserEntity } from './user.entity';
import { IUserPermissions } from './interfaces';

@Entity(userPermissionsEntityName)
export class UserPermissionsEntity implements IUserPermissions {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @OneToOne(() => UserEntity, u => u.permissions, { nullable: false })
  @JoinColumn()
  public user: UserEntity;

  @Column()
  public createAgents: boolean;

  @Column()
  public editAgents: boolean;

  @Column()
  public createContactsLists: boolean;

  @Column()
  public editContactsLists: boolean;

  @Column()
  public createOutboundCampaigns: boolean;

  @Column()
  public editOutboundCampaigns: boolean;

  @Column()
  public deleteOutboundCampaigns: boolean;
}

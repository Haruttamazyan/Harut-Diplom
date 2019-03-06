import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  Column,
  CreateDateColumn,
  OneToOne
} from 'typeorm';
import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import {
  oCampaignConnectedSalesName
} from '../../../../constants';
import { UserEntity } from '../../../user/user.entity';

@Entity(oCampaignConnectedSalesName)
export class OCampaignConnectedSalesEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;
/*
  @Expose()
  @IsUUID()
  @ApiModelProperty()
  @Column({ type: 'uuid', nullable: true })
  public salesId: string;*/

  @OneToOne(() => UserEntity, v => v.salescampaign)
  @JoinColumn()
  public sales: UserEntity;

  @Expose()
  @IsUUID()
  @ApiModelProperty()
  @Column({ type: 'uuid' })
  public outboundCampaignId: string;

  @Expose()
  @IsUUID()
  @Column({ type: 'uuid', nullable: true })
  public belongsTo: string;

  @CreateDateColumn()
  public assigned_on: Date;
}

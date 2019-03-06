import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn
} from 'typeorm';
import { Expose } from 'class-transformer';

import { IsUUID } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import {
  oCampaignConnectedCallsAndAgentsRelationName
} from '../../../../constants';

@Entity(oCampaignConnectedCallsAndAgentsRelationName)
export class OCampaignConnectedCallsAndAgentsEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;
  
  @Expose()
  @IsUUID()
  @ApiModelProperty()
  @Column({ type: 'uuid' })
  public outboundCampaignConnectedCallsConfigId: string;

  @Expose()
  @IsUUID()
  @ApiModelProperty()
  @Column({ type: 'uuid' })
  public userId: string;

  @Expose()
  @IsUUID()
  @ApiModelProperty()
  @Column({ type: 'uuid', nullable: true })
  public campaignId: string;

  @Expose()
  @IsUUID()
  @ApiModelProperty()
  @Column({ type: 'varchar', enum: ["hold", "unhold"], default: "unhold"})
  public status: string;

  @Expose()
  @IsUUID()
  @Column({ type: 'uuid', nullable: true })
  public belongsTo: string;

  @Expose()
  @ApiModelProperty()
  @Column({nullable: true })
  public MCD_uuid: string;

  @CreateDateColumn()
  public assigned_on: Date;
}

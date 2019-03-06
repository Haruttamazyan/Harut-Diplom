import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn
  } from 'typeorm';
import { Expose } from 'class-transformer';

import { IsUUID, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import {
  cdrEntityName
} from '../../../constants';

@Entity(cdrEntityName)
export class CDREntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;
  
  @Expose()
  @CreateDateColumn()
  public timestamp: string;

  @Expose()
  @IsUUID()
  @ApiModelProperty()
  @Column({ type: 'uuid'})
  public campaign_uuid: string;
  
  @Expose()
  @IsUUID()
  @ApiModelProperty()
  @Column({ type: 'uuid'})
  public lead_uuid: string;

  @Expose()
  @IsUUID()
  @ApiModelProperty()
  @Column({ type: 'uuid'})
  public recording_uuid: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  @Column({ type: 'varchar', length: 20})
  public call_start_on: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  @Column({ type: 'varchar', length: 20})
  public answered_on: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  @Column({ type: 'varchar', length: 20})
  public ended_on: string;

  @Expose()
  @IsUUID()
  @ApiModelProperty()
  @Column({ type: 'uuid'})
  public connected_to_agent_uuid: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  @Column({ type: 'varchar', length: 20})
  public duration: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  @Column({ type: 'varchar', length: 64})
  public disposition: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  @Column({ type: 'varchar', length: 64})
  public auto_disposition: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  @Column({ type: 'varchar', length: 16})
  public ani: string;
  
  @Expose()
  @IsString()
  @ApiModelProperty()
  @Column({ type: 'varchar', length: 256})
  public dnis: string;

  @Expose()
  @IsUUID()
  @ApiModelProperty()
  @Column({ type: 'uuid' })
  public call_uuid: string;

  @Expose()
  @IsUUID()
  @ApiModelProperty()
  @Column({ type: 'varchar', enum: ["hold", "unhold"], default: "unhold"})
  public status: string;
}

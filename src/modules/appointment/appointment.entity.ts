import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToMany, JoinColumn, JoinTable, CreateDateColumn } from 'typeorm';
import { UserEntity } from '../user/user.entity';
//import { AgentEntity } from '../user/agent.entity';

import { OCampaignEntity } from '../campaign/outbound/entities/o-campaign.entity'
import { OCampaignTimeSlotEntity } from '../campaign/outbound/entities/o-campaign-time-slot.entity';
import {
  appointmentEntityName,
  oCampaignAppointmentsAndSalesPersonsRelationName,
  oCampaignAppointmentsAndAgentsRelationName
} from '../../constants';

@Entity(appointmentEntityName)
export class AppointmentEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @OneToOne(() => OCampaignEntity, campaign => campaign.appointment, { nullable: false })
  @JoinColumn()
  public campaign: OCampaignEntity;

  @Column()
  public isEnabled: boolean;

  // Only required when "isEnabled" is true.
  // Because of the long relation table name, it will get truncated by postgres, so
  // leaving it to the orm will cause an error saying "relation already exists"
  @Column({ type: 'jsonb', nullable: true })
  public assignedSalesPersons: string[];

  // Only required when "isEnabled" is true.
  // Because of the long relation table name, it will get truncated by postgres, so
  // leaving it to the orm will cause an error saying "relation already exists"
  @Column({ type: 'jsonb', nullable: true })
  public assignedAgents: string[];

  @Column({type: 'uuid', nullable: true})
  public created_by_uuid: string;

  @Column({type: 'date', nullable: true})
  public scheduled_on: string;

  @Column({type: 'uuid', nullable: true})
  public call_uuid:string;

  @Column({type: 'varchar', nullable: true})
  public description:string;

  @Column({type: 'uuid', nullable: true})
  public contact_id:string;

  @Column({type: 'varchar', nullable: true})
  public title:string;

  // Only required when "isEnabled" is true.
  @OneToOne(() => OCampaignTimeSlotEntity, v => v.campaignAppointmentsConfig)
  public timeSlot: OCampaignTimeSlotEntity;

  @CreateDateColumn({nullable:true})
  public created: Date;
}

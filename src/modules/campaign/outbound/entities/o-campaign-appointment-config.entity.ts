import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { UserEntity } from '../../../user/user.entity';
//import { AgentEntity } from '../../../user/agent.entity';

import { OCampaignEntity } from './o-campaign.entity';
import { OCampaignTimeSlotEntity } from './o-campaign-time-slot.entity';
import {
  oCampaignAppointmentsConfigEntityName,
  oCampaignAppointmentsAndSalesPersonsRelationName,
  oCampaignAppointmentsAndAgentsRelationName
} from '../../../../constants';

@Entity(oCampaignAppointmentsConfigEntityName)
export class OCampaignAppointmentConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @OneToOne(() => OCampaignEntity, campaign => campaign.appointmentsConfig, { nullable: false })
  @JoinColumn()
  public campaign: OCampaignEntity;

  @Column()
  public isEnabled: boolean;

  // Only required when "isEnabled" is true.
  // Because of the long relation table name, it will get truncated by postgres, so
  // leaving it to the orm will cause an error saying "relation already exists"
 /* @ManyToMany(() => UserEntity, user => user.outboundCampaignAppointments)
  @JoinTable({ name: oCampaignAppointmentsAndSalesPersonsRelationName })
  public assignedSalesPersons: UserEntity[];*/

  // Only required when "isEnabled" is true.
  // Because of the long relation table name, it will get truncated by postgres, so
  // leaving it to the orm will cause an error saying "relation already exists"
  /*@ManyToMany(() => AgentEntity, agent => agent.outboundCampaignAppointments)
  @JoinTable({ name: oCampaignAppointmentsAndAgentsRelationName })
  public assignedAgents: AgentEntity[];*/

  @Column({type: 'uuid', nullable: true})
  public assignedBy: string;

  @Column({type: 'varchar', nullable: true})
  public time: string;

  @Column({type: 'uuid', nullable: true})
  public call_uuid:string;

  // Only required when "isEnabled" is true.
  @OneToOne(() => OCampaignTimeSlotEntity, v => v.campaignAppointmentsConfig)
  public timeSlot: OCampaignTimeSlotEntity;
}

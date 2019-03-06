import { Entity, PrimaryGeneratedColumn, OneToOne, Column, JoinColumn } from 'typeorm';
import { OCampaignAppointmentConfigEntity } from './o-campaign-appointment-config.entity';
import { OCampaignEntity } from './o-campaign.entity';
import { oCampaignTimeSlotEntityName } from '../../../../constants';
import { ITimeSlotDay } from '../interfaces';

@Entity(oCampaignTimeSlotEntityName)
export class OCampaignTimeSlotEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @OneToOne(() => OCampaignAppointmentConfigEntity, v => v.timeSlot)
  @JoinColumn()
  public campaignAppointmentsConfig: OCampaignAppointmentConfigEntity;

  @OneToOne(() => OCampaignEntity, v => v.timeSlot)
  @JoinColumn()
  public campaign: OCampaignEntity;

  @Column({ type: 'date' })
  public start_date: string;

  @Column({ type: 'date' })
  public end_date: string;
  
  @Column({ type: 'boolean' })
  public mon: boolean;

  @Column({ type: 'boolean' })
  public tue: boolean;

  @Column({ type: 'boolean' })
  public wed: boolean;

  @Column({ type: 'boolean' })
  public thu: boolean;

  @Column({ type: 'boolean' })
  public fri: boolean;

  @Column({ type: 'boolean' })
  public sat: boolean;

  @Column({ type: 'boolean' })
  public sun: boolean;

  @Column({ type: 'time' })
  public start_time: string;

  @Column({ type: 'time' })
  public end_time: string;
}

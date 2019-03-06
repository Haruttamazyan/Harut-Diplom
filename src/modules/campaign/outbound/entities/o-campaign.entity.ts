import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  ManyToMany,
  JoinTable,
  JoinColumn
} from 'typeorm';
import { CompanyEntity } from '../../../company/company.entity';
import { ContactsListEntity } from '../../../contacts-list/contacts-list.entity';
import { CampaignStrategy, MCIStrategy, CampaignType, CampaignStatus } from '../types';
import { OCampaignQuestionEntity } from './o-campaign-question.entity';
import { OCampaignAppointmentConfigEntity } from './o-campaign-appointment-config.entity';
import { OCampaignOrderTakenFormEntity } from './o-campaign-order-taken-form.entity';
import { OCampaignConnectedCallsConfigEntity } from './o-campaign-connected-calls-config.entity';
import { OCampaignTimeSlotEntity } from './o-campaign-time-slot.entity';
import { name } from '../o-campaign.boundaries';
import { RecordingEntity } from '../../../recording/recording.entity';
import { oCampaignEntityName, oCampaignContactsListRelationName, oCampaignCallerRelationName} from '../../../../constants';
import { DidEntity } from '../../../user/did.entity'
import { PlaybackEntity } from '../../../playback/playback.entity'
//import { join } from 'path';
import { AppointmentEntity } from '../../../appointment/appointment.entity';

@Entity(oCampaignEntityName)
export class OCampaignEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(() => CompanyEntity, company => company.outboundCampaigns, { nullable: false, onDelete: 'CASCADE'})
  public company: CompanyEntity;

  @ManyToMany(() => ContactsListEntity, contact => contact.campaigns)
  @JoinTable({ name: oCampaignContactsListRelationName })
  public contactsLists: ContactsListEntity[];

  // Caller ids must have their own table.
  @ManyToMany(() => DidEntity, d => d.campaign)
  @JoinTable({name: oCampaignCallerRelationName})
  public callerIds: DidEntity[];

  @Column({nullable: true})
  public script: string;

  @OneToMany(() => OCampaignQuestionEntity, question => question.campaign)
  public questions: OCampaignQuestionEntity[];

  /*@OneToOne(() => PlaybackEntity, p => p.campaign, {nullable: true})
  public playback: PlaybackEntity;*/

  @OneToOne(() => OCampaignAppointmentConfigEntity, v => v.campaign, { nullable: true })
  public appointmentsConfig: OCampaignAppointmentConfigEntity;

  @OneToOne(() => OCampaignOrderTakenFormEntity, v => v.campaign, { nullable: true })
  public orderTakenForm: OCampaignOrderTakenFormEntity;

  @OneToMany(() => OCampaignConnectedCallsConfigEntity, v => v.campaign)
  public connectedCallsConfig: OCampaignConnectedCallsConfigEntity[];

  @OneToOne(() => OCampaignTimeSlotEntity, v => v.campaign)
  public timeSlot: OCampaignTimeSlotEntity;

  @ManyToOne(() => RecordingEntity, r => r.oCampaignAbandonedMessage)
  @JoinColumn()
  public abandonedMessage: RecordingEntity;

  @OneToOne(() => AppointmentEntity, q => q.campaign)
  public appointment: AppointmentEntity;

  @Column({ type: 'varchar' })
  public type: CampaignType;

  @Column({ length: name.maxLength })
  public name: string;

  @Column({ type: 'varchar',nullable: true })
  public strategy: CampaignStrategy;

  @Column({ type: 'varchar' })
  public status: CampaignStatus;

  @Column({nullable: true})
  public breakTimeBetweenCalls: number;

  // Can be null if only one caller id is set.
  @Column({ type: 'varchar', nullable: true })
  public MCIStrategy: MCIStrategy;

  @Column({ type: 'double precision',nullable: true })
  public callRatio: number;

  @Column({ nullable: true })
  public prefix: string;

  @Column({ nullable: true })
  public MCD_id: string;

  @Column({ nullable: true })
  public lead_id: string;

  @Column({ nullable: true })
  public dnl_ingress_id: string;
}

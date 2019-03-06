import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, ManyToOne, CreateDateColumn } from 'typeorm';
import * as company from './company.boundaries';
import { UserEntity } from '../user/user.entity';
import { ContactsListEntity } from '../contacts-list/contacts-list.entity';
import { CompanyStatus } from './types';
import { ContactEntity } from '../contacts-list/modules/contact/contact.entity';
import { OCampaignEntity } from '../campaign/outbound/entities/o-campaign.entity';
import { RecordingEntity } from '../recording/recording.entity';
import { ResellerEntity } from '../reseller/reseller.entity';
import { PlaybackEntity } from '../playback/playback.entity'
import { companyProfileEntity } from './compnay-profile.entity'
import { companyEntityName } from '../../constants';
import { BillingPlanEntity } from '../billing-plan/billing-plan.entity'
import { BillingPlanSysEntity } from '../billing-plan/billing-plan-sys.entity'
import { textTTSEntity } from './textTTS.entity'
import { companypaymentEntity } from './company-payment.entity'
@Entity(companyEntityName)
export class CompanyEntity {
  constructor (payload?: { id?: string }) {
    if (payload && payload.id) {
      this.id = payload.id;
    }
  }

  @CreateDateColumn()
  public created: Date;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @OneToOne(() => UserEntity, user => user.company)
  @JoinColumn()
  public owner: UserEntity;
  @OneToMany(() => UserEntity, user => user.company_users)
  public users: UserEntity[];

  @OneToOne(() => companyProfileEntity, p => p.company)
  public profile: companyProfileEntity;

  @OneToOne(() => companypaymentEntity, p => p.company)
  public payment: companypaymentEntity;

  @OneToMany(() => textTTSEntity, p => p.Created_By)
  public textTTS: textTTSEntity[];
  

  /*@OneToMany(() => UserEntity, user => user.company)
  public agents: UserEntity[];*/

  @OneToMany(() => OCampaignEntity, campaign => campaign.company)
  public outboundCampaigns: OCampaignEntity[];

  @OneToMany(() => ContactsListEntity, c => c.company)
  public contactsLists: ContactsListEntity[];

  @OneToMany(() => ContactEntity, c => c.company)
  public contacts: ContactEntity[];

  @OneToMany(() => RecordingEntity, recording => recording.company)
  public recordings: RecordingEntity[];

  @OneToMany(() => PlaybackEntity, playback => playback.company)
  public playbacks: PlaybackEntity[];

  @OneToOne(() => BillingPlanEntity, p => p.company)
  public bilingPlan: BillingPlanEntity;

  @OneToOne(() => BillingPlanSysEntity, p => p.company)
  public bilingPlanSys: BillingPlanSysEntity;

  @Column({ length: company.name.maxLength })
  public company_name: string;

  @Column({ length: company.address1.maxLength })
  public address1: string;

  @Column({ length: company.address2.maxLength, nullable: true })
  public address2: string;

  @Column({ length: company.address2.maxLength })
  public country: string;

  @Column({ length: company.state.maxLength })
  public state: string;

  @Column()
  public phone: string;
/*
  @Column()
  public first_name: string;

  @Column()
  public last_name: string;
*/
  @Column()
  public email: string;

  @Column({ nullable: true })
  public object_id: number;
  
  @Column({nullable: true})
  public city: string;

  @Column({nullable: true})
  public zipcode: string;

  @Column({ type: 'varchar' })
  public status: CompanyStatus;

  @Column()
  public dnl_client_id: number;

  @Column({type: 'timestamp', nullable: true})
  public Registered_On: Date;
}

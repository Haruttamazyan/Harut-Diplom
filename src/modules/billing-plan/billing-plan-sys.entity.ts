import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { billingPlanSysEntityName } from '../../constants';
import { Price } from './interfaces';
import { CompanyEntity } from '../company/company.entity'


@Entity(billingPlanSysEntityName)
export class BillingPlanSysEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public plan_name: string;

  @Column({ type: 'jsonb', nullable: false })
  public monthly: Price;

  @Column({ type: 'jsonb', nullable: false })
  public yearly: Price;

  @Column({ type: 'jsonb', nullable: true })
  public custom_price: Price[];

  @OneToOne(() => CompanyEntity, p => p.bilingPlanSys)
  @JoinColumn()
  public company: CompanyEntity;

  @Column({type: 'timestamp', nullable: true})
  public assigned_on: Date;


}

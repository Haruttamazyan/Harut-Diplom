import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { BillingPlanPriceEntity } from './billing-plan-price.entity';
import { billingPlanEntityName } from '../../constants';
import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { CompanyEntity } from '../company/company.entity'
import { Price2 } from './interfaces'


@Entity(billingPlanEntityName)
export class BillingPlanEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public plan_name: string;

  @OneToOne(() => BillingPlanPriceEntity, v => v.billingPlan)
  @JoinColumn()
  public price: BillingPlanPriceEntity;

  @OneToOne(() => CompanyEntity, p => p.bilingPlan)
  @JoinColumn()
  public company: CompanyEntity;

  @Column()
  public allowed_country_code: string;

  @Column({type: 'jsonb', nullable: true })
  public monthly_fee_per_day_per_agent: Price2;

  @Column({type: 'jsonb', nullable: true })
  public yearly_fee_per_month_per_agent: Price2;

  @Column({type: 'jsonb', nullable: true })
  public agent_fee_year_per_agent: Price2;

  @Expose()
  @IsUUID()
  @Column({ type: 'uuid', nullable: true })
  public belongsTo: string;

  @Column({type: 'timestamp', nullable: true})
  public assigned_on: Date;

}

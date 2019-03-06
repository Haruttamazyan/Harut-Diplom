import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { BillingPlanEntity } from './billing-plan.entity';
import { billingPlanPriceEntityName } from '../../constants';

@Entity(billingPlanPriceEntityName)
export class BillingPlanPriceEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'money' })
  public amount: number;

  @Column()
  public frequency: string;

  @Column()
  public isEnabled: boolean;

  @Column()
  public order: number;

  @Column()
  public type: string;

  @OneToOne(() => BillingPlanEntity, v => v.price)
  public billingPlan: BillingPlanEntity;
}

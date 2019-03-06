import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { ResellerEntity } from './reseller.entity';
import { pricingEntityName } from '../../constants';

@Entity(pricingEntityName)
export class PricingEntity {
  
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(() => ResellerEntity, r => r.pricing, { nullable: false })
  public reseler: ResellerEntity;

  @Column({ nullable: true })
  public country: string;

  @Column({ nullable: true })
  public rate_per_min: number;


  @Column({ type: 'jsonb', nullable: true })
  public codes: string[];
}

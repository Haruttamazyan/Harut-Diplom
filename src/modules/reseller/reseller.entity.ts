import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';

import { CompanyEntity } from '../company/company.entity';
import { resellerEntityName } from '../../constants';
import { PricingEntity } from './pricing.entity'
import { User } from '../user/user.abstract.class';
import { userPassword } from '../user/user.boundaries';

@Entity(resellerEntityName)
export class ResellerEntity extends User {

  @OneToMany(() => PricingEntity, p => p.reseler)
  public pricing: PricingEntity[];

  @Column({ nullable: true })
  public object_id: number;

  @Column({ nullable: true })
  public rate_table_id: number;

  @Column({ type: 'boolean',nullable: true , default: false })
  public isEnabled: boolean;
}

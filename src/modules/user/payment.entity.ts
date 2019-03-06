import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

import { paymentsEntityName } from '../../constants';

@Entity(paymentsEntityName)
export class PaymentsEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  /*@Column({ type: 'varchar'})
  public first_name: string;

  @Column({ type: 'varchar'})
  public last_name: string;*/
  @Column({ nullable: true})
  public card_name: string;

  @Column({ type: 'money' })
  public amount: number;

  @Column({ type: 'varchar'})
  public credit_card_no: string;

  @Column({ type: 'varchar' })
  public cvv: string;
/*
  @Column({ type: 'varchar'})
  public expiry_month: string;

  @Column({ type: 'varchar'})
  public expiry_year: string;*/
  @Column({type: 'date', nullable: true})
  public expire_date: string;
}
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, ManyToOne, CreateDateColumn } from 'typeorm';
import * as company from './company.boundaries';
import { CompanyEntity } from './company.entity';
import { companyPaymentEntityName } from '../../constants';
import { userAvatar } from '../user/user.boundaries';


@Entity(companyPaymentEntityName)
export class companypaymentEntity {

    @PrimaryGeneratedColumn('uuid')
    public id: string;
  
    @OneToOne(() => CompanyEntity, p => p.payment)
    @JoinColumn()
    public company: CompanyEntity;

    @Column()
    public amount: string;
  
    @Column()
    public payment_type: string;
  
    @CreateDateColumn()
    public paid_on: Date;
  
    @Column({nullable:true})
    public note: string;

}

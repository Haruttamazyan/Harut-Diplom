import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, ManyToOne, CreateDateColumn } from 'typeorm';
import * as company from './company.boundaries';
import { CompanyEntity } from './company.entity';
import { companyProfileEntityName } from '../../constants';
import { userAvatar } from '../user/user.boundaries';


@Entity(companyProfileEntityName)
export class companyProfileEntity {

    @PrimaryGeneratedColumn('uuid')
    public id: string;
  
    @OneToOne(() => CompanyEntity, p => p.profile)
    @JoinColumn()
    public company: CompanyEntity;

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

    @Column({nullable: true})
    public city: string;
  
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

    @Column({ nullable: true, length: userAvatar.maxLength })
    public avatar: string;
  
}

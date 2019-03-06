import { Entity, OneToOne, ManyToOne, OneToMany, Column, JoinColumn } from 'typeorm';
import { User } from './user.abstract.class';
import { userEntityName } from '../../constants';
import { UserPermissionsEntity } from './user-permissions.entity';
import { CompanyEntity } from '../company/company.entity';
import { DidEntity } from './did.entity';
import { OCampaignConnectedSalesEntity } from '../campaign/outbound/entities/o-campaign-connected-sales.entity'
import { FedDncEntity } from '../fed_dnc/fed_dnc.entity'

@Entity(userEntityName)
export class UserEntity extends User {
    @OneToOne(() => CompanyEntity, company => company.owner)
    public company: CompanyEntity;

    @ManyToOne(() => CompanyEntity, company => company.users)
    public company_users: CompanyEntity;

    @OneToMany(() => DidEntity, d => d.user)
    public user_did: DidEntity;

    @OneToMany(() => FedDncEntity, d => d.user)
    public fed_dnc: FedDncEntity[];

    // Only for users with role "agent"
    @OneToOne(() => UserPermissionsEntity, p => p.user)
    public permissions: UserPermissionsEntity;
     // Only for users with role "company-admin"
     @Column({ nullable: true })
     public reseller_uuid: string;

    @OneToOne(() => OCampaignConnectedSalesEntity, s => s.sales)
    public salescampaign: OCampaignConnectedSalesEntity;

    @Column({ nullable: true })
    public address: string;

    @Column({ nullable: true })
    public city: string;

    @Column({ nullable: true })
    public state: string;

    @Column({ nullable: true })
    public sipUsername: string;
    
    @Column({ nullable: true })
    public sipPassword: string;
    
    @Column({ nullable: true})
    public register_type: string;
       
}

import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany,JoinTable } from 'typeorm';
import { ContactEntity } from './modules/contact/contact.entity';
import { CompanyEntity } from '../company/company.entity';
import { OCampaignEntity } from '../campaign/outbound/entities/o-campaign.entity';
import { contactsListEntityName,oCampaignContactsListRelationName } from '../../constants';
import { ContactsFileEntity } from './contacts-file.entity';
import { ContactsInfoEntity } from './contacts-info.entity';

@Entity(contactsListEntityName)
export class ContactsListEntity {
  constructor (payload?: { id?: string }) {
    if (payload && payload.id) {
      this.id = payload.id;
    }
  }

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @OneToMany(() => ContactEntity, v => v.contactsList)
  public contacts: ContactEntity[];

  @OneToMany(() => ContactsFileEntity, v => v.contactsList)
  public contacts_file: ContactsFileEntity[];

  @OneToMany(() => ContactsInfoEntity, c => c.contactsList)
  public contacts_info: ContactsInfoEntity[];

  @ManyToOne(() => CompanyEntity, v => v.contactsLists, { nullable: false, onDelete: 'CASCADE' })
  public company: CompanyEntity;

  @ManyToMany(() => OCampaignEntity, c => c.contactsLists)
  public campaigns: OCampaignEntity[];

  @Column()
  public contact_list_name: string;

  @Column({ nullable: true })
  public contact_file_count: number;

  @Column({ nullable: true })
  public contact_file_column_count: number;
}

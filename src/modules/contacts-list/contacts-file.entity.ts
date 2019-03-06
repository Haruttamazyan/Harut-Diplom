import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm'
import { ContactsListEntity } from './contacts-list.entity'
import { contactsFileEntityName } from '../../constants'
import { ContactsInfoEntity } from './contacts-info.entity'
import { triggerAsyncId } from 'async_hooks';

@Entity(contactsFileEntityName)
export class ContactsFileEntity {
  constructor (payload?: { id?: string }) {
    if (payload && payload.id) {
      this.id = payload.id;
    }
  }

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(() => ContactsListEntity, v => v.contacts_file, { nullable: false })
  public contactsList: ContactsListEntity;


  @Column({ nullable: true })
  public contact_file_url: string;
}

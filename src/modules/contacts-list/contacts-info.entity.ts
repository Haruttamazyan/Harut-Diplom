import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { ContactsListEntity } from './contacts-list.entity'
import { contactsInfoEntityName } from '../../constants'
import { ContactsFileEntity } from './contacts-file.entity'

@Entity(contactsInfoEntityName)
export class ContactsInfoEntity {
  constructor (payload?: { id?: string }) {
    if (payload && payload.id) {
      this.id = payload.id;
    }
  }

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(() => ContactsListEntity, v => v.contacts_file, { nullable: false })
  public contactsList: ContactsListEntity;

  @Column()
  public first_name: string;

  @Column()
  public middle_name: string;

  @Column()
  public last_name: string;

  @Column()
  public phone_number: string;

  @Column()
  public email: string;

  @Column({nullable: true})
  public address1: string;

  @Column({nullable: true})
  public address2: string;

  @Column({nullable: true})
  public zipcode: string;

  @Column({nullable: true})
  public city: string;

  @Column({nullable: true})
  public state: string;

  @Column({ type: 'jsonb', nullable: true })
  public UserDefinedField: string[];
}

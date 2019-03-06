import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { ContactsListEntity } from '../../contacts-list.entity';
import { CompanyEntity } from '../../../company/company.entity';
import { contactEntityName } from '../../../../constants';

@Entity(contactEntityName)
@Index(['contactsList', 'phoneNumber'], { unique: true })
export class ContactEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(() => ContactsListEntity, v => v.contacts, { nullable: false })
  public contactsList: ContactsListEntity;

  @ManyToOne(() => CompanyEntity, c => c.contacts, { nullable: false })
  public company: CompanyEntity;

  @Column()
  public firstName: string;

  @Column({ nullable: true })
  public lastName?: string;

  @Column()
  public phoneNumber: string;

  @Column({ nullable: true })
  public address?: string;

  @Column({ nullable: true })
  public city?: string;

  @Column({ nullable: true })
  public state?: string;

  @Column({ nullable: true })
  public country?: string;

  @Column({ type: 'jsonb', nullable: true })
  public udf?: object;
}

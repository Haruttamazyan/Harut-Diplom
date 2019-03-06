import { Component, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ContactEntity } from './contact.entity';
import { contactRepositoryToken } from '../../../../constants';
import {
  ICreateContactPayload,
  IFindContactsPayload,
  IDeleteContactsPayload,
  IDeleteAllContactsPayload,
  IUpdateContactPayload
} from './interfaces';
import { UnknownContactException, DuplicateContactException } from './exceptions';
import { IPaginated } from '../../../../interfaces';

@Component()
export class ContactService {
  constructor (
    @Inject(contactRepositoryToken)
    private readonly contactRepository: Repository<ContactEntity>
  ) {}

  public async createContact (payload: ICreateContactPayload) {
    return this.contactRepository.save(
      this.contactRepository.create(payload)
    );
  }

  public async updateContact (payload: IUpdateContactPayload) {
    const isExistingContact = await this.isExistingContact(
      payload.companyId,
      payload.contactsListId,
      payload.contactId
    );

    if (!isExistingContact) {
      throw new UnknownContactException(payload.contactId);
    }

    try {
      await this.contactRepository.updateById(payload.contactId, payload.contact);
    } catch (e) {
      if ((e.message as string).startsWith('duplicate')) {
        throw new DuplicateContactException(payload.contactsListId, payload.contact.phoneNumber as any);
      }

      throw e;
    }
  }

  public async isExistingContact (
    companyId: string,
    contactsListId: string,
    contactId: string
  ): Promise<boolean> {
    return !!(await this.contactRepository.findOneById(contactId, {
      where: {
        company: companyId,
        contactsList: contactsListId
      }
    }));
  }

  public async hasContacts (contactsListId: string): Promise<boolean> {
    return !!(await this.contactRepository.findOne({
      where: {
        contactsList: contactsListId
      }
    }));
  }

  public async findContacts (payload: IFindContactsPayload): Promise<IPaginated<ContactEntity>> {
    const [items, count] = await this.contactRepository.findAndCount({
      where: {
        company: payload.companyId,
        contactsList: payload.contactsListId
      },
      skip: payload.offset,
      take: payload.limit
    });

    return { items, count };
  }

  public async deleteContacts (payload: IDeleteContactsPayload) {
    return this.contactRepository
      .createQueryBuilder()
      .delete()
      .from(ContactEntity)
      .where('company = :companyId', { companyId: payload.companyId })
      .andWhere('contactsList = :contactsListId', { contactsListId: payload.contactsListId })
      .andWhereInIds(payload.contactsIds)
      .execute();
  }

  public async deleteAll (payload: IDeleteAllContactsPayload) {
    return this.contactRepository
      .createQueryBuilder()
      .delete()
      .from(ContactEntity)
      .where('company = :companyId', { companyId: payload.companyId })
      .andWhere('contactsList = :contactsListId', { contactsListId: payload.contactsListId })
      .execute();
  }
}

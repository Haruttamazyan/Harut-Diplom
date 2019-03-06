import { dbConnectionToken, contactsListRepositoryToken, contactsFileRepositoryToken, contactsInfoRepositoryToken } from '../../constants'
import { Connection } from 'typeorm'
import { ContactsListEntity } from './contacts-list.entity'
import { ContactsFileEntity } from './contacts-file.entity'
import { ContactsInfoEntity } from './contacts-info.entity'

export const contactsListProviders = [
  {
    provide: contactsListRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(ContactsListEntity)
    }
  },
  {
    provide: contactsFileRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(ContactsFileEntity)
    }
  },
  {
    provide: contactsInfoRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(ContactsInfoEntity)
    }
  }
];

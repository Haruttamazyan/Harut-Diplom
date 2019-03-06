import { Module, NestModule, MiddlewaresConsumer, RequestMethod, forwardRef } from '@nestjs/common';
import { contactsListProviders } from './contacts-list.providers';
import { ContactsListService } from './contacts-list.service';
import { ContactsListController } from './contacts-list.controller';
import { DatabaseModule } from '../database/database.module';
import { SetTimeoutMiddleware } from '../../middlewares';
import { ContactModule } from './modules/contact/contact.module';
import { ContactsListGateway } from './contacts-list.gateway';
import { UserModule } from '../user/user.module';
import { ContactsListFsService } from './contacts-list-fs.service';
import { CompanyModule } from '../company/company.module'

@Module({
  imports: [
    DatabaseModule,
    ContactModule,
    forwardRef(() => UserModule), 
    //forwardRef(() => [CompanyModule]),
  ],
  controllers: [
    ContactsListController
  ],
  components: [
    ...contactsListProviders,
    ContactsListService,
    //ContactsListGateway,
    ContactsListFsService
  ],
  exports:[
    ContactsListService
  ]
})
export class ContactsListModule implements NestModule {
  public configure (consumer: MiddlewaresConsumer): void {
    // 30 minutes. Done so server doesn't timeout when uploading contacts.
    const timeout = 1800000;

    consumer.apply(SetTimeoutMiddleware(timeout)).forRoutes({
      path: '/contacts-list',
      method: [RequestMethod.POST, RequestMethod.PUT]
    });
  }
}

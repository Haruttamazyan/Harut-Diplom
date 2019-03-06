import { Module, forwardRef,NestModule,MiddlewaresConsumer, RequestMethod } from '@nestjs/common';
import { companyProviders } from './company.providers';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';
//import { DenovolabModule } from '../denovolab/denovolab.module';
import { CompanyClass4Service } from './company.class4';
import { SetTimeoutMiddleware } from '../../middlewares';
import { ContactsListModule } from '../contacts-list/contacts-list.module'

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => ContactsListModule) ,
    forwardRef(() => UserModule),
    
  ],
  controllers: [
    CompanyController
  ],
  components: [
    ...companyProviders,
    CompanyService,
    CompanyClass4Service
  ],
  exports: [
    CompanyService
  ]
})
export class CompanyModule implements NestModule {
  public configure (consumer: MiddlewaresConsumer): void {
    // 30 minutes. Done so server doesn't timeout when uploading contacts.
    const timeout = 1800000;

    consumer.apply(SetTimeoutMiddleware(timeout)).forRoutes({
      path: '/company.profile',
      method: [RequestMethod.PATCH, RequestMethod.PUT]
    });
  }
}
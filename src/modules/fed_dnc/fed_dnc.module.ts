import { Module,NestModule, MiddlewaresConsumer, RequestMethod } from '@nestjs/common';
import { FedDncController } from './fed_dnc.controller';
import { DatabaseModule } from '../database/database.module';
import { SetTimeoutMiddleware } from '../../middlewares';

import { fedDncProviders } from './fed_dnc.providers';
import { FedDncService } from './fed_dnc.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [
    FedDncController
  ],
  components: [
    ...fedDncProviders,
    FedDncService,
    
  ]
})
export class FedDncModule implements NestModule {
  public configure (consumer: MiddlewaresConsumer): void {
    // 30 minutes. Done so server doesn't timeout when uploading contacts.
    const timeout = 1800000;

    consumer.apply(SetTimeoutMiddleware(timeout)).forRoutes({
      path: '/contacts-list',
      method: [RequestMethod.POST, RequestMethod.PUT]
    });
  }
}

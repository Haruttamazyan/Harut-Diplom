import { Module } from '@nestjs/common';
import { DidGroupController } from './did-group.controller';
import { DatabaseModule } from '../database/database.module';

import { didGroupProviders } from './did-group.providers';
import { DidGroupService } from './did-group.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [
    DidGroupController
  ],
  components: [
    ...didGroupProviders,
    DidGroupService,
    
  ]
})
export class DidGroupModule {}

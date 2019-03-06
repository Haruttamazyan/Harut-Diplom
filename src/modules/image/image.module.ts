import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { imageProviders } from './image.providers';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';

@Module({
  controllers: [
    ImageController
  ],
  imports: [
    DatabaseModule
  ],
  components: [
    ...imageProviders,
    ImageService
  ]
})
export class ImageModule {}

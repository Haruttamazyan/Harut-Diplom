import { Module } from '@nestjs/common';
import { denovolabProviders } from './denovolab.providers';
import { DenovolabService } from './denovolab.service';

@Module({
  components: [
    ...denovolabProviders,
    DenovolabService
  ],
  exports: [
    DenovolabService
  ]
})
export class DenovolabModule {}

import { Module } from '@nestjs/common';
import { contactProviders } from './contact.providers';
import { ContactService } from './contact.service';

@Module({
  components: [
    ...contactProviders,
    ContactService
  ],
  exports: [
    ContactService
  ]
})
export class ContactModule {}

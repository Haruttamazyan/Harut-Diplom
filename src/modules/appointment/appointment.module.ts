import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { appointmentProviders } from './appointment.providers';
import { AppointmentService } from './appointment.service';
import { UserModule } from '../user/user.module';
import { AppointmentController } from './appointment.controller';

@Module({
  controllers: [
    AppointmentController
  ],
  imports: [
    DatabaseModule,
    UserModule
  ],
  components: [
    ...appointmentProviders,
    AppointmentService
  ]
})
export class AppointmentModule {}

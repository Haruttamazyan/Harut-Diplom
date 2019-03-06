import { Module, MiddlewaresConsumer, RequestMethod, NestModule } from '@nestjs/common';
import { AuthMiddleware, IWhiteListItem } from './middlewares';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { BillingPlanModule } from './modules/billing-plan/billing-plan.module';
import { ContactsListModule } from './modules/contacts-list/contacts-list.module';
import { OCampaignModule } from './modules/campaign/outbound/o-campaign.module';
import { RecordingModule } from './modules/recording/recording.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { PlaybackModule } from './modules/playback/playback.module';
import { FreeswitchModule } from './modules/freeswitch/freeswitch.module';
import { ResellerModule } from './modules/reseller/reseller.module';
import { DidGroupModule } from './modules/did-group/did-group.module';
//import { UserModule } from './modules/user/user.module';
import { LiveModule } from './modules/live/live.module'
import { ImageModule } from './modules/image/image.module'
import { FedDncModule } from './modules/fed_dnc/fed_dnc.module'

@Module({
  imports: [
   // UserModule,
    AuthModule,
    CompanyModule,
    BillingPlanModule,
    ContactsListModule,
    OCampaignModule,
    RecordingModule,
    AppointmentModule,
    PlaybackModule,    
    FreeswitchModule,
    ResellerModule,
    BillingPlanModule,
    DidGroupModule,
    LiveModule,
    ImageModule,
    FedDncModule
  ],
  controllers: []
})
export class ApplicationModule implements NestModule {
  public configure (consumer: MiddlewaresConsumer): void {
    const authWhiteList: IWhiteListItem[] = [
      { url: '/auth/register' },
      { url: '/auth/login' },
      { url: '/auth/is-existing-email' },
      { url: '/auth/forget_password' },
      { url: '/auth/reset-password'},
      { url: '/freeswitch/directory' },
      { url: '/company'}
    ];
    consumer.apply(AuthMiddleware(authWhiteList)).forRoutes({
      path: '*',
      method: RequestMethod.ALL
    });
  }
}

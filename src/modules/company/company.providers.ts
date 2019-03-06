import { companyRepositoryToken,textTTSRepositoryToken,companyPaymentRepositoryToken, imageRepositoryToken, dbConnectionToken,companyProfileRepositoryToken, BillingPlanRepositoryToken, BillingPlanSysRepositoryToken, oCampaignRepositoryToken } from '../../constants/tokens';
import { Connection } from 'typeorm';
import { CompanyEntity } from './company.entity';
import { companypaymentEntity } from "./company-payment.entity";
import { companyProfileEntity } from './compnay-profile.entity';
import { BillingPlanEntity } from '../billing-plan/billing-plan.entity';
import { BillingPlanSysEntity } from '../billing-plan/billing-plan-sys.entity';
import { OCampaignEntity } from '../campaign/outbound/entities/o-campaign.entity';
import { ImageEntity } from '../image/image.entity'
import { textTTSEntity } from './textTTS.entity';

export const companyProviders = [
  {
    provide: companyRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(CompanyEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: textTTSRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(textTTSEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: companyProfileRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(companyProfileEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: companyPaymentRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(companypaymentEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: BillingPlanRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(BillingPlanEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: BillingPlanSysRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(BillingPlanSysEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: oCampaignRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(OCampaignEntity),
    inject: [dbConnectionToken]
  },
  {
    provide: imageRepositoryToken,
    useFactory: (connection: Connection) => connection.getRepository(ImageEntity),
    inject: [dbConnectionToken]
  }
];

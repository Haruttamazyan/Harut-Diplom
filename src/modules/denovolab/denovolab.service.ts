import { Component, Inject } from '@nestjs/common';
import { denovolabHttpToken } from '../../constants';
import { AxiosInstance } from 'axios';
import { DuplicateDnlCompanyNameException, InvalidDnlCompanyNameException } from './exceptions';
import { FS_PORT, FS_HOST, DNL_RATE_TABLE_ID, DNL_ROUTING_PLAN_ID } from '../../config';

@Component()
export class DenovolabService {
  constructor (
    @Inject(denovolabHttpToken)
    private readonly dnlHttp: AxiosInstance
  ) {}

  public async createCompany (name: string) {
    try {
      return await this.dnlHttp.post('/carrier/full/create', {
        carrier_name: name,
        unlimited_credit: true,
        is_prepay: false,
        mode: 'Postpay'
      });
    } catch (e) {
      if(e.response.data.error_type === 'validation_error') {
        throw new InvalidDnlCompanyNameException(name);
      }

      if (e.response.data.error && e.response.data.error.reason === 'already_exists') {
        throw new DuplicateDnlCompanyNameException(name);
      } else {
        throw e;
      }
    }
  }

  public async createCampaign (options: {
    campaign: {
      name: string;
    };
    company: {
      dnl_client_id: number;
    }
  }) {
    return await this.dnlHttp.post(`/carrier/${options.company.dnl_client_id}/ingress_trunk`, {
      name: options.campaign.name,
      auth_type: 'Authorized by Host Only',
      media_type: 'Bypass Media',
      host_routing_strategy: 'top-down',
      is_active: true,
      ip: [
        {
          port: FS_PORT,
          ip: FS_HOST
        }
      ],
      prefixes: [
        {
          rate_table_id: DNL_RATE_TABLE_ID,
          routing_plan_id: DNL_ROUTING_PLAN_ID,
          tech_prefix: Math.floor(Math.random() * 1000000000000)
        }
      ]
    });
  }
}

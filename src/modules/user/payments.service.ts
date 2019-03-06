import { Component, Inject, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PaymentsEntity } from './payment.entity';
import { CreatePaymentDto } from './dto';

import { paymentRepositoryToken } from '../../constants';


@Component()
export class PaymentsService {
  constructor (
    @Inject(paymentRepositoryToken)
    private readonly paymentsRepository: Repository<PaymentsEntity>
  ) {}

  public async getPayments(): Promise<PaymentsEntity[] | undefined> {
    return this.paymentsRepository.find({
    });
  }

  public async createPayment(payload: CreatePaymentDto) {
    const currentDate = new Date();
    const payload_date = new Date(payload.expire_date);
    //console.log('111-->',currentDate.getTime())
   // console.log('111-->',payload_date.getTime())
      if(currentDate.getTime() > payload_date.getTime()) throw new BadRequestException(`Expiry Date should be greater than ${currentDate}.`)
    let payment:any = {};
    payment.amount = payload.amount;
    payment.credit_card_no = payload.credit_card_no;
    //payment.expiry_month = parseInt(payload.expiry_month+'');
    //payment.expiry_year = payload.expiry_year;    
    //payment.first_name = payload.first_name;
    //payment.last_name = payload.last_name;
    payment.cvv = payload.cvv;
    payment.card_name = payload.card_name
    payment.expire_date = payload.expire_date 

   // console.log('heeeeeeeeeer', payment.expiry_month)
    //console.log('current', currentMonth, typeof currentMonth);
    /*if(payload.expiry_year == currentYear) {
      if(payment.expiry_month <= currentMonth)
        throw new BadRequestException(`Expiry month should be greater than ${currentMonth}.`)
    }*/

    return await this.paymentsRepository.save(payment);
  }

    public async editPayment (
        id: string,
        payload: any
    ): Promise<void> {
        return this.paymentsRepository.updateById(id, payload);
    }
}

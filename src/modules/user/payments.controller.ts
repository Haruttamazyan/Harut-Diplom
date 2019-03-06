import {Controller, Post, Body, Get, Param, Put} from '@nestjs/common';
import { ApiUseTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import {CreatePaymentDto, EditCompanyUserDto} from './dto';
import { User, Roles } from '../../decorators';
import { IAuthTokenContent} from '../../interfaces';
import { ROLE_SYS_ADMIN, ROLE_COMPANY_ADMIN } from '../user/types';
import {UuidDto} from "../../dto";
import {EditPaymentDto} from "./dto/edit-payment.dto";

@Controller('billing-info')
@ApiUseTags('billing-info')
@ApiBearerAuth()
export class PaymentsController {
    constructor (
        private readonly paymentsService: PaymentsService
    ) {}

    @Get('')
    @ApiOperation({
      title: 'Get payments'
    })
    public async getPayments (
      @User() user: IAuthTokenContent,
    ) {
      return await this.paymentsService.getPayments();
    }

    @Post('')
    @ApiOperation({
      title: 'Create payment'
    })
    @Roles(ROLE_SYS_ADMIN, ROLE_COMPANY_ADMIN)
    public async createPayment (
      @User() user: IAuthTokenContent,
      @Body() payload: CreatePaymentDto
    ) {
       // console.log(payload);
      return await this.paymentsService.createPayment(payload);
    }

    @Put(':id')
    @ApiOperation({
        title: 'Edit payment'
    })
    @Roles(ROLE_SYS_ADMIN, ROLE_COMPANY_ADMIN)
    public async editPayment (
        @User() user: IAuthTokenContent,
        @Param() { id }: UuidDto,
        @Body() payload: CreatePaymentDto
    ): Promise<void> {
        return await this.paymentsService.editPayment(
            id,
            payload
        );
    }
}

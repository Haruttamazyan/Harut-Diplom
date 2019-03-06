import {
  Controller,
  Post,
  Get,
  Req,
  Param,
  UseGuards,
  UseInterceptors,
  FileInterceptor,
  HttpStatus,
  BadRequestException,
  Body,
  Delete
} from '@nestjs/common';
import { ApiUseTags, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentService } from './appointment.service'
import { HasCompanyGuard } from '../../guards';
import { User } from '../../decorators';
import { IAuthTokenContent, IPaginated } from '../../interfaces';
import { UnknownCampaignException } from '../campaign/outbound/exceptions';

import { CreateAppointmentsDto } from './dto'
import { GetUsersQueryDto } from '../user/dto';
import { DateDoubleDto, DateOneDto, UuidDto } from '../../dto'

@Controller('appointment')
@ApiUseTags('appointment')
@ApiBearerAuth()
export class AppointmentController {
  constructor (
    private readonly appointmentService: AppointmentService
  ) {}

  @Post()
  @UseGuards(HasCompanyGuard)
  public async createAppointment (
    @User() user: IAuthTokenContent,
    @Body() payload: CreateAppointmentsDto
  ) {
    try {
      return await this.appointmentService.createAppointment(user, payload)
      //return await this.oCampaignService.getAgentsOfCampaign(id)
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }

  
  @Get('get')
  @UseGuards(HasCompanyGuard)
  public async getAppointments (
  ) {
    try {
      return await this.appointmentService.getAppointments()
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }

  @Get(':id/get')
  @UseGuards(HasCompanyGuard)
  public async getAppointmentByID (
    @Param() { id }: UuidDto    
  ) {
    try {
      return await this.appointmentService.getAppointmentById(id)
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }

  @Delete(':id')
  @UseGuards(HasCompanyGuard)
  public async deleteAppointmentByID (
    @Param() { id }: UuidDto    
  ) {
    try {
      return await this.appointmentService.removeAppointmentById(id)
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }
  
  @Get(':first_date/:second_date')
  @UseGuards(HasCompanyGuard)
  public async getAppointmentsBetweenDate (
    @Param() { first_date, second_date }: DateDoubleDto,
  ) {
    try {
     // console.log('first_date:', first_date)
     // console.log('second_date:', second_date)
      
      return await this.appointmentService.getAppointmentsBetweenDate(first_date, second_date)
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }

  @Get(':date')
  @UseGuards(HasCompanyGuard)
  public async getAppointmentsByDate (
    @User() user: IAuthTokenContent,
    @Param() { date }: DateOneDto,
  ) {
    try {
      //console.log('date:', date)

      return await this.appointmentService.getAppointmentByDate(date, user.companyId as string)
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }

}

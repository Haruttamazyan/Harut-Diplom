import { Controller, Req, Post, Get, Delete, Put, Body, Param, NotAcceptableException, Query,FileInterceptor, Patch,UseInterceptors, UseGuards } from '@nestjs/common';
import { User, Roles } from '../../decorators';
import { IAuthTokenContent } from '../../interfaces';
import { ApiUseTags, ApiOperation, ApiBearerAuth,ApiConsumes,ApiImplicitBody } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CompanyEntity } from './company.entity';
import { NoOverwriteException, NotASysAdminException } from '../../exceptions';
import { UnknownCompanyException } from './exceptions';
import { BadRequestException } from '@nestjs/common';
import { PaginationQueryDto, UuidDto, DateRangeDto, UuidDoubleDto , DateDoubleDto, HourDto, TopDto} from '../../dto';
import { CreateCompanyDto, CompanyStatusDto,AddpaymentDto, CompanyStatusOptionalDto, UpdateCompanyDto, UpdateCompanyProfileDto,TextDto } from './dto';
import { onlySysAdminMessage, atLeastCompanyAdminMessage } from '../../messages';
import { IPaginated, IAuthTokenized } from '../../interfaces';
import { ROLE_SYS_ADMIN, ROLE_COMPANY_ADMIN } from '../user/types';
import { signToken } from '../../utilities/jwt';
import { DuplicateDnlCompanyNameException, InvalidDnlCompanyNameException } from '../denovolab/exceptions';
import { CompanyClass4Service } from './company.class4';
import { UserEntity } from '../user/user.entity';
import { multerOptions } from './multer-options'
import { Request } from 'express';
import { SAME_STATE_MCI_STRATEGY } from '../campaign/outbound/types';
import { HasCompanyGuard } from '../../guards';

@Controller('company')
@ApiUseTags('company')
@ApiBearerAuth()
export class CompanyController {
  constructor (
    private readonly companyService: CompanyService,
    private readonly companyClass4Service: CompanyClass4Service    
  ) {}

  @Post()
  @ApiOperation({
    title: 'Create company',
    description: atLeastCompanyAdminMessage
  })
  public async createCompany (
    @Body() payload: CreateCompanyDto
    //@User() user: IAuthTokenContent
  ): Promise<CompanyEntity & IAuthTokenized> {
    try {
      const obj = await this.companyService.create({
        company: payload
        //owner: user
      });

      const token = signToken({
        id: obj.user.id,
        role: obj.user.role,
        companyId: obj.company.id
      });
            //const admin = await this.companyService.finduser(user.id)
      const class4:any = await this.companyClass4Service.companyClass4(obj.company.id,obj.user);
      //console.log(class4)
        
        

      if(class4) {
        await this.companyService.setCompanyObjectId(obj.company.id, class4.object_id);
      }
      
      return {
        ...obj.company,
        token,
        class4
      };
    } catch (e) {
      if (e instanceof NoOverwriteException) {
        throw new NotAcceptableException('User can create only one company.');
      } else
      if (e instanceof DuplicateDnlCompanyNameException) {
        throw new NotAcceptableException(e.message);
      } else if(e instanceof InvalidDnlCompanyNameException) {
        throw new NotAcceptableException(e.message);        
      }
      else {
        throw e;
      }
    }
  }

  @Get('/all')
  @ApiOperation({
    title: 'Get all companies',
    description: onlySysAdminMessage
  })
  public async getCompanies (
    @User() user: IAuthTokenContent,
    @Query() { offset, limit }: PaginationQueryDto,
    @Query() { status }: CompanyStatusOptionalDto,
    @Query() range: DateRangeDto
  ): Promise<IPaginated<CompanyEntity>> {
    
    return await this.companyService.getAll({
      offset,
      limit,
      status,
      range,
    }, user);
  }

  @Post(':id/set-status')
  @ApiOperation({
    title: 'Set company status',
    description: onlySysAdminMessage
  })
  @Roles(ROLE_SYS_ADMIN)
  public async setCompanyStatus (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto,
    @Body() { status }: CompanyStatusDto
  ): Promise<void> {
    return await this.companyService.setStatus({
      userId: user.id,
      companyId: id,
      status
    });
  }

  @Delete(':id')
  @ApiOperation({
    title: 'Delete company',
    description: onlySysAdminMessage
  })
  public async deleteCompany (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto
  ) {
    try {
       return this.companyService.deleteCompany(user, id);
    } catch (e) {
      if (e instanceof UnknownCompanyException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
    
  }

  @Put(':id')
  @ApiOperation({
    title: 'Update company',
    description: onlySysAdminMessage
  })
  public async updateCompany (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto,
    @Body() company: UpdateCompanyDto
  ) {
   
    if (!Object.keys(company).length) {
      throw new NotAcceptableException('At least one property must be specified');
    }
     await this.companyService.updateCompany(user, id, company)
    
    return await this.companyService.findCompanyById(id)
  }

  @Get('/profile')
  @ApiOperation({
    title: 'Get all company profile'
  })
  public async getCompanyProfile (
    @User() user: IAuthTokenContent
  ) {
    if(!user.companyId)
        throw new BadRequestException(`this user dont have company`)
    return await this.companyService.getCompanyProfile(user.companyId as string);
  }
  private async validateFile (value: any) {
    if (!value) {
      throw new BadRequestException('"avatar" property must be a photo');
    }
  }

  @Patch('profile')
  @Roles(ROLE_SYS_ADMIN,ROLE_COMPANY_ADMIN)
  public async updateCompanyProfile (
    @User() user: IAuthTokenContent,
    @Body() payload: UpdateCompanyProfileDto
    //@Body() data: UpdateCompanyDto
  ) { 
    //const data = req.body
    if (!Object.keys(payload).length) {
      throw new NotAcceptableException('At least one property must be specified');
    }
   // console.log('avatar2--->',payload)
    if(payload.billing_planid){
        await this.companyService.AssignBilingPlan(user.companyId as string,payload.billing_planid)
    }
    //delete payload.billing_planid
    //console.log(data)
  /*  if(!Object.keys(data).length && req.file === undefined){
      return await this.companyService.getCompanyProfile(user.companyId as string)
    }*/
    
      await this.companyService.updateCompanyProfile(user.companyId as string ,payload)
    return await this.companyService.getCompanyProfile(user.companyId as string)
 
  }

   /* @Post(":id1/assign/:id2")
    @ApiOperation({
        title: 'Assign Biling PLan to Company'
    })
    public async assignbilingplan (
        @User() user: IAuthTokenContent,
        @Param() { id1: CompanyId, id2: BillingPlanId }: UuidDoubleDto,
    ) { 
       return await this.companyService.AssignBilingPlan(CompanyId,BillingPlanId);
       
    }*/

    @Get('/billing_plan')
    @ApiOperation({
    title: 'Get  company billing Plan'
    })
    public async getCompanyBilling (
    @User() user: IAuthTokenContent
    ) {
    return await this.companyService.getCompanyBilingPlan(user.companyId as string);
  }

  @Get('/billing_plan/:id')
    @ApiOperation({
    title: 'Get  company billing Plan By Id'
    })
    public async getCompanyBillingbyId (
      @Param() { id }: UuidDto,
    @User() user: IAuthTokenContent
    ) {
    return await this.companyService.getCompanyBilingPlanbyId(user.companyId as string,id);
  }

  @Get('records/:first_date/:second_date/:id')
  @ApiOperation({
    title: 'Get  company records'
    })
    public async getCompanyRecords (
    @Param() { first_date: start_time, second_date: end_time }: DateDoubleDto,
    @Param() { id: campaign_uuid }: UuidDto,
    @User() user: IAuthTokenContent
    
    ) {
    return await this.companyService.getCompanyRecords(start_time, end_time, campaign_uuid, user);
  }

  @Get('/dashboard/:first_date/:second_date')
  @ApiOperation({
    title: 'Get all company profile'
  })
  @UseGuards(HasCompanyGuard)
  public async getCompanyDashboard (
    @User() user: IAuthTokenContent,
    @Query() { hour, month }: HourDto,
    @Param() { first_date, second_date }: DateDoubleDto
  ) {
    if(hour)
     return await this.companyService.getCompanyDashboard(user.companyId as string,first_date,second_date,hour,true);
    if(month)
    return await this.companyService.getCompanyDashboard(user.companyId as string,first_date,second_date,month,false);
  }

  @Get('/top/:top')
  @ApiOperation({
    title: 'Get company top agents and campaigns'
  })
  @UseGuards(HasCompanyGuard)
  public async getCompanyTop (
    @User() user: IAuthTokenContent,
    @Param() { top }: TopDto
  ) {
     return await this.companyService.getCompanyTop(user.companyId as string,top);

  }

  @Post('/payment')
  @ApiOperation({
    title: 'add balance to company'
  })
  @Roles(ROLE_SYS_ADMIN,ROLE_COMPANY_ADMIN)
  public async addBalanceToCompany (
    @User() user: IAuthTokenContent,
    @Body() payload : AddpaymentDto
  ) {
     // console.log('data--->',payload)
    return await this.companyService.addPayment(user.companyId as string,payload)
    
  }
  @Get('/payment/log')
  @ApiOperation({
    title: 'get payment to company'
  })
  @Roles(ROLE_SYS_ADMIN,ROLE_COMPANY_ADMIN)
  public async getPaymentToCompany (
    @User() user: IAuthTokenContent
  ) {
     // console.log('data--->',payload)
    return await this.companyService.getPayment(user.companyId as string)
    
  }

  @Get('/balance')
  @ApiOperation({
    title: 'get balance to company'
  })
  @Roles(ROLE_SYS_ADMIN,ROLE_COMPANY_ADMIN)
  public async getBalanceToCompany (
    @User() user: IAuthTokenContent
  ) {
     // console.log('data--->',payload)
    return await this.companyService.getBalance(user.companyId as string)
    
  }

  @Get('campaign_assigned/:id')
    @Roles(ROLE_COMPANY_ADMIN)
    @ApiOperation({
      title: 'Get all campaigns of agent'
    })
    public async getCompaignsOfAgent (
      @User() user: IAuthTokenContent,
      @Param() { id }: UuidDto
    ) {
      return await this.companyService.allAgentCampaigns(user.companyId as string,id);
    }


    @Get('campaign_unassigned/:id')
    @Roles(ROLE_COMPANY_ADMIN)
    @ApiOperation({
      title: 'Get all unassigned campaigns of agent'
    })
    public async getUnassignedCompaignsOfAgent (
      @User() user: IAuthTokenContent,
      @Param() { id }: UuidDto
    ) {
      return await this.companyService.allUnassignedAgentCampaigns(user.companyId as string,id);
    }

    @Post('TTS')
    //@Roles(ROLE_COMPANY_ADMIN)
    @ApiOperation({
      title: 'Enter Text and convert with TTS'
    })
    public async ConvertTTS (
      @User() user: IAuthTokenContent,
      @Body() payload : TextDto
    ) {
      return await this.companyService.textToTTS(user.companyId as string,payload)
    }


}

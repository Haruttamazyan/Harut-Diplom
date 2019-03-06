import {Controller, Post, Body, Get, Param, Put, Patch, NotAcceptableException, UseGuards, Query, HttpStatus, Delete} from '@nestjs/common';
import { ApiUseTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BilingPlanService } from './billing-plan.service';
import { User, Roles } from '../../decorators';
import { IAuthTokenContent } from '../../interfaces';
import { addPlanDto, editPlanDto, addPlanSysDto, editPlanSysDto } from './dto'
import { UuidDto } from '../../dto';
import { HasCompanyGuard } from '../../guards';
import { ROLE_SYS_ADMIN, ROLE_COMPANY_ADMIN } from '../user/types';
import { onlySysAdminMessage, atLeastCompanyAdminMessage } from '../../messages';
import { PaginationQueryDto } from '../../dto';


@Controller('billing_plan')
@ApiUseTags('billing_plan')
@ApiBearerAuth()
export class billing_planController {
    constructor (
        private readonly billingPlanService: BilingPlanService
    ) {}

    @Post()
    //@UseGuards(HasCompanyGuard)
    @ApiOperation({ title: 'Add Billing_plan' })
    public async addPlan (
      @User() user: IAuthTokenContent,
      @Body() plan: addPlanDto
    ) {
      return await this.billingPlanService.AddPlan(user.id,plan)
    }


    @Get('/countries')
    //@UseGuards(HasCompanyGuard)
    @ApiOperation({
        title: 'Get all countries ISO codes'
     })
  public async getCountries () {
    return await this.billingPlanService.getcountries();
  }

  @Get()
 // @UseGuards(HasCompanyGuard)
  @ApiOperation({
        title: 'Get Billing Plan List'
     })
  public async getBillingPlans (
    @User() user: IAuthTokenContent
  ) {
    return await this.billingPlanService.getBillingPlansList(user.id);
  }

  @Get(':id')
  //@UseGuards(HasCompanyGuard)
  @ApiOperation({
        title: 'Get Billing Plan by Id'
     })
  public async getBillingPlanbyId (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto
  ) {
    return await this.billingPlanService.getBillingPlansbyId(user.id,id);
  }

  @Patch(':id')
  //@UseGuards(HasCompanyGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Billing Plan is updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parsing error',
  })
  @ApiOperation({
      title: 'Edit Billing Plan by Id'
   })
    public async edirBillingPlanbyId (
     @User() user: IAuthTokenContent,
     @Param() { id }: UuidDto,
     @Body() payload: editPlanDto
    ) {
      if (!Object.keys(payload).length) {
        throw new NotAcceptableException('At least one property must be specified');
      }
    await this.billingPlanService.editBillingPlansbyId(id,payload);
    return {"success":"true"}
    }

    @Post('/sys')
    @Roles(ROLE_SYS_ADMIN)
    @ApiOperation({ title: 'Add Billing_plan for System Admin',
    description: onlySysAdminMessage
       })
    public async addPlanSys (
      @Body() plan: addPlanSysDto
    ) {
     // console.log()
      return await this.billingPlanService.AddPlanSys(plan)
    }

    @Get('/sys/get')
    @Roles(ROLE_SYS_ADMIN)
    @ApiOperation({
        title: 'Get Billing Plan List for system Admin',
        description: onlySysAdminMessage
     })
     public async getBillingPlansSys (
      @Query() { offset, limit }: PaginationQueryDto,
     ) {
    return await this.billingPlanService.getBillingPlansListSys({
      offset,
      limit
    });
  }

     @Get('/sys/:id')
    @Roles(ROLE_SYS_ADMIN)
    @ApiOperation({
        title: 'Get Billing Plan List by Id for system Admin',
        description: onlySysAdminMessage
     })
     public async getBillingPlanIdSys (
      @Param() { id }: UuidDto,
     ) {
    return await this.billingPlanService.getBillingPlanSysById(id);
  }

  @Patch('/sys/:id')
  @Roles(ROLE_SYS_ADMIN)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Billing Plan for system admin is updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parsing error',
  })
  @ApiOperation({
      title: 'Edit Billing Plan by Id for system admin',
      description: onlySysAdminMessage
   })
    public async editBillingPlanbyIdSys (
     @Param() { id }: UuidDto,
     @Body() payload: editPlanSysDto
    ) {
      if (!Object.keys(payload).length) {
        throw new NotAcceptableException('At least one property must be specified');
      }
    await this.billingPlanService.editBillingPlansbyIdsys(id,payload);
    return {"success":"true"}
    }

  @Delete('/sys/:id')
  @Roles(ROLE_SYS_ADMIN)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Billing Plan for system admin is Deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parsing error',
  })
  @ApiOperation({
      title: 'Delete Billing Plan by Id for system admin',
      description: onlySysAdminMessage
   })
    public async deleteBillingPlanbyIdSys (
     @Param() { id }: UuidDto
    ) {
      
    await this.billingPlanService.deleteBillingPlansbyIdsys(id);
    return {"success":"true"}
    }

}

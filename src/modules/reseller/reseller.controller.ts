import { Controller, Post, Get, Body, Delete, Param, Patch, NotAcceptableException, Query, UseGuards } from '@nestjs/common';
import { User, Roles } from '../../decorators';
import { IAuthTokenContent } from '../../interfaces';
import { ApiUseTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResellerService } from './reseller.service';
import { CreateCompanyUserDto } from '../user/dto';
import { ResellerEntity } from './reseller.entity';
import { UuidDto, NameParameterDto } from '../../dto';
import { HasCompanyGuard } from '../../guards';
import { EditResellerDto } from './dto/edit-reseller.dto';
import { addPricingDto } from './dto/add-pricing.dto'
import { ROLE_SYS_ADMIN, ROLE_RESELLER } from '../user/types';
import { ResellerClass4Service } from './reseller.class4';
import { onlySysAdminMessage } from '../../messages';
import { CreateResellerDto } from './dto/create-reseller.dto'
import { PaginationQueryDto } from '../../dto';



@Controller('reseller')
@ApiUseTags('reseller')
@ApiBearerAuth()
export class ResellerController {
  constructor (
    private readonly resellerService: ResellerService,
    private readonly resellerClass4Service: ResellerClass4Service     
  ) {}

  @Post('')
  @ApiOperation({
    title: 'Create reseller',
    description: onlySysAdminMessage
  })
  @Roles(ROLE_SYS_ADMIN)
  public async createReseller (
    @User() user: IAuthTokenContent,
    @Body() payload: CreateResellerDto
  ) {
    const reseller =  await this.resellerService.createReseller(user, payload);
      const class4:any = await this.resellerClass4Service.resellerClass4(reseller.id);

      delete reseller.reseller_uuid;
      delete reseller.forget_password_token;

      if(class4) {
        await this.resellerService.setresellerObjectId(reseller.id, class4.createCarier.object_id,class4.RateTable.object_id);
      }
      reseller.object_id = class4.createCarier.object_id
      reseller.rate_table_id = class4.RateTable.object_id
      return {
        ...reseller,
        class4
      };
  }

  @Get('')
  @ApiOperation({
    title: 'Get all reseller',
    description: onlySysAdminMessage
  })
  @Roles(ROLE_SYS_ADMIN)
  public async getResellers (
    @User() user: IAuthTokenContent,
    @Query() { offset, limit }: PaginationQueryDto,
  ) {
    return await this.resellerService.getAllResellers({
      offset,
      limit
    });
  }

  @Patch(':id')
  @ApiOperation({
    title: 'Edit reseller',
    description: onlySysAdminMessage
  })
  @Roles(ROLE_SYS_ADMIN) 
  public async editCompanyAgent (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto,
    @Body() payload: EditResellerDto
  ) {
      return await this.resellerService.editReseller(
          { target: id, requester: user.id },
          payload
      );
  }

  @Delete(':id')
  @ApiOperation({
    title: 'Delete reseller',
    description: onlySysAdminMessage
  })
  @Roles(ROLE_SYS_ADMIN)
  public async deleteResellers (
    @Param() { id }: UuidDto
  ): Promise<ResellerEntity[]> {
     return await this.resellerService.deleteReseller(id);
  }

  @Post(':id/pricing')
  @ApiOperation({
    title: 'add pricing',
  })  
  public async AddPricing (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto,
    @Body() payload: addPricingDto
  ) {
      return await this.resellerService.addPricing(
          id,
          payload
      );
  }

  @Get(':id/pricing')
  @ApiOperation({
    title: 'Get pricing',
  })
  @UseGuards(HasCompanyGuard)    
  public async GetPricing (
    @Param() { id }: UuidDto
  ) {
      return await this.resellerService.getPricing(
          id
      );
  }


  @Get(':id/companies')
  @ApiOperation({
    title: 'Get all reseller companies',
    description: onlySysAdminMessage
  })
  @Roles(ROLE_SYS_ADMIN)
  public async getResellerCompaniesbyId (
    @Param() { id }: UuidDto
  ) {
    return await this.resellerService.getResellerCompanies(id);
  }

  @Get('companies')
  @ApiOperation({
    title: 'Get all reseller companies',
    description: ''
  })
  @Roles(ROLE_RESELLER)
  public async getResellerCompanies (
    @User() user: IAuthTokenContent
  ) {
    
    return await this.resellerService.getResellerCompaniesbyreseller(user.id);
  }

  @Post(':id/fee')  
  @Roles(ROLE_SYS_ADMIN)
  public async AddFee (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto
  ) {
      const rate_id = await this.resellerService.addFee(id);

      const res = await this.resellerClass4Service.addFee(rate_id)
      return {class4:res}
  }

  @Get('/termination/route')
  @ApiOperation({
    title: 'Get reseller termination route',
    description: ''
  })
  @Roles(ROLE_RESELLER)
  public async getResellerTerminationRoute (
    @User() user: IAuthTokenContent
  ) {
    return await this.resellerService.getAllResellerTerminationRoute(user.id);
  }

  @Get('/origination/route')
  @ApiOperation({
    title: 'Get reseller origination route',
    description: ''
  })
  @Roles(ROLE_RESELLER)
  public async getResellerOriginationRoute (
    @User() user: IAuthTokenContent
  ) {
    return await this.resellerService.getAllResellerOriginationRoute(user.id);
  }

  @Get('/DID/fees')
  @ApiOperation({
    title: 'Get reseller DID fees',
    description: ""
  })
  @Roles(ROLE_RESELLER)
  public async getResellerdidfees (
    @User() user: IAuthTokenContent
  ) {
    return await this.resellerService.getAllResellerDIDfees(user.id);
  }

  @Get('/termination/fees')
  @ApiOperation({
    title: 'Get reseller termination fees',
    description: ""
  })
  @Roles(ROLE_RESELLER)
  public async getResellerterminationfees (
    @User() user: IAuthTokenContent
  ) {
    return await this.resellerService.getAllResellerTerminationfees(user.id);
  }

  @Get('/SMS/fees')
  @ApiOperation({
    title: 'Get reseller SMS fees',
    description: ""
  })
  @Roles(ROLE_RESELLER)
  public async getResellerSMSfees (
    @User() user: IAuthTokenContent
  ) {
    return await this.resellerService.getAllResellerSMSfees(user.id);
  }

  @Post('login/:id')
  @ApiOperation({
    title: 'login reseller',
    description: onlySysAdminMessage
  })
  @Roles(ROLE_SYS_ADMIN)
  public async loginResellers (
    @Param() { id }: UuidDto
  ) {
     return await this.resellerService.loginReseller(id);
  }

  @Get(':id')
  @ApiOperation({
    title: 'get reseller with id',
    description: onlySysAdminMessage
  })
  @Roles(ROLE_SYS_ADMIN)
  public async getReseller (
    @Param() { id }: UuidDto
  ) {
     return await this.resellerService.getResellerbyId(id);
  }

}

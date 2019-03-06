import { Controller, Post, Put, Delete, Body, Param, Get } from '@nestjs/common';
import { ApiUseTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import {CreateCompanySalesPersonDto, EditCompanyUserDto } from './dto';
import { User, Roles } from '../../decorators';
import { IAuthTokenContent} from '../../interfaces';
import { ROLE_SYS_ADMIN, ROLE_COMPANY_ADMIN } from '../user/types';
import { UuidDto } from '../../dto';

@Controller('sales')
@ApiUseTags('sales')
@ApiBearerAuth()
export class SalesController {
    constructor (
        private readonly userService: UserService
    ) {}

    @Get('')
    @ApiOperation({
      title: 'Get sales persons'
    })
    public async getSalesPersons (
      @User() user: IAuthTokenContent,
    ) {
      return await this.userService.getSales(user.id);
    }

    @Get(':id')
    @ApiOperation({
      title: 'Get sales person'
    })
    public async getCompanySalesPerson (
      @User() user: IAuthTokenContent,
      @Param() { id }: UuidDto
    ) {
      return await this.userService.findByIdAndRole('sales', id,user.id);
    }

    @Post('create')
    @ApiOperation({
      title: 'Create sales person'
    })
    @Roles(ROLE_SYS_ADMIN, ROLE_COMPANY_ADMIN)
    public async createCompanySalesPerson (
      @User() user: IAuthTokenContent,
      @Body() payload: CreateCompanySalesPersonDto
    ) {
      return await this.userService.createCompanySalesPerson(payload,user.id);
    }

    @Put(':id')
    @ApiOperation({
      title: 'Edit sales person',
      description: `Only a system admin or company admin can edit other users.
      All users can edit themselves.
      Only the same user can change the password.`
    })
    public async editCompanyAgent (
      @User() user: IAuthTokenContent,
      @Param() { id }: UuidDto,
      @Body() payload: EditCompanyUserDto
    ) {
        return await this.userService.editCompanySales(
            { target: id, requester: user.id },
            payload
        );
    }

    @Delete(":id")
    @ApiOperation({
        title: 'Delete sales person'
    })
    @Roles(ROLE_SYS_ADMIN, ROLE_COMPANY_ADMIN)
    public async DeleteSale (
        @User() user: IAuthTokenContent,
        @Param() { id }: UuidDto
    ) { 
         await this.userService.deleteUserSale(id);
         return {success:true}
    }

    @Delete('')
    @ApiOperation({
        title: 'Delete all sales person'
    })
    @Roles(ROLE_SYS_ADMIN, ROLE_COMPANY_ADMIN)
    public async DeleteAllSale (
        @User() user: IAuthTokenContent,
    ) { 
        return await this.userService.deleteAllUserSales(user.id);
    }
}

import { Controller, Post, Get, Body, Delete, Param, Patch, NotAcceptableException, Query, UseGuards } from '@nestjs/common';
import { User, Roles } from '../../decorators';
import { IAuthTokenContent } from '../../interfaces';
import { ApiUseTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DidGroupService } from './did-group.service'
import { CreateGroupDto } from './dto/createGroup.dto'
import { AddDidDto } from './dto/addDid.dto'
import { UuidDto } from '../../dto';

@Controller('did-group')
@ApiUseTags('did-group')
@ApiBearerAuth()
export class DidGroupController {
  constructor (
    private readonly didGroupService: DidGroupService,
  ) {}


  @Post()
  @ApiOperation({
    title: 'Create did Group',
  })
  //@Roles(ROLE_SYS_ADMIN)
  public async createReseller (
    @User() user: IAuthTokenContent,
    @Body() payload: CreateGroupDto
  ) {

    return await this.didGroupService.create(payload)
  }

  @Get()
  @ApiOperation({
    title: 'Get did Groups',
  })
  //@Roles(ROLE_SYS_ADMIN)
  public async GetGroupes (
    @User() user: IAuthTokenContent
  ) {

    return await this.didGroupService.GetGroups()
  }

  @Delete(':id')
  @ApiOperation({
    title: 'Delete did Group',
  })
  //@Roles(ROLE_SYS_ADMIN)
  public async deleteReseller (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto
  ) {

    return await this.didGroupService.delete(id)
  }

  @Get(':id')
  @ApiOperation({
    title: 'Get did Group',
  })
  //@Roles(ROLE_SYS_ADMIN)
  public async GetGroup (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto
  ) {

    return await this.didGroupService.GetGroup(id)
  }

  @Patch(':id')
  @ApiOperation({
    title: 'Edit did Group',
  })
  //@Roles(ROLE_SYS_ADMIN)
  public async EditGroup (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto,
    @Body() payload: CreateGroupDto
  ) {
                
    return await this.didGroupService.EditGroup(id,payload)
  }

  @Post(':id/did')
  @ApiOperation({
    title: 'Add DID to DID Group',
  })
  //@Roles(ROLE_SYS_ADMIN)
  public async AddDid (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto,
    @Body() payload: AddDidDto
  ) {

    return await this.didGroupService.AddDid(id,payload)
  }

  @Delete(':id/did')
  @ApiOperation({
    title: 'Delete Did from DID Group',
  })
  //@Roles(ROLE_SYS_ADMIN)
  public async deleteDidfromGroup (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto,
  ) {

    return await this.didGroupService.DeleteDidfromGroup(id)
  }



  

}

import { Controller, Post, Req, Get, Body, Delete, Param, Patch, NotAcceptableException, UseInterceptors, FileInterceptor } from '@nestjs/common';
import { User, Roles } from '../../decorators';
import { IAuthTokenContent } from '../../interfaces';
import { ApiUseTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FedDncService } from './fed_dnc.service'
import { UuidDto } from '../../dto';
import { ROLE_COMPANY_ADMIN,ROLE_SYS_ADMIN } from '../user/types';
import { Request, Response } from 'express'
import { multerOptions } from './multer-options'
import { NumberDto } from './dto/number.dto'


@Controller('fed_dnc')
@ApiUseTags('fed_dnc')
@ApiBearerAuth()
export class FedDncController {
  constructor (
    private readonly fedDncService: FedDncService,
  ) {}


  @Post('/import')
  @UseInterceptors(FileInterceptor('fed_dnc', multerOptions))
  @ApiConsumes('multipart/form-data')
  @Roles(ROLE_SYS_ADMIN,ROLE_COMPANY_ADMIN)
  public async createReseller (
    @User() user: IAuthTokenContent,
    @Req() req: Request
  ) {
    console.log(req.file)
    return await this.fedDncService.addDnc(user.id,req.file.path)
  }

  @Get()
  @ApiOperation({ title: 'Get fed dnc' })
  @Roles(ROLE_SYS_ADMIN,ROLE_COMPANY_ADMIN)
  public async getFeds (
    @User() user: IAuthTokenContent,
  ) {
    return await this.fedDncService.getfeds(user.id);
  }

  @Delete('/:number')
  @ApiOperation({ title: 'Delete fed dnc' })
  @Roles(ROLE_SYS_ADMIN,ROLE_COMPANY_ADMIN)
  public async delFed (
    @User() user: IAuthTokenContent,
    @Param() {number}: NumberDto
  ) {
    return await this.fedDncService.deleteFed(user.id,number);
  }
  
  

}

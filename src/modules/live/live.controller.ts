import { Controller, Post, Body, Param, Req, Res, Get } from '@nestjs/common';
import { ApiUseTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { User, Roles } from '../../decorators';
import { IAuthTokenContent } from '../../interfaces';
import { LiveService } from './live.service'
import { ROLE_COMPANY_ADMIN, ROLE_AGENT } from '../user/types';

@Controller('live')
@ApiUseTags('live')
@ApiBearerAuth()
export class LiveController {
  constructor (
    private readonly LiveService: LiveService
  ) {}

  @Get('/is-sip-registered')
  @ApiOperation({ title: 'Get is sip registered' })
  public async isSipRegistred (
    @User() user: IAuthTokenContent,
  ) {
    return await this.LiveService.isSipRegistered(user);
  }

  @Get('/stats')
  @ApiOperation({ title: 'Get all SIP registered agents' })
  public async getStats (
    @User() user: IAuthTokenContent,
  ) {
    return await this.LiveService.getAgents(user);
  }

  @Get('/calls')
  @ApiOperation({ title: 'Get all live calls' })
  @Roles(ROLE_COMPANY_ADMIN,ROLE_AGENT)
  public async getCalls (
    @User() user: IAuthTokenContent,
  ) {
   // console.log('user-->',user)
    return await this.LiveService.getCalls(user);
  }
}

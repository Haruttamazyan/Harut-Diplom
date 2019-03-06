import { Controller, Post, Body, Param, Req, Res } from '@nestjs/common';
import { FreeswitchService } from './freeswitch.service';
import { ApiUseTags, ApiOperation } from '@nestjs/swagger';
import { AuthenticateDto } from './dto';
import { Request, Response } from 'express'

@Controller('freeswitch')
@ApiUseTags('freeswitch')
export class FreeswitchController {
  constructor (
    private readonly freeswitchService: FreeswitchService
  ) {}

  @Post('directory')
  @ApiOperation({ title: 'Freeswitch authentication' })
  public async authenticate (
    @Body() { sip_auth_username, user }: AuthenticateDto,
    @Req() req: Request,
    @Res() res: Response,
    ) {
      //console.log('sip_auth_username-->',sip_auth_username,'user-->',user)
     // console.log('body--->',req.body)
     // console.log('ip--->', req.ip)
      if(sip_auth_username){
        return this.freeswitchService.getAuthXml(sip_auth_username,req.ip,res);
      } else{
        return this.freeswitchService.getAuthXml(user,req.ip,res);
      }
    
  }

  @Post(':sip_user/directory')
  @ApiOperation({ title: 'Freeswitch directory' })
  public async freeswitchDir (
    @Param() { sip_user }: any) 
    {
   // console.log(sip_user)
    return this.freeswitchService.checkAuthXml(sip_user);
  }
}

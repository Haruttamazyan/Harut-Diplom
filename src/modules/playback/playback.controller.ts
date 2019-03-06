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
  Query
} from '@nestjs/common';
import { ApiUseTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiResponse, ApiImplicitBody } from '@nestjs/swagger';
import { User } from '../../decorators';
import { IAuthTokenContent } from '../../interfaces';
import { PlaybackService } from './playback.service';
import { multerOptions } from '../playback/multer-options';
import { HasCompanyGuard } from '../../guards';
import { ParseErrorResponse } from './swagger/response-types/parse-error';
import { UuidDto, PaginationQueryDto } from '../../dto';
import { CreatePlaybackDto } from './dto';
import { Request } from 'express';

import { ImportMediaFileCampaignDto } from './swagger/implicit-body/import-media-file-campaign.dto'
import { ImportMediaFileCampaignResponse } from './swagger/response-types/import-media-file-campaign'
import { PlaybackEntity } from './playback.entity';

@Controller('playback')
@ApiUseTags('playback')
@ApiBearerAuth()
export class PlaybackController {
  constructor (
    private readonly playbackService: PlaybackService
  ) {}

  private validateFile (value: any) {
    if (!value) {
      throw new BadRequestException('"playback" property must be a file');
    }
  }

  @Post()
  @UseGuards(HasCompanyGuard)
  @UseInterceptors(FileInterceptor('playback', multerOptions))
  @ApiOperation({ title: 'Create playback' })
  @ApiConsumes('multipart/form-data')
  @ApiImplicitBody({ name: 'ImportMediaFileCampaignDto', type: ImportMediaFileCampaignDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Playback uploaded successfully'
  })
  public async importPlaybackCampaign (  
    @Req() req: Request,
    @User() user: IAuthTokenContent,   
  ) {
    this.validateFile(req.file)

   /* if(req.body.campaignId) {
      //console.log('here 1')
      return await this.playbackService.createPlayback({
        url: req.file.path,
        companyId: user.companyId as string,
        fileName:req.file.originalname,
        campaignId: req.body.campaignId
      });
    } else {
     // console.log('here ')*/
      
      return await this.playbackService.createPlayback({
        url: req.file.path,
        companyId: user.companyId as string,
        fileName:req.file.originalname
      });
    }
    
  

  @Get()
  @UseGuards(HasCompanyGuard)
  @ApiOperation({ title: 'Get playbacks' })
  public async getRecordings (
    @User() user: IAuthTokenContent,
    @Query() { offset, limit }: PaginationQueryDto
  ) {
    return await this.playbackService.getPlaybacks({
      offset,
      limit
    },user.companyId as string);
  }

}

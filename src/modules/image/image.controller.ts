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
import { ImageService } from './image.service';
import { multerOptions } from './multer-options';
import { HasCompanyGuard } from '../../guards';
import { UuidDto, PaginationQueryDto } from '../../dto';
import { Request } from 'express';

@Controller('image')
@ApiUseTags('image')
@ApiBearerAuth()
export class ImageController {
  constructor (
    private readonly imageService: ImageService
  ) {}

  private validateFile (value: any) {
    if (!value) {
      throw new BadRequestException('"image" property must be a file');
    }
  }

  @Post()
  @UseGuards(HasCompanyGuard)
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @ApiOperation({ title: 'Create Image' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Image uploaded successfully'
  })
  public async importPlaybackCampaign (  
    @Req() req: Request,
    @User() user: IAuthTokenContent,   
  ) {
    this.validateFile(req.file)

 
      
      return await this.imageService.createImage({
        url: req.file.path
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

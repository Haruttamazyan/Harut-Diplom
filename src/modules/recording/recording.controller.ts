import {
  Controller,
  Post,
  Get,
  Req,
  Query,
  UseGuards,
  UseInterceptors,
  FileInterceptor,
  HttpStatus,
  BadRequestException
} from '@nestjs/common';
import { ApiUseTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiResponse, ApiImplicitBody } from '@nestjs/swagger';
import { User } from '../../decorators';
import { IAuthTokenContent } from '../../interfaces';
import { RecordingService } from './recording.service';
import { HasCompanyGuard } from '../../guards';
import { Request } from 'express';
import { multerOptions } from './multer-options';
import { CreateContactsListDto } from './swagger';
import { PaginationQueryDto } from '../../dto';
import { RecordingEntity } from './recording.entity';
import { ImportRecordingFileDto } from './swagger';
import { promisify } from 'util';
import { RECORDINGS_STORAGE_PATH } from '../../config';
import * as fs from 'fs';
const writeFile = promisify(fs.writeFile);

@Controller('recording')
@ApiUseTags('recording')
@ApiBearerAuth()
export class RecordingController {
  constructor (
    private readonly recordingService: RecordingService
  ) {}

  
  private validateFile (value: any) {
    if (!value) {
      throw new BadRequestException('"recording" property must be a file');
    }
  }

  @Post()
  @UseGuards(HasCompanyGuard)
  @UseInterceptors(FileInterceptor('recording', multerOptions))
  @ApiOperation({ title: 'Create recording' })
  @ApiConsumes('multipart/form-data')
  @ApiImplicitBody({ name: 'ImportRecordingFileDto', type: ImportRecordingFileDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Recording uploaded successfully'
  })
  public async createRecording (
    @Req() req: Request,
    @User() user: IAuthTokenContent
  ): Promise<RecordingEntity> {
    this.validateFile(req.file)

    //await writeFile(RECORDINGS_STORAGE_PATH, req.file)
    return await this.recordingService.createRecording({
      companyId: user.companyId as any,
      userId: user.id,
      url: req.file.path,
      fileName:req.file.originalname
    });
  }

  @Get()
  @ApiOperation({ title: 'Get recordings' })
  public async getRecordings (
    @User() user: IAuthTokenContent,
    @Query() { offset, limit }: PaginationQueryDto
  ): Promise<RecordingEntity[]> {
    return await this.recordingService.getRecordings({
      companyId: user.companyId as any,
      offset,
      limit
    });
  }
}

import { Controller, Post, Get, Delete, Body, 
  UseGuards, Param, Query, BadRequestException, Put,
  UseInterceptors, FileInterceptor, HttpStatus, Req, NotAcceptableException } from '@nestjs/common';
import { OCampaignService } from './o-campaign.service';
import { HasCompanyGuard } from '../../../guards';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/create-campaign';
import { JoinAgentToCampaignDto } from './dto/join-agent-to-campaign-dto';
import { JoinSalesToCampaignDto } from './dto/join-sales-to-campaign-dto';
import { JoinContactsListToCampaignDto } from './dto/join-contactsList-to-campaign-dto';
import { JoinCallerToCampaignDto } from './dto/join-caller-to-campaign-dto'
import { QuestionDto } from './dto/create-campaign/question.dto';
import { AnswerDto } from './dto/create-campaign/answer.dto'
import { CreateAppointmentDto } from './dto/create-appointment-campaign.dto'
import { User, Roles } from '../../../decorators';
import { IAuthTokenContent, IPaginated } from '../../../interfaces';
import { ApiUseTags, ApiBearerAuth, ApiOperation, ApiConsumes, 
  ApiImplicitBody, ApiResponse } from '@nestjs/swagger';
import { UuidDto, PaginationQueryDto, DateDoubleDto, StatusDto } from '../../../dto';
import { Request } from 'express';
import { OCampaignEntity } from './entities/o-campaign.entity';
import { UnknownCampaignException } from './exceptions';
import { multerOptions } from '../../recording/multer-options';
import { ImportMediaFileCampaignDto } from './swagger/implicit-body/import-media-file-campaign.dto';
import { ImportDNCFileCampaignDto } from './swagger/implicit-body/import-dnc-file-campaign.dto'
import { ImportMediaFileCampaignResponse } from './swagger/response-types/import-media-file-campaign';
import { ParseErrorResponse } from './swagger/response-types/parse-error';
import * as multerOptions2 from '../../contacts-list/multer-options'
import { ROLE_AGENT, ROLE_AGENT_MANAGER } from '../../user/types';
import { CreateCompanyDto } from './dto/email-query.dto'

@Controller('company/campaign')
@ApiUseTags('company/campaign')
@ApiBearerAuth()
export class OCampaignController {
  constructor (
    private readonly oCampaignService: OCampaignService
  ) {}

  private validateFile (value: any) {
    if (!value) {
      throw new BadRequestException('"media" property must be a file');
    }
  }

  @Post()
  @UseGuards(HasCompanyGuard)
  public async createCampaign (
    @User() user: IAuthTokenContent,
    @Body() payload: CreateCampaignDto
  ) {
    //console.log('54564',payload)
    return await this.oCampaignService.createOutboundCampaign({
      user,
      campaign: payload
    });
  }

  @Post(':id/assign-agent')
  @UseGuards(HasCompanyGuard)
  public async assignAgentToCampaign (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto,
    @Body() payload: JoinAgentToCampaignDto
  ) {
    try {
      return await this.oCampaignService.assignAgentToOutboundCampaign(payload.agentId, id,user.id)
      //return await this.oCampaignService.getAgentsOfCampaign(id)
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }
  @Post(':id/join')
  @Roles(ROLE_AGENT,ROLE_AGENT_MANAGER)
  //@UseGuards(HasCompanyGuard)
  public async joinAgentToCampaign (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto
  ) {
    try {
     // console.log('agetnUser-->',user)
      return await this.oCampaignService.joinAgentToOutboundCampaign(id,user.id)
      //return await this.oCampaignService.getAgentsOfCampaign(id)
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }

  @Post(':id/join-caller')
  @UseGuards(HasCompanyGuard)
  public async joinCallerToCampaign (
    @Param() { id }: UuidDto,
    @Body() payload: JoinCallerToCampaignDto
  ) {
    try {
      return await this.oCampaignService.joinCallerToOutboundCampaign(payload.callerId, id);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }

  @Post(':id/join-sales')
  @UseGuards(HasCompanyGuard)
  public async joinSalesToCampaign (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto,
    @Body() payload: JoinSalesToCampaignDto
  ) {
    try {
      const res = await this.oCampaignService.joinSalesToOutboundCampaign(payload.salesId, id,user.id)
      
      /*if(res.hasOwnProperty('id'))
        delete res.id*/

      return res
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }

  @Post(':id/start')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Campaign is started.',
    type: ImportMediaFileCampaignResponse
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parsing error',
    type: ParseErrorResponse
  })
  @UseGuards(HasCompanyGuard)
  public async startCampaign (
    @Param() { id }: UuidDto,
  ) {
   
    try {
      return await this.oCampaignService.startCampaign(id);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }
    
      throw e;
    }
  }

  @Post(':id/stop')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Campaign is stoped.',
    type: ImportMediaFileCampaignResponse
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parsing error',
    type: ParseErrorResponse
  })
  @UseGuards(HasCompanyGuard)
  public async stopCampaign (
    @Param() { id }: UuidDto,
  ) {
    try {
      return await this.oCampaignService.stopCampaign(id);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }
    
      throw e;
    }
  }

  @Post(':id/pause')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Campaign is paused.',
    type: ImportMediaFileCampaignResponse
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parsing error',
    type: ParseErrorResponse
  })
  @UseGuards(HasCompanyGuard)
  public async pauseCampaign (
    @Param() { id }: UuidDto,
  ) {
    try {
      return await this.oCampaignService.pauseCampaign(id);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }
    
      throw e;
    }
  }

  @Post(':id/dnc')
  @UseGuards(HasCompanyGuard)
  @UseInterceptors(FileInterceptor('dnc', multerOptions2.multerOptions))
  @ApiOperation({
    title: 'Import DNC file to campaign',
    description: 'Create contacts list and validate contacts file. ' +
    'Note this will not parse the file as there isn\'t enough information to do so, ' +
    'instead, it will return a preview containing the first 10 rows ' +
    'in the file to be used in /contacts-list/{id}/set-bindings.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiImplicitBody({ name: 'ImportDNCFileCampaignDto', type: ImportDNCFileCampaignDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'file uploaded successfully.',
    type: ImportMediaFileCampaignResponse
  })
  @ApiResponse({
    status: HttpStatus.NOT_ACCEPTABLE,
    description: 'Parsing error',
    type: ParseErrorResponse
  })
  public async importDNCFileCampaign (
    @Param() { id }: UuidDto,    
    @Req() req: Request,
    @User() user: IAuthTokenContent
  ) {
    this.validateFile(req.file);

    try {
     return await this.oCampaignService.importDNCFileToCampaign(req.file, id)
      //return await this.oCampaignService.getCampaignDNCFiles(id)
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }
    
      throw e;
    }
    
  }

  @Post(':id/unassign-agent')
  @UseGuards(HasCompanyGuard)
  public async unassignAgentFromCampaign (
    @Param() { id }: UuidDto,
    @Body() payload: JoinAgentToCampaignDto
  ) {
    //console.log('zxczv',payload)
    try {
      return await this.oCampaignService.unassignAgentFromCampaign(payload.agentId, id);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }
    
      throw e;
    }
  }

  @Post(':id/leave')
  //@UseGuards(HasCompanyGuard)
  @Roles(ROLE_AGENT,ROLE_AGENT_MANAGER)
  public async leaveAgentFromCampaign (
    @Param() { id }: UuidDto,
    @User() user: IAuthTokenContent
    //@Body() payload: JoinAgentToCampaignDto
  ) {
    //console.log('zxczv',payload)
    try {
      return await this.oCampaignService.leaveAgentFromCampaign(id,user.id);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }
    
      throw e;
    }
  }

  @Post(':id/hold')
  @UseGuards(HasCompanyGuard)
  public async holdAgentStatusCampaign (
    @Param() { id }: UuidDto,
    @Body() payload: JoinAgentToCampaignDto    
  ) {
    try {
      return await this.oCampaignService.changeAgentStatusInCampaign(payload, 'hold', id);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }
    
      throw e;
    }
  }

  @Post(':id/unhold')
  @UseGuards(HasCompanyGuard)
  public async unholdAgentStatusCampaign (
    @Param() { id }: UuidDto,
    @Body() payload: JoinAgentToCampaignDto
  ) {
    try {
      return await this.oCampaignService.changeAgentStatusInCampaign(payload, 'unhold', id);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }
    
      throw e;
    }
  }

  @Post(':id/contacts-list')
  @UseGuards(HasCompanyGuard)
  public async assignContactsListToCampaign (
    @Param() { id }: UuidDto,
    @Body() payload: JoinContactsListToCampaignDto    
  ) {
    try {
      return await this.oCampaignService.joinContactsListToOutboundCampaign(payload, id);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }
    
      throw e;
    }
  }

  @Post(':id/unassign-contacts-list')
  @UseGuards(HasCompanyGuard)
  public async unassignContactsListToCampaign (
    @Param() { id }: UuidDto,
    @Body() payload: JoinContactsListToCampaignDto    
  ) {
    try {
      return await this.oCampaignService.unassignContactsListToOutboundCampaign(payload, id);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }
    
      throw e;
    }
  }


  @Get(':id/unassign-contacts-list')
  @UseGuards(HasCompanyGuard)
  @ApiOperation({
    title: 'Get all unassigned contact lists'
  })
  public async GetunassignContactsListToCampaign (
    @Param() { id }: UuidDto,
    @User() user: IAuthTokenContent
  ) {
    try {
      return await this.oCampaignService.GetUnassignContactsListToOutboundCampaign(id,user.companyId as string);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }
    
      throw e;
    }
  }


  @Get(':id/agents')
  @UseGuards(HasCompanyGuard)
  public async getCampaignAgents (
    @Param() { id }: UuidDto,
    @User() user: IAuthTokenContent
  ) {
    try {
      return await this.oCampaignService.getAgentsOfCampaign(id, user.companyId as string);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }

  @Get(':id/assigned-agents')
  @UseGuards(HasCompanyGuard)
  public async getCampaignAssignedAgents (
    @Param() { id }: UuidDto,
    @User() user: IAuthTokenContent
  ) {
    try {
      return await this.oCampaignService.getAssignedAgentsOfCampaign(id, user.companyId as string);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }

 /* @Get(':id/unassigned-agents')
  @UseGuards(HasCompanyGuard)
  public async getCampaignUnassignedAgents (
    @Param() { id }: UuidDto,
    @User() user: IAuthTokenContent
  ) {
    try {
      return await this.oCampaignService.getUnassignedAgentsOfCampaign(id,user.id);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }*/

  @Get(':id/sales')
  @UseGuards(HasCompanyGuard)
  public async getCampaignSales (
    @Param() { id }: UuidDto,
    @User() user: IAuthTokenContent
  ) {
    try {
      return await this.oCampaignService.getSalesOfCampaign(id,user.companyId as string);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }

  /*
  @Get(':id/unassigned-sales')
  @UseGuards(HasCompanyGuard)
  public async getUnassignedCampaignSales (
    @Param() { id }: UuidDto,
  ) {
    try {
      return await this.oCampaignService.getUnassignedSalesOfCampaign(id);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  } */

  /*@Get(':id/appointment')
  @UseGuards(HasCompanyGuard)
  public async getCampaignAppointment (
    @Param() { id }: UuidDto,
  ) {
    try {
      return await this.oCampaignService.getCampaignAppointment(id);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }*/

  /*@Get('appointments')
  @UseGuards(HasCompanyGuard)
  public async getCampaignAppointments (
  ) {
    try {
      return await this.oCampaignService.getCampaignAppointments();
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }*/

  /*@Post(':id/appointment')
  @UseGuards(HasCompanyGuard)
  public async createCampaignAppointment (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto,
    @Body() payload: CreateAppointmentDto
  ) {
    try {
      return await this.oCampaignService.createCampaignAppointment(user.id, id, payload);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }*/

  @Put(':id')
  @UseGuards(HasCompanyGuard)
  public async updateCampaign (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto,
    @Body() campaign: UpdateCampaignDto
  ) {
    if (!Object.keys(campaign).length) {
      throw new NotAcceptableException('At least one property must be specified');
    }
    return await this.oCampaignService.updateOutboundCampaign({
      user,
      campaignId: id,
      campaign
    });
  }

  @Get()
  @UseGuards(HasCompanyGuard)
  public async getCampaigns (
    @User() user: IAuthTokenContent,
    @Query() { status }: StatusDto,
    @Query() { offset, limit }: PaginationQueryDto
  ): Promise<IPaginated<OCampaignEntity>> {
    //console.log('status--->',status)
    return await this.oCampaignService.getCampaigns({
      companyId: user.companyId as any,
      offset,
      limit,
      status
    });
  }

  @Get('/real-time-statistics')
  @UseGuards(HasCompanyGuard)
  public async stats (
    @User() user: IAuthTokenContent
  ) {
        return this.oCampaignService.stats(user.companyId as string)
  }

  @Get('/summary')
  @UseGuards(HasCompanyGuard)
  public async summary (
    @User() user: IAuthTokenContent
  ) {
        return this.oCampaignService.summary(user.companyId)
  }

  @Get('export/:first_date/:second_date')
  @UseGuards(HasCompanyGuard)
  public async getCampaignexport (
    @User() user: IAuthTokenContent,
    @Param() { first_date, second_date }: DateDoubleDto,
    @Query() { email }: CreateCompanyDto
  ) {
    return await this.oCampaignService.getCampaignexport(user.companyId as string,first_date,second_date,email);
  }

  @Get('/mcd_dnc')
  @UseGuards(HasCompanyGuard)
  public async getCampaignMcdDnc (
    @User() user: IAuthTokenContent,
  ) {
    
    return await this.oCampaignService.getCampaignMcdDnc(user.companyId as string);
  }
  
  @Get('live')
  @UseGuards(HasCompanyGuard)
  public async getLiveCampaigns (
    @User() user: IAuthTokenContent,
    @Query() { offset, limit }: PaginationQueryDto
  ): Promise<IPaginated<OCampaignEntity>> {
    return await this.oCampaignService.getLiveCampaigns({
      companyId: user.companyId as any,
      offset,
      limit
    });
  }


  @Get(':id')
  @UseGuards(HasCompanyGuard)
  public async getCampaign (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto,
  ): Promise<IPaginated<OCampaignEntity>> {
    return await this.oCampaignService.getCampaign(id);
  }

  

  @Delete(':id')
  @UseGuards(HasCompanyGuard)
  public async deleteCampaign (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto
  ) {
    try {
      await this.oCampaignService.deleteCampaign({
        campaignId: id,
        user
      });

      return { "success": "true" }
    } catch (e) {
      if (e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }

  @Post(':id/question')
  @UseGuards(HasCompanyGuard)
  public async addQuestionToCampaign (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto,
    @Body() payload: QuestionDto    
  ) {
    try {
      return await this.oCampaignService.joinQuestionToOutboundCampaign(payload, id,user);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }
    
      throw e;
    }
  }

  @Get(':id/question')
  @UseGuards(HasCompanyGuard)
  public async getCampaignQuestions (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto, 
  ) {
    try {
      return await this.oCampaignService.getQuestionOfOutboundCampaign(id,user.id);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }
    
      throw e;
    }
  }

  @Post('answer')
  @UseGuards(HasCompanyGuard)
  public async postCampaignAnswer (
    @User() user: IAuthTokenContent,
    @Body() payload: AnswerDto
  ) {
    try {
      return await this.oCampaignService.postAnswerOutboundCampaign(payload,user.companyId);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }
    
      throw e;
    }
  }

  @Get(':id/answers')
  @UseGuards(HasCompanyGuard)
  public async getCampaignAnswers (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto, 
  ) {
    try {
      return await this.oCampaignService.getAnswersOfOutboundCampaign(id,user.companyId);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }
    
      throw e;
    }
  }

  @Delete(':id/question')
  @UseGuards(HasCompanyGuard)
  public async deleteQuestion (
    @Param() { id }: UuidDto, 
  ) {
    try {
      return await this.oCampaignService.deleteQuestion(id);
    } catch(e) {
      if(e instanceof UnknownCampaignException) {
        throw new BadRequestException(e.message);
      }
    
      throw e;
    }
  }

 

  @Get(':id/outgoing')
  @UseGuards(HasCompanyGuard)
  public async outgoing (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto
  ) {
        return this.oCampaignService.outgoing(id)
  }

  @Get('/statistics/:id')
  @UseGuards(HasCompanyGuard)
  public async getCampaignStatistics (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto,
  ) {
    return await this.oCampaignService.getCampaignStatistics(id);
  }

  @Get('/records/:first_date/:second_date')
  @UseGuards(HasCompanyGuard)
  public async getCampaignRecords (
    @User() user: IAuthTokenContent,
    @Param() { first_date, second_date }: DateDoubleDto
  ) {
    //console.log('first-->',first_date,'sec->',second_date)
    return await this.oCampaignService.getCampaignRecords(first_date,second_date);
  }

 

 




  

}

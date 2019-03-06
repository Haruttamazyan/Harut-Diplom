import { Controller, Post, Put, Delete, Body, Patch, Param, Get, Query, UseGuards, NotAcceptableException, BadRequestException} from '@nestjs/common';
import { ApiUseTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import {CreateCompanyAgentDto, EditCompanyAgentDto, AgentRegisterTypeDto, AgentStatisticsDto } from './dto';
import { User, Roles } from '../../decorators';
import { IAuthTokenContent} from '../../interfaces';
import { UuidDto, NameParameterDto, UuidDoubleDto } from '../../dto';
import { HasCompanyGuard } from '../../guards';
//import { AgentEntity } from './agent.entity';
import { ROLE_SYS_ADMIN, ROLE_COMPANY_ADMIN,ROLE_AGENT_MANAGER, ROLE_AGENT } from '../user/types';

@Controller('agents')
@ApiUseTags('agents')
@ApiBearerAuth()
export class AgentController {
    constructor (
        private readonly userService: UserService
    ) {}

    @Get('')
    @ApiOperation({
      title: 'Get agents'
    })
    @Roles(ROLE_SYS_ADMIN, ROLE_COMPANY_ADMIN)
    public async getAgents (
      @Query() { name }: NameParameterDto,      
      @User() user: IAuthTokenContent,
    ) {
      const agents = await this.userService.getAgents(user, name);

      return agents /*? agents.map(item => {
        delete item.extension;
        return item;
      }): []*/
    }

    @Get('/all')
    @ApiOperation({
      title: 'Get all agents created by company-admin for agent-manger'
    })
    @Roles(ROLE_SYS_ADMIN, ROLE_AGENT_MANAGER)
    public async getAllAgents (     
    ) {
      return await this.userService.getAllAgents();
    }

    @Get('/campaign')
    @Roles(ROLE_AGENT, ROLE_AGENT_MANAGER)
    @ApiOperation({
      title: 'Get all campaigns of agent'
    })
    public async getCompaignsOfAgent (
      @User() user: IAuthTokenContent
    ) {
      return await this.userService.allAgentCampaigns(user.id);
    }
    
    @Get("/dashboard")
    @ApiOperation({
        title: 'get agent Dashboard'
    })
    @Roles(ROLE_AGENT, ROLE_AGENT_MANAGER)
    public async getAgentDashboard (
        @User() user: IAuthTokenContent
    ) { 
        return await this.userService.getAgentDushboard(user);
    }

    @Get(':id')
    @ApiOperation({
      title: 'Get company agent'
    })
    public async getCompanyAgent (
      @User() user: IAuthTokenContent,
      @Param() { id }: UuidDto
    ) {
      return await this.userService.findAgentById(id);
    }

    

    @Post('create')
    @ApiOperation({
      title: 'Create company agent'
    })
    //@UseGuards(HasCompanyGuard)
    public async createCompanyAgent (
      @User() user: IAuthTokenContent,
      @Body() payload: CreateCompanyAgentDto
    ) {
      return await this.userService.createCompanyAgent(payload, user);
    }

    @Post('logout')
    @ApiOperation({
      title: 'Leave all campaigns'
    })
    //@UseGuards(HasCompanyGuard)
    @Roles(ROLE_AGENT,ROLE_AGENT_MANAGER)
    public async logoutCompanyAgent (
      @User() user: IAuthTokenContent,
    ) {
      return await this.userService.logoutCompanyAgent(user.id);
    }

    @Patch(':id')
    @ApiOperation({
      title: 'Edit company agent',
      description: `Only a system admin or company admin can edit other users.
      All users can edit themselves.
      Only the same user can change the password.`
    }) 
    public async editCompanyAgent (
      @User() user: IAuthTokenContent,
      @Param() { id }: UuidDto,
      @Body() payload: EditCompanyAgentDto
    ) {
        await this.userService.editCompanyAgent(
            { target: id, requester: user.id },
            payload
        );

        return await this.userService.findAgentById(id); 
    }

    // TASK
    @Delete(":id")
    @ApiOperation({
        title: 'Delete company agent'
    })
    public async deleteCompanyAgent (
        @User() user: IAuthTokenContent,
        @Param() { id }: UuidDto
    ) { 
        return await this.userService.deleteCompanyAgent(id);
    }

    @Delete(":id1/campaign/:id2")
    @ApiOperation({
        title: 'Delete camapign from assigned on Agent'
    })
    public async deleteCompaignfromAgent (
        @User() user: IAuthTokenContent,
        @Param() { id1: agentId, id2: campaignId }: UuidDoubleDto,
    ) { 
        return await this.userService.deleteCampaignFromAgent(agentId,campaignId);
    }

    @Get(":id/sip_account")
    @ApiOperation({
        title: 'check Sip Account'
    })
    public async check_sip_account (
        @User() user: IAuthTokenContent,
        @Param() { id }: UuidDto
    ) { 
        return await this.userService.checkSip(id);
    }

    @Get(":id/calls")
    @ApiOperation({
        title: 'get agent calls'
    })
    public async getAgentCalls (
        @User() user: IAuthTokenContent,
        @Param() { id }: UuidDto
    ) { 
        return await this.userService.getagentcalls(id);
    }


    @Get(":id/statistics")
    @ApiOperation({
        title: 'get agent statistics by time and campaign'
    })
    public async getAgentStatistics (
        @User() user: IAuthTokenContent,
        @Param() { id }: UuidDto,
        @Query()  payload: AgentStatisticsDto
    ) { 
        console.log(payload)
      
      if(payload.search_type == 'campaign'){
        return await this.userService.getAgentStatisticsforCampaign(id,user.companyId as string)
      }
      
        if(payload.search_type == 'hourly')
            return await this.userService.getAgentStatisticsbyTime(id,payload.hour,true);
        if(payload.search_type == 'daily')
            return await this.userService.getAgentStatisticsbyTime(id,payload.day,false);
      
        //return payload
    }

    

    
}

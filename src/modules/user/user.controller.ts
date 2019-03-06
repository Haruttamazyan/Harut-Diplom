import { Controller, Post, Put,Req, Delete, Body, Param, Get, Query, UseGuards, Patch, NotAcceptableException, UseInterceptors,FileInterceptor } from '@nestjs/common';
import { ApiUseTags, ApiOperation, ApiBearerAuth,ApiConsumes,ApiImplicitBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateCompanyUserDto, CreateCompanyAgentDto, EditCompanyUserDto, GetUsersQueryDto } from './dto';
import { User, Roles } from '../../decorators';
import { IAuthTokenContent, IPaginated } from '../../interfaces';
import { UserEntity } from './user.entity';
import { atLeastPrivilegedAgentMessage } from '../../messages';
import { UuidDto, RegisterTypeDto } from '../../dto';
import { HasCompanyGuard } from '../../guards';
import { ROLE_SYS_ADMIN, ROLE_COMPANY_ADMIN,ROLE_AGENT,ROLE_AGENT_MANAGER } from '../user/types';
import { CreateUserDidDto } from './dto/create-did.dto';
import { multerOptions } from './multer-options';
import { Request } from 'express';

@Controller('user')
@ApiUseTags('user')
@ApiBearerAuth()
export class UserController {
  constructor (
    private readonly userService: UserService
  ) {}

  @Post()
  @ApiOperation({
    title: 'Create company user',
    description: atLeastPrivilegedAgentMessage
  })
  public async createCompanyUser (
    @User() user: IAuthTokenContent,
    @Body() payload: CreateCompanyUserDto
  ): Promise<UserEntity> {
    return await this.userService.createCompanyUser(payload, user.id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar', multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiImplicitBody({ name: 'EditCompanyProfile', type: EditCompanyUserDto })
  @ApiOperation({
    title: 'Edit company user',
    description: `Only a system admin or company admin can edit other users.
    All users can edit themselves.
    Only the same user can change the password.`
  })
  public async editCompanyUser (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto,
    @Req() req: Request,
    //@Body() payload: EditCompanyUserDto
  ) {
    
    const payload = req.body
   // console.log(payload)
    if (!Object.keys(payload).length) {
      throw new NotAcceptableException('At least one property must be specified');
    }

    if(req.file === undefined){
      return await this.userService.editCompanyUser(
        { target: id, requester: user.id },
        payload
      )
    } else{
       return await this.userService.editCompanyUser(
                { target: id, requester: user.id },
              payload,
            req.file.filename
           );
        }
    
  }

  // TASK
  @Delete(":id")
  @ApiOperation({
    title: 'Delete company user'
  })
  @Roles(ROLE_SYS_ADMIN, ROLE_COMPANY_ADMIN)
  public async CompanyAgent (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto
  ) {   
    return await this.userService.deleteCompanyUser(id, user);
  }
  
  @Get()
  @ApiOperation({
    title: 'Get company users'
  })
  @UseGuards(HasCompanyGuard)
  public async getCompanyUsers (
    @User() user: IAuthTokenContent,
    @Query() { offset, limit, role }: GetUsersQueryDto
  ): Promise<IPaginated<UserEntity>> {
    return await this.userService.findByCompany({
      userId: user.id,
      companyId: user.companyId as any,
      offset,
      limit,
      role
    });
  }

  @Get('/profile')
  @ApiOperation({
    title: 'Get  user'
  })
  public async getUsers (
    @User() user: IAuthTokenContent
  ) {
    return await this.userService.findLoginUser(user);
  }

  @Get('did')
  @ApiOperation({
    title: 'Get user dids'
  })
  public async getUserDids (
    @User() user: IAuthTokenContent
  ): Promise<void> {
   // console.log('hereeeeeee')
    return await this.userService.getDids(user)
  }

  @Get('did/:id')
  @ApiOperation({
    title: 'Get user dids'
  })
  public async getUserDid (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto
  ) {
   // console.log('hereeeeeee')
    return await this.userService.getDid(id,user.id)
  }

  @Delete('did/:id')
  @ApiOperation({
    title: 'Delete user dids'
  })
  public async DeleteUserDid (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto
  ) {
   // console.log('hereeeeeee')
    return await this.userService.deleteDid(id)
  }

  @Post('did')
  @ApiOperation({
    title: 'Create did number for user',
    description: atLeastPrivilegedAgentMessage
  })
  public async addDidToUser (
    @User() user: IAuthTokenContent,
    @Body() payload: CreateUserDidDto
  ): Promise<void> {
   return  await this.userService.addDid(user, payload.did, payload.name)
    //return await this.userService.getDids(user)    
  }

  @Get(':id')
  @ApiOperation({
    title: 'Get company user'
  })
  public async getCompanyUser (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto
  ) {
    return await this.userService.findByIdAndCompany(user.companyId as any, id);
  }

  @Post('register/:type')
    @ApiOperation({
      title: 'Register with type Web or SIP'
    })
    @Roles(ROLE_AGENT, ROLE_AGENT_MANAGER,ROLE_COMPANY_ADMIN)
    public async registerAgent (
      @User() user: IAuthTokenContent,
      @Param() { type }: RegisterTypeDto,
      //@Body() payload: AgentRegisterTypeDto
    ) {
      return await this.userService.registeragent(user, type);
    }
}

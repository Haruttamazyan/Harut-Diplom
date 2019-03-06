import { Controller, Post, Body, HttpStatus, NotAcceptableException, BadRequestException, Patch } from '@nestjs/common';
import { ApiResponse, ApiUseTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { RegisterUserDto, LoginDto, IsExistingEmailDto, ResetPassword } from './dto';
import { signToken, forgetToken } from '../../utilities/jwt';
import { UserEntity } from '../user/user.entity';
import { IAuthTokenized } from '../../interfaces';
import { ILoginResponse } from './interfaces';
import { CompanyEntity } from '../company/company.entity';
import { DuplicatedEmailException } from '../../exceptions';
import {
  ROLE_RESELLER,
  ROLE_AGENT,
  ROLE_SALES,
  ROLE_AGENT_MANAGER
} from '../user/types';

@Controller('auth')
@ApiUseTags('auth')
export class AuthController {
  constructor (
    private readonly userService: UserService
  ) {}

  @Post('register')
  @ApiOperation({
    title: 'Register a new company admin'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Company admin created successfully'
  })
  @ApiResponse({
    status: HttpStatus.NOT_ACCEPTABLE,
    description: 'Email already exists'
  })
  public async createCompanyAdmin (
    @Body() payload: RegisterUserDto
  ): Promise<UserEntity /*& IAuthTokenized*/> {
    const user = await this.userService.createCompanyAdmin(payload);

    return {
      ...user,
      /*token: signToken({
        id: user.id,
        role: user.role
      })*/
    };
  }

  @Post('login')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login was successful'
  })
  @ApiResponse({
    status: HttpStatus.NOT_ACCEPTABLE,
    description: 'Invalid credentials'
  })
  public async login (@Body() payload: LoginDto): Promise<ILoginResponse> {
    const user = await this.userService.findByCredentials(payload);

    if (!user) {
      throw new NotAcceptableException('credentials:invalid');
    }
   /* if(user.role == ROLE_AGENT){
      const agent = await this.userService.getagentsss(user.email)
      user.sipUsername = agent.sipUsername
      user.sipPassword = agent.sipPassword
    }*/

    const company = user.company ? user.company : new CompanyEntity();
      //user.status = company.status;
      if(user.role == 'company-admin' && company.status == 'pending'){
        throw new NotAcceptableException('this company admin is not approved yet')
      }
    delete user.company;
    delete user.forget_password_token
   
    if(user.role == ROLE_SALES ||  user.role == ROLE_RESELLER ||  user.role == ROLE_AGENT || user.role == ROLE_AGENT_MANAGER){
      delete user.reseller_uuid;
      return {
        user,
        token: signToken({
          id: user.id,
          role: user.role,
          companyId: company && company.id
        })
      };
    } else{
    return {
      user,
      company,
      token: signToken({
        id: user.id,
        role: user.role,
        companyId: company && company.id
      })
    };
  }
  }

  @Post('is-existing-email')
  @ApiOperation({
    title: 'Check if an email is valid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Boolean
  })
  public async isExistingEmail (
    @Body() { email }: IsExistingEmailDto
  ): Promise<boolean> {
    return await this.userService.isExistingEmail(email);
  }

  @Post('forget_password')
  @ApiOperation({
    title: 'Check if an email is valid and send token'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Boolean
  })
  public async forget_password (
    @Body() { email }: IsExistingEmailDto
  ) {
   // return await this.userService.isExistingEmail(email);
    if (!await this.userService.isExistingEmail(email)) {
      throw new BadRequestException(`User with this email ${email} does not exist`);
    }
  const  token = forgetToken({email: email })
      await this.userService.changeForgetPasswordToken(email,token);

     const sgMail = require('@sendgrid/mail');

   sgMail.setApiKey(process.env['SENDGRID_API_KEY']);
   const msg = {
     to: email,
     from: 'noreply@extremedialer.com',
     subject: 'Token for reset password',
     text: `Token - ${token}testttt`,
     html: `Token - ${token}`,
   };
     
   sgMail.send(msg);  

    return `token sendid in ${email}`
  }


  
  @Patch('reset-password')
  @ApiOperation({
    title: 'Check if token is valid and reset password'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Boolean
  })
  public async reset_password (
    @Body()  payload : ResetPassword
  ) {
    return  await this.userService.resetPassword(payload.change_password_token,payload.password);
      
      
  }

}

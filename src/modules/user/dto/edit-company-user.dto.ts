import {
  IsString,
  IsBoolean,
  IsEmail,
  MinLength,
  MaxLength,
  IsIn,
  IsOptional,
  ValidateIf,
  ValidateNested,
  IsUUID
} from 'class-validator';
import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { userFirstName, userLastName, userPassword } from '../user.boundaries';
import { AssignableUserRole, AssignableUserRoleArr } from '../types';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserPermissionsDto } from './edit-user-permissions.dto';

@Exclude()
export class EditCompanyUserDto {
  @Expose()
  @IsString()
  @IsOptional()  
  @MinLength(userLastName.minLength)
  @MaxLength(userLastName.maxLength)
  @ApiModelPropertyOptional(userLastName as any)
  public readonly first_name: string;
 
  @Expose()
  @IsString()
  @IsOptional()  
  @MinLength(userLastName.minLength)
  @MaxLength(userLastName.maxLength)
  @ApiModelPropertyOptional(userLastName as any)
  public readonly last_name: string;

  @Expose()
  @IsOptional()
  @IsEmail()
  @ApiModelPropertyOptional()
  public readonly email: string;

  @Expose()
  @IsString()
  @IsOptional()
  @ApiModelPropertyOptional()
  public readonly phone: string;

  @Expose()
  @IsBoolean()
  @IsOptional()
  @ApiModelPropertyOptional()
  public readonly is_active: boolean;

  @Expose()
  @IsBoolean()
  @IsOptional()
  @ApiModelPropertyOptional()
  public readonly is_company_admin: boolean;

 /* @Expose()
  @IsString()
  @IsOptional()
  @ApiModelPropertyOptional()
  public readonly avatar: string;*/

  @Expose()
  @ValidateIf(obj => !!obj.newPassword)
  @IsString()
  @MinLength(userPassword.minLength)
  @MaxLength(userPassword.maxLength)
  @ApiModelPropertyOptional(userPassword as any)
  public readonly oldPassword: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(userPassword.minLength)
  @MaxLength(userPassword.maxLength)
  @ApiModelPropertyOptional(userPassword as any)
  public readonly newPassword: string;

  @Expose()
  @IsOptional()
  @IsIn(AssignableUserRoleArr)
  @ApiModelPropertyOptional({ type: 'string', enum: AssignableUserRoleArr })
  public readonly role: AssignableUserRole;

  @Expose()
  @IsOptional()
  @Type(() => UserPermissionsDto)
  @ValidateNested()
  @ApiModelPropertyOptional()
  public readonly permissions?: UserPermissionsDto;

  @Expose()
  @IsOptional()
  @IsUUID()
  @ApiModelPropertyOptional()
  public readonly reseller_uuid: string;

  @ApiModelPropertyOptional({ format: 'binary', content: 'file/jpg' } as any)
  public readonly avatar?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly address: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly city: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly state: string;
}

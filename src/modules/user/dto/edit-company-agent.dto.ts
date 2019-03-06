import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsBoolean,
  IsOptional,
  ValidateIf,
  ValidateNested
} from 'class-validator';
import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { userFirstName, userLastName, userPassword } from '../user.boundaries';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserPermissionsDto } from './edit-user-permissions.dto';

@Exclude()
export class EditCompanyAgentDto {
  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(userFirstName.minLength)
  @MaxLength(userFirstName.maxLength)
  @ApiModelPropertyOptional(userFirstName as any)
  public readonly first_name: string;

  @Expose()
  @IsOptional()
  @IsString()
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
  @Type(() => UserPermissionsDto)
  @ValidateNested()
  @ApiModelPropertyOptional()
  public readonly permissions?: UserPermissionsDto;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional(userPassword as any)
  public readonly sipUsername: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly sipPassword: string;

  /*@Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly extension: string;*/

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly phone: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  @ApiModelPropertyOptional()
  public readonly agent_manager: boolean;
/*
  @Expose()
  @IsOptional()
  @IsBoolean()
  @ApiModelPropertyOptional()
  public readonly is_on_hook: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  @ApiModelPropertyOptional()
  public readonly is_online: boolean;*/
}

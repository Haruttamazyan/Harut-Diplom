import { Exclude, Expose } from 'class-transformer';
import { IsString, IsBoolean, MinLength, MaxLength, IsEmail, IsOptional } from 'class-validator';
import { userPassword } from '../user.boundaries';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { userFirstName, userLastName } from '../user.boundaries';

@Exclude()
export class CreateCompanyAgentDto {
  @Expose()
  @IsString()
  @MinLength(userFirstName.minLength)
  @MaxLength(userFirstName.maxLength)
  @ApiModelProperty(userFirstName as any)
  public readonly first_name: string;

  @Expose()
  @IsString()
  @MinLength(userLastName.minLength)
  @MaxLength(userLastName.maxLength)
  @ApiModelProperty(userLastName as any)
  public readonly last_name: string;

  @Expose()
  @IsEmail()
  @ApiModelProperty()
  public readonly email: string;

  @Expose()
  @IsString()
  @MinLength(userPassword.minLength)
  @MaxLength(userPassword.maxLength)
  @ApiModelProperty(userPassword as any)
  public readonly password: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly extension?: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  @ApiModelPropertyOptional()
  public readonly is_on_hook?: boolean;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly phone?: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  public readonly is_online: boolean;

  @Expose()
  @IsBoolean()
  @IsOptional()
  public readonly agent_manager: boolean;
}

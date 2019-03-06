import { Exclude, Expose, Type } from 'class-transformer';
import { IsString, MinLength, MaxLength, IsIn, IsEmail, ValidateNested, IsDefined, IsBoolean,IsOptional } from 'class-validator';
import { userPassword } from '../user.boundaries';
import { ApiModelProperty,ApiModelPropertyOptional } from '@nestjs/swagger';
import { userFirstName, userLastName } from '../user.boundaries';

@Exclude()
export class CreateCompanyUserDto {
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
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly phone: string;

  @Expose()
  @IsString()
  @MinLength(userPassword.minLength)
  @MaxLength(userPassword.maxLength)
  @ApiModelProperty(userPassword as any)
  public readonly password: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly address: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly city: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly state: string;
}

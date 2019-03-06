import { IsString, IsEmail, MinLength, MaxLength, IsOptional, IsUUID } from 'class-validator';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import * as company from '../company.boundaries';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CreateCompanyDto {
  @Expose()
  @IsString()
  @MinLength(company.name.minLength)
  @MaxLength(company.name.maxLength)
  @ApiModelProperty(company.name as any)
  public readonly company_name: string;
/*
  @Expose()
  @IsString()
  @ApiModelProperty()  
  public readonly first_name: string;

  @Expose()
  @IsString()
  @ApiModelProperty()  
  public readonly last_name: string;*/

  @Expose()
  @IsString()
  @MinLength(company.address1.minLength)
  @MaxLength(company.address1.maxLength)
  @ApiModelProperty(company.address1 as any)
  public readonly address1: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(company.address1.minLength)
  @MaxLength(company.address1.maxLength)
  @ApiModelPropertyOptional(company.address2 as any)
  public readonly address2: string;

  @Expose()
  @IsString()
  @MinLength(company.country.minLength)
  @MaxLength(company.country.maxLength)
  @ApiModelProperty(company.country as any)
  public readonly country: string;

  @Expose()
  @IsString()
  @MinLength(company.state.minLength)
  @MaxLength(company.state.maxLength)
  @ApiModelProperty(company.state as any)
  public readonly state: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly phone: string;

  @Expose()
  @IsString()
  @ApiModelProperty()  
  public readonly zipcode: string;

  @Expose()
  @IsString()
  @ApiModelProperty()  
  public readonly city: string;

  @Expose()
  @IsEmail()
  @ApiModelProperty()
  public readonly email: string;
/*
  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly rate_per_min: string;*/

  @Expose()
  @IsString()
  @IsUUID(undefined, { each: true })
  @ApiModelProperty({
    type: 'string',
    format: 'uuid'
  } as any)
  public readonly user_uuid: string;
}

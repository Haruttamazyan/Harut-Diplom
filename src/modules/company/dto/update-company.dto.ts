import { IsString, IsEmail, MinLength, MaxLength, IsOptional, IsUUID } from 'class-validator';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import * as company from '../company.boundaries';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UpdateCompanyDto {
  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(company.name.minLength)
  @MaxLength(company.name.maxLength)
  @ApiModelPropertyOptional(company.name as any)
  public readonly company_name?: string;
/*
  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()  
  public readonly first_name?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()  
  public readonly last_name?: string;*/

  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(company.address1.minLength)
  @MaxLength(company.address1.maxLength)
  @ApiModelPropertyOptional(company.address1 as any)
  public readonly address1?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(company.address1.minLength)
  @MaxLength(company.address1.maxLength)
  @ApiModelPropertyOptional(company.address2 as any)
  public readonly address2?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(company.country.minLength)
  @MaxLength(company.country.maxLength)
  @ApiModelPropertyOptional(company.country as any)
  public readonly country?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(company.state.minLength)
  @MaxLength(company.state.maxLength)
  @ApiModelPropertyOptional(company.state as any)
  public readonly state?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly phone?: string;
/*
  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()  
  public readonly zipcode?: string;*/

  @Expose()
  @IsOptional()
  @IsEmail()
  @ApiModelPropertyOptional()
  public readonly email?: string;
/*
  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly rate_per_min?: string;*/

  @Expose()
  @IsOptional()
  @IsString()
  @IsUUID(undefined, { each: true })
  @ApiModelPropertyOptional({
    type: 'string',
    format: 'uuid'
  } as any)
  public readonly user_uuid: string;
}

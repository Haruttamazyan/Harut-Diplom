import {  IsEmail, IsOptional  } from 'class-validator';
import {  ApiModelPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CreateCompanyDto {
  @Expose()
  @IsOptional()
  @IsEmail()
  @ApiModelPropertyOptional()
  public readonly email: string;

}

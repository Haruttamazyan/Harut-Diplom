import { Exclude, Expose, Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { ApiModelPropertyOptional } from '@nestjs/swagger';


@Exclude()
export class UpdateContactDto {
  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public firstName?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public middle_name?: string;


  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public lastName?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public phoneNumber?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public address1?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public address2?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public city?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public state?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public zipcode?: string;



}

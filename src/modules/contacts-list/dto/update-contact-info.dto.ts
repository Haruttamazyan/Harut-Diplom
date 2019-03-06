import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString, IsArray } from 'class-validator';
import { ApiModelPropertyOptional } from '@nestjs/swagger';


@Exclude()
export class UpdateContactDto {

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public first_name?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public middle_name?: string;


  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public last_name?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public phone_number?: string;

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

  @Expose()
  @IsOptional()
  @IsArray()
  @ApiModelPropertyOptional({
    type: 'string',
    format: 'uuid',
    isArray: true
  } as any)
  public readonly UserDefinedField: string[];

}

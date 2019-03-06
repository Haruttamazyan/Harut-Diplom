import { IsString, IsEmail, MinLength, MaxLength, IsOptional, IsNumber,IsArray } from 'class-validator';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class addPricingDto {

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional() 
  public readonly country?: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  @ApiModelPropertyOptional()
  public readonly rate_per_min: number;

  @Expose()
  @IsOptional()
  @IsArray()
  @ApiModelPropertyOptional({
    type: 'string',
    isArray: true
  } as any)
  public readonly codes: string[];

}

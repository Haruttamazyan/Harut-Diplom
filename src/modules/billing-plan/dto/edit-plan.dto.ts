import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class editPlanDto {

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional() 
  public readonly plan_name?: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  @ApiModelPropertyOptional()
  public readonly allowed_country_code?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  @ApiModelPropertyOptional()  
  public readonly monthly_fee_per_day_per_agent?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  @ApiModelPropertyOptional()  
  public readonly yearly_fee_per_month_per_agent?: number;
 
  @Expose()
  @IsOptional()
  @IsNumber()
  @ApiModelPropertyOptional()  
  public readonly agent_fee_year_per_agent?: number;

}

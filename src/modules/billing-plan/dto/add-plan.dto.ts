import { IsString, IsEmail, MinLength, MaxLength, IsOptional, IsNumber,IsDefined,ValidateNested } from 'class-validator';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose,Type, } from 'class-transformer';
import { Price2Dto } from './price2.dto'

@Exclude()
export class addPlanDto {

  @Expose()
  @IsString()
  @ApiModelProperty() 
  public readonly plan_name: string;

  @Expose()
  @IsNumber()
  @ApiModelProperty()
  public readonly allowed_country_code: number;

  @Expose()
  @Type(() => Price2Dto)
  @IsDefined()
  @ValidateNested()
  @ApiModelProperty()  
  public readonly monthly_fee_per_day_per_agent: Price2Dto;

  @Expose()
  @Type(() => Price2Dto)
  @IsDefined()
  @ValidateNested()
  @ApiModelProperty()  
  public readonly yearly_fee_per_month_per_agent: Price2Dto;
 
  @Expose()
  @Type(() => Price2Dto)
  @IsDefined()
  @ValidateNested()
  @ApiModelProperty()  
  public readonly agent_fee_year_per_agent: Price2Dto;

}

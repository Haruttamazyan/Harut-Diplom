import { CompanyStatus, CompanyStatusArr } from '../types';
import { IsIn, IsOptional } from 'class-validator';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CompanyStatusDto {
  @Expose()
  @IsIn(CompanyStatusArr)
  @ApiModelProperty({
    type: 'string',
    enum: CompanyStatusArr
  } as any)
  public readonly status: CompanyStatus;
}

@Exclude()
export class CompanyStatusOptionalDto {
  @Expose()
  @IsOptional()
  @IsIn(CompanyStatusArr)
  @ApiModelPropertyOptional({
    type: 'string',
    enum: CompanyStatusArr,
    description: 'One of [' + CompanyStatusArr.join(', ') + ']'
  } as any)
  public readonly status?: CompanyStatus;
}

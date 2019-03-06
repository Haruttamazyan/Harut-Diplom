import { IsOptional } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsSimpleDate } from '../decorators';

@Exclude()
export class DateRangeDto {
  @Expose()
  @IsOptional()
  @IsSimpleDate()
  @ApiModelPropertyOptional({ description: 'Simple date for filtering in YYYY-MM-DD format.' })
  public readonly from?: string;

  @Expose()
  @IsOptional()
  @IsSimpleDate()
  @ApiModelPropertyOptional({ description: 'Simple date for filtering in YYYY-MM-DD format.' })
  public readonly to?: string;
}

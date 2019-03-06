import { IsInt, Min, Max,IsOptional } from 'class-validator';
import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { offsetMessage, limitMessage } from '../messages';
import { defaultListLimit, maxListLimit } from '../constants';
import { Type, Transform, Exclude, Expose } from 'class-transformer';

@Exclude()
export class PaginationQueryDto {
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @Transform((value: number) => Number.isNaN(value) ? 0 : value)
  @IsInt()
  @Min(0)
  @ApiModelPropertyOptional({
    description: offsetMessage,
    default: 0
  })
  public readonly offset: number;

  @Expose()
  @IsOptional()
  @Type(() => Number)
  @Transform((value: number) => Number.isNaN(value) ? defaultListLimit : value)
  @IsInt()
  @Min(1)
  @Max(maxListLimit)
  @ApiModelPropertyOptional({
    description: limitMessage,
    default: defaultListLimit
  })
  public readonly limit: number;
}

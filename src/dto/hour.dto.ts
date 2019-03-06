import { IsInt, Min, Max,IsOptional } from 'class-validator';
import { ApiModelPropertyOptional } from '@nestjs/swagger';
//import { offsetMessage, limitMessage } from '../messages';
//import { defaultListLimit, maxListLimit } from '../constants';
import { Type, Transform, Exclude, Expose } from 'class-transformer';

@Exclude()
export class HourDto {
    @Expose()
    @IsOptional()
    @Type(() => Number)
    @Transform((value: number) => Number.isNaN(value) ? 0 : value)
    @IsInt()
    @Min(0)
    @ApiModelPropertyOptional()
    public readonly hour?: number;

    @Expose()
    @IsOptional()
    @Type(() => Number)
    @Transform((value: number) => Number.isNaN(value) ? 0 : value)
    @IsInt()
    @Min(0)
    @ApiModelPropertyOptional()
    public readonly month?: number;
}

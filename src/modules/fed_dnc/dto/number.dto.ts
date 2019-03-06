import { IsIn, Min, Max,IsOptional, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type, Transform, Exclude, Expose } from 'class-transformer';

@Exclude()
export class NumberDto {
    @Expose()
    @IsString()
    @ApiModelProperty()
    public readonly number: string;
}
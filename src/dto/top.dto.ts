import { IsIn, Min, Max,IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { ConnectedTop, ConnectedTopArr } from '../modules/company/types';
import { Type, Transform, Exclude, Expose } from 'class-transformer';

@Exclude()
export class TopDto {
    @Expose()
    @IsIn(ConnectedTopArr)
    @ApiModelProperty({ type: 'string', enum: ConnectedTopArr } as any)
    public readonly top: ConnectedTop;
}
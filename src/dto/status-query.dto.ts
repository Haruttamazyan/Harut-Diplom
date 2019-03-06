import { IsIn, Min, Max,IsOptional } from 'class-validator';
import { ApiModelProperty,ApiModelPropertyOptional } from '@nestjs/swagger';
import { CampaignStatus, CampaignStatusArray } from '../modules/campaign/outbound/types/campaign-status';
import { Type, Transform, Exclude, Expose } from 'class-transformer';

@Exclude()
export class StatusDto {
    @Expose()
    @IsOptional()
    @IsIn(CampaignStatusArray)
    @ApiModelPropertyOptional({ type: 'string', enum: CampaignStatusArray } as any)
    public readonly status: CampaignStatus;
}
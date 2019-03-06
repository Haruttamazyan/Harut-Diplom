import { Exclude, Expose } from 'class-transformer';
import { IsUUID,IsArray,ArrayMinSize } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

@Exclude()
export class JoinAgentToCampaignDto {
    @Expose()
    @IsArray()
    @ArrayMinSize(1)
    @ApiModelProperty({
      type: 'string',
      format: 'uuid',
      isArray: true
    } as any)
    public readonly agentId: string[];
}

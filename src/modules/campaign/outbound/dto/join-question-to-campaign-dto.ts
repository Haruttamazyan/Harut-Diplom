import { Exclude, Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

@Exclude()
export class JoinQuestionToCampaignDto {
    @Expose()
    @IsUUID()
    @ApiModelProperty({
      type: 'string',
      format: 'uuid',
    } as any)
    public readonly questionId: string;
}

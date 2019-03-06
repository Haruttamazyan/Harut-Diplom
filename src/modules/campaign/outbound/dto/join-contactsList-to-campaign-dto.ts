import { Exclude, Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

@Exclude()
export class JoinContactsListToCampaignDto {
    @Expose()
    @IsUUID()
    @ApiModelProperty({
      type: 'string',
      format: 'uuid',
    } as any)
    public readonly contactsListId: string;
}

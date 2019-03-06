import { ApiModelProperty } from '@nestjs/swagger';

export class CreateContactsListDto {
  @ApiModelProperty({ type: 'string' } as any)
  public readonly contact_list_name: string;
}

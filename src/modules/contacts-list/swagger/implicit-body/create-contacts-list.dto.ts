import { ApiModelProperty } from '@nestjs/swagger';

export class CreateContactsListDto {
  @ApiModelProperty({ format: 'binary', content: 'text/csv' } as any)
  public readonly contacts: string;

  @ApiModelProperty()
  public readonly contact_list_name: string;
}

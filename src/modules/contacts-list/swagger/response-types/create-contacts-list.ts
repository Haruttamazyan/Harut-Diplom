import { ApiModelProperty } from '@nestjs/swagger';

export class CreateContactsListResponse {
  @ApiModelProperty()
  public readonly contactsListId: string;

  @ApiModelProperty({ type: Array, isArray: true })
  public readonly contactsListPreview: string[][];
}

import { ApiModelPropertyOptional } from '@nestjs/swagger';

export class EditContactsListDto {
  @ApiModelPropertyOptional({ format: 'binary', content: 'text/csv' } as any)
  public readonly contacts?: string;

  @ApiModelPropertyOptional()
  public readonly contact_list_name?: string;
}

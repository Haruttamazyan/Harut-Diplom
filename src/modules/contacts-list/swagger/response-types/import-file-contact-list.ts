import { ApiModelPropertyOptional } from '@nestjs/swagger';

export class ImportFileContactsListResponse {
  @ApiModelPropertyOptional({ type: 'string', format: 'binary'} as any)
  public readonly contacts?: string;
}
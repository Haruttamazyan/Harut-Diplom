import { ApiModelProperty } from '@nestjs/swagger';

export class ImportDNCFileCampaignDto {
  /*@ApiModelPropertyOptional({ type: 'string', format: 'binary'} as any)
  public readonly contacts?: string;*/

  @ApiModelProperty({
    name: 'audio file',
    in: 'formData',
    description: 'Base64 encoded .csv file',
    required: true,
    type: 'file'
  } as any)
  public readonly dnc: string;
}
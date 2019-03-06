import { ApiModelProperty } from '@nestjs/swagger';

export class ImportMediaFileCampaignResponse {
  /*@ApiModelPropertyOptional({ type: 'string', format: 'binary'} as any)
  public readonly contacts?: string;*/

  @ApiModelProperty({
    name: 'audio file',
    in: 'formData',
    description: 'mp3 or wav file',
    required: true,
    type: 'file'
  } as any)
  public readonly recording: string;
}
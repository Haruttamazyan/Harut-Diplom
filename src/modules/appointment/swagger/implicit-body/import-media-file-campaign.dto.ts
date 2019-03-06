import { ApiModelProperty } from '@nestjs/swagger';

export class ImportMediaFileCampaignDto {
  @ApiModelProperty({
    name: 'playback',
    in: 'formData',
    description: 'mp3 or wav file',
    required: true,
    type: 'file'
  } as any)
  public readonly playback: string;
}
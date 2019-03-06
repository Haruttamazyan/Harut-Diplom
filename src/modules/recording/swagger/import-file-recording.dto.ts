import { ApiModelProperty } from '@nestjs/swagger';

export class ImportRecordingFileDto {
  /*@ApiModelPropertyOptional({ type: 'string', format: 'binary'} as any)
  public readonly contacts?: string;*/

  @ApiModelProperty({
    name: 'recording',
    in: 'formData',
    description: 'mp3 file',
    required: true,
    type: 'file'
  } as any)
  public readonly recording: string;
}
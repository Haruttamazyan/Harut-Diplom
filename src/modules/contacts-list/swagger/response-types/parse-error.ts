import { ApiModelProperty } from '@nestjs/swagger';

export class ParseErrorResponse {
  @ApiModelProperty({ default: 406 })
  public readonly statusCode: number;

  @ApiModelProperty({ default: 'parsing-error' })
  public readonly error: string;

  @ApiModelProperty({ description: 'Parser error message.' })
  public readonly message: string;
}

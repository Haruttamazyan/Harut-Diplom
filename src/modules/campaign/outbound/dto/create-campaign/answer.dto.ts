import { Exclude, Expose } from 'class-transformer';
import { IsUUID, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

@Exclude()
export class AnswerDto {
  @Expose()
  @IsUUID()
  @ApiModelProperty()
  public readonly question_uuid: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly answer: string;
}

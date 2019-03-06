import { Exclude, Expose } from 'class-transformer';
import { IsIn, IsString, ValidateIf, IsArray, ArrayMinSize } from 'class-validator';
import { QuestionType, QuestionTypeArr } from '../types';
import { ApiModelProperty } from '@nestjs/swagger';

@Exclude()
export class CreateAppointmentDto {
  @Expose()
  @IsIn(QuestionTypeArr)
  @ApiModelProperty({ type: 'string', enum: QuestionTypeArr } as any)
  public readonly type: QuestionType;

  @Expose()
  @ApiModelProperty()
  public readonly date: Date;

  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly label_default: string;
}

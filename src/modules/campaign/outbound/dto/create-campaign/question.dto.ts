import { Exclude, Expose } from 'class-transformer';
import { IsIn, IsString, ValidateIf, IsArray, ArrayMinSize } from 'class-validator';
import { QuestionType, QuestionTypeArr } from '../../types';
import { ApiModelProperty } from '@nestjs/swagger';

@Exclude()
export class QuestionDto {
  @Expose()
  @IsIn(QuestionTypeArr)
  @ApiModelProperty({ type: 'string', enum: QuestionTypeArr } as any)
  public readonly type: QuestionType;

  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly label: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly label_default: string;

  @Expose()
  @ValidateIf((o: QuestionDto) => o.type === 'multiple-choice')
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  @ApiModelProperty({
    type: 'string',
    isArray: true,
    description: 'Will only be validated if type is "multiple-choice"'
  })
  public readonly choices: string[];
}

import { Exclude, Expose, Type } from 'class-transformer';
import { IsBoolean, IsUrl, IsArray, ValidateNested } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { QuestionDto } from './question.dto';

@Exclude()
export class OrderTakenFormDto {
  @Expose()
  @IsBoolean()
  @ApiModelProperty()
  public readonly canBeTakenByAgent: boolean;

  @Expose()
  @IsBoolean()
  @ApiModelProperty()
  public readonly canBeTakenBySalesPerson: boolean;

  @Expose()
  @IsUrl()
  @ApiModelProperty({ format: 'url' } as any)
  public readonly submitAsPostUrl: string;

  @Expose()
  @Type(() => QuestionDto)
  @IsArray()
  @ValidateNested({ each: true })
  @ApiModelProperty({ type: QuestionDto, isArray: true })
  public readonly questions: QuestionDto[];
}

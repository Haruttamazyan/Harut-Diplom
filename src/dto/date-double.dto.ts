import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DateDoubleDto {
  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly first_date: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly second_date: string;
}

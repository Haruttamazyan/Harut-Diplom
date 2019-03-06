import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DateOneDto {
  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly date: string;
}

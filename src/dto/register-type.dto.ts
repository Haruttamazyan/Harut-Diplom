import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RegisterTypeDto {
  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly type: string;
}

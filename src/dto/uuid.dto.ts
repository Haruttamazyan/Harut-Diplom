import { IsUUID } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UuidDto {
  @Expose()
  @IsUUID()
  @ApiModelProperty()
  public readonly id: string;
}

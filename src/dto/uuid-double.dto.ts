import { IsUUID } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UuidDoubleDto {
  @Expose()
  @IsUUID()
  @ApiModelProperty()
  public readonly id1: string;

  @Expose()
  @IsUUID()
  @ApiModelProperty()
  public readonly id2: string;
}

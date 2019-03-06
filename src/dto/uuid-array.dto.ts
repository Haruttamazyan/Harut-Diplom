import { IsUUID, ArrayMinSize } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UuidArrayDto {
  @Expose()
  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1)
  @ApiModelProperty({ isArray: true })
  public readonly ids: string;
}

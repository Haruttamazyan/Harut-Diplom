import { Exclude, Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { ApiModelPropertyOptional } from '@nestjs/swagger';

@Exclude()
export class CreatePlaybackDto {
  @Expose()
  @IsUUID()
  @ApiModelPropertyOptional()
  public readonly campaignId: string;
}

import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsMilitaryTime } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

@Exclude()
export class TimeSlotDayDto {
  @Expose()
  @IsBoolean()
  @ApiModelProperty()
  public readonly isEnabled: boolean;

  @Expose()
  @IsMilitaryTime()
  @ApiModelProperty({ format: 'HH:MM' } as any)
  public readonly startHour: string;

  @Expose()
  @IsMilitaryTime()
  @ApiModelProperty({ format: 'HH:MM' } as any)
  public readonly endHour: string;
}

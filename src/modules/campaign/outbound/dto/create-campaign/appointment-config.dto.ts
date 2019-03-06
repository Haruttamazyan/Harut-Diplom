import { Exclude, Expose, Type } from 'class-transformer';
import { IsBoolean, ValidateNested, IsUUID, IsArray, IsDefined } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { TimeSlotDto } from './time-slot.dto';

@Exclude()
export class AppointmentsConfigDto {
  @Expose()
  @IsBoolean()
  @ApiModelProperty()
  public readonly isEnabled: boolean;

  @Expose()
  @Type(() => TimeSlotDto)
  @IsDefined()
  @ValidateNested()
  @ApiModelProperty()
  public readonly timeSlot: TimeSlotDto;

  @Expose()
  @IsArray()
  @IsUUID(undefined, { each: true })
  @ApiModelProperty({
    type: 'string',
    format: 'uuid',
    isArray: true
  } as any)
  public readonly assignedSalesPersonsIds: string[];
}

import { Exclude, Expose, Type } from 'class-transformer';
import { ValidateNested, IsDefined, IsBoolean, IsString, IsDateString, IsDate} from 'class-validator';
import { TimeSlotDayDto } from './time-slot-day.dto';
import { ApiModelProperty } from '@nestjs/swagger';

@Exclude()
export class TimeSlotDto {
  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly start_date: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly end_date: string;

  @Expose()
  @IsBoolean()
  @ApiModelProperty()
  public readonly mon: boolean;

  @Expose()
  @IsBoolean()
  @ApiModelProperty()
  public readonly tue: boolean;

  @Expose()
  @IsBoolean()
   
  @ApiModelProperty()
  public readonly wed: boolean;

  @Expose()
  @IsBoolean()
   
  @ApiModelProperty()
  public readonly thu: boolean;

  @Expose()
  @IsBoolean()
   
  @ApiModelProperty()
  public readonly fri: boolean;

  @Expose()
  @IsBoolean()
   
  @ApiModelProperty()
  public readonly sat: boolean;

  @Expose()
  @IsBoolean()
   
  @ApiModelProperty()
  public readonly sun: boolean;

  @Expose()
  @IsString() 
  @ApiModelProperty()
  public readonly start_time: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly end_time: string;
}

import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsString,
  IsIn,
  IsNumber,
  IsUUID,
  ValidateNested,
  Length,
  IsArray,
  ArrayMinSize,
  Min,
  MinLength,
  MaxLength,
  IsDefined,
  ArrayUnique,
  IsOptional,
  IsBoolean,
  ValidateIf
} from 'class-validator';
import {
  CampaignStrategy,
  CampaignStrategyArr,
  CampaignStatus,
  CampaignStatusArray,  
  MCIStrategy,
  MCIStrategyArr,
  CampaignType,
  CampaignTypeArr
} from '../../types';
import { TimeSlotDto } from './time-slot.dto';
import { AppointmentsConfigDto } from './appointment-config.dto';
import { name, scriptText } from '../../o-campaign.boundaries';
import { QuestionDto } from './question.dto';
import { OrderTakenFormDto } from './order-taken-form.dto';
import { ConnectedCallsConfigDto } from './connected-calls-config.dto';

@Exclude()
export class UpdateCampaignDto {
  @Expose()
  @IsOptional()
  @IsIn(CampaignTypeArr)
  @ApiModelPropertyOptional({ type: 'string', enum: CampaignTypeArr } as any)
  public readonly type: CampaignType;

  @Expose()
  @IsOptional()
  @IsString()
  @Length(name.minLength, name.maxLength)
  @ApiModelPropertyOptional({ minLength: name.minLength, maxLength: name.maxLength } as any)
  public readonly name: string;

  @Expose()
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  @ApiModelPropertyOptional({
    type: 'string',
    format: 'uuid',
    isArray: true
  } as any)
  public readonly callerIds: string[];

  @Expose()
  @IsOptional()
  @ValidateIf((o: UpdateCampaignDto) => o.type != 'broadcast-dialing')
  @IsIn(CampaignStrategyArr)
  @ApiModelPropertyOptional({ type: 'string', enum: CampaignStrategyArr } as any)
  public readonly strategy: CampaignStrategy;

  @Expose()
  @IsOptional()
  @IsIn(CampaignStatusArray)
  @ApiModelPropertyOptional({ type: 'string', enum: CampaignStatusArray } as any)
  public readonly status: CampaignStatus;

  @Expose()
  @IsOptional()
  @ValidateIf((o: UpdateCampaignDto) => o.type != 'broadcast-dialing')
  @IsNumber()
  @Min(0)
  @ApiModelPropertyOptional({ description: 'In seconds' })
  public readonly breakTimeBetweenCalls: number;

  @Expose()
  @IsOptional()
  @ValidateIf((o: UpdateCampaignDto) => o.type != 'broadcast-dialing')
  @IsIn(MCIStrategyArr)
  @ApiModelPropertyOptional({ type: 'string', enum: MCIStrategyArr } as any)
  public readonly MCIStrategy: MCIStrategy;

  @Expose()
  @IsOptional()
  @ValidateIf((o: UpdateCampaignDto) => o.type != 'broadcast-dialing')
  @IsNumber()
  @Min(0)
  @ApiModelPropertyOptional()
  public readonly callRatio: number;

  // This should be an uuid for a previously uploaded message.
  @Expose()
  @IsOptional()
  @ValidateIf((o: UpdateCampaignDto) => o.type != 'broadcast-dialing')
  @IsUUID()
  @ApiModelPropertyOptional()
  public readonly abandonedMessageId: string;

  @Expose()
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  @ApiModelPropertyOptional({ format: 'uuid', type: 'string', isArray: true } as any)
  public readonly contactsListsIds: string[];

  @Expose()
  @IsOptional()
  @IsBoolean()
  @ApiModelPropertyOptional()
  public readonly AutoExecutionControl: boolean;

  @Expose()
  @IsOptional()
  @ValidateIf((o: UpdateCampaignDto) => !o.AutoExecutionControl)
  @Type(() => TimeSlotDto)
  @IsDefined()
  @ValidateNested()
  @ApiModelPropertyOptional()
  public readonly timeSlot: TimeSlotDto;

  @Expose()
  @IsOptional()
  @ValidateIf((o: UpdateCampaignDto) => o.type != 'broadcast-dialing')
  @Type(() => AppointmentsConfigDto)
  @ValidateNested()
  @ApiModelPropertyOptional()
  public readonly appointmentsConfig: AppointmentsConfigDto;

  @Expose()
  @IsOptional()
  @ValidateIf((o: UpdateCampaignDto) => o.type != 'broadcast-dialing')
  @IsString()
  @MinLength(scriptText.minLength)
  @MaxLength(scriptText.maxLength)
  @ApiModelPropertyOptional({ minLength: scriptText.minLength, maxLength: scriptText.maxLength } as any)
  public readonly script: string;

  @Expose()
  @Type(() => QuestionDto)
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @ApiModelPropertyOptional({ type: QuestionDto, isArray: true })
  public readonly questions: QuestionDto[];

  @Expose()
  @IsOptional()
  @ValidateIf((o: UpdateCampaignDto) => o.type != 'broadcast-dialing')
  @Type(() => OrderTakenFormDto)
  @ValidateNested()
  @ApiModelPropertyOptional()
  public readonly orderTakenForm: OrderTakenFormDto;

  @Expose()
  @IsOptional()
  @Type(() => ConnectedCallsConfigDto)
  @IsDefined()
  @ValidateNested()
  @ApiModelPropertyOptional()
  public readonly connectedCallsConfig: ConnectedCallsConfigDto;

  @Expose()
  @IsOptional()
  @ValidateIf((o: UpdateCampaignDto) => o.type != 'broadcast-dialing')
  @IsArray()
  @ArrayMinSize(1)
  @ApiModelPropertyOptional({
    type: 'string',
    format: 'uuid',
    isArray: true
  } as any)
  public readonly assignAgents: string[];
}

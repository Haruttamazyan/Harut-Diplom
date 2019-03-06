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
  ValidateIf,
  IsBoolean
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
export class CreateCampaignDto {
  @Expose()
  @IsIn(CampaignTypeArr)
  @ApiModelProperty({ type: 'string', enum: CampaignTypeArr } as any)
  public readonly type: CampaignType;

  @Expose()
  @IsString()
  @Length(name.minLength, name.maxLength)
  @ApiModelProperty({ minLength: name.minLength, maxLength: name.maxLength } as any)
  public readonly name: string;

  @Expose()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  @ApiModelProperty({
    type: 'string',
    format: 'uuid',
    isArray: true
  } as any)
  public readonly callerIds: string[];

  @Expose()
  @ValidateIf((o: CreateCampaignDto) => o.type != 'broadcast-dialing')
  @IsIn(CampaignStrategyArr)
  @ApiModelProperty({ type: 'string', enum: CampaignStrategyArr } as any)
  public readonly strategy: CampaignStrategy;

  @Expose()
  @IsIn(CampaignStatusArray)
  @IsOptional()
  @ApiModelPropertyOptional({ type: 'string', enum: CampaignStatusArray } as any)
  public readonly status: CampaignStatus;

  @Expose()
  @ValidateIf((o: CreateCampaignDto) => o.type != 'broadcast-dialing')
  @IsNumber()
  @Min(0)
  @ApiModelProperty({ description: 'In seconds' })
  public readonly breakTimeBetweenCalls: number;

  @Expose()
  @ValidateIf((o: CreateCampaignDto) => o.type != 'broadcast-dialing')
  @IsIn(MCIStrategyArr)
  @ApiModelProperty({ type: 'string', enum: MCIStrategyArr } as any)
  public readonly MCIStrategy: MCIStrategy;

  @Expose()
  @ValidateIf((o: CreateCampaignDto) => o.type != 'broadcast-dialing')
  @IsNumber()
  @Min(0)
  @ApiModelProperty()
  public readonly callRatio: number;

  // This should be an uuid for a previously uploaded message.
  @Expose()
  @ValidateIf((o: CreateCampaignDto) => o.type != 'broadcast-dialing')
  @IsUUID()
  @ApiModelProperty()
  public readonly abandonedMessageId: string;

  @Expose()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  @ApiModelProperty({ format: 'uuid', type: 'string', isArray: true } as any)
  public readonly contactsListsIds: string[];

  @Expose()
  @IsBoolean()
  @ApiModelProperty()
  public readonly AutoExecutionControl: boolean;

  @Expose()
  @ValidateIf((o: CreateCampaignDto) => !o.AutoExecutionControl)
  @Type(() => TimeSlotDto)
  @IsDefined()
  @ValidateNested()
  @ApiModelProperty()
  public readonly timeSlot: TimeSlotDto;

  @Expose()
  @ValidateIf((o: CreateCampaignDto) => o.type != 'broadcast-dialing')
  @Type(() => AppointmentsConfigDto)
  @ValidateNested()
  @ApiModelPropertyOptional()
  public readonly appointmentsConfig: AppointmentsConfigDto;

  @Expose()
  @ValidateIf((o: CreateCampaignDto) => o.type != 'broadcast-dialing')
  @IsString()
  @MinLength(scriptText.minLength)
  @MaxLength(scriptText.maxLength)
  @ApiModelProperty({ minLength: scriptText.minLength, maxLength: scriptText.maxLength } as any)
  public readonly script: string;

  @Expose()
  @Type(() => QuestionDto)
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @ApiModelPropertyOptional({ type: QuestionDto, isArray: true })
  public readonly questions: QuestionDto[];

  @Expose()
  @ValidateIf((o: CreateCampaignDto) => o.type != 'broadcast-dialing')
  @Type(() => OrderTakenFormDto)
  @ValidateNested()
  @ApiModelPropertyOptional()
  public readonly orderTakenForm: OrderTakenFormDto;

  @Expose()
  @Type(() => ConnectedCallsConfigDto)
  @IsDefined()
  @ValidateNested()
  @ApiModelProperty()
  public readonly connectedCallsConfig: ConnectedCallsConfigDto;
  
  @Expose()
  @ValidateIf((o: CreateCampaignDto) => o.type != 'broadcast-dialing')
  @IsArray()
  @ArrayMinSize(1)
  @ApiModelProperty({
    type: 'string',
    format: 'uuid',
    isArray: true
  } as any)
  public readonly assignAgents: string[];
}

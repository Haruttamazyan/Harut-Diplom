import { Exclude, Expose, Type } from 'class-transformer';
import { ValidateIf, IsIn, IsArray, IsUUID, ArrayMinSize, ValidateNested, IsInstance, IsString, IsOptional } from 'class-validator';
import { ConnectedCallAction, ConnectedCallActionArr } from '../../types';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { DtmfDto } from './dtmf.dto';

@Exclude()
export class ConnectedCallsConfigDto {
  @Expose()
  @IsIn(ConnectedCallActionArr)
  @ApiModelProperty({ type: 'string', enum: ConnectedCallActionArr } as any)
  public readonly action: ConnectedCallAction;

  @Expose()
  @ValidateIf((o: ConnectedCallsConfigDto) => o.action === 'direct-to-agent')
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  @ApiModelProperty({
    type: 'string',
    isArray: true,
    format: 'uuid',
    description: 'Only if type is "direct-to-agent" or "ivr"'
  } as any)
  public readonly agentsIds: string[];

  @Expose()
  @IsOptional()
  @ValidateIf((o: ConnectedCallsConfigDto) => { return o.action === 'ivr' || o.action ==='playback'})
  @IsUUID()
  @ApiModelPropertyOptional({
    format: 'uuid',
    description: 'Only if type is "playback" or "ivr"'
  } as any)
  public readonly playbackAudioId: string;
/*
  @Expose()
  @IsOptional()
  @ValidateIf((o: ConnectedCallsConfigDto) => o.action === 'ivr')
  @IsUUID()
  @ApiModelPropertyOptional({
    format: 'uuid',
    description: 'Only if type is "ivr"'
  } as any)
  public readonly introAudioId: string;*/

  @Expose()
  @Type(() => DtmfDto)
  @ValidateIf((o: ConnectedCallsConfigDto) => o.action === 'ivr')
  @IsArray()
  @ArrayMinSize(1)
  @IsInstance(DtmfDto, { each: true })
  @ValidateNested({ each: true })
  @ApiModelProperty({
    type: DtmfDto,
    isArray: true,
    description: 'Only if type is "ivr"'
  })
  public readonly dtmf: DtmfDto[];

  @Expose()
  @IsOptional()
  @ValidateIf((o: ConnectedCallsConfigDto) =>{ return o.action === 'ivr' || o.action ==='playback'})
  @IsString()
  @ApiModelPropertyOptional({
    type: 'string',
    description: 'Only if type is "playback" or "ivr"'
  } as any)
  public readonly message: string;
}

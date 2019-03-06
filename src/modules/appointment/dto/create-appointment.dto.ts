import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsUUID, IsArray, IsString, IsOptional } from 'class-validator';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';

@Exclude()
export class CreateAppointmentsDto {
  @Expose()
  @IsUUID()
  @ApiModelPropertyOptional()
  public readonly campaignId: string;

  @Expose()
  @IsBoolean()
  @ApiModelProperty()
  public readonly isEnabled: boolean;

  @Expose()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly scheduled_on: string;

  @Expose()
  @IsUUID()
  @ApiModelPropertyOptional()
  public readonly call_uuid: string;

  @Expose()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly description: string;

  @Expose()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly title: string;

  @Expose()
  @IsUUID()
  @ApiModelPropertyOptional()
  public readonly contact_id: string;

  @Expose()
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  @ApiModelPropertyOptional({
    type: 'string',
    format: 'uuid',
    isArray: true
  } as any)
  public readonly assignedSalesPersonsIds: string[];

  @Expose()
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  @ApiModelPropertyOptional({
    type: 'string',
    format: 'uuid',
    isArray: true
  } as any)
  public readonly assignedAgentsIds: string[];
}

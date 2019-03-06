import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { IUserPermissions } from '../interfaces';

@Exclude()
export class UserPermissionsDto implements Partial<IUserPermissions> {
  @Expose()
  @IsOptional()
  @IsBoolean()
  @ApiModelPropertyOptional()
  public readonly createAgents?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  @ApiModelPropertyOptional()
  public readonly editAgents?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  @ApiModelPropertyOptional()
  public readonly createContactsLists?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  @ApiModelPropertyOptional()
  public readonly editContactsLists?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  @ApiModelPropertyOptional()
  public readonly createOutboundCampaigns?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  @ApiModelPropertyOptional()
  public readonly editOutboundCampaigns?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  @ApiModelPropertyOptional()
  public readonly deleteOutboundCampaigns?: boolean;
}

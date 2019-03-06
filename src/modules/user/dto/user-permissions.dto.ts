import { Exclude, Expose } from 'class-transformer';
import { IsBoolean } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { IUserPermissions } from '../interfaces';

@Exclude()
export class UserPermissionsDto implements IUserPermissions {
  @Expose()
  @IsBoolean()
  @ApiModelProperty()
  public readonly createAgents: boolean;

  @Expose()
  @IsBoolean()
  @ApiModelProperty()
  public readonly editAgents: boolean;

  @Expose()
  @IsBoolean()
  @ApiModelProperty()
  public readonly createContactsLists: boolean;

  @Expose()
  @IsBoolean()
  @ApiModelProperty()
  public readonly editContactsLists: boolean;

  @Expose()
  @IsBoolean()
  @ApiModelProperty()
  public readonly createOutboundCampaigns: boolean;

  @Expose()
  @IsBoolean()
  @ApiModelProperty()
  public readonly editOutboundCampaigns: boolean;

  @Expose()
  @IsBoolean()
  @ApiModelProperty()
  public readonly deleteOutboundCampaigns: boolean;
}

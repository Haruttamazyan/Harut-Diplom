import { Exclude, Expose } from 'class-transformer';
import { IsUUID, IsOptional } from 'class-validator';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';

@Exclude()
export class AuthenticateDto {
  @Expose()
  @IsOptional()
  @ApiModelPropertyOptional()
  public readonly sip_auth_username: string;

  @Expose()
  @IsOptional()
  @ApiModelPropertyOptional()
  public readonly user: string;
}

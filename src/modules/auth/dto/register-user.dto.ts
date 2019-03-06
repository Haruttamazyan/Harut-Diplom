import { IsString, IsEmail, IsBoolean, MinLength, MaxLength, IsUUID,IsOptional } from 'class-validator';
import { ApiModelProperty,ApiModelPropertyOptional } from '@nestjs/swagger';
import { userFirstName, userLastName, userPassword } from '../../user/user.boundaries';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RegisterUserDto {
  @Expose()
  @IsString()
  @MinLength(userFirstName.minLength)
  @MaxLength(userFirstName.maxLength)
  @ApiModelProperty(userFirstName as any)
  public readonly first_name: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(userLastName.minLength)
  @MaxLength(userLastName.maxLength)
  @ApiModelPropertyOptional(userLastName as any)
  public readonly last_name: string;

  @Expose()
  @IsEmail()
  @ApiModelProperty()
  public readonly email: string;

  @Expose()
  @IsString()
  @MinLength(userPassword.minLength)
  @MaxLength(userPassword.maxLength)
  @ApiModelProperty(userPassword as any)
  public readonly password: string; 
  
  @Expose()
  @IsOptional()
  @IsUUID()
  @ApiModelPropertyOptional()
  public readonly reseller_uuid: string;
  
}
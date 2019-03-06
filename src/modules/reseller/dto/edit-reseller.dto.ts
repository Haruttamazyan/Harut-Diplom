import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  ValidateIf,
  IsBoolean
} from 'class-validator';
import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { userFirstName, userLastName, userPassword } from '../../user/user.boundaries';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class EditResellerDto {
  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(userFirstName.minLength)
  @MaxLength(userFirstName.maxLength)
  @ApiModelPropertyOptional(userFirstName as any)
  public readonly first_name: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(userLastName.minLength)
  @MaxLength(userLastName.maxLength)
  @ApiModelPropertyOptional(userLastName as any)
  public readonly last_name: string;

  @Expose()
  @IsOptional()
  @IsEmail()
  @ApiModelPropertyOptional()
  public readonly email: string;

  @Expose()
  @ValidateIf(obj => !!obj.newPassword)
  @IsString()
  @MinLength(userPassword.minLength)
  @MaxLength(userPassword.maxLength)
  @ApiModelPropertyOptional(userPassword as any)
  public readonly oldPassword: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(userPassword.minLength)
  @MaxLength(userPassword.maxLength)
  @ApiModelPropertyOptional(userPassword as any)
  public readonly newPassword: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly phone: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  @ApiModelPropertyOptional()
  public readonly isEnabled: boolean;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly address: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly city: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly state: string;
}

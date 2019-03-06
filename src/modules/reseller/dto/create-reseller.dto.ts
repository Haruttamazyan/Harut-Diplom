import { Exclude, Expose } from 'class-transformer';
import { IsString, IsEmail, MinLength, MaxLength, IsOptional} from 'class-validator';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { userFirstName, userLastName, userPassword } from '../../user/user.boundaries';


@Exclude()
export class CreateResellerDto {
  @Expose()
  @IsString()
  @MinLength(userFirstName.minLength)
  @MaxLength(userFirstName.maxLength)
  @ApiModelProperty(userFirstName as any)
  public readonly first_name: string;

  @Expose()
  @IsString()
  @MinLength(userLastName.minLength)
  @MaxLength(userLastName.maxLength)
  @ApiModelProperty(userLastName as any)
  public readonly last_name: string;

  @Expose()
  @IsEmail()
  @ApiModelProperty()
  public readonly email: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly phone: string;

  @Expose()
  @IsString()
  @MinLength(userPassword.minLength)
  @MaxLength(userPassword.maxLength)
  @ApiModelProperty(userPassword as any)
  public readonly password: string;

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

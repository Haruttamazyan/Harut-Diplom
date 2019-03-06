import { Exclude, Expose } from 'class-transformer';
import { IsString, IsBoolean, MinLength, MaxLength, IsEmail } from 'class-validator';
import { userPassword } from '../user.boundaries';
import { ApiModelProperty } from '@nestjs/swagger';
import { userFirstName, userLastName } from '../user.boundaries';

@Exclude()
export class CreateCompanySalesPersonDto {
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
}

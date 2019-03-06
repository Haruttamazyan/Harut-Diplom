import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { userPassword } from '../../user/user.boundaries';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ResetPassword {
  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly change_password_token: string;

  @Expose()
  @IsString()
  @MinLength(userPassword.minLength)
  @MaxLength(userPassword.maxLength)
  @ApiModelProperty(userPassword as any)
  public readonly password: string;
}

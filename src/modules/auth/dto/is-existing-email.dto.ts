import { Exclude, Expose } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

@Exclude()
export class IsExistingEmailDto {
  @Expose()
  @IsEmail()
  @ApiModelProperty({ format: 'email' } as any)
  public readonly email: string;
}

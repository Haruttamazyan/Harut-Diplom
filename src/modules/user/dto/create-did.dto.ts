import { Exclude, Expose } from 'class-transformer';
import { IsString, IsNumber } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

@Exclude()
export class CreateUserDidDto {
  @Expose()
  @IsNumber()
  @ApiModelProperty()
  public readonly did: number;

  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly name: string;
}

import { Exclude, Expose } from 'class-transformer';
import { IsString, IsEmail} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

@Exclude()
export class AddDidDto {
  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly did_uuid: string;

}

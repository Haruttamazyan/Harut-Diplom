import { Exclude, Expose } from 'class-transformer';
import { IsString, IsEmail} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

@Exclude()
export class CreateGroupDto {
  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly did_group_name: string;

}

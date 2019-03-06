import { Exclude, Expose, Type } from 'class-transformer';
import { IsBoolean, IsString, IsNumber} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

@Exclude()
export class Price2Dto {
  @Expose()
  @IsNumber() 
  @ApiModelProperty()
  public readonly price: number;

  @Expose()
  @IsBoolean()
  @ApiModelProperty()
  public readonly is_active: boolean;
}

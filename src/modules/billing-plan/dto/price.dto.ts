import { Exclude, Expose, Type } from 'class-transformer';
import { IsBoolean, IsString, IsNumber} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

@Exclude()
export class PriceDto {
  @Expose()
  @IsNumber() 
  @ApiModelProperty()
  public readonly price: number;

  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly per_period: string;

  @Expose()
  @IsBoolean()
  @ApiModelProperty()
  public readonly is_active: boolean;
}

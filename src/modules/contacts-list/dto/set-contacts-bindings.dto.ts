import { Exclude, Expose, Type } from 'class-transformer';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';

interface IUdf {
  [x: string]: number;
}

@Exclude()
export class SetContactsBindingsDto {
  @Expose()
  @IsNumber()
  @Min(0)
  @ApiModelProperty({ minimum: 0 } as any)
  public firstName: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiModelPropertyOptional({ minimum: 0 } as any)
  public lastName?: number;

  @Expose()
  @IsNumber()
  @Min(0)
  @ApiModelProperty({ minimum: 0 } as any)
  public phoneNumber: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiModelPropertyOptional({ minimum: 0 } as any)
  public address?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiModelPropertyOptional({ minimum: 0 } as any)
  public city?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiModelPropertyOptional({ minimum: 0 } as any)
  public state?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiModelPropertyOptional({ minimum: 0 } as any)
  public country?: number;

  @Expose()
  @Type(() => Object)
  @ApiModelPropertyOptional({ description: 'An object containing user-defined fields with integers as values.' })
  public udf?: IUdf;
}

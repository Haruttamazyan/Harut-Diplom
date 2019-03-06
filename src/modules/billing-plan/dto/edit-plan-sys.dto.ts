import { IsDefined, ValidateNested, IsArray, ArrayMinSize, ArrayUnique, IsString,IsOptional } from 'class-validator';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose,Type } from 'class-transformer';
import { PriceDto } from './price.dto'

@Exclude()
export class editPlanSysDto {

    @Expose()
    @IsOptional()
    @IsString()
    @ApiModelPropertyOptional() 
    public readonly plan_name: string;

    @Expose()
    @IsOptional()
    @Type(() => PriceDto)
    @IsDefined()
    @ValidateNested()
    @ApiModelPropertyOptional()
    public readonly monthly: PriceDto;

    @Expose()
    @IsOptional()
    @Type(() => PriceDto)
    @IsDefined()
    @ValidateNested()
    @ApiModelPropertyOptional()
    public readonly yearly: PriceDto;

    @Expose()
    @IsOptional()
    @Type(() => PriceDto)
    @IsArray()
    @ValidateNested({ each: true })
    @ApiModelPropertyOptional({ type: PriceDto, isArray: true })
    public readonly custom_price: PriceDto[];

}

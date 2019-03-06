import { IsDefined, ValidateNested, IsArray, ArrayMinSize, ArrayUnique, IsString } from 'class-validator';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose,Type } from 'class-transformer';
import { PriceDto } from './price.dto'

@Exclude()
export class addPlanSysDto {

    @Expose()
    @IsString()
    @ApiModelProperty() 
    public readonly plan_name: string;

    @Expose()
    @Type(() => PriceDto)
    @IsDefined()
    @ValidateNested()
    @ApiModelProperty()
    public readonly monthly: PriceDto;

    @Expose()
    @Type(() => PriceDto)
    @IsDefined()
    @ValidateNested()
    @ApiModelProperty()
    public readonly yearly: PriceDto;

    @Expose()
    @Type(() => PriceDto)
    @IsArray()
    @ValidateNested({ each: true })
    @ApiModelProperty({ type: PriceDto, isArray: true })
    public readonly custom_price: PriceDto[];

}

import { IsString, IsEmail, MinLength, MaxLength, IsOptional, IsUUID, IsInt, IsMilitaryTime } from 'class-validator';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import * as company from '../company.boundaries';
import { Exclude, Expose } from 'class-transformer';


@Exclude()
export class AddpaymentDto {
    @Expose()
    @IsInt()
    @ApiModelProperty()
    public readonly amount: number;

  
    @Expose()
    @IsString()
    @ApiModelProperty()
    public readonly payment_type: string;

    @Expose()
    @IsString()
    @ApiModelProperty()
    public readonly note: string; 
}

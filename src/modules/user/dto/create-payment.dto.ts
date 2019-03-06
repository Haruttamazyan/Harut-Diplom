import { Exclude, Expose } from 'class-transformer';
import { IsString, MaxLength, MinLength, IsNumber, Min, Max } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { creditCardNumber, cvvNumber } from '../user.boundaries';

@Exclude()
export class CreatePaymentDto {
  private static currentYear:number = (new Date()).getFullYear();
/*
  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly first_name: string;

  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly last_name: string; */
  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly card_name: string
  
  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly amount: string;

  @Expose()
  @IsString()
  @MaxLength(creditCardNumber.maxLength)
  @ApiModelProperty()
  public readonly credit_card_no: string;

  @Expose()
  @IsString()
  @MinLength(cvvNumber.minLength)
  @MaxLength(cvvNumber.maxLength)
  @ApiModelProperty()
  public cvv: string;
  /*
  @Expose()
  @IsNumber()
  @ApiModelProperty()
  @Max(12)
  public readonly expiry_month: number;

  @Expose()
  @IsNumber()
  @ApiModelProperty()
  @Min(CreatePaymentDto.currentYear)
  public readonly expiry_year: number;*/
  @Expose()
  @IsString()
  @ApiModelProperty()
  public readonly expire_date: string;

}

import { Exclude, Expose } from 'class-transformer';
import { IsString, MaxLength, MinLength, IsNumber, Min, Max,IsOptional} from 'class-validator';
import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { creditCardNumber, cvvNumber } from '../user.boundaries';

@Exclude()
export class EditPaymentDto {
  private static currentYear:number = (new Date()).getFullYear();
  private static currentMonth:number = (new Date()).getMonth() + 1;  

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly first_name?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly last_name?: string;
  
  @Expose()
  @IsOptional()
  @IsString()
  @ApiModelPropertyOptional()
  public readonly amount?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(creditCardNumber.maxLength)
  @ApiModelPropertyOptional()
  public readonly credit_card_no?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(cvvNumber.minLength)
  @MaxLength(cvvNumber.maxLength)
  @ApiModelPropertyOptional()
  public cvv?: string;
  
  @Expose()
  @IsOptional()
  @IsNumber()
  @ApiModelPropertyOptional()
  @Min(EditPaymentDto.currentMonth)
  @Max(12)
  public readonly expiry_month?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  @ApiModelPropertyOptional()
  @Min(EditPaymentDto.currentYear)
  public readonly expiry_year?: number;
}

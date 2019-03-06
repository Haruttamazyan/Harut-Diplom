import { Exclude, Expose } from 'class-transformer';
import { IsIn,ValidateIf,IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { DtmfKey, DtmfKeyArr, DtmfAction, DtmfActionArr } from '../../types';

@Exclude()
export class DtmfDto {
  @Expose()
  @IsIn(DtmfKeyArr)
  @ApiModelProperty({ type: 'string', enum: DtmfKeyArr } as any)
  public readonly key: DtmfKey;

  @Expose()
  @IsIn(DtmfActionArr)
  @ApiModelProperty({ type: 'string', enum: DtmfActionArr } as any)
  public readonly action: DtmfAction;

  @Expose()
  @ValidateIf((o: DtmfDto) => o.action === 'dial-a-number' )
  @IsString()
  @ApiModelProperty({
    type: 'string',
    description: 'Only if type is "dial-a-number'
  } as any)
  public readonly number: string;
}

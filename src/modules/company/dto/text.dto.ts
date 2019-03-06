import { IsString,IsIn } from 'class-validator';
import { ApiModelProperty,  } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { textStatus, TextStatusArr } from '../types'


@Exclude()
export class TextDto {

    @Expose()
    @IsString()
    @ApiModelProperty()
    public readonly text: string;

    @Expose()
    @IsIn(TextStatusArr)
    @ApiModelProperty({ type: 'string', enum: TextStatusArr } as any)
    public readonly status: textStatus;

}

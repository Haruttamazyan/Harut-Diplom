import { IsString, IsOptional } from 'class-validator';
import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { agentNameMessage } from '../messages';

@Exclude()
export class NameParameterDto {
  @Expose()
  @IsString()
  @IsOptional()
  @ApiModelPropertyOptional({
    default: '',
    description: agentNameMessage
  })
  public readonly name: string;
}

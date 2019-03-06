import { Exclude, Expose } from 'class-transformer';
//import { IsUUID,IsArray,ArrayMinSize } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

@Exclude()
export class AgentRegisterTypeDto {
    @Expose()
    @ApiModelProperty({
      type: 'string',
      format: 'uuid'
    } as any)
    public readonly agentId: string;
}
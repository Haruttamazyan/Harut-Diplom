import { Exclude, Expose,Type } from 'class-transformer';
import { ValidateIf, IsInt,  IsUUID,   IsIn, IsString,  Min } from 'class-validator';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { AgentSearch, AgentSearchArray } from '../types'

@Exclude()
export class AgentStatisticsDto {

    @Expose()
    @IsIn(AgentSearchArray)
    //@IsString()
    @ApiModelProperty({ type: 'string', enum: AgentSearchArray } as any)
    public readonly search_type: AgentSearch;

/*
    @Expose()
    @ValidateIf((o: AgentStatisticsDto) => { return o.search_type === 'hourly' || o.search_type ==='daily'})
    @IsString()
    @ApiModelProperty({
      type: 'string',
      description: 'Only if type is "hourly" or "daily"'
    } as any)
    public readonly first_date: string

    @Expose()
    @ValidateIf((o: AgentStatisticsDto) => { return o.search_type === 'hourly' || o.search_type ==='daily'})
    @IsString()
    @ApiModelProperty({
      type: 'string',
      description: 'Only if type is "hourly" or "daily"'
    } as any)
    public readonly second_date: string
*/

    @Expose()
    @IsIn([3,8,24])
    @ValidateIf((o: AgentStatisticsDto) => o.search_type === 'hourly')
    @Type(() => Number)
    //@IsInt()
    //@IsString()
    //@Min(0)
    @ApiModelPropertyOptional({
      //IsInt:true,
      description: 'Only if type is "hourly" ',
      enum:[3,8,24]
    } as any)
    public readonly hour: 3|8|24

    @Expose()
    @IsIn([3,7,14,30])
    @ValidateIf((o: AgentStatisticsDto) => o.search_type === 'daily')
    @Type(() => Number)
    @ApiModelPropertyOptional({
      description: 'Only if type is "daily"',
      enum:[3,7,14,30]
    } as any)
    public readonly day: 3|7|14|30


    

  
}

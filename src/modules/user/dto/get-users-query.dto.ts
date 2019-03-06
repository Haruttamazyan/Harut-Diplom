import { IsIn, IsOptional } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { PaginationQueryDto } from '../../../dto';
import { AssignableUserRoleArr, AssignableUserRole } from '../types';
import { ApiModelPropertyOptional } from '@nestjs/swagger';

@Exclude()
export class GetUsersQueryDto extends PaginationQueryDto {
  @Expose()
  @IsOptional()
  @IsIn(AssignableUserRoleArr)
  @ApiModelPropertyOptional({
    type: 'string',
    enum: AssignableUserRoleArr,
    description: `One of [${AssignableUserRoleArr.join(', ')}].`
  })
  public readonly role?: AssignableUserRole;
}

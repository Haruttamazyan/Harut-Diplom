import { ApiModelProperty,ApiModelPropertyOptional } from '@nestjs/swagger';
import { Field } from 'multer';

export class EditCompanyProfile {
  @ApiModelPropertyOptional({
    name: 'avatar',
    in: 'formData',
    description: 'jpg or png file',
    required: true,
    type: 'file'
  } as any)
  public readonly avatar?: Field;

  
  
  @ApiModelPropertyOptional()
  public readonly company_name?: string;

 
  @ApiModelPropertyOptional()  
  public readonly first_name?: string;

  @ApiModelPropertyOptional()  
  public readonly last_name?: string;

  @ApiModelPropertyOptional()
  public readonly address1?: string;

 
  @ApiModelPropertyOptional()
  public readonly address2?: string;

  @ApiModelPropertyOptional()
  public readonly country?: string;

  @ApiModelPropertyOptional()
  public readonly state?: string;

  @ApiModelPropertyOptional()
  public readonly city?: string;


  @ApiModelPropertyOptional()
  public readonly phone?: string;

  
  @ApiModelPropertyOptional()  
  public readonly zipcode?: string;

  
  @ApiModelPropertyOptional()
  public readonly email?: string;


  
  @ApiModelPropertyOptional({
    type: 'string',
    format: 'uuid'
  } as any)
  public readonly billing_planid: string;
}
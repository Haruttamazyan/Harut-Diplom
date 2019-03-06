import { PipeTransform, Pipe, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Pipe()
export class ValidationPipe implements PipeTransform<any> {
  public async transform (value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    if (!metatype || this.isJsType(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);

    const errors = await validate(object, {
      validationError: {
        target: false,
        value: false
      }
    });
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    this.deleteUndefined(object);

    return object;
  }

  private isJsType (metatype: any): boolean {
    return (
      [String, Boolean, Number, Array, Object]
      .includes(metatype)
    );
  }

  /**
   * Delete properties with `undefined` value that will be created
   * by class-transformer when @Expose is used. See
   * https://github.com/typestack/routing-controllers/issues/200#issuecomment-349040586
   *
   * Note: this will only work on a single level.
   */
  private deleteUndefined (payload: object): void {
    Object.keys(payload).forEach((key) => {
      const value = (payload as any)[key];

      if (value === undefined) {
        delete (payload as any)[key];
        return;
      }

      if (value && value.constructor === 'function') {
        this.deleteUndefined(value);
      }
    });
  }
}

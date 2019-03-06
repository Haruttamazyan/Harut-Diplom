import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import * as moment from 'moment';

export const IsSimpleDate = (validationOptions?: ValidationOptions) => {
  return (obj: object, propertyName: string) => {
    registerDecorator({
      name: 'IsSimpleDate',
      target: obj.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate (value: any, args: ValidationArguments) {
          return moment(value, 'YYYY-MM-DD', true).isValid();
        },
        defaultMessage: () => 'Value must be a valid date in format YYYY-MM-DD'
      }
    });
  };
};

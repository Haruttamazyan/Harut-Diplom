import { IStringBoundaries } from '../../interfaces';

export const userFirstName: IStringBoundaries = { minLength: 2, maxLength: 64 };
export const userLastName: IStringBoundaries = { minLength: 2, maxLength: 64 };
export const userPassword: IStringBoundaries = { minLength: 8, maxLength: 128 };
export const userAvatar: IStringBoundaries = { minLength: 0, maxLength: 256 };

export const creditCardNumber: IStringBoundaries = { minLength: 0, maxLength: 16 };
export const cvvNumber: IStringBoundaries = { minLength: 3, maxLength: 4 };



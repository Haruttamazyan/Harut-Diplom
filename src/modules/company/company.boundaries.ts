import { IStringBoundaries } from '../../interfaces';

export const name: IStringBoundaries = { minLength: 1, maxLength: 256 };
export const address1: IStringBoundaries = { minLength: 1, maxLength: 256 };
export const address2: IStringBoundaries = { minLength: 0, maxLength: 256 };
export const country: IStringBoundaries = { minLength: 1, maxLength: 256 };
export const state: IStringBoundaries = { minLength: 1, maxLength: 256 };
export const city: IStringBoundaries = { minLength: 1, maxLength: 256 };

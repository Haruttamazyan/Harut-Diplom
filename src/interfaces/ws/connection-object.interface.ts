import { IPromisifiedRedisClient } from '..';

export interface IConnectionObject {
  [x: string]: { // List of companies
    redisClient: IPromisifiedRedisClient;
    // List of socket connections per user. This needs to be an array to
    // support multiple browser windows.
    userSockets: {
      [x: string]: any[];
    }
  };
}

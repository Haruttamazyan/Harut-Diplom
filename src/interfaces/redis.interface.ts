import { RedisClient } from 'redis';

export interface IPromisifiedRedisClient extends RedisClient {
  [x: string]: any;
}

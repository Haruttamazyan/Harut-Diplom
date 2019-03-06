import * as dotenv from 'dotenv';

dotenv.config();

const getEnvKey = (key: string): string => {
  if (process.env[key] === undefined) {
    throw new Error(`Property "${key}" is missing in environment.`);
  }

  return process.env[key] as string;
};

const toBoolean = (v: any): boolean => {
  if (typeof v === 'boolean') {
    return v;
  } else {
    switch (v) {
      case 'true':
        return true;
      case 'false':
        return false;
      default:
        throw new Error(`Invalid boolean ${v}`);
    }
  }
};

export const NODE_ENV = getEnvKey('NODE_ENV');
export const IS_VERBOSE = toBoolean(getEnvKey('IS_VERBOSE'));

// App
export const APP_PORT = Number(getEnvKey('APP_PORT'));
export const APP_WS_PORT = Number(getEnvKey('WS_PORT'));
export const CONTACTS_STORAGE_PATH = getEnvKey('CONTACTS_STORAGE_PATH');
export const CDR_STORAGE_PATH = getEnvKey('CDR_STORAGE_PATH');
export const AVATAR_STORAGE_PATH = getEnvKey('AVATAR_STORAGE_PATH');
export const RECORDINGS_STORAGE_PATH = getEnvKey('RECORDINGS_STORAGE_PATH');
export const CAMPAIGNS_JSON_PATH = getEnvKey('CAMPAIGNS_JSON_PATH');
export const MEDIAS_STORAGE_PATH = getEnvKey('MEDIA_STORAGE_PATH')

// Password encryption
export const HMAC_ALGORITHM = getEnvKey('HMAC_ALGORITHM');
export const HMAC_SECRET = getEnvKey('HMAC_SECRET');

// Authentication token
export const JWT_ID = getEnvKey('JWT_ID');
export const JWT_KEY = getEnvKey('JWT_KEY');
export const JWT_ALGORITHM = getEnvKey('JWT_ALGORITHM');
export const JWT_EXPIRATION = getEnvKey('JWT_EXPIRATION');

// Postgres
export const DB_HOST = getEnvKey('DB_HOST');
export const DB_PORT = Number(getEnvKey('DB_PORT'));
export const DB_USERNAME = getEnvKey('DB_USERNAME');
export const DB_PASSWORD = getEnvKey('DB_PASSWORD');
export const DB_NAME = getEnvKey('DB_NAME');

// Rabbitmq
//export const RABBITMQ_URL = getEnvKey('RABBITMQ_URL');

// Freeswitch
export const FS_HOST = getEnvKey('FS_HOST');
export const FS_PORT = getEnvKey('FS_PORT');

// DNL
export const DNL_HOST = getEnvKey('DNL_HOST');
export const DNL_BASE_URL = getEnvKey('DNL_BASE_URL');
export const DNL_USER = getEnvKey('DNL_USER');
export const DNL_PASSWORD = getEnvKey('DNL_PASSWORD');
export const DNL_RATE_TABLE_ID = getEnvKey('DNL_RATE_TABLE_ID');
export const DNL_ROUTING_PLAN_ID = getEnvKey('DNL_ROUTING_PLAN_ID');

// WS
export const AGENT_WS_PORT = getEnvKey('AGENT_WS_PORT')
export const CDR_WS_PORT =  getEnvKey('CDR_WS_PORT')
export const EVENT_WS_PORT =  getEnvKey('EVENT_WS_PORT')
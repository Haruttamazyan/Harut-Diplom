import { createConnection } from 'typeorm';
import { dbConnectionToken } from '../../constants/tokens';
import { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } from '../../config';

export const databaseProviders = [
  {
    provide: dbConnectionToken,
    useFactory: async () => {
      try {
        return await createConnection({
          type: 'postgres',
          host: DB_HOST,
          port: DB_PORT,
          username: DB_USERNAME,
          password: DB_PASSWORD,
          database: DB_NAME,
          entities: [
            __dirname + '/../**/*.entity{.ts,.js}',
          ],
          synchronize: true, //process.env.NODE_ENV === 'development',
          logging: [
            'query',
            'error',
            'warn'
          ]
        });
      } catch (e) {
        process.stdout.write('Error in database provider: ' + e);
      }
    }
  }
];

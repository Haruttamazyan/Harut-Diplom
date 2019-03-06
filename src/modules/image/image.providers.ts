import { dbConnectionToken, imageRepositoryToken } from '../../constants';
import { Connection } from 'typeorm';
import { ImageEntity } from './image.entity'


export const imageProviders = [
  {
    provide: imageRepositoryToken,
    inject: [dbConnectionToken],
    useFactory: (connection: Connection) => {
      return connection.getRepository(ImageEntity);
    }
  }
];

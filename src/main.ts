import * as helmet from 'helmet';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ApplicationModule } from './app.module';
import { APP_PORT } from './config';
import { ValidationPipe } from './pipes';
import { ForbiddenExceptionFilter, UnauthorizedExceptionFilter } from './filters';
import { RolesGuard } from './guards';
import * as redis from 'redis';
import * as bluebird from 'bluebird';
import * as cors from 'cors';
var Raven = require('raven');
var socketall = require('./ws')
import * as path from "path"
import * as express from 'express';
import { CAMPAIGNS_JSON_PATH} from './config';


bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

(async function bootstrap () {
  const app = await NestFactory.create(ApplicationModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(
    new ForbiddenExceptionFilter(),
    new UnauthorizedExceptionFilter()
  );
  app.useGlobalGuards(new RolesGuard(app.get(Reflector)));

  app.use(morgan('dev'));
  app.use(helmet());
  app.use(compression());
  app.use(bodyParser.json());
  app.use(cors());
  app.use(express.static(path.join(__dirname, '../../data')));
  if (process.env.DEVELOPMENT !== 'development') {
    Raven.config('http://a85681dcf17746dca536e597cb52cae2@sentry.denovolab.com:9000/7').install();
}
 

  const swaggerOptions = new DocumentBuilder()
    .setTitle('Extreme Dialer v2')
    .setDescription('Extreme Dialer v2 API documentation')
    .setVersion('1.0.0')
    .setContactEmail('hector.webdeveloper@gmail.com')
    .setSchemes('http')
    .addBearerAuth('Authorization', 'header')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);

  SwaggerModule.setup('/api', app, document);

  await app.listen(APP_PORT);

 /*
 await socketall.agent(app)
 await socketall.cdr(app)
 await socketall.event(app) 
  */

 
  process.stdout.write(`Listening on port ${APP_PORT}\n`);
})();

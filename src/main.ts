import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IS_DEV_MODE } from '@/config';
import * as cfonts from 'cfonts';
import { UnauthorizedExceptionFilter } from './middleware/UnauthorizedFilter';

const DOCS_PATH = 'api-docs';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: true,
      methods: ['GET', 'POST', 'HEAD'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      preflightContinue: false,
      credentials: true,
    },
    logger: IS_DEV_MODE ? ['error', 'log', 'debug'] : ['error', 'log'],
  });
  app.useGlobalFilters(new UnauthorizedExceptionFilter());
  app.use(cookieParser());
  IS_DEV_MODE && createApiDocument(app);
  await app.listen(process.env.PORT || 5000, () => {
    cfonts.say('cgoing-love|server', {
      font: 'block',
      align: 'center',
      colors: ['red', '#f80', 'green', 'blue'],
      gradient: true,
      transitionGradient: true,
    });

    console.log(`
        web domain => ${process.env.WEB_DOMAIN || 'localhost'}
        port => ${process.env.PORT || 5000}
        env mode => ${process.env.NODE_ENV}
        database init  => ${!!process.env.INIT}
    `);
    IS_DEV_MODE &&
      console.log(`
        open-swagger  => http:localhost:${
          process.env.PORT || 5000
        }/${DOCS_PATH}`);
  });
}

const createApiDocument = (app: INestApplication) => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('cgoing-test API')
    .setDescription('server for test')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(DOCS_PATH, app, document);
};

bootstrap();

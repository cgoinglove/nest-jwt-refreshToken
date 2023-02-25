import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfig from './orm.config';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AuthModule } from './domain/auth/auth.module';
import { CommonModule } from './domain/common/common.module';
import { CatModule } from './domain/cat/cat.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: ormConfig }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),
    AuthModule,
    CommonModule,
    CatModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

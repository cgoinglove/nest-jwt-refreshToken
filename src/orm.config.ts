import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const ormConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'mysql',
    port: Number(process.env.DB_PORT) || 3306,
    host: process.env.DB_HOST || 'localhost',
    autoLoadEntities: true,
    entities: [__dirname + '/domain/*/entities/*.entity{.ts,.js}'],
    username: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '1234',
    database: process.env.MYSQL_DATABASE || 'cgoing_love',
    synchronize: process.env.INIT == 'true' || false,
  };
};

export default ormConfig;

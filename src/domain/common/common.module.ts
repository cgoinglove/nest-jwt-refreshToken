import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { RefreshToken } from '../auth/entities/user-refreshToken.entity';
import { User } from '../auth/entities/user.entity';
import { Log } from './entites/log.entity';
import { LogService } from './logger.service';
import { TokenManager } from './tokenManager';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Log, User, RefreshToken])],
  providers: [LogService, TokenManager, JwtService, AuthService],
  exports: [LogService, TokenManager, AuthService],
})
export class CommonModule {}

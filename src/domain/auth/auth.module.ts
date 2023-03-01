import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken } from './entities/user-refreshToken.entity';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '../common/local.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken]), PassportModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}

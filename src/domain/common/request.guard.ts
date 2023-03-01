import { Aes256 } from '@/utils/cryptoUtil';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { JwtPayload } from '../auth/auth.controller';
import { roleAccessController, RoleType } from '../auth/role';
import { TokenManager } from './tokenManager';
import { parse as useragentParse } from 'express-useragent';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private tokenManager: TokenManager) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    try {
      const payload = this.tokenManager.accessTokenVerify(
        Aes256.decode(request.cookies.accessToken),
      );
      request.user = payload;
      return true;
    } catch (error) {
      if (error.name == 'TokenExpiredError')
        throw new HttpException(
          'AccessTokenExpiredError',
          HttpStatus.UNAUTHORIZED,
        );
      this.tokenManager.expireToken(
        response,
        Aes256.decode(request.cookies.refreshToken),
      );
      throw new UnauthorizedException();
    }
  }
}

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh-token') {
  constructor(private tokenManager: TokenManager) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { platform, browser, os } = useragentParse(request.get('user-agent'));
    try {
      const entity = await this.tokenManager.refreshTokenVerify(
        Aes256.decode(request.cookies.refreshToken),
        platform,
        browser,
        os,
        request.ip,
      );
      this.tokenManager.tokenAssignToClient({
        ...(await this.tokenManager.generateToken(
          entity.user.getJwtPayload(),
          entity,
        )),
        response,
      });
      return true;
    } catch (error) {
      this.tokenManager.expireToken(
        response,
        Aes256.decode(request.cookies.refreshToken),
      );
      throw new UnauthorizedException();
    }
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const roles = this.reflector.get<RoleType[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return roleAccessController(user.roles, roles, 'some');
  }
}

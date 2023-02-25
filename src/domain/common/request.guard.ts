import { Aes256 } from '@/utils/cryptoUtil';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { JwtPayload } from '../auth/auth.controller';
import { roleAccessController, RoleType } from '../auth/role';
import { TokenManager } from './tokenManager';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private tokenManager: TokenManager) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    try {
      const payload = await this.tokenManager.verify(request, response);
      request.user = payload;
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

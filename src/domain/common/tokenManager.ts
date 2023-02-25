import { IS_DEV_MODE } from '@/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { Aes256 } from 'src/utils/cryptoUtil';
import { Repository } from 'typeorm';
import { RefreshToken } from '../auth/entities/user-refreshToken.entity';
import { JwtPayload } from '../auth/auth.controller';
import { User } from '../auth/entities/user.entity';
import { parse as useragentParse } from 'express-useragent';
@Injectable()
export class TokenManager {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  /** @verify */
  async verify(request: Request, response: Response): Promise<JwtPayload> {
    const accessToken = Aes256.decode(request.cookies.accessToken);
    const refreshToken = Aes256.decode(request.cookies.refreshToken);
    try {
      return this.jwtService.verify(accessToken, {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      });
    } catch (error) {
      if (error.name != 'TokenExpiredError' || !refreshToken) {
        throw new UnauthorizedException();
      }
      try {
        const { id } = this.jwtService.verify(refreshToken, {
          secret: process.env.JWT_REFRESH_TOKEN_SECRET,
        });
        const refreshTokenEntity = await this.refreshTokenRepository.findOne({
          where: {
            id,
            refreshToken,
            ip: request.ip,
          },
          relations: ['user'],
        });
        if (!refreshTokenEntity || !refreshTokenEntity.canUse())
          throw new Error();
        return await this.generateToken(
          request,
          response,
          refreshTokenEntity.user,
          refreshTokenEntity,
        );
      } catch (error) {
        throw new UnauthorizedException();
      }
    }
  }

  async generateToken(
    request: Request,
    response: Response,
    userEntity: User,
    refreshTokenEntity: RefreshToken,
  ): Promise<JwtPayload> {
    const payload: JwtPayload = {
      id: userEntity.id,
      name: userEntity.name,
      roles: userEntity.getRolesOnlyName(),
    };

    const accessToken = this.sign(
      payload,
      process.env.JWT_ACCESS_TOKEN_SECRET,
      +process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME * 1000,
    );
    const refreshToken = this.sign(
      { id: refreshTokenEntity.id },
      process.env.JWT_REFRESH_TOKEN_SECRET,
      refreshTokenEntity.getExpiresIn?.() ||
        +process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME * 1000,
    );
    const { platform, browser, os } = useragentParse(request.get('user-agent'));
    await this.refreshTokenRepository.save({
      ...refreshTokenEntity,
      refreshToken,
      platform,
      browser,
      os,
      ip: request.ip,
    });

    Object.entries({
      accessToken,
      refreshToken,
    }).forEach(([key, value]) => {
      response.cookie(key, Aes256.encode(value), {
        maxAge: new Date(refreshTokenEntity.expiresDate).getTime() - Date.now(),
        httpOnly: true,
        sameSite: 'lax',
        secure: !IS_DEV_MODE,
      });
    });
    request.user = payload;
    return payload;
  }

  private sign(
    payload: { id: string } | JwtPayload,
    secret: string,
    expiresIn: number,
  ): string {
    return this.jwtService.sign(payload, {
      secret,
      expiresIn: expiresIn.toString(),
      algorithm: 'HS256',
      issuer: 'cgoing',
    });
  }

  async expireToken(response: Response, refreshToken: string) {
    ['accessToken', 'refreshToken'].forEach((key) => {
      response.cookie(key, '', {
        maxAge: 0,
      });
    });
    refreshToken &&
      (await this.refreshTokenRepository.softDelete({
        refreshToken,
      }));
  }
}

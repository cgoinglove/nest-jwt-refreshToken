import { IS_DEV_MODE } from '@/config';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Aes256 } from 'src/utils/cryptoUtil';
import { Repository } from 'typeorm';
import { RefreshToken } from '../auth/entities/user-refreshToken.entity';
import { JwtPayload } from '../auth/auth.controller';

@Injectable()
export class TokenManager {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  /** @verify */
  accessTokenVerify(accessToken: string): JwtPayload {
    return this.jwtService.verify(accessToken, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }
  /** @verify */
  async refreshTokenVerify(
    refreshToken: string,
    platform,
    browser,
    os,
    ip: string,
  ): Promise<RefreshToken> {
    const { id } = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    });
    const refreshTokenEntity = await this.refreshTokenRepository.findOne({
      where: {
        id,
        refreshToken,
        platform,
        browser,
        os,
        ip,
      },
      relations: ['user'],
    });
    if (!refreshTokenEntity || !refreshTokenEntity.canUse()) throw new Error();
    return refreshTokenEntity;
  }

  async generateToken(
    payload: JwtPayload,
    refreshTokenEntity: RefreshToken,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
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

    await this.refreshTokenRepository.save({
      ...refreshTokenEntity,
      refreshToken,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn:
        new Date(refreshTokenEntity.expiresDate).getTime() - Date.now(),
    };
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

  tokenAssignToClient({
    response,
    accessToken,
    refreshToken,
    expiresIn,
    responseData,
  }: {
    response: Response;
    accessToken: string;
    refreshToken: string;
    expiresIn?: number;
    responseData?: any;
  }) {
    Object.entries({
      accessToken,
      refreshToken,
    }).forEach(([key, value]) => {
      response.cookie(key, Aes256.encode(value), {
        maxAge: expiresIn,
        httpOnly: true,
        sameSite: 'lax',
        secure: !IS_DEV_MODE,
      });
    });
    response.send(responseData);
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

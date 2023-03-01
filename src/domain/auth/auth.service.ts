import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { parse as useragentParse } from 'express-useragent';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Aes256, createSalt, toHash } from 'src/utils/cryptoUtil';
import { Request, Response } from 'express';
import { AuthHistory, UserDTO } from './dto';
import { User } from './entities/user.entity';
import { TokenManager } from '../common/tokenManager';
import { randomUUID } from 'crypto';
import { RefreshToken } from './entities/user-refreshToken.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private tokenManager: TokenManager,
  ) {}

  /** @회원가입 */
  async registerUser(userDto: UserDTO) {
    const exist = await this.userRepository.exist({
      where: {
        email: userDto.email,
      },
    });
    // 이미 사용중인 email
    if (exist)
      throw new HttpException('email aleady used', HttpStatus.BAD_REQUEST);
    const salt = await createSalt();
    const password = await toHash(userDto.password, salt);
    await this.userRepository.save({
      ...userDto,
      password,
      salt,
      name: 'test',
    });
  }

  /** @로그인  */
  async userAssign(request: Request, response: Response) {
    const user = request.user as User;

    const { platform, browser, os } = useragentParse(request.get('user-agent'));
    const refreshTokenDTO = {
      id: randomUUID(),
      expiresDate: new Date(
        Date.now() + +process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME * 1000,
      ),
      userId: user.id,
      platform,
      browser,
      os,
      ip: request.ip,
    } as RefreshToken;

    this.tokenManager.tokenAssignToClient({
      response,
      responseData: {
        name: user.name,
        roles: user.getRolesOnlyName(),
      },
      ...(await this.tokenManager.generateToken(
        user.getJwtPayload(),
        refreshTokenDTO,
      )),
    });
  }

  /** @로그아웃  */
  async logOut(resposne: Response, refreshToken: string) {
    await this.tokenManager.expireToken(resposne, Aes256.decode(refreshToken));
  }

  /** @로그인히스토리 */
  async getHistory(userId: string) {
    const refreshTokenList = await this.refreshTokenRepository.find({
      where: {
        userId,
      },
      withDeleted: true,
      order: {
        updatedAt: 'DESC',
      },
    });
    return refreshTokenList
      .reduce((list: AuthHistory[], entity) => {
        if (
          !list.some((v) =>
            ['browser', 'platform', 'ip'].every(
              (key) => v[key] === entity[key],
            ),
          )
        ) {
          list.push({
            browser: entity.browser,
            id: Aes256.encode(entity.id),
            platform: entity.platform,
            lastDate: entity.updatedAt,
            ip: entity.ip,
            use: entity.canUse(),
            os: entity.os,
          });
        }
        return list;
      }, [])
      .sort((a, b) => (a.use == b.use ? 0 : a.use ? -1 : 1));
  }
}

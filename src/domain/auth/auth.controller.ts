import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserDTO } from './dto';
import { RoleType } from './role';
import { LogService } from '../common/logger.service';
import { JwtAuthGuard, RefreshTokenGuard } from '../common/request.guard';
import { AuthGuard } from '@nestjs/passport';
import { TokenManager } from '../common/tokenManager';

export type JwtPayload = {
  id: string;
  name: string;
  roles: RoleType[];
};

@ApiTags('auth api 입니다.')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private logger: LogService,
    private tokenManager: TokenManager,
  ) {}

  @ApiOperation({ summary: '회원가입 하기! 이름은 test라고 넣을게요!' })
  @Post('/register')
  @UsePipes(ValidationPipe)
  async registerAccount(@Res() res: Response, @Body() userDTO: UserDTO) {
    await this.authService.registerUser(userDTO);
    res.send();
  }

  @ApiOperation({ summary: 'login 을 시도합니다 ' })
  @ApiBody({
    type: UserDTO,
  })
  @UsePipes(ValidationPipe)
  @Post('/login')
  @UseGuards(AuthGuard('local'))
  async login(@Req() request: Request, @Res() response: Response) {
    await this.authService.userAssign(request, response);
  }

  @ApiOperation({ summary: 'logout api 입니다!' })
  @Get('/logout')
  async test(@Req() req: Request, @Res() res: Response) {
    await this.authService.logOut(res, req.cookies.refreshToken);
    res.send('ok');
  }

  @ApiOperation({
    summary:
      '실제 클라이언트 사이드에 유저가 index 접속시에 해당 api 를 사용합니다',
  })
  @Get('/token')
  @UseGuards(JwtAuthGuard)
  tokenSign() {
    return;
  }

  @ApiOperation({
    summary: 'refresh Token 으로 재발급 요청 ',
  })
  @Get('/refresh')
  @UseGuards(RefreshTokenGuard)
  refresh() {
    return;
  }

  @ApiOperation({
    summary: 'login history',
  })
  @Get('/history')
  @UseGuards(JwtAuthGuard)
  async getHistory(@Req() req: Request, @Res() res: Response) {
    const user = req.user as JwtPayload;
    res.send(await this.authService.getHistory(user.id));
  }
}

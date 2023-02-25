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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserDTO } from './dto';
import { RoleType } from './role';
import { LogService } from '../common/logger.service';
import { JwtAuthGuard } from '../common/request.guard';

export type JwtPayload = {
  id: string;
  name: string;
  roles: RoleType[];
};

@ApiTags('auth api 입니다.')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private logger: LogService) {}

  @ApiOperation({ summary: '회원가입 하기! 이름은 test라고 넣을게요!' })
  @Post('/register')
  @UsePipes(ValidationPipe)
  async registerAccount(@Res() res: Response, @Body() userDTO: UserDTO) {
    await this.authService.registerUser(userDTO);
    res.send();
  }

  @ApiOperation({ summary: 'login 을 시도합니다 ' })
  @Post('/login')
  @UsePipes(ValidationPipe)
  async login(
    @Body() user: UserDTO,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const { name, roles } = await this.authService.userCertification(
      user,
      request,
      response,
    );
    return response.send({ name, roles });
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
  tokenSign(@Req() req: Request, @Res() res: Response) {
    const user = req.user as JwtPayload;
    res.send({
      roles: user.roles,
      name: user.name,
    });
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

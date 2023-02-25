import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Roles, RoleType } from '../auth/role';
import { JwtAuthGuard, RolesGuard } from '../common/request.guard';

@ApiTags('토근이 필수로 존재해야하는 controller 입니다.')
@Controller('cat')
@UseGuards(JwtAuthGuard)
export class CatController {
  @Get('/')
  index(@Res() res: Response) {
    res.send('냐옹');
  }

  @ApiOperation({ summary: 'admin 만 가능합니다' })
  @Get('/admin')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  needRole(@Res() res: Response) {
    res.send('냐옹');
  }
}

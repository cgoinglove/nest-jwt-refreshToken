import { IS_DEV_MODE } from '@/config';

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();
    response.cookie('accessToken', '', {
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
      secure: !IS_DEV_MODE,
    });
    response.cookie('refreshToken', '', {
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
      secure: !IS_DEV_MODE,
    });
    response.status(exception.getStatus()).send({ message: exception.message });
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { JwtPayload } from '../auth/auth.controller';
import { Log } from './entites/log.entity';

@Injectable()
export class LogService {
  constructor(
    @Inject(REQUEST) private request: Request,
    @InjectRepository(Log)
    private repository: Repository<Log>,
  ) {}

  log(message?: string) {
    const user = this.request.user as JwtPayload;
    const content = `[${this.request.method}] Request URL : ${
      this.request.url
    } , MESSAGE : ${message}, ip : ${this.request.ip}, ${
      user ? `user: [${user.id}] ${user.name}` : ''
    }`;
    this.repository.save({
      userId: user?.id,
      logType: 'INFO',
      content,
    });
  }
  async exportAndDeleteAll(): Promise<Buffer> {
    const logs = await this.repository.find();
    await this.repository.delete({});
    return Buffer.from(logs.map((v) => v.content).join('\n'));
  }
}

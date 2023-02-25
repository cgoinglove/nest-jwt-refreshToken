import { Injectable } from '@nestjs/common';

@Injectable()
export class CatService {
  hello(): string {
    return 'hello';
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { CatService } from './domain/cat/cat.service';

describe('test', () => {
  let service: CatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatService],
    }).compile();

    service = module.get<CatService>(CatService);
  });

  it('test', () => {
    console.log(`in a test`);
    console.log(service.hello());
  });
});

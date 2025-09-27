import { Test, TestingModule } from '@nestjs/testing';
import { MensagensService } from './mensagens.service';

describe('MensagensService', () => {
  let service: MensagensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MensagensService],
    }).compile();

    service = module.get<MensagensService>(MensagensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

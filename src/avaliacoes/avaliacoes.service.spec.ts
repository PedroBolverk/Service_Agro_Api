import { Test, TestingModule } from '@nestjs/testing';
import { AvaliacoesService } from './avaliacoes.service';

describe('AvaliacoesService', () => {
  let service: AvaliacoesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvaliacoesService],
    }).compile();

    service = module.get<AvaliacoesService>(AvaliacoesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

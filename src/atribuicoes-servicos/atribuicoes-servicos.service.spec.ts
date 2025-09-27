import { Test, TestingModule } from '@nestjs/testing';
import { AtribuicoesServicosService } from './atribuicoes-servicos.service';

describe('AtribuicoesServicosService', () => {
  let service: AtribuicoesServicosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AtribuicoesServicosService],
    }).compile();

    service = module.get<AtribuicoesServicosService>(AtribuicoesServicosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

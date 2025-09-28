import { Test, TestingModule } from '@nestjs/testing';
import { SolicitacoesServicosService } from './solicitacoes-servicos.service';

describe('SolicitacoesServicosService', () => {
  let service: SolicitacoesServicosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolicitacoesServicosService],
    }).compile();

    service = module.get<SolicitacoesServicosService>(SolicitacoesServicosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SolicitacoesServicosController } from './solicitacoes-servicos.controller';
import { SolicitacoesServicosService } from './solicitacoes-servicos.service';

describe('SolicitacoesServicosController', () => {
  let controller: SolicitacoesServicosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitacoesServicosController],
      providers: [SolicitacoesServicosService],
    }).compile();

    controller = module.get<SolicitacoesServicosController>(SolicitacoesServicosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

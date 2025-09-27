import { Test, TestingModule } from '@nestjs/testing';
import { AtribuicoesServicosController } from './atribuicoes-servicos.controller';
import { AtribuicoesServicosService } from './atribuicoes-servicos.service';

describe('AtribuicoesServicosController', () => {
  let controller: AtribuicoesServicosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AtribuicoesServicosController],
      providers: [AtribuicoesServicosService],
    }).compile();

    controller = module.get<AtribuicoesServicosController>(AtribuicoesServicosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

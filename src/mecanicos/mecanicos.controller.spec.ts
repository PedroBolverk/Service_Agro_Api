import { Test, TestingModule } from '@nestjs/testing';
import { MecanicosController } from './mecanicos.controller';
import { MecanicosService } from './mecanicos.service';

describe('MecanicosController', () => {
  let controller: MecanicosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MecanicosController],
      providers: [MecanicosService],
    }).compile();

    controller = module.get<MecanicosController>(MecanicosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

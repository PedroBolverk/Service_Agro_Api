import { Test, TestingModule } from '@nestjs/testing';
import { MecanicosService } from './mecanicos.service';

describe('MecanicosService', () => {
  let service: MecanicosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MecanicosService],
    }).compile();

    service = module.get<MecanicosService>(MecanicosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

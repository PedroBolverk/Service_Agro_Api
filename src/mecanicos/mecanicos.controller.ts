import { Controller, Get, Param, Patch, Body, Query, BadRequestException, Post } from '@nestjs/common';
import { MecanicosService } from './mecanicos.service';
import { UpdateMecanicoDto } from './dto/update-mecanico.dto';

@Controller('mecanicos')
export class MecanicosController {
  constructor(private readonly service: MecanicosService) {}

  // ... (suas rotas existentes)

  // BACKFILL: cria registros Mechanic para todos Users com role=MECHANIC que ainda não têm
  @Post('backfill')
  backfill() {
    return this.service.backfillAllMechanics();
  }

  // SYNC de um único userId (útil para testar rapidamente)
  @Post('sync/:userId')
  backfillOne(@Param('userId') userId: string) {
    return this.service.backfillOne(userId);
  }
}

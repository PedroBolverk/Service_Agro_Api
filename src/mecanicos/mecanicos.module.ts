import { Module } from '@nestjs/common';
import { MecanicosService } from './mecanicos.service';
import { MecanicosController } from './mecanicos.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MecanicosController],
  providers: [MecanicosService, PrismaService],
  exports: [MecanicosService],
})
export class MecanicosModule {}

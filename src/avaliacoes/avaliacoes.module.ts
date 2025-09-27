import { Module } from '@nestjs/common';
import { AvaliacoesService } from './avaliacoes.service';
import { AvaliacoesController } from './avaliacoes.controller';
@Module({ controllers: [AvaliacoesController], providers: [AvaliacoesService] })
export class AvaliacoesModule {}
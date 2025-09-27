import { Module } from '@nestjs/common';
import { AtribuicoesServicosService } from './atribuicoes-servicos.service';
import { AtribuicoesServicosController } from './atribuicoes-servicos.controller';
@Module({ controllers: [AtribuicoesServicosController], providers: [AtribuicoesServicosService] })
export class AtribuicoesServicosModule {}
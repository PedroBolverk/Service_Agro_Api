import { Module } from '@nestjs/common';
import { SolicitacoesServicosService } from './solicitacoes-servicos.service';
import { SolicitacoesServicosController } from './solicitacoes-servicos.controller';
@Module({ controllers: [SolicitacoesServicosController], providers: [SolicitacoesServicosService] })
export class SolicitacoesServicosModule {}
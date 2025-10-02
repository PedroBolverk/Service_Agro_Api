// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { MecanicosModule } from './mecanicos/mecanicos.module';
import { SolicitacoesServicosModule } from './solicitacoes-servicos/solicitacoes-servicos.module';
import { AtribuicoesServicosModule } from './atribuicoes-servicos/atribuicoes-servicos.module';
import { MensagensModule } from './mensagens/mensagens.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { WsModule } from './ws/ws.module';
import { RedisModule } from './redis/redis.module';
import { LocationGateway } from './gateways/location/location.gateway';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsuariosModule,
    MecanicosModule,
    SolicitacoesServicosModule,
    AtribuicoesServicosModule,
    MensagensModule,
    AvaliacoesModule,
    WsModule,
    RedisModule
    
  ],
  controllers: [AppController],
  providers: [AppService, LocationGateway],
})
export class AppModule {}
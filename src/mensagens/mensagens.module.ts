import { Module } from '@nestjs/common';
import { MensagensService } from './mensagens.service';
import { MensagensController } from './mensagens.controller';

@Module({
  controllers: [MensagensController],
  providers: [MensagensService],
})
export class MensagensModule {}

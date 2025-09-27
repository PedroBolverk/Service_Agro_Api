import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MensagensService } from './mensagens.service';
import { CreateMensagemDto } from './dto/create-mensagen.dto';

@Controller('mensagens')
export class MensagensController {
  constructor(private readonly service: MensagensService) {}

  @Post()
  create(@Body() dto: CreateMensagemDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query('solicitacaoId') solicitacaoId: string) {
    return this.service.listBySolicitacao(solicitacaoId);
  }
}

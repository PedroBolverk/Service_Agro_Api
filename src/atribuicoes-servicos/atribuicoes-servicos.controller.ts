import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AtribuicoesServicosService } from './atribuicoes-servicos.service';
import { CreateAtribuicaoServicoDto } from './dto/create-atribuicoes-servico.dto';
import { UpdateAtribuicaoServicoDto } from './dto/update-atribuicoes-servico.dto';

@Controller('atribuicoes-servicos')
export class AtribuicoesServicosController {
  constructor(private readonly service: AtribuicoesServicosService) {}

  @Post()
  create(@Body() dto: CreateAtribuicaoServicoDto) {
    return this.service.create(dto);
  }

  // 1) Via query param: /atribuicoes-servicos?mechanicId=UUID
  @Get()
  findAll(@Query('mechanicId') mechanicId?: string) {
    if (!mechanicId) {
      throw new BadRequestException('mechanicId é obrigatório');
    }
    return this.service.findAll(mechanicId);
  }

  // 2) Via rota clara: /atribuicoes-servicos/mechanic/:mechanicId
  @Get('mechanic/:mechanicId')
  findAllFromMechanic(@Param('mechanicId') mechanicId: string) {
    if (!mechanicId) {
      throw new BadRequestException('mechanicId é obrigatório');
    }
    return this.service.findAll(mechanicId);
  }

  // 3) Detalhe de UMA atribuição: /atribuicoes-servicos/by-id/:id
  @Get('by-id/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch('by-id/:id')
  update(@Param('id') id: string, @Body() dto: UpdateAtribuicaoServicoDto) {
    return this.service.update(id, dto);
  }

  @Delete('by-id/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch('by-id/:id/aceitar')
  aceitar(@Param('id') id: string) {
    return this.service.aceitar(id);
  }

  @Patch('by-id/:id/recusar')
  recusar(@Param('id') id: string) {
    return this.service.recusar(id);
  }

  @Patch('by-id/:id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.service.cancelar(id);
  }
}

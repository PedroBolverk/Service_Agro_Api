import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { SolicitacoesServicosService } from './solicitacoes-servicos.service';
import { CreateSolicitacaoServicoDto } from './dto/create-solicitacoes-servico.dto';
import { UpdateSolicitacoesServicoDto } from './dto/update-solicitacoes-servico.dto';

@Controller('solicitacoes-servicos')
export class SolicitacoesServicosController {
  constructor(private readonly service: SolicitacoesServicosService) { }

  @Post()
  create(@Body() dto: CreateSolicitacaoServicoDto) {
    return this.service.create(dto);
  }

  // ✅ troque a rota de lista por algo claro
  @Get('user/:userId')
  async findAllFromUser(@Param('userId') userId: string) {
    return this.service.findAll(userId);
  }

  // ✅ detalhe por id com caminho diferente
  @Get('by-id/:id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch('by-id/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateSolicitacoesServicoDto) {
    return this.service.update(id, dto);
  }

  @Delete('by-id/:id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
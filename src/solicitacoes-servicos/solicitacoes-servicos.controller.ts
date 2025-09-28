import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { SolicitacoesServicosService } from './solicitacoes-servicos.service';
import { CreateSolicitacaoServicoDto } from './dto/create-solicitacoes-servico.dto';
import { UpdateSolicitacoesServicoDto } from './dto/update-solicitacoes-servico.dto';

@Controller('solicitacoes-servicos')
export class SolicitacoesServicosController {
constructor(private readonly service: SolicitacoesServicosService) {}


@Post() create(@Body() dto: CreateSolicitacaoServicoDto) { return this.service.create(dto); }
@Get() findAll() { return this.service.findAll(); }
@Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
@Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateSolicitacoesServicoDto) { return this.service.update(id, dto); }
@Patch(':id/cancelar') @HttpCode(200)
cancelar(@Param('id') id: string) { return this.service.cancelar(id); }
@Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
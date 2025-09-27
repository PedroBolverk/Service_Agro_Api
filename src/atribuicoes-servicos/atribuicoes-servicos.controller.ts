import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AtribuicoesServicosService } from './atribuicoes-servicos.service';
import { CreateAtribuicaoServicoDto } from './dto/create-atribuicoes-servico.dto';
import { UpdateAtribuicaoServicoDto } from './dto/update-atribuicoes-servico.dto';

@Controller('atribuicoes-servicos')
export class AtribuicoesServicosController {
constructor(private readonly service: AtribuicoesServicosService) {}


@Post() create(@Body() dto: CreateAtribuicaoServicoDto) { return this.service.create(dto); }
@Get() findAll() { return this.service.findAll(); }
@Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
@Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateAtribuicaoServicoDto) { return this.service.update(id, dto); }
@Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }


@Patch(':id/aceitar') aceitar(@Param('id') id: string) { return this.service.aceitar(id); }
@Patch(':id/recusar') recusar(@Param('id') id: string) { return this.service.recusar(id); }
}
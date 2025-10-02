import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { SolicitacoesServicosService } from './solicitacoes-servicos.service';
import { CreateSolicitacaoServicoDto } from './dto/create-solicitacoes-servico.dto';
import { UpdateSolicitacoesServicoDto } from './dto/update-solicitacoes-servico.dto';

@Controller('solicitacoes-servicos')
export class SolicitacoesServicosController {
  constructor(private readonly service: SolicitacoesServicosService) {}

  // Rota de criação de solicitação de serviço
  @Post() create(@Body() dto: CreateSolicitacaoServicoDto) { return this.service.create(dto); }

  // Rota para buscar todas as solicitações de serviço do usuário logado
  @Get(':userId') // Rota para buscar as solicitações de serviço do usuário com ID na URL
  async findAllFromUser(@Param('userId') userId: string) {
    console.log('Buscando solicitações para o userId:', userId);  // Log do userId vindo da URL
    return this.service.findAll(userId);  // Passa o userId diretamente para o serviço
  }

  // Rota para buscar uma solicitação de serviço pelo ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSolicitacoesServicoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

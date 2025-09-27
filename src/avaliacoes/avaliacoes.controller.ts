import { Controller, Post, Body } from '@nestjs/common';
import { AvaliacoesService } from './avaliacoes.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacoe.dto';

@Controller('avaliacoes')
export class AvaliacoesController {
constructor(private readonly service: AvaliacoesService) {}


@Post() create(@Body() dto: CreateAvaliacaoDto) { return this.service.create(dto); }
}
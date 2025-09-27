import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacoe.dto';

@Injectable()
export class AvaliacoesService {
constructor(private prisma: PrismaService) {}


async create(dto: CreateAvaliacaoDto) {
// valida unicidade (um rating por produtor por solicitação)
const existing = await this.prisma.rating.findFirst({
where: { solicitacaoServicoId: dto.solicitacaoServicoId, producerId: dto.producerId },
});
if (existing) throw new BadRequestException('Já existe avaliação deste produtor para esta solicitação');


return this.prisma.rating.create({ data: dto });
}
}
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMensagemDto } from './dto/create-mensagen.dto';

@Injectable()
export class MensagensService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateMensagemDto) {
    return this.prisma.message.create({ data: dto });
  }

  listBySolicitacao(solicitacaoId: string) {
    if (!solicitacaoId) throw new BadRequestException('solicitacaoServicoId obrigatório');
    return this.prisma.message.findMany({
      where: { solicitacaoServicoId: solicitacaoId },
      orderBy: { createdAt: 'asc' },
    });
  }
}

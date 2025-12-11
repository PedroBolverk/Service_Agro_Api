import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, StatusAtribuicao, RequestStatus } from '@prisma/client';
import { CreateAtribuicaoServicoDto } from './dto/create-atribuicoes-servico.dto';
import { UpdateAtribuicaoServicoDto } from './dto/update-atribuicoes-servico.dto';

@Injectable()
export class AtribuicoesServicosService {
  constructor(private prisma: PrismaService) {}

  // ───────────────────────────────────────────────
  // Helpers
  // ───────────────────────────────────────────────
  private ensureTransition(from: StatusAtribuicao, to: StatusAtribuicao) {
    const allowed: Record<StatusAtribuicao, StatusAtribuicao[]> = {
      PENDENTE: [StatusAtribuicao.ACEITA, StatusAtribuicao.RECUSADA, StatusAtribuicao.CANCELADA],
      ACEITA: [StatusAtribuicao.CANCELADA],
      RECUSADA: [],
      CANCELADA: [],
    };
    const ok = allowed[from]?.includes(to);
    if (!ok) {
      throw new BadRequestException(`Transição inválida de ${from} para ${to}`);
    }
  }

  private mapPrismaNotFound<T>(promise: Promise<T>): Promise<T> {
    return promise.catch((e) => {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Atribuição não encontrada');
      }
      throw e;
    });
  }

  private serialize(a: any) {
    return {
      id: a.id,
      status: a.status,
      createdAt: a.createdAt?.toISOString?.() ?? a.createdAt,
      decidedAt: a.decidedAt ? a.decidedAt.toISOString() : undefined,
      mechanic: a.mechanic,
      solicitacaoServico: {
        id: a.solicitacaoServico.id,
        description: a.solicitacaoServico.description,
        machineType: a.solicitacaoServico.machineType ?? null,
        locationLat: a.solicitacaoServico.locationLat ?? null,
        locationLng: a.solicitacaoServico.locationLng ?? null,
        status: a.solicitacaoServico.status,
        createdAt: a.solicitacaoServico.createdAt.toISOString(),
        producer: a.solicitacaoServico.producer
          ? {
              id: a.solicitacaoServico.producer.id,
              fullName: a.solicitacaoServico.producer.fullName,
              email: a.solicitacaoServico.producer.email,
              phone: a.solicitacaoServico.producer.phone ?? null,
            }
          : null,
      },
    };
  }

  // ───────────────────────────────────────────────
  // CRUD
  // ───────────────────────────────────────────────
  async create(dto: CreateAtribuicaoServicoDto) {
    return this.prisma.$transaction(async (tx) => {
      const sol = await tx.solicitacaoServicos.findUnique({
        where: { id: dto.solicitacaoServicoId },
      });
      if (!sol) throw new BadRequestException('Solicitação inválida');

      const mech = await tx.users.findUnique({
        where: { id: dto.mechanicId },
      });
      if (!mech) throw new BadRequestException('Mecânico inválido');

      const atrib = await tx.atribuicaoServicos.create({
        data: {
          solicitacaoServicoId: dto.solicitacaoServicoId,
          mechanicId: dto.mechanicId,
          status: StatusAtribuicao.PENDENTE,
        },
      });

      // marca a solicitação como ATRIBUIDA
      await tx.solicitacaoServicos.update({
        where: { id: dto.solicitacaoServicoId },
        data: { status: RequestStatus.ATRIBUIDA },
      });

      return atrib;
    });
  }

  async findAll(mechanicId: string) {
    try {
      const atribuicoes = await this.prisma.atribuicaoServicos.findMany({
        where: { mechanicId },
        orderBy: { createdAt: 'desc' },
        include: {
          mechanic: {
            select: { id: true, fullName: true, email: true },
          },
          solicitacaoServico: {
            include: {
              producer: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      return atribuicoes.map((a) => this.serialize(a));
    } catch (error) {
      console.error('Erro na busca de atribuições:', error);
      throw new BadRequestException('Erro ao buscar atribuições');
    }
  }

  async findOne(id: string) {
    const a = await this.prisma.atribuicaoServicos.findUnique({
      where: { id },
      include: {
        mechanic: { select: { id: true, fullName: true, email: true } },
        solicitacaoServico: {
          include: {
            producer: {
              select: { id: true, fullName: true, email: true, phone: true },
            },
          },
        },
      },
    });
    if (!a) throw new NotFoundException('Atribuição não encontrada');
    return this.serialize(a);
  }

  async update(id: string, dto: UpdateAtribuicaoServicoDto) {
    // valida transição se status vier no body
    if (dto.status) {
      const atual = await this.prisma.atribuicaoServicos.findUnique({
        where: { id },
        select: { status: true },
      });
      if (!atual) throw new NotFoundException('Atribuição não encontrada');
      this.ensureTransition(atual.status, dto.status);
    }

    // monta payload final (sem mutar o DTO)
    const data: Prisma.AtribuicaoServicosUpdateInput = { ...dto };

    if (
      dto.status === StatusAtribuicao.ACEITA ||
      dto.status === StatusAtribuicao.RECUSADA ||
      dto.status === StatusAtribuicao.CANCELADA
    ) {
      data.decidedAt = new Date();
    }

    return this.mapPrismaNotFound(
      this.prisma.atribuicaoServicos.update({
        where: { id },
        data,
      }),
    );
  }

  async remove(id: string) {
    return this.mapPrismaNotFound(
      this.prisma.atribuicaoServicos.delete({ where: { id } }),
    );
  }

  // ───────────────────────────────────────────────
  // Ações de status
  // ───────────────────────────────────────────────
  async aceitar(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const atual = await tx.atribuicaoServicos.findUnique({
        where: { id },
        select: { status: true, solicitacaoServicoId: true },
      });
      if (!atual) throw new NotFoundException('Atribuição não encontrada');

      this.ensureTransition(atual.status, StatusAtribuicao.ACEITA);

      const atrib = await tx.atribuicaoServicos.update({
        where: { id },
        data: { status: StatusAtribuicao.ACEITA, decidedAt: new Date() },
      });

      await tx.solicitacaoServicos.update({
        where: { id: atual.solicitacaoServicoId },
        data: { status: RequestStatus.ATRIBUIDA },
      });

      return atrib;
    });
  }

  async recusar(id: string) {
    const atual = await this.prisma.atribuicaoServicos.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!atual) throw new NotFoundException('Atribuição não encontrada');

    this.ensureTransition(atual.status, StatusAtribuicao.RECUSADA);

    return this.prisma.atribuicaoServicos.update({
      where: { id },
      data: { status: StatusAtribuicao.RECUSADA, decidedAt: new Date() },
    });
  }

  async cancelar(id: string) {
    const atual = await this.prisma.atribuicaoServicos.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!atual) throw new NotFoundException('Atribuição não encontrada');

    this.ensureTransition(atual.status, StatusAtribuicao.CANCELADA);

    return this.prisma.atribuicaoServicos.update({
      where: { id },
      data: { status: StatusAtribuicao.CANCELADA, decidedAt: new Date() },
    });
  }
}

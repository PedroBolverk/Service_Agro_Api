import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestStatus } from '@prisma/client';
import { CreateSolicitacaoServicoDto } from './dto/create-solicitacoes-servico.dto';
import { UpdateSolicitacoesServicoDto } from './dto/update-solicitacoes-servico.dto';

@Injectable()
export class SolicitacoesServicosService {
  constructor(
    private prisma: PrismaService,  // PrismaService para interação com o banco de dados
  ) { }

  // Função de criação de solicitação de serviço
  async create(dto: CreateSolicitacaoServicoDto) {
    try {
      console.log('Dados recebidos para criação de solicitação:', dto); // Log para dados recebidos

      // Valida se o produtor existe
      const prod = await this.prisma.users.findUnique({ where: { id: dto.producerId } });
      if (!prod) {
        console.log('Produtor não encontrado:', dto.producerId); // Log de erro
        throw new BadRequestException('Produtor inválido');
      }

      // Verifique se a localização foi passada, se sim, converta os valores para número
      const lat = Number(dto.locationLat);
      const lng = Number(dto.locationLng);
      if (dto.locationLat && (!Number.isFinite(lat) || !Number.isFinite(lng))) {
        console.log('Localização inválida:', lat, lng); // Log de erro
        throw new BadRequestException('Localização inválida');
      }

      // Criação da solicitação de serviço
      const solicit = await this.prisma.solicitacaoServicos.create({
        data: {
          description: dto.description,
          machineType: dto.machineType || '', // Caso não tenha machineType, deixe como string vazia
          locationLat: dto.locationLat,
          locationLng: dto.locationLng,
          scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
          status: dto.status || RequestStatus.ABERTA, // Default para 'ABERTA'
          producerId: dto.producerId,
        },
      });

      console.log('Solicitação criada com sucesso:', solicit); // Log de sucesso

      return solicit; // Retorna a solicitação criada

    } catch (error) {
      console.error('Erro ao criar solicitação:', error); // Log de erro detalhado
      throw error; // Repassa o erro para o NestJS lidar com ele
    }
  }

  // ----------------- READS -----------------

  // Função para buscar todas as solicitações de um produtor específico
  async findAll(userId: string) {
    const solicitacoes = await this.prisma.solicitacaoServicos.findMany({
      where: { producerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        producer: { select: { id: true, fullName: true, email: true, phone: true } },
        // ✅ puxe a última atribuição ACEITA (se existir)
        assignments: {
          where: { status: 'ACEITA' },
          orderBy: { decidedAt: 'desc' },
          take: 1,
          include: {
            mechanic: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    // ✅ achata um campo "assignedMechanic" para o front
    return solicitacoes.map((s) => ({
      id: s.id,
      description: s.description,
      machineType: s.machineType ?? '',
      createdAt: s.createdAt,
      status: s.status, // ABERTA / ATRIBUIDA / ...
      assignedMechanic: s.assignments?.[0]?.mechanic?.fullName ?? null,
    }));
  }

  // Função para buscar uma solicitação de serviço pelo ID
  async findOne(id: string) {
    console.log('Buscando solicitação com o ID:', id);
    try {
      const sol = await this.prisma.solicitacaoServicos.findUnique({
        where: { id },
        include: {
          producer: { select: { id: true, fullName: true, email: true } },
          assignments: true,
        },
      });
      if (!sol) throw new NotFoundException('Solicitação não encontrada');
      return sol;
    } catch (error) {
      console.error('Erro ao buscar solicitação:', error);
      throw new NotFoundException('Solicitação não encontrada');
    }
  }

  // ----------------- UPDATE -----------------

  // Função para atualizar uma solicitação de serviço
  async update(id: string, dto: UpdateSolicitacoesServicoDto) {
    console.log('Atualizando solicitação com ID:', id);
    const data: any = {};
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.machineType !== undefined) data.machineType = dto.machineType;
    if (dto.locationLat !== undefined) data.locationLat = dto.locationLat;
    if (dto.locationLng !== undefined) data.locationLng = dto.locationLng;
    if (dto.scheduledFor !== undefined) data.scheduledFor = dto.scheduledFor ? new Date(dto.scheduledFor) : null;
    if (dto.status !== undefined) data.status = dto.status;

    try {
      return await this.prisma.solicitacaoServicos.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('Erro ao atualizar solicitação:', error);
      throw new NotFoundException('Solicitação não encontrada');
    }
  }

  // ----------------- CANCEL / DELETE -----------------

  // Função para cancelar uma solicitação de serviço
  async cancelar(id: string) {
    console.log('Cancelando solicitação com ID:', id);
    try {
      return await this.prisma.solicitacaoServicos.update({
        where: { id },
        data: { status: RequestStatus.CANCELADA },
      });
    } catch (error) {
      console.error('Erro ao cancelar solicitação:', error);
      throw new NotFoundException('Solicitação não encontrada');
    }
  }

  // Função para remover uma solicitação de serviço
  async remove(id: string) {
    console.log('Removendo solicitação com ID:', id);
    try {
      return await this.prisma.solicitacaoServicos.delete({ where: { id } });
    } catch (error) {
      console.error('Erro ao remover solicitação:', error);
      throw new NotFoundException('Solicitação não encontrada');
    }
  }
}

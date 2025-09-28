import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestStatus, StatusAtribuicao } from '@prisma/client';
import { CreateSolicitacaoServicoDto } from './dto/create-solicitacoes-servico.dto';
import { UpdateSolicitacoesServicoDto } from './dto/update-solicitacoes-servico.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class SolicitacoesServicosService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

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
  async findAll() {
    return this.prisma.solicitacaoServicos.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        producer: { select: { id: true, fullName: true, email: true } },
        assignments: true,
      },
    });
  }

  async findOne(id: string) {
    const sol = await this.prisma.solicitacaoServicos.findUnique({
      where: { id },
      include: {
        producer: { select: { id: true, fullName: true, email: true } },
        assignments: true,
      },
    });
    if (!sol) throw new NotFoundException('Solicitação não encontrada');
    return sol;
  }

  // ----------------- UPDATE -----------------
  async update(id: string, dto: UpdateSolicitacoesServicoDto) {
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
    } catch {
      throw new NotFoundException('Solicitação não encontrada');
    }
  }

  // ----------------- CANCEL / DELETE -----------------
  async cancelar(id: string) {
    try {
      return await this.prisma.solicitacaoServicos.update({
        where: { id },
        data: { status: RequestStatus.CANCELADA },
      });
    } catch {
      throw new NotFoundException('Solicitação não encontrada');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.solicitacaoServicos.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Solicitação não encontrada');
    }
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

const userSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  phone: true,
  cpfCnpj: true,
  stateReg: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) { }

  // POST /usuarios
  async create(dto: CreateUsuarioDto) {
    const {
      mechanicSpecialty,
      mechanicPhotoUrl,
      mechanicIsAvailable = true,
      mechanicLat,
      mechanicLng,
      ...userDto
    } = dto;

    // hash de senha
    if (userDto.password) {
      userDto.password = await bcrypt.hash(userDto.password, 10);
    }

    // 1) cria o usuário
    const user = await this.prisma.users.create({
      data: userDto as any,
      select: { ...userSelect, id: true, role: true },
    });

    // 2) se for mecânico, GARANTE via UPSERT que exista Mechanic
    if (user.role === Role.MECHANIC) {
      if (!mechanicSpecialty) {
        throw new BadRequestException(
          'Para role=MECHANIC é obrigatório informar mechanicSpecialty.',
        );
      }

      await this.prisma.mechanic.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          specialty: mechanicSpecialty,
          photoUrl: mechanicPhotoUrl ?? '',
          isAvailable: mechanicIsAvailable,
          lat: mechanicLat ?? null,
          lng: mechanicLng ?? null,
        },
        update: {
          specialty: mechanicSpecialty,
          photoUrl: mechanicPhotoUrl ?? '',
          isAvailable: mechanicIsAvailable,
          lat: mechanicLat ?? null,
          lng: mechanicLng ?? null,
        },
      });
    }

    return user; // retorna usuário (sem password)
  }

  // GET /usuarios
  async findAll() {
    return this.prisma.users.findMany({
      select: {
        ...userSelect,
        mechanic: {
          select: {
            specialty: true,
            photoUrl: true,
            isAvailable: true,
            lat: true,
            lng: true,
          },
        },
      },
    });
  }

  // GET /usuarios/:id
  async findOne(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: {
        ...userSelect,
        mechanic: {
          select: {
            specialty: true,
            photoUrl: true,
            isAvailable: true,
            lat: true,
            lng: true,
          },
        },
        SolicitacaoServicos: {  // Inclui as solicitações de serviço do usuário
          select: {
            id: true,
            description: true,
            status: true,
          },
        },
        AtribuicaoServicos: {  // Inclui as atribuições de serviço relacionadas ao usuário
          select: {
            id: true,
            status: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  // PATCH /usuarios/:id  (role é IMUTÁVEL)
  async update(id: string, dto: UpdateUsuarioDto & { role?: unknown }) {
    if (Object.prototype.hasOwnProperty.call(dto, 'role')) {
      throw new BadRequestException('O campo "role" é imutável nesta aplicação.');
    }

    const data: any = { ...dto };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.users.update({
      where: { id },
      data,
      select: userSelect,
    });
  }

  // DELETE /usuarios/:id (remove Mechanic antes, se existir)
  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const mech = await tx.mechanic.findUnique({ where: { userId: id } });
      if (mech) await tx.mechanic.delete({ where: { userId: id } });
      return tx.users.delete({ where: { id }, select: userSelect });
    });
  }
}

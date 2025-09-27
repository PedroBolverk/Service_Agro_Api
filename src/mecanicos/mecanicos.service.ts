import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMecanicoDto } from './dto/update-mecanico.dto';
import { Role } from '@prisma/client';

// ... (restante do service que você já tem)

@Injectable()
export class MecanicosService {
  constructor(private prisma: PrismaService) {}

  // ... (métodos existentes)

  // Cria Mechanic para TODOS os Users com role=MECHANIC que ainda não têm registro
  async backfillAllMechanics() {
    const users = await this.prisma.users.findMany({
      where: { role: Role.MECHANIC },
      select: { id: true, fullName: true, email: true },
    });

    const created: string[] = [];
    const skipped: string[] = [];

    for (const u of users) {
      const exists = await this.prisma.mechanic.findUnique({ where: { userId: u.id } });
      if (exists) {
        skipped.push(u.id);
        continue;
      }

      await this.prisma.mechanic.create({
        data: {
          userId: u.id,
          specialty: 'Geral', // default — pode ajustar
          photoUrl: '',
          isAvailable: true,
        },
      });
      created.push(u.id);
    }

    return { createdCount: created.length, created, skippedCount: skipped.length, skipped };
  }

  // Cria/sincroniza Mechanic para um único userId (se for MECHANIC)
  async backfillOne(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (user.role !== Role.MECHANIC) {
      return { message: 'Usuário não é MECHANIC — nada a fazer.' };
    }

    const mech = await this.prisma.mechanic.findUnique({ where: { userId } });
    if (mech) {
      return { message: 'Mechanic já existe — nada a fazer.', userId };
    }

    await this.prisma.mechanic.create({
      data: {
        userId,
        specialty: 'Geral',
        photoUrl: '',
        isAvailable: true,
      },
    });

    return { message: 'Mechanic criado.', userId };
  }
}

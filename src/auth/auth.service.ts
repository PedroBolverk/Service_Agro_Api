import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(email: string, password: string) {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Credenciais inválidas');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new BadRequestException('Credenciais inválidas');

    const payload = { sub: user.id, role: user.role, fullName: user.fullName };
    const token = await this.jwt.signAsync(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    };
  }
}
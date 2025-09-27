import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

type JwtPayload = { sub: string; role: 'MECHANIC' | 'PRODUCER' };

@WebSocketGateway({
  namespace: '/ws/chat',
  cors: { origin: '*', credentials: false },
})
export class ChatGateway {
  @WebSocketServer() server: Server;
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private getUser(client: Socket): JwtPayload | null {
    const t = (client.handshake.auth as any)?.token;
    if (!t) return null;
    try {
      // ⬇⬇⬇ TIPADO (resolve "Type '{}' is missing ...")
      return this.jwt.verify<JwtPayload>(t, {
        secret: process.env.JWT_SECRET || 'supersecret',
      });
    } catch {
      return null;
    }
  }

  @SubscribeMessage('message:send')
  async onSend(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { solicitacaoServicoId: string; text: string }, // <- recebemos "text" do cliente
  ) {
    const u = this.getUser(client);
    if (!u) return client.emit('error', { message: 'unauthorized' });

    // valida payload
    if (!payload?.solicitacaoServicoId || typeof payload.text !== 'string' || !payload.text.trim()) {
      return client.emit('error', { message: 'payload inválido' });
    }

    const sol = await this.prisma.solicitacaoServicos.findUnique({
      where: { id: payload.solicitacaoServicoId },
      select: { id: true, producerId: true },
    });
    if (!sol) return client.emit('error', { message: 'solicitação inválida' });

    // autorização mínima: produtor da solicitação OU mecânico atribuído a ela
    const atrib = await this.prisma.atribuicaoServicos.findFirst({
      where: { solicitacaoServicoId: sol.id, mechanicId: u.sub },
      select: { id: true },
    });
    const isProducer = sol.producerId === u.sub;
    const isMechanic = !!atrib;
    if (!isProducer && !isMechanic) {
      return client.emit('error', { message: 'forbidden' });
    }

    // ⚠️ Prisma: o campo do modelo normalmente é "content", não "text".
    // Se no seu schema for "message" ou outro nome, troque aqui:
    const msg = await this.prisma.message.create({
      data: {
        solicitacaoServicoId: sol.id,
        senderId: u.sub,
        content: payload.text, // <-- ALTERADO de "text" para "content"
      },
      // opcional: include para retornar user ou timestamps
      // include: { sender: { select: { id: true, fullName: true } } }
    });

    this.server.to(`sol:${sol.id}`).emit('message:new', msg);
    return { ok: true };
  }

  @SubscribeMessage('room:join')
  async onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { solicitacaoServicoId: string },
  ) {
    if (!payload?.solicitacaoServicoId) {
      return client.emit('error', { message: 'solicitacaoServicoId é obrigatório' });
    }
    client.join(`sol:${payload.solicitacaoServicoId}`);
    return { ok: true };
  }
}

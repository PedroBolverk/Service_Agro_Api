import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

// Tipos para autenticação, localização e mecânicos
type JwtPayload = { sub: string; role: 'MECHANIC' | 'PRODUCER' };
type ClientAuth = { userId: string; role: 'MECHANIC' | 'PRODUCER' };
type NearbyItem = {
  userId: string;
  fullName?: string;
  email?: string;
  specialty?: string;
  lat: number;
  lng: number;
  isAvailable?: boolean;
  lastSeen?: number | null;
};

// Constantes para as chaves do Redis
const GEO_KEY = 'geo:mechanics';
const PRESENCE_KEY = (id: string) => `presence:mechanic:${id}`;
const MECH_HASH = (id: string) => `mechanic:${id}`;
const PRESENCE_TTL = 60; // segundos para considerar “online”

@WebSocketGateway({
  namespace: '/ws/location',
  cors: { origin: '*', credentials: false },
})
export class LocationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) { }

  // Helper para verificar autenticação
  private getAuth(client: Socket): ClientAuth | null {
    const token = (client.handshake.auth as any)?.token;
    if (!token) return null;
    try {
      const payload = this.jwt.verify<JwtPayload>(token, { secret: process.env.JWT_SECRET || 'supersecret' });
      const role = payload.role === 'MECHANIC' ? 'MECHANIC' : 'PRODUCER';
      return { userId: payload.sub, role };
    } catch (error) {
      console.log('[WS] Error verifying token', error);
      return null;
    }
  }

  // Verificar a role do usuário no banco de dados
  private async verifyUserRole(userId: string, expected: Role) {
    try {
      const u = await this.prisma.users.findUnique({ where: { id: userId }, select: { role: true } });
      return !!u && u.role === expected;
    } catch {
      return false;
    }
  }

  // Quando um usuário se conecta
  async handleConnection(client: Socket) {
    const auth = this.getAuth(client);
    if (!auth) {
      client.emit('error', { message: 'invalid auth (provide userId & role)' });
      console.log('[WS] Conexão recusada, sem token válido');
      return client.disconnect();
    }
    console.log(`[WS] Usuário conectado: ${auth.userId}, Role: ${auth.role}`);

    // Verificar se o usuário possui a role correta no banco de dados
    const ok = await this.verifyUserRole(auth.userId, auth.role as unknown as Role);
    if (!ok) {
      client.emit('error', { message: 'role mismatch' });
      return client.disconnect();
    }

    // Conectar o Produtor
    if (auth.role === 'PRODUCER') {
      client.join('producers');
      client.emit('connected', { ok: true, role: auth.role });
    }
    // Conectar o Mecânico
    else if (auth.role === 'MECHANIC') {
      const r = this.redis.getClient();
      await r.set(PRESENCE_KEY(auth.userId), '1', { EX: PRESENCE_TTL });
      await r.hSet(MECH_HASH(auth.userId), { isAvailable: '1' }); // Inicialmente disponível
      client.join(`mechanic:${auth.userId}`);
      client.emit('connected', { ok: true, role: auth.role });
    } else {
      client.emit('error', { message: 'Invalid role' });
      return client.disconnect();
    }
  }

  // Quando um usuário se desconecta
  async handleDisconnect(client: Socket) {
    const auth = this.getAuth(client);
    if (!auth || auth.role !== 'MECHANIC') return;
    console.log(`[WS] Mecânico desconectado: ${auth.userId}`);

    // Remover do Redis quando desconectar
    try {
      await this.redis.getClient().zRem(GEO_KEY, auth.userId);
    } catch (e) {
      console.error('[WS] Erro ao remover mecânico do Redis', e);
    }
  }

  // Atualiza a localização do mecânico
  @SubscribeMessage('loc:update')
  async onLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { lat: number; lng: number; isAvailable?: boolean },
  ) {
    const auth = this.getAuth(client);
    if (!auth || auth.role !== 'MECHANIC') return client.emit('error', { message: 'not a mechanic' });

    console.log('[WS] Atualizando localização do mecânico:', { lat: payload.lat, lng: payload.lng, userId: auth.userId });

    const r = this.redis.getClient();
    const { lat, lng, isAvailable } = payload || ({} as any);

    // Log antes de adicionar no Redis
    console.log('[WS] Adicionando no Redis:', { lat, lng, userId: auth.userId });

    try {
      await r.geoAdd(GEO_KEY, [{ longitude: lng, latitude: lat, member: auth.userId }]);
      console.log('[WS] Localização do mecânico adicionada ao Redis');
    } catch (e) {
      console.error('[WS] GEOADD failed', e);
    }

    const h: Record<string, string> = {
      lat: String(lat),
      lng: String(lng),
      lastSeen: String(Date.now()),
    };
    if (typeof isAvailable === 'boolean') h.isAvailable = isAvailable ? '1' : '0';

    await r.hSet(MECH_HASH(auth.userId), h);
    console.log('[WS] Dados do mecânico atualizados no Redis:', h);

    try {
      await r.set(PRESENCE_KEY(auth.userId), '1', { EX: PRESENCE_TTL });
    } catch (e) {
      console.error('[WS] SET presence failed', e);
    }

    // Emitir para TODOS os produtores
    this.server.to('producers').emit('mechanic:location', {
      userId: auth.userId,
      lat, lng, ts: Date.now(),
      isAvailable: h.isAvailable === '1',
    });

    console.log('[WS] Enviando localização para todos os produtores:', { userId: auth.userId, lat, lng, isAvailable: h.isAvailable === '1' });
    return { ok: true };
  }

  // Busca por mecânicos próximos (não filtrando por proximidade)
  @SubscribeMessage('nearby:search')
async onNearbySearch(
  @ConnectedSocket() client: Socket,
  @MessageBody() payload: { limit?: number },
) {
  const auth = this.getAuth(client);
  if (!auth || auth.role !== 'PRODUCER') {
    return client.emit('error', { message: 'not a producer' });
  }

  // Conectando ao cliente Redis
  const r = this.redis.getClient();

  // Pegando todos os mecânicos, sem filtro de proximidade
  const allMechanics = await this.prisma.mechanic.findMany({
    include: {
      user: { select: { id: true, fullName: true, email: true, phone: true } },
    },
  });

  // Juntar os dados de localização dos mecânicos no Redis
  const items: NearbyItem[] = [];
  for (const m of allMechanics) {
    const h = await r.hGetAll(MECH_HASH(m.userId));  // Pegando dados de localização do Redis
    const latNum = h.lat ? Number(h.lat) : null;
    const lngNum = h.lng ? Number(h.lng) : null;
    if (latNum == null || lngNum == null) continue;

    items.push({
      userId: m.userId,
      fullName: m.user.fullName,
      specialty: m.specialty,
      isAvailable: h.isAvailable === '1',
      lat: latNum,
      lng: lngNum,
      lastSeen: h.lastSeen ? Number(h.lastSeen) : null,
    });
  }

  // Enviando todos os mecânicos encontrados para o PRODUCER
  client.emit('nearby:result', { items });
  return { count: items.length };
}

}

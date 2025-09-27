import { Module } from '@nestjs/common';
import { LocationGateway } from '../gateways/location/location.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, RedisModule, AuthModule],
  providers: [LocationGateway],
  exports: [],
})
export class WsModule {}

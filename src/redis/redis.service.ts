import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async onModuleInit() {
    this.client = createClient({ url: process.env.REDIS_URL || 'redis://redis:6379' });
    this.client.on('error', (err) => console.error('[Redis] error', err));
    await this.client.connect();
    console.log('[Redis] connected');
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit();
  }

  getClient() {
    return this.client;
  }
}

import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private async connectWithRetry(retries = 20, delayMs = 1500) {
    let lastErr: any;
    for (let i = 1; i <= retries; i++) {
      try {
        await this.$connect();
        return;
      } catch (err) {
        lastErr = err;
        // eslint-disable-next-line no-console
        console.warn(`[Prisma] Conexão falhou (${i}/${retries}). Tentando de novo em ${delayMs}ms...`);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    throw lastErr;
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async enableShutdownHooks(app: INestApplication) {
    (this as any).$on?.('beforeExit', async () => {
      await app.close();
    });
  }
}

import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { createPrismaClient } from "@ai-auto-business/database";
import { environment } from "../config/env.js";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly client = createPrismaClient(environment.DATABASE_URL);

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}

import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module.js";
import { DatabaseModule } from "./database/database.module.js";
import { RbacModule } from "./rbac/rbac.module.js";
import { WorkflowsModule } from "./workflows/workflows.module.js";

@Module({
  imports: [DatabaseModule, AuthModule, RbacModule, WorkflowsModule],
})
export class AppModule {}

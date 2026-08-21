import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module.js";
import { CommandModule } from "./commands/command.module.js";
import { DatabaseModule } from "./database/database.module.js";
import { RbacModule } from "./rbac/rbac.module.js";
import { WorkflowsModule } from "./workflows/workflows.module.js";

@Module({
  imports: [DatabaseModule, AuthModule, RbacModule, WorkflowsModule, CommandModule],
})
export class AppModule {}

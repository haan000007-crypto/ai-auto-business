import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { RbacModule } from "../rbac/rbac.module.js";
import { CommandController } from "./command.controller.js";
import { CommandService } from "./command.service.js";

@Module({
  imports: [AuthModule, RbacModule],
  controllers: [CommandController],
  providers: [CommandService],
})
export class CommandModule {}

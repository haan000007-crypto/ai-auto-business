import { Module } from "@nestjs/common";
import { RbacGuard } from "./rbac.guard.js";

@Module({
  providers: [RbacGuard],
  exports: [RbacGuard],
})
export class RbacModule {}

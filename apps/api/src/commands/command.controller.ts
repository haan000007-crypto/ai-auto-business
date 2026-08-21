import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { AuthGuard, type AuthenticatedRequest } from "../auth/auth.guard.js";
import { RequirePermissions } from "../rbac/rbac.decorator.js";
import { RbacGuard } from "../rbac/rbac.guard.js";
import { CommandService } from "./command.service.js";

const commandSchema = z.object({
  command: z.string().trim().min(3).max(4_000),
});

@Controller("v1/commands")
@UseGuards(AuthGuard, RbacGuard)
export class CommandController {
  constructor(private readonly commands: CommandService) {}

  @Post("workflow")
  @RequirePermissions("workflow:write")
  async createWorkflow(
    @Body() body: unknown,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    const parsed = commandSchema.parse(body);
    if (!organizationId || !request.auth) {
      throw new Error("Authenticated organization context is required.");
    }

    return this.commands.createWorkflow({
      organizationId,
      userId: request.auth.userId,
      command: parsed.data.command,
    });
  }
}

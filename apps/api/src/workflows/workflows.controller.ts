import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard.js";
import { RbacGuard } from "../rbac/rbac.guard.js";
import { RequirePermissions } from "../rbac/rbac.decorator.js";
import { validateWorkflowDefinition } from "@ai-auto-business/workflow-engine";
import type { WorkflowDefinition } from "@ai-auto-business/workflow-engine";

@Controller("v1/workflows")
@UseGuards(AuthGuard, RbacGuard)
export class WorkflowsController {
  @Post("validate")
  @RequirePermissions("workflow:write")
  validate(@Body() definition: WorkflowDefinition) {
    return validateWorkflowDefinition(definition);
  }
}

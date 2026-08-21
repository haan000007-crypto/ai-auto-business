import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DatabaseService } from "../database/database.service.js";
import type { AuthenticatedRequest } from "../auth/auth.guard.js";
import { REQUIRED_PERMISSIONS } from "./rbac.decorator.js";

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly database: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const organizationId = request.headers["x-organization-id"];
    if (typeof organizationId !== "string" || !request.auth) {
      throw new ForbiddenException("Organization context is required.");
    }

    const membership = await this.database.client.membership.findUnique({
      where: {
        organizationId_userId: { organizationId, userId: request.auth.userId },
      },
      include: {
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      },
    });
    const granted = new Set(
      membership?.roles.flatMap((entry) =>
        entry.role.permissions.map((permission) => permission.permission.code),
      ) ?? [],
    );
    if (!required.every((permission) => granted.has(permission))) {
      throw new ForbiddenException("Insufficient permission.");
    }
    return true;
  }
}

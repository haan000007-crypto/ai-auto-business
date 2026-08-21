import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { DatabaseService } from "../database/database.service.js";
import { hashToken } from "./auth.service.js";

export interface AuthenticatedRequest extends Request {
  auth?: { userId: string; sessionId: string };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly database: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) throw new UnauthorizedException("Missing bearer token.");

    const session = await this.database.client.session.findFirst({
      where: {
        tokenHash: hashToken(token),
        revokedAt: null,
        expiresAt: { gt: new Date() },
        user: { status: "ACTIVE" },
      },
    });
    if (!session) throw new UnauthorizedException("Invalid or expired session.");

    request.auth = { userId: session.userId, sessionId: session.id };
    return true;
  }
}

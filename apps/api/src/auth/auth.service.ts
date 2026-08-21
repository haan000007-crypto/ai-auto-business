import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as argon2 from "argon2";
import { createHash, randomBytes } from "node:crypto";
import { DatabaseService } from "../database/database.service.js";
import { environment } from "../config/env.js";

type RegisterInput = { email: string; password: string; displayName?: string };
type LoginInput = { email: string; password: string };
type SessionResult = { userId: string; accessToken: string; expiresAt: Date };

@Injectable()
export class AuthService {
  constructor(private readonly database: DatabaseService) {}

  async register(input: RegisterInput): Promise<SessionResult> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.database.client.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException("Email is already registered.");

    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    const user = await this.database.client.user.create({
      data: {
        email,
        displayName: input.displayName?.trim() || null,
        accounts: {
          create: {
            provider: "credentials",
            providerAccountId: email,
            passwordHash,
          },
        },
      },
    });
    return this.issueSession(user.id);
  }

  async login(input: LoginInput): Promise<SessionResult> {
    const email = input.email.trim().toLowerCase();
    const account = await this.database.client.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "credentials",
          providerAccountId: email,
        },
      },
      include: { user: true },
    });
    if (!account?.passwordHash || account.user.status !== "ACTIVE") {
      throw new UnauthorizedException("Invalid email or password.");
    }
    if (!(await argon2.verify(account.passwordHash, input.password))) {
      throw new UnauthorizedException("Invalid email or password.");
    }
    return this.issueSession(account.userId);
  }

  async revoke(accessToken: string): Promise<void> {
    await this.database.client.session.updateMany({
      where: { tokenHash: hashToken(accessToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueSession(userId: string): Promise<SessionResult> {
    const accessToken = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + environment.SESSION_TTL_HOURS * 60 * 60 * 1000);
    await this.database.client.session.create({
      data: { userId, tokenHash: hashToken(accessToken), expiresAt },
    });
    return { userId, accessToken, expiresAt };
  }
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

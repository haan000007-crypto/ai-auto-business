import { Body, Controller, HttpCode, Post, UnauthorizedException } from "@nestjs/common";
import { z } from "zod";
import { AuthService } from "./auth.service.js";

const credentialsSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(12).max(256),
});
const registrationSchema = credentialsSchema.extend({
  displayName: z.string().trim().min(1).max(120).optional(),
});

@Controller("v1/auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  register(@Body() body: unknown) {
    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) throw new UnauthorizedException("Invalid registration input.");
    return this.auth.register(parsed.data);
  }

  @HttpCode(200)
  @Post("login")
  login(@Body() body: unknown) {
    const parsed = credentialsSchema.safeParse(body);
    if (!parsed.success) throw new UnauthorizedException("Invalid credentials.");
    return this.auth.login(parsed.data);
  }
}

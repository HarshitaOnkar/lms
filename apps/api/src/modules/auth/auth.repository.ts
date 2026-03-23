import type { PrismaClient } from "@prisma/client";

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createUser(params: { email: string; password_hash: string; name: string }) {
    return this.prisma.users.create({ data: params });
  }

  async findUserByEmail(email: string) {
    return this.prisma.users.findUnique({ where: { email } });
  }

  async createRefreshToken(params: {
    user_id: number;
    token_hash: string;
    expires_at: Date;
  }) {
    return this.prisma.refresh_tokens.create({ data: params });
  }

  async findRefreshTokenByHash(token_hash: string) {
    return this.prisma.refresh_tokens.findUnique({ where: { token_hash } });
  }

  async revokeRefreshToken(token_hash: string) {
    return this.prisma.refresh_tokens.update({
      where: { token_hash },
      data: { revoked_at: new Date() }
    });
  }

  async revokeAllRefreshTokensForUser(user_id: number) {
    return this.prisma.refresh_tokens.updateMany({
      where: { user_id, revoked_at: null },
      data: { revoked_at: new Date() }
    });
  }
}

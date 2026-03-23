import type { PrismaClient } from "@prisma/client";

import { HttpError } from "../../middleware/errorHandler";

export class UsersService {
  constructor(private readonly prisma: PrismaClient) {}

  async me(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    });
    if (!user) throw new HttpError(404, "User not found");
    return user;
  }
}

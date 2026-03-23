import type { NextFunction, Request, Response } from "express";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError
} from "@prisma/client/runtime/library";
import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function mapPrismaError(err: unknown): { status: number; message: string; details?: unknown } | null {
  if (err instanceof PrismaClientInitializationError) {
    return {
      status: 503,
      message:
        "Database is unavailable. Check DATABASE_URL in apps/api/.env, MySQL is running (e.g. docker compose up -d), and run prisma migrate.",
      details: { code: err.errorCode }
    };
  }

  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === "P1001") {
      return {
        status: 503,
        message:
          "Cannot reach MySQL. Start local MySQL (see README / docker-compose.yml), verify DATABASE_URL host and port, then run prisma migrate.",
        details: { code: err.code }
      };
    }
    if (err.code === "P2002") {
      return {
        status: 409,
        message: "A record with this value already exists.",
        details: { code: err.code, meta: err.meta }
      };
    }
    return {
      status: 400,
      message: "Database request failed.",
      details: { code: err.code, meta: err.meta }
    };
  }

  return null;
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message,
      details: err.details
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      details: err.flatten()
    });
  }

  const prismaMapped = mapPrismaError(err);
  if (prismaMapped) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(prismaMapped.status).json({
      message: prismaMapped.message,
      details: prismaMapped.details
    });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
}

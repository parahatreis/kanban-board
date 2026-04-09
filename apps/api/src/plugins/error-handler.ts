import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { HttpError } from "../lib/errors.js";

export async function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof ZodError) {
      return reply.status(400).send({
        error: {
          message: "Invalid request",
          issues: err.flatten(),
        },
      });
    }

    if (err instanceof HttpError) {
      return reply.status(err.statusCode).send({
        error: {
          message: err.message,
          ...(err.code ? { code: err.code } : {}),
        },
      });
    }

    const statusCode =
      typeof err === "object" &&
      err !== null &&
      "statusCode" in err &&
      typeof (err as { statusCode: unknown }).statusCode === "number"
        ? (err as { statusCode: number }).statusCode
        : 500;
    if (statusCode >= 400 && statusCode < 500) {
      return reply.status(statusCode).send({
        error: {
          code: "CLIENT_ERROR",
          message: err instanceof Error ? err.message : "Error",
        },
      });
    }

    app.log.error(err);
    return reply.status(500).send({
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal Server Error",
      },
    });
  });
}

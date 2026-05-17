import pino from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";

const transport = isDevelopment
  ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        singleLine: false,
      },
    }
  : undefined;

export const logger = pino({
  level: isDevelopment ? "debug" : "info",
  transport,
  base: { env: process.env.NODE_ENV },
  redact: {
    paths: [
      "password",
      "passwordHash",
      "token",
      "accessToken",
      "refreshToken",
      "authorization",
      "*.password",
      "*.token",
      "req.headers.authorization",
    ],
    censor: "[REDACTED]",
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: (req) => ({
      method: req.method,
      url: req.url,
      path: req.path,
      headers: {
        host: req.headers.host,
        "user-agent": req.headers["user-agent"],
        "content-type": req.headers["content-type"],
      },
    }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const createChildLogger = (bindings: Record<string, unknown>) =>
  logger.child(bindings);

export type Logger = typeof logger;

import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";

const app: Express = express();

// Security Headers
app.use(helmet());

// Rate Limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// Secure CORS
app.use(cors({ 
  credentials: true, 
  origin: process.env.FRONTEND_URL || "http://localhost:5173" 
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isClerkEnabled = process.env.CLERK_SECRET_KEY &&
  process.env.CLERK_SECRET_KEY !== "[YOUR-CLERK-SECRET-KEY]" &&
  process.env.CLERK_SECRET_KEY.trim() !== "";

if (isClerkEnabled) {
  app.use(
    clerkMiddleware((req) => ({
      publishableKey: publishableKeyFromHost(
        getClerkProxyHost(req) ?? "",
        process.env.CLERK_PUBLISHABLE_KEY,
      ),
    })),
  );
} else {
  logger.warn("Clerk Secret Key is missing or placeholder. Running in mock/bypass auth mode with user 'mock_user_id'.");
  app.use((req: any, _res, next) => {
    req.auth = { userId: "mock_user_id" };
    next();
  });
}

// Serve legacy uploaded files statically under /api/uploads
app.use("/api/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.use("/api", router);

// Global error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err }, "Application error");
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
  });
});

export default app;

import express, { type Request, Response, NextFunction } from "express";
import http from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// health route (very important for Coolify)
app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

// CRITICAL: Webhook must use raw body parser BEFORE global JSON parser
app.use('/api/payments/webhook', (req, res, next) => {
  if (req.method === 'POST') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // SECURITY: Log only method, path, status, duration - NO response bodies to prevent token leakage
      const logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // create a real HTTP server and pass to setupVite (HMR needs it in dev)
    const server = http.createServer(app);

    // registerRoutes should register endpoints on the Express `app`.
    // It does NOT need to return a server — but if it does return one, we respect it.
    // If your existing registerRoutes returns a server, prefer that; otherwise proceed.
    const maybeServer = await registerRoutes(app);
    // If registerRoutes returns an http.Server, use it; otherwise use the created server
    const httpServer = (maybeServer as unknown as http.Server) || server;

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      // still log the error server-side
      console.error("Unhandled error:", err);
    });

    // development vs production static serving
    if (app.get("env") === "development") {
      await setupVite(app, httpServer);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    const port = parseInt(process.env.PORT || '5000', 10);
    httpServer.listen({
      port,
      host: "0.0.0.0",
      // reusePort: true, // optional; some environments don't support reusePort
    }, () => {
      log(`serving on port ${port}`);
    });

  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
})();

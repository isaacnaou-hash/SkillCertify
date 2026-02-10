import express, { Request, Response, NextFunction } from "express";
import http from "http";
import compression from "compression";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite"; // ✅ static serving imported directly
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ──────────────────────────────
   🩺  DIAGNOSTIC LOGS (SAFE)
────────────────────────────── */
console.log("\n--- DIAGNOSTIC LOG START ---");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Database URL present:", !!process.env.DATABASE_URL);
const paystackKey = process.env.PAYSTACK_SECRET_KEY;
console.log(
  "PAYSTACK_SECRET_KEY:",
  paystackKey ? `SET (${paystackKey.length} chars)` : "UNDEFINED/EMPTY"
);
console.log("VITE_PAYSTACK_PUBLIC_KEY:", process.env.VITE_PAYSTACK_PUBLIC_KEY);
console.log("PAYSTACK_PUBLIC_KEY:", process.env.PAYSTACK_PUBLIC_KEY);
console.log("--- DIAGNOSTIC LOG END ---\n");

/* ──────────────────────────────
   ✅  HEALTH CHECK (for Coolify)
────────────────────────────── */
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).type("text/plain").send("OK");
});

/* ──────────────────────────────
   ✅  PAYSTACK WEBHOOK (raw JSON)
────────────────────────────── */
app.use("/api/payments/webhook", (req, res, next) => {
  if (req.method === "POST") {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    next();
  }
});

/* ──────────────────────────────
   ✅  BODY PARSERS
────────────────────────────── */
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ──────────────────────────────
   ✅  REQUEST LOGGER
────────────────────────────── */
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      const line = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;
      log(line);
    }
  });
  next();
});

/* ──────────────────────────────
   ✅  MAIN STARTUP FUNCTION
────────────────────────────── */
(async () => {
  try {
    const server = http.createServer(app);

    // Register API routes
    await registerRoutes(app);

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || 500;
      const message = err.message || "Internal Server Error";
      console.error("Unhandled error:", err);
      res.status(status).json({ message });
    });

    /* ────────────
       🔹 ENV-SAFE VITE SETUP
       (Dynamic import only in dev)
    ───────────── */
    if (process.env.NODE_ENV === "development") {
      const { setupVite } = await import("./vite.js"); // ✅ only loaded in dev
      await setupVite(app, server);
    } else {
      serveStatic(app); // ✅ production: serve built client
    }

    /* ────────────
       ✅ START SERVER
    ───────────── */
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(port, "0.0.0.0", () => {
      log(`✅ Server running on port ${port}`);
    });

  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
})();

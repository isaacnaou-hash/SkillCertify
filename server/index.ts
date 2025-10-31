import express, { Request, Response, NextFunction } from "express";
import http from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// --- START: TEMPORARY DIAGNOSTIC LOGGING ---
console.log('\n--- DIAGNOSTIC LOG START ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Database URL presence:', !!process.env.DATABASE_URL);

// Log the specific secret key and its length
const paystackKey = process.env.PAYSTACK_SECRET_KEY;
console.log('PAYSTACK_SECRET_KEY (Value):', paystackKey ? 'SET (' + paystackKey.length + ' chars)' : 'UNDEFINED/EMPTY');
console.log('PAYSTACK_SECRET_KEY (First 8 chars):', paystackKey ? paystackKey.substring(0, 8) : 'N/A');

// Log the public key to check for case sensitivity
console.log('VITE_PAYSTACK_PUBLIC_KEY:', process.env.VITE_PAYSTACK_PUBLIC_KEY);
console.log('PAYSTACK_PUBLIC_KEY:', process.env.PAYSTACK_PUBLIC_KEY);

// Log all environment variables (filtered for privacy)
console.log('\n--- ALL ENV KEYS (FILTERED) ---');
for (const key in process.env) {
    if (key.includes('SECRET') || key.includes('TOKEN') || key.includes('KEY') || key.includes('PASSWORD')) {
        // Log just the keys for secrets, not the values
        console.log(`Found SECRET key: ${key}`);
    }
}
console.log('--- DIAGNOSTIC LOG END ---\n');
// --- END: TEMPORARY DIAGNOSTIC LOGGING ---


/* 
  ✅ Health Check (MUST be first)
  Coolify uses this to detect if the service is healthy.
*/
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).type("text/plain").send("OK");
});

/*
  ✅ Paystack Webhook (raw body before global JSON parsing)
*/
app.use("/api/payments/webhook", (req, res, next) => {
  if (req.method === "POST") {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/*
  ✅ Request logging (safe)
*/
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      log(logLine);
    }
  });

  next();
});

/*
  ✅ Main async block
*/
(async () => {
  try {
    const server = http.createServer(app);

    // Register backend API routes
    await registerRoutes(app);

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || 500;
      const message = err.message || "Internal Server Error";
      console.error("Unhandled error:", err);
      res.status(status).json({ message });
    });

    // Serve static files (frontend)
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    /*
      ✅ Start the server
      Listen on port 5000 (or PORT from env)
      Ensure it binds to 0.0.0.0 for Coolify
    */
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(port, "0.0.0.0", () => {
      log(`✅ Server running on port ${port}`);
    });

  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }

import express, { Request, Response, NextFunction } from "express";
import http from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
// CRITICAL FIX: Import the payment service here. This executes the initialization
// logic within that file immediately upon server startup. If the key is bad,
// this import will trigger the 'process.exit(1)' defined in the paymentService,
// preventing the server from running in a broken state.
// --- FIX APPLIED: Reverted to lowercase and added explicit .ts extension. ---
import "./services/paymentService.ts"; // <<<<<<<<< CORRECTED LINE

const app = express();

// --- START: TEMPORARY DIAGNOSTIC LOGGING ---
console.log('\n--- DIAGNOSTIC LOG START ---');
// ... (rest of the diagnostic logging code)
// ...
// ...
console.log('--- DIAGNOSTIC LOG END ---\n');
// --- END: TEMPORARY DIAGNOSTIC LOGGING ---


/* ✅ Health Check (MUST be first)
// ... (rest of the health check code)
// ...
// ...
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).type("text/plain").send("OK");
});

/*
  ✅ Paystack Webhook (raw body before global JSON parsing)
// ... (rest of the webhook code)
// ...
// ...
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/*
  ✅ Request logging (safe)
// ... (rest of the request logging code)
// ...
// ...
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
})();

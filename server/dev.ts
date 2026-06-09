/**
 * Local dev server — wraps the Vercel API handler in Express.
 * Only used for `npm run dev`. Not deployed to Vercel.
 */
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: false, limit: "20mb" }));

// Dynamically import the handler (ESM-compatible)
const { default: handler } = await import("../api/index.js");

// Mount all /api/* routes to the handler
app.all("/api/*", (req, res) => {
  // Normalize url to match what Vercel passes (without the base path)
  return handler(req as any, res as any);
});

const port = parseInt(process.env.PORT || "5000", 10);
const httpServer = createServer(app);

// In dev, Vite runs separately via vite.config.ts proxy → port 5000
httpServer.listen({ port, host: "0.0.0.0" }, () => {
  console.log(`[API] dev server on port ${port}`);
});

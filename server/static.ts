import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// аналог __dirname для ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  // dist/public относительно папки server
  const distPath = path.resolve(__dirname, "../dist/public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Build not found at ${distPath}. Did you run vite build?`
    );
  }

  app.use(express.static(distPath));

  app.get("/*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

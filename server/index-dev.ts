import { type Server } from "node:http";
import { type Express } from "express";
import { createServer as createViteServer } from "vite";
import runApp from "./app";

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "spa",
  });

  app.use(vite.middlewares);
}

(async () => {
  await runApp(setupVite);
})();

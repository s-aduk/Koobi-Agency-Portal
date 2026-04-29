import express from "express";
import path from "node:path";
import { createServer as createViteServer } from "vite";
import { readStore, createProject, updateApprovalStatus } from "./src/lib/store.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/dashboard", (req, res) => {
    try {
      const data = readStore();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to read store" });
    }
  });

  app.post("/api/projects", (req, res) => {
    const { name, clientId, status, dueDate, budget, description } = req.body;
    
    if (!name || !clientId || !status || !dueDate || budget === undefined) {
      return res.status(400).json({ message: "Invalid project payload." });
    }

    try {
      const project = createProject({
        name,
        clientId,
        status,
        dueDate,
        budget,
        description
      });
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/approvals/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "approved", "changes"].includes(status)) {
      return res.status(400).json({ message: "Invalid approval status." });
    }

    try {
      const approval = updateApprovalStatus(id, status);
      res.json(approval);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update approval";
      res.status(error instanceof Error && error.message === 'Approval not found' ? 404 : 500).json({ message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

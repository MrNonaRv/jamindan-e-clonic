import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const db = new Database("clinic.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT,
    recovery_question TEXT,
    recovery_answer TEXT
  )
`);

// Seed default user if not exists
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (username, password, name, role, recovery_question, recovery_answer) VALUES (?, ?, ?, ?, ?, ?)").run(
    "admin",
    "password123",
    "BHW Maria",
    "Barangay Health Worker",
    "What is your favorite color?",
    "emerald"
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, user: userWithoutPassword });
    } else {
      res.status(401).json({ success: false, message: "Invalid username or password" });
    }
  });

  app.get("/api/forgot-password", (req, res) => {
    const { username } = req.query;
    const user = db.prepare("SELECT recovery_question FROM users WHERE username = ?").get(username) as any;
    
    if (user) {
      res.json({ success: true, question: user.recovery_question });
    } else {
      res.status(404).json({ success: false, message: "Username not found" });
    }
  });

  app.post("/api/reset-password", (req, res) => {
    const { username, answer, newPassword } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
    
    if (!user) {
      return res.status(404).json({ success: false, message: "Username not found" });
    }
    
    if (user.recovery_answer?.toLowerCase() === answer?.toLowerCase()) {
      db.prepare("UPDATE users SET password = ? WHERE username = ?").run(newPassword, username);
      res.json({ success: true, message: "Password reset successfully" });
    } else {
      res.status(401).json({ success: false, message: "Incorrect recovery answer" });
    }
  });

  app.get("/api/user", (req, res) => {
    // In a real app, we'd use sessions/JWT. For this demo, we'll just return the first user.
    const user = db.prepare("SELECT id, username, name, role, recovery_question, recovery_answer FROM users LIMIT 1").get() as any;
    res.json(user);
  });

  app.put("/api/user", (req, res) => {
    const { username, password, name, recoveryQuestion, recoveryAnswer } = req.body;
    try {
      let query = "UPDATE users SET username = ?, name = ?";
      let params = [username, name];
      
      if (password) {
        query += ", password = ?";
        params.push(password);
      }

      if (recoveryQuestion) {
        query += ", recovery_question = ?";
        params.push(recoveryQuestion);
      }

      if (recoveryAnswer) {
        query += ", recovery_answer = ?";
        params.push(recoveryAnswer);
      }
      
      query += " WHERE id = (SELECT id FROM users LIMIT 1)";
      
      const result = db.prepare(query).run(...params);
      
      if (result.changes > 0) {
        res.json({ success: true, message: "Profile updated successfully" });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    } catch (error: any) {
      if (error.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ success: false, message: "Username already taken" });
      } else {
        console.error("Update error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.get("/api/check-username", (req, res) => {
    const { username, excludeId } = req.query;
    const user = db.prepare("SELECT id FROM users WHERE username = ? AND id != ?").get(username, excludeId || 0);
    res.json({ available: !user });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

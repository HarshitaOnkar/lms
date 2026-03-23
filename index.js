const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

const users = [];
const sessions = new Map();
let nextUserId = 1;

app.use(express.json());
app.use(
  cors({
    origin: (origin, cb) => cb(null, origin || true),
    credentials: true
  })
);

function getAuthToken(req) {
  const header = req.headers.authorization || "";
  if (!header.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim() || null;
}

function authRequired(req, res, next) {
  const token = getAuthToken(req);
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.userId = sessions.get(token);
  return next();
}

app.get("/", (_req, res) => {
  res.send("API working");
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (users.some((u) => u.email === normalizedEmail)) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const user = {
    id: nextUserId++,
    name: String(name).trim(),
    email: normalizedEmail,
    password: String(password)
  };
  users.push(user);
  return res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const user = users.find((u) => u.email === normalizedEmail && u.password === String(password || ""));
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const token = crypto.randomUUID();
  sessions.set(token, user.id);
  return res.json({
    access_token: token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

app.post("/api/auth/logout", authRequired, (req, res) => {
  const token = getAuthToken(req);
  if (token) sessions.delete(token);
  return res.status(204).send();
});

app.post("/api/auth/refresh", (_req, res) => {
  return res.status(401).json({ message: "Refresh token flow is not configured" });
});

app.get("/api/users/me", authRequired, (req, res) => {
  const user = users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ id: user.id, name: user.name, email: user.email });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port", PORT));

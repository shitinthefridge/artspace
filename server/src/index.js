import "dotenv/config";
import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// ── Routes ──
app.use("/api/health", healthRouter);
// Future routes:
// app.use("/api/auth",     authRouter);
// app.use("/api/users",    usersRouter);
// app.use("/api/artworks", artworksRouter);
// app.use("/api/likes",    likesRouter);
// app.use("/api/comments", commentsRouter);

// ── Start ──
app.listen(PORT, () => {
  console.log(`🎨 Artspace server running on http://localhost:${PORT}`);
});

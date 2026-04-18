import "dotenv/config";
import http from "http";
import path from "path";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import catalogRoutes from "./routes/catalog";
import cartRoutes from "./routes/cart";
import { authMiddleware } from "./middleware/auth";
import { createOrderCancelHandler, createOrdersRouter } from "./routes/orders";
import { createTailorRouter } from "./routes/tailor";
import { createAdminRouter } from "./routes/admin";
import favoritesRoutes from "./routes/favorites";
import reviewsRoutes from "./routes/reviews";
import recommendationsRoutes from "./routes/recommendations";
import billingRoutes from "./routes/billing";
import { attachSocket } from "./socket";
import { buildCorsOptions } from "./lib/corsConfig";

const app = express();
const server = http.createServer(app);

const io = attachSocket(server);

app.use(cors(buildCorsOptions()));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (_req, res) => res.json({ ok: true, service: "atelier-api" }));

const api = express.Router();
api.get("/health", (_req, res) => res.json({ ok: true }));
api.use("/auth", authRoutes);
api.use("/catalog", catalogRoutes);
api.use("/cart", cartRoutes);
api.patch(
  "/orders/:id/cancel",
  authMiddleware,
  createOrderCancelHandler(io)
);
api.use("/orders", createOrdersRouter(io));
api.use("/tailor", createTailorRouter(io));
api.use("/admin", createAdminRouter(io));
api.use("/favorites", favoritesRoutes);
api.use("/reviews", reviewsRoutes);
api.use("/recommendations", recommendationsRoutes);
api.use("/billing", billingRoutes);
app.use("/api", api);

const port = Number(process.env.PORT ?? 4000);
server.listen(port, () => {
  console.log(`ATELIER API + Socket.io → http://localhost:${port}`);
});

import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "../lib/jwt";
import type { Role } from "@prisma/client";
import { buildCorsOptions } from "../lib/corsConfig";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

export type IoServer = Server;

export function attachSocket(httpServer: HttpServer) {
  const corsOpts = buildCorsOptions();
  const io = new Server(httpServer, {
    cors: {
      origin: corsOpts.origin,
      credentials: corsOpts.credentials ?? true,
      methods: corsOpts.methods,
    },
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ??
        socket.handshake.headers.authorization?.replace("Bearer ", "");
      if (!token || typeof token !== "string") {
        return next(new Error("Unauthorized"));
      }
      const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
      (socket.data as { user: JwtPayload }).user = payload;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket.data as { user: JwtPayload }).user;

    socket.on("tailor:join", (categoryId: string) => {
      if (user.role !== "TAILOR") return;
      const room = tailorRoom(categoryId);
      socket.join(room);
      console.log("[socket] tailor:join user=%s room=%s", user.sub, room);
    });

    socket.on("tailor:leave", (categoryId: string) => {
      socket.leave(tailorRoom(categoryId));
    });

    socket.on("client:subscribe-order", (orderId: string) => {
      if (user.role !== "CLIENT" && user.role !== "ADMIN") return;
      socket.join(orderRoom(orderId));
    });

    socket.on("client:join-self", () => {
      if (user.role === "CLIENT") {
        socket.join(clientRoom(user.sub));
      }
    });
  });

  return io;
}

export function tailorRoom(categoryId: string) {
  return `tailor-cat:${categoryId}`;
}

export function orderRoom(orderId: string) {
  return `order:${orderId}`;
}

export function clientRoom(userId: string) {
  return `client:${userId}`;
}

export function emitOrderBroadcast(io: IoServer, categoryId: string, payload: unknown) {
  const room = tailorRoom(categoryId);
  console.log("[socket] emit order:new room=%s", room);
  io.to(room).emit("order:new", payload);
}

export function emitOrderTaken(
  io: IoServer,
  categoryId: string,
  payload: { orderId: string }
) {
  const room = tailorRoom(categoryId);
  console.log("[socket] emit order:taken room=%s orderId=%s", room, payload.orderId);
  io.to(room).emit("order:taken", payload);
}

export function emitOrderStatus(
  io: IoServer,
  orderId: string,
  payload: { status: string }
) {
  io.to(orderRoom(orderId)).emit("order:status", payload);
}

/** Notify tailors (category room), subscribed client order view, and client orders list. */
export function emitOrderDeleted(
  io: IoServer,
  params: { categoryId: string; clientId: string; orderId: string }
) {
  const { categoryId, clientId, orderId } = params;
  const payload = { orderId, categoryId };
  io.to(tailorRoom(categoryId)).emit("order:deleted", payload);
  io.to(orderRoom(orderId)).emit("order:deleted", payload);
  io.to(clientRoom(clientId)).emit("order:deleted", payload);
}

/** Client cancelled a pending order — same reach as order:deleted for live lists. */
export function emitOrderCancelled(
  io: IoServer,
  params: { categoryId: string; clientId: string; orderId: string }
) {
  const { categoryId, clientId, orderId } = params;
  const payload = { orderId, categoryId, status: "CANCELLED" as const };
  io.to(tailorRoom(categoryId)).emit("order:cancelled", payload);
  io.to(orderRoom(orderId)).emit("order:cancelled", payload);
  io.to(clientRoom(clientId)).emit("order:cancelled", payload);
}

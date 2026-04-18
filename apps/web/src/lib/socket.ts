"use client";

import { io, type Socket } from "socket.io-client";

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000";

export function createSocket(token: string): Socket {
  return io(WS_BASE, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
  });
}

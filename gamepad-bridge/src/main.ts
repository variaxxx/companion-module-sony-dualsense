import { DualsenseBridge } from "./bridge.js";

export function bootstrap(): DualsenseBridge {
  process.loadEnvFile();
  const host = process.env.WS_HOST;
  const port = process.env.WS_PORT;
  const secret = process.env.WS_SECRET;
  if (!host || !port || !secret)
    throw new Error("WebSocket host, port or secret is not configured");

  return new DualsenseBridge(`ws://${host}:${port}/?token=${secret}`);
}

bootstrap();

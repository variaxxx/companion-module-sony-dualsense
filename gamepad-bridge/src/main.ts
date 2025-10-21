import { DualsenseBridge } from "./bridge.js";

export function bootstrap(): DualsenseBridge {
  process.loadEnvFile();
  const host = process.env.WS_HOST;
  const port = process.env.WS_PORT;
  if (!host || !port)
    throw new Error("WebSocket host or port is not configured");

  return new DualsenseBridge(`ws://${host}:${port}/`);
}

bootstrap();

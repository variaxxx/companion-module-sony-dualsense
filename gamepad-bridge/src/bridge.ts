import { DualsenseButton, DualsenseButtons } from "./buttons.js";
import { logger } from "./logger.js";
import { Dualsense } from "dualsense-ts";
import { WebSocket } from "ws";

export interface IncomingMessage {
  code: number;
  type: "error" | "message";
  message: string;
}

export interface OutgoingMessage {
  code: number;
  type: "error" | "message" | "buttonPress";
  message: string;
}

export class DualsenseBridge {
  private ws!: WebSocket;
  private dualsense!: Dualsense;

  private wsPath: string;
  private retryDelay: number = 1000;

  constructor(wsPath: string) {
    this.wsPath = wsPath;

    this.setupWs();
    this.setupDualsenseEvents();
  }

  private setupWs(): void {
    try {
      this.ws.removeAllListeners();
      this.ws.terminate();
    } catch {}

    this.ws = new WebSocket(this.wsPath);

    this.ws.on("open", () => {
      this.sendMessage({
        code: 200,
        type: "message",
        message: "Connection established",
      });
    });

    this.ws.on("message", (data) => {
      const obj: IncomingMessage = JSON.parse(data.toString());

      if (obj.type === "message") {
        logger.info(`Received message: ${obj.message}`);
      } else if (obj.type === "error") {
        if (obj.code === 401) {
          logger.error("Wrong token provided, edit environment and try again");
          process.exit(1);
        } else {
          logger.error(`Received error: ${obj.message}`);
        }
      }
    });

    this.ws.on("error", (err: any) => {
      if (err.code !== "ECONNREFUSED") {
        logger.error(err);
      }
    });

    this.ws.on("close", () => {
      logger.error(`WebSocket connection closed, reconnecting in ${this.retryDelay / 1000}s...`);
      setTimeout(() => {
        this.setupWs();
        this.retryDelay = Math.min(this.retryDelay * 2, 10000);
      }, this.retryDelay);
    });
  }

  private setupDualsenseEvents(): void {
    this.dualsense = new Dualsense();

    this.dualsense.connection.on("change", ({ active }) => {
      logger.info(`Controller ${active ? "" : "dis"}connected`);
    });

    for (const mainButton of Object.values(DualsenseButtons.Main) as DualsenseButton[]) {
      (this.dualsense as any)[mainButton].on("press", () => this.handleButtonPress(mainButton));
    }

    for (const dpadButton of Object.values(DualsenseButtons.DPad) as DualsenseButton[]) {
      const direction = dpadButton.split("_")[1];
      (this.dualsense.dpad as any)[direction].on("press", () => this.handleButtonPress(dpadButton));
    }

    for (const systemButton of Object.values(DualsenseButtons.System) as DualsenseButton[]) {
      (this.dualsense as any)[systemButton].on("press", () => this.handleButtonPress(systemButton));
    }

    for (const side of ["left", "right"]) {
      (this.dualsense as any)[side].bumper.on("press", () => this.handleButtonPress(
        side === "left"
          ? DualsenseButtons.Triggers.L1
          : DualsenseButtons.Triggers.R1,
      ));

      (this.dualsense as any)[side].trigger.on("press", () => this.handleButtonPress(
        side === "left"
          ? DualsenseButtons.Triggers.L2
          : DualsenseButtons.Triggers.R2,
      ));

      // this.dualsense.left.analog.on("press", () => console.log("l3"));
    }
  }

  private handleButtonPress(button: DualsenseButton): void {
    logger.info(`Pressed: ${button}`);
    if (this.ws.readyState === WebSocket.OPEN) {
      this.sendMessage({
        code: 200,
        type: "buttonPress",
        message: button,
      });
    } else {
      logger.warn("WebSocket connection is closed");
    }
  }

  private sendMessage(message: OutgoingMessage): void {
    this.ws.send(JSON.stringify(message));
  }
}

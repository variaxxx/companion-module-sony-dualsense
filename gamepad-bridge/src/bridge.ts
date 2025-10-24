import { DualsenseButton, DualsenseButtons } from "./buttons.js";
import { logger } from "./logger.js";
import { Dualsense } from "dualsense-ts";
import throttle from "lodash.throttle";
import { WebSocket } from "ws";

export interface IncomingMessage {
  code: number;
  type: "error" | "message";
  message: string;
}

export interface OutgoingMessage {
  code: number;
  type: "error" | "message" | "button";
  message?: string;
  data?: {
    button: DualsenseButton;
    x?: number;
    y?: number;
    direction?: number;
  };
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
      (this.dualsense as any)[mainButton].on("press", () => this.handleButtonEvent(mainButton));
    }

    for (const dpadButton of Object.values(DualsenseButtons.DPad) as DualsenseButton[]) {
      const direction = dpadButton.split("_")[1];
      (this.dualsense.dpad as any)[direction].on("press", () => this.handleButtonEvent(dpadButton));
    }

    for (const systemButton of Object.values(DualsenseButtons.System) as DualsenseButton[]) {
      (this.dualsense as any)[systemButton].on("press", () => this.handleButtonEvent(systemButton));
    }

    for (const side of ["left", "right"]) {
      (this.dualsense as any)[side].bumper.on("press", () => this.handleButtonEvent(
        side === "left"
          ? DualsenseButtons.Triggers.L1
          : DualsenseButtons.Triggers.R1,
      ));

      (this.dualsense as any)[side].trigger.on("change", (obj: any) => this.handleButtonEventWithThrottling(
        side === "left"
          ? DualsenseButtons.Triggers.L2
          : DualsenseButtons.Triggers.R2,
        { x: obj.state },
      ));

      (this.dualsense as any)[side].analog.on("change", (obj: any, x: any) => this.handleButtonEventWithThrottling(
        side === "left"
          ? DualsenseButtons.Sticks.L3
          : DualsenseButtons.Sticks.R3,
        { x: x.state, direction: obj.direction },
      ));
    }

    this.dualsense.touchpad.on("change", (touchpad) => {
      this.handleButtonEventWithThrottling(
        DualsenseButtons.System.Touchpad,
        {
          x: touchpad.left.x.state,
          y: touchpad.left.y.state,
          direction: touchpad.left.direction,
        },
      );
    });
  }

  private handleButtonEvent(
    button: DualsenseButton,
    options?: {
      x?: number;
      y?: number;
      direction?: number;
    },
  ): void {
    logger.info(`Pressed: ${button}`);
    if (this.ws.readyState === WebSocket.OPEN) {
      const payload: OutgoingMessage = {
        code: 200,
        type: "button",
        data: {
          button,
          x: options?.x,
          y: options?.y,
          direction: options?.direction,
        },
      };
      this.sendMessage(payload);
    } else {
      logger.warn("WebSocket connection is closed");
    }
  }

  private handleButtonEventWithThrottling = throttle(
    this.handleButtonEvent,
    30,
    { leading: true, trailing: true },
  );

  private sendMessage(message: OutgoingMessage): void {
    this.ws.send(JSON.stringify(message));
  }
}

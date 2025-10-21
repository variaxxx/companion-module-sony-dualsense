import { DualsenseButton, DualsenseButtons } from "./buttons.js";
import { Dualsense } from "dualsense-ts";
import { WebSocket } from "ws";

export class DualsenseBridge {
  private ws!: WebSocket;
  private wsPath: string;
  private dualsense!: Dualsense;

  constructor(wsPath: string) {
    this.wsPath = wsPath;

    this.setupWs();
    this.setupDualsenseEvents();
  }

  private setupWs(): void {
    this.ws = new WebSocket(this.wsPath);

    this.ws.on("open", () => {
      console.log("WebSocket connected");
      this.ws.send("Connection established");
    });

    this.ws.on("error", err => console.error(err));

    this.ws.on("close", () => {
      console.log("WebSocket closed");
      setTimeout(() => this.setupWs(), 1000);
    });
  }

  private setupDualsenseEvents(): void {
    this.dualsense = new Dualsense();

    this.dualsense.connection.on("change", ({ active }) => {
      console.log(`Controller ${active ? "" : "dis"}connected`);
    });

    for (const mainButton of Object.values(DualsenseButtons.Main) as DualsenseButton[]) {
      // @ts-expect-error (чтоб итерироваться)
      this.dualsense[mainButton].on("press", () => this.handleButtonPress(mainButton));
    }

    for (const dpadButton of Object.values(DualsenseButtons.DPad) as DualsenseButton[]) {
      const direction = dpadButton.split("_")[1];
      // @ts-expect-error (чтоб итерироваться)
      this.dualsense.dpad[direction].on("press", () => this.handleButtonPress(dpadButton));
    }

    for (const systemButton of Object.values(DualsenseButtons.System) as DualsenseButton[]) {
      // @ts-expect-error (чтоб итерироваться)
      this.dualsense[systemButton].on("press", () => this.handleButtonPress(systemButton));
    }

    for (const side of ["left", "right"]) {
      // @ts-expect-error (чтоб итерироваться)
      this.dualsense[side].bumper.on("press", () => {
        if (side === "left")
          return this.handleButtonPress(DualsenseButtons.Triggers.L1);
        return this.handleButtonPress(DualsenseButtons.Triggers.R1);
      });

      // @ts-expect-error (чтоб итерироваться)
      this.dualsense[side].trigger.on("press", () => {
        if (side === "left")
          return this.handleButtonPress(DualsenseButtons.Triggers.L2);
        return this.handleButtonPress(DualsenseButtons.Triggers.R2);
      });

      this.dualsense.left.analog.on("press", () => console.log("l3"));
    }
  }

  private handleButtonPress(button: DualsenseButton): void {
    console.log(`Pressed ${button}`);
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(button);
    } else {
      console.warn("WebSocket connection is closed!");
    }
  }
}

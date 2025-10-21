export const DualsenseButtons = {
  DPad: {
    Left: "dpad_left",
    Up: "dpad_up",
    Right: "dpad_right",
    Down: "dpad_down",
  },

  Triggers: {
    L1: "l1",
    R1: "r1",
    L2: "l2",
    R2: "r2",
  },

  Main: {
    Cross: "cross",
    Square: "square",
    Triangle: "triangle",
    Circle: "circle",
  },

  Sticks: {
    L3: "l3",
    R3: "r3",
  },

  System: {
    Create: "create",
    Options: "options",
    PS: "ps",
    Touchpad: "touchpad",
    Mute: "mute",
  },
} as const;

type Values<T> = T[keyof T];

export type DualsenseButton
  = Values<typeof DualsenseButtons.Main>
    | Values<typeof DualsenseButtons.Triggers>
    | Values<typeof DualsenseButtons.DPad>
    | Values<typeof DualsenseButtons.Sticks>
    | Values<typeof DualsenseButtons.System>;

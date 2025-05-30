import { Cartridge } from "./cartridge";
import { Emulator } from "./emulator";
import { ActionButton, DirectionButton } from "./hw/joypad";

import { LCD } from "./lcd";

import "./style.css";
import { EmulatorType } from "./types";

// const canvas = document.createElement("canvas");
// canvas.width = 160 * 2;
// canvas.tabIndex = -1;
// canvas.height = 144 * 2;
// canvas.style.margin = "0 0 32px";
// canvas.style.border = "1px solid gray";
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;

const lcd = new LCD(context);

let current: Emulator | null = null;
let type: EmulatorType = "DMG";

window.addEventListener(
  "keydown",
  (e) => {
    switch (e.code) {
      case "KeyZ":
        current?.pressActionButton(ActionButton.A);
        break;
      case "KeyX":
        current?.pressActionButton(ActionButton.B);
        break;
      case "Space":
        current?.pressActionButton(ActionButton.Select);
        break;
      case "Enter":
        current?.pressActionButton(ActionButton.Start);
        break;
      case "ArrowUp":
        current?.pressDirectionButton(DirectionButton.Up);
        break;
      case "ArrowDown":
        current?.pressDirectionButton(DirectionButton.Down);
        break;
      case "ArrowLeft":
        current?.pressDirectionButton(DirectionButton.Left);
        break;
      case "ArrowRight":
        current?.pressDirectionButton(DirectionButton.Right);
        break;
    }
  },
  false
);

window.addEventListener(
  "keyup",
  (e) => {
    switch (e.code) {
      case "KeyZ":
        current?.releaseActionButton(ActionButton.A);
        break;
      case "KeyX":
        current?.releaseActionButton(ActionButton.B);
        break;
      case "Space":
        current?.releaseActionButton(ActionButton.Select);
        break;
      case "Enter":
        current?.releaseActionButton(ActionButton.Start);
        break;
      case "ArrowUp":
        current?.releaseDirectionButton(DirectionButton.Up);
        break;
      case "ArrowDown":
        current?.releaseDirectionButton(DirectionButton.Down);
        break;
      case "ArrowLeft":
        current?.releaseDirectionButton(DirectionButton.Left);
        break;
      case "ArrowRight":
        current?.releaseDirectionButton(DirectionButton.Right);
        break;
    }
  },
  false
);

const arrowUp = document.querySelector(
  ".gameboy__arrow_up"
) as HTMLButtonElement;
arrowUp.addEventListener("mousedown", () =>
  current?.pressDirectionButton(DirectionButton.Up)
);
arrowUp.addEventListener("mouseup", () =>
  current?.releaseDirectionButton(DirectionButton.Up)
);

const arrowLeft = document.querySelector(
  ".gameboy__arrow_left"
) as HTMLButtonElement;
arrowLeft.addEventListener("mousedown", () =>
  current?.pressDirectionButton(DirectionButton.Left)
);
arrowLeft.addEventListener("mouseup", () =>
  current?.releaseDirectionButton(DirectionButton.Left)
);

const arrowRight = document.querySelector(
  ".gameboy__arrow_right"
) as HTMLButtonElement;
arrowRight.addEventListener("mousedown", () =>
  current?.pressDirectionButton(DirectionButton.Right)
);
arrowRight.addEventListener("mouseup", () =>
  current?.releaseDirectionButton(DirectionButton.Right)
);

const arrowDown = document.querySelector(
  ".gameboy__arrow_right"
) as HTMLButtonElement;
arrowDown.addEventListener("mousedown", () =>
  current?.pressDirectionButton(DirectionButton.Down)
);
arrowDown.addEventListener("mouseup", () =>
  current?.releaseDirectionButton(DirectionButton.Down)
);

const actionStart = document.querySelector(
  ".gameboy__action_start"
) as HTMLButtonElement;
actionStart.addEventListener("mousedown", () =>
  current?.pressActionButton(ActionButton.Start)
);
actionStart.addEventListener("mouseup", () =>
  current?.releaseActionButton(ActionButton.Start)
);

const actionSelect = document.querySelector(
  ".gameboy__action_select"
) as HTMLButtonElement;
actionSelect.addEventListener("mousedown", () =>
  current?.pressActionButton(ActionButton.Select)
);
actionSelect.addEventListener("mouseup", () =>
  current?.releaseActionButton(ActionButton.Select)
);

const actionA = document.querySelector(
  ".gameboy__action_a"
) as HTMLButtonElement;
actionA.addEventListener("mousedown", () =>
  current?.pressActionButton(ActionButton.A)
);
actionA.addEventListener("mouseup", () =>
  current?.releaseActionButton(ActionButton.A)
);

const actionB = document.querySelector(
  ".gameboy__action_b"
) as HTMLButtonElement;
actionB.addEventListener("mousedown", () =>
  current?.pressActionButton(ActionButton.B)
);
actionB.addEventListener("mouseup", () =>
  current?.releaseActionButton(ActionButton.B)
);

async function readImage(file: File) {
  const buffer = await file.arrayBuffer();
  const cartridge = new Cartridge(buffer);

  canvas.focus();

  if (current != null) {
    current.destroy();
  }

  current = new Emulator(type, lcd);
  current.run(cartridge);

  const batteryIndicator = document.querySelector(
    ".gameboy__battery-indicator"
  )!;
  batteryIndicator.classList.add("gameboy__battery-indicator_active");

  typeSelect.disabled = true;
}

const typeSelect = document.getElementById("type-select") as HTMLSelectElement;
type = typeSelect.value as EmulatorType;
typeSelect.addEventListener("change", () => {
  type = typeSelect.value as EmulatorType;
});

const fileSelector = document.getElementById("file-selector")!;
fileSelector.addEventListener("change", (event) => {
  const fileList = (event.target as HTMLInputElement).files!;
  readImage(fileList[0]);
});

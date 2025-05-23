import { Cartridge } from "./cartridge";
import { Emulator } from "./emulator";
import { ActionButton, DirectionButton } from "./hw/joypad";

import { LCD } from "./lcd";

import "./style.css";

const canvas = document.createElement("canvas");
canvas.width = 160 * 2;
canvas.tabIndex = -1;
canvas.height = 144 * 2;
canvas.style.margin = "0 0 32px";
canvas.style.border = "1px solid gray";
const context = canvas.getContext("2d")!;

const lcd = new LCD(context);

let current: Emulator | null = null;

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

async function readImage(file: File) {
  const buffer = await file.arrayBuffer();
  const cartridge = new Cartridge(buffer);

  canvas.focus();

  if (current == null) {
    current = new Emulator(lcd);
  } else {
    current.reset();
  }

  current.run(cartridge);
}

const app = document.getElementById("app");
if (app != null) {
  app.insertBefore(canvas, app.firstChild);
}

const fileSelector = document.getElementById("file-selector");
if (fileSelector != null) {
  fileSelector.addEventListener("change", (event) => {
    const fileList = (event.target as HTMLInputElement).files!;
    readImage(fileList[0]);
  });
}

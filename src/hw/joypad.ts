import { resetBit, setBit, testBit } from "../utils";

enum SelectedButtons {
  Action = 0x10,
  Direction = 0x20,
}

export enum ActionButton {
  A = 0,
  B = 1,
  Select = 2,
  Start = 3,
}

export enum DirectionButton {
  Right = 0,
  Left = 1,
  Up = 2,
  Down = 3,
}

export class Joypad {
  private actionButtons = 0x0;
  private directionButtons = 0x0;

  private selectedButtons = 0;

  public constructor() {}

  public reset() {
    this.actionButtons = 0;
    this.directionButtons = 0;
    this.selectedButtons = 0;
  }

  setRegister(data: number) {
    this.selectedButtons = data & 0x30;
  }

  getRegister() {
    let result = 0xcf;

    if (!testBit(this.selectedButtons, 5)) {
      result &= ~this.actionButtons;
    }

    if (!testBit(this.selectedButtons, 4)) {
      result &= ~this.directionButtons;
    }

    return result;
  }

  public pressActionButton(i: ActionButton) {
    if (!testBit(this.actionButtons, i)) {
      this.actionButtons = setBit(this.actionButtons, i);

      if (this.selectedButtons === SelectedButtons.Action) {
        //this.onPress();
      }
    }
  }

  public releaseActionButton(i: ActionButton) {
    this.actionButtons = resetBit(this.actionButtons, i);
  }

  public pressDirectionButton(i: DirectionButton) {
    if (!testBit(this.directionButtons, i)) {
      this.directionButtons = setBit(this.directionButtons, i);

      if (this.selectedButtons === SelectedButtons.Direction) {
        //this.onPress();
      }
    }
  }

  public releaseDirectionButton(i: DirectionButton) {
    this.directionButtons = resetBit(this.directionButtons, i);
  }
}

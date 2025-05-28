// See https://gbdev.io/pandocs/Joypad_Input.html

const READONLY_MASK = 0b11001111;
const WRITEONLY_MASK = 0b00110000;

const enum SelectButtons {
  Action = 1 << 4,
  Direction = 1 << 5,
}

export enum ActionButton {
  A = 1 << 0,
  B = 1 << 1,
  Select = 1 << 2,
  Start = 1 << 3,
}

export enum DirectionButton {
  Right = 1 << 0,
  Left = 1 << 1,
  Up = 1 << 2,
  Down = 1 << 3,
}

export class Joypad {
  private actionButtons = 0;
  private directionButtons = 0;

  private selectedButtons = 0;

  public constructor(private onPress = () => {}) {}

  writeRegister(data: number) {
    this.selectedButtons = data & WRITEONLY_MASK;
  }

  readRegister() {
    let result = READONLY_MASK;

    if (!(this.selectedButtons & SelectButtons.Direction)) {
      result &= ~this.actionButtons;
    }

    if (!(this.selectedButtons & SelectButtons.Action)) {
      result &= ~this.directionButtons;
    }

    return result;
  }

  public pressActionButton(btn: ActionButton) {
    if (!(this.actionButtons & btn)) {
      this.actionButtons |= btn;

      if (this.selectedButtons === SelectButtons.Action) {
        this.onPress();
      }
    }
  }

  public releaseActionButton(btn: ActionButton) {
    this.actionButtons &= ~btn;
  }

  public pressDirectionButton(btn: DirectionButton) {
    if (!(this.directionButtons & btn)) {
      this.directionButtons |= btn;

      if (this.selectedButtons === SelectButtons.Direction) {
        this.onPress();
      }
    }
  }

  public releaseDirectionButton(btn: DirectionButton) {
    this.directionButtons &= ~btn;
  }
}

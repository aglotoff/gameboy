import { wrappingIncrementWord } from "../utils";

// This magic value is used to pass the acceptance/boot_div-dmgABCmgb test
// FIXME: something seems to be wrong...
const VALUE_ON_RESET = 0xdc87;

export class SystemCounter {
  private value = VALUE_ON_RESET;

  public resetValue() {
    this.value = 0;
  }

  public getValue() {
    return this.value;
  }

  public reset() {
    this.value = VALUE_ON_RESET;
  }

  public tick() {
    this.value = wrappingIncrementWord(this.value);
  }
}

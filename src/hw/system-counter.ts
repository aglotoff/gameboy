import { wrappingIncrementWord } from "../utils";

const VALUE_ON_RESET = 0;

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

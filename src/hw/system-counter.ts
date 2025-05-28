import { wrappingIncrementWord } from "../utils";

export class SystemCounter {
  private value = 0;

  public resetValue() {
    this.value = 0;
  }

  public getValue() {
    return this.value;
  }

  public tick() {
    this.value = wrappingIncrementWord(this.value);
  }
}

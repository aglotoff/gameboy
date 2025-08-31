import { describe, expect, test } from "vitest";
import { CpuState } from "./cpu-state";

describe("CPU state", () => {
  test("initialization and cycle tracking", () => {
    const state = new CpuState();

    expect(state.getElapsedCycles()).toBe(0);
    expect(state.isHalted()).toBe(false);
    expect(state.isStopped()).toBe(false);
    expect(state.isInterruptMasterEnabled()).toBe(false);
    expect(state.isInterruptMasterEnableScheduled()).toBe(false);

    state.beginNextCycle();
    expect(state.getElapsedCycles()).toBe(1);

    state.beginNextCycle();
    expect(state.getElapsedCycles()).toBe(2);

    state.resetCycle();
    expect(state.getElapsedCycles()).toBe(0);
  });

  test("halted transitions", () => {
    const state = new CpuState();

    expect(state.isHalted()).toBe(false);

    state.halt();
    expect(state.isHalted()).toBe(true);

    state.setHalted(false);
    expect(state.isHalted()).toBe(false);

    state.setHalted(true);
    expect(state.isHalted()).toBe(true);
  });

  test("interupt enable operations", () => {
    const state = new CpuState();

    expect(state.isInterruptMasterEnabled()).toBe(false);
    expect(state.isInterruptMasterEnableScheduled()).toBe(false);

    state.setInterruptMasterEnable(true);
    expect(state.isInterruptMasterEnabled()).toBe(true);
    expect(state.isInterruptMasterEnableScheduled()).toBe(false);

    state.setInterruptMasterEnable(false);
    expect(state.isInterruptMasterEnabled()).toBe(false);

    state.scheduleInterruptMasterEnable();
    expect(state.isInterruptMasterEnableScheduled()).toBe(true);
    expect(state.isInterruptMasterEnabled()).toBe(false);

    state.updateInterruptMasterEnabled();
    expect(state.isInterruptMasterEnabled()).toBe(true);
    expect(state.isInterruptMasterEnableScheduled()).toBe(false);
  });
});

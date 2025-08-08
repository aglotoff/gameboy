import { describe, expect } from "vitest";

import { Flag } from "../register";
import { testCpuState } from "../test-lib";
import { getLSB, getMSB } from "../../utils";

import {
  callFunction,
  callFunctionConditional,
  jump,
  jumpConditional,
  jumpToHL,
  relativeJump,
  relativeJumpConditional,
  restartFunction,
  returnFromFunction,
  returnFromFunctionConditional,
  returnFromInterruptHandler,
} from "./flow";
import { RegisterPair, Condition } from "../cpu-state";

describe("Control flow instructions", () => {
  testCpuState("JP nn", ({ state }) => {
    state.writeMemory(0x00, getLSB(0x8000));
    state.writeMemory(0x01, getMSB(0x8000));

    jump(state);

    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8000);
    expect(state.getElapsedCycles()).toBe(4);
  });

  testCpuState("JP (HL)", ({ state }) => {
    state.writeRegisterPair(RegisterPair.HL, 0x8000);

    jumpToHL(state);

    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8000);
    expect(state.getElapsedCycles()).toBe(1);
  });

  describe("JP cc,nn", () => {
    testCpuState("JP NZ, nn", ({ state }) => {
      state.writeMemory(0x00, getLSB(0x8000));
      state.writeMemory(0x01, getMSB(0x8000));
      state.setFlag(Flag.Z, true);

      jumpConditional(state, Condition.NZ);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x0002);
      expect(state.getElapsedCycles()).toBe(3);
    });

    testCpuState("JP Z, nn", ({ state }) => {
      state.writeMemory(0x00, getLSB(0x8000));
      state.writeMemory(0x01, getMSB(0x8000));
      state.setFlag(Flag.Z, true);

      jumpConditional(state, Condition.Z);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8000);
      expect(state.getElapsedCycles()).toBe(4);
    });

    testCpuState("JP C, nn", ({ state }) => {
      state.writeMemory(0x00, getLSB(0x8000));
      state.writeMemory(0x01, getMSB(0x8000));
      state.setFlag(Flag.Z, true);

      jumpConditional(state, Condition.C);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x0002);
      expect(state.getElapsedCycles()).toBe(3);
    });

    testCpuState("JP NC, nn", ({ state }) => {
      state.writeMemory(0x00, getLSB(0x8000));
      state.writeMemory(0x01, getMSB(0x8000));
      state.setFlag(Flag.Z, true);

      jumpConditional(state, Condition.NC);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8000);
      expect(state.getElapsedCycles()).toBe(4);
    });
  });

  testCpuState("JR e", ({ state }) => {
    state.writeRegisterPair(RegisterPair.PC, 0x8000);
    state.writeMemory(0x8000, 0x14);

    relativeJump(state);

    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8015);
    expect(state.getElapsedCycles()).toBe(3);
  });

  describe("JR cc,e", () => {
    testCpuState("JR NZ, e", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeMemory(0x8000, 0xfa);
      state.setFlag(Flag.Z, true);

      relativeJumpConditional(state, Condition.NZ);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8001);
      expect(state.getElapsedCycles()).toBe(2);
    });

    testCpuState("JR Z, e", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeMemory(0x8000, 0xfa);
      state.setFlag(Flag.Z, true);

      relativeJumpConditional(state, Condition.Z);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x7ffb);
      expect(state.getElapsedCycles()).toBe(3);
    });

    testCpuState("JR C, e", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeMemory(0x8000, 0xfa);
      state.setFlag(Flag.Z, true);

      relativeJumpConditional(state, Condition.C);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8001);
      expect(state.getElapsedCycles()).toBe(2);
    });

    testCpuState("JR NC, e", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeMemory(0x8000, 0xfa);
      state.setFlag(Flag.Z, true);

      relativeJumpConditional(state, Condition.NC);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x7ffb);
      expect(state.getElapsedCycles()).toBe(3);
    });
  });

  testCpuState("CALL nn", ({ state }) => {
    state.writeRegisterPair(RegisterPair.PC, 0x8000);
    state.writeRegisterPair(RegisterPair.SP, 0xfffe);
    state.writeMemory(0x8000, getLSB(0x1234));
    state.writeMemory(0x8001, getMSB(0x1234));

    callFunction(state);

    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x1234);
    expect(state.readMemory(0xfffd)).toBe(0x80);
    expect(state.readMemory(0xfffc)).toBe(0x02);
    expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
    expect(state.getElapsedCycles()).toBe(6);
  });

  describe("CALL cc, nn", () => {
    testCpuState("CALL NZ, nn", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeRegisterPair(RegisterPair.SP, 0xfffe);
      state.writeMemory(0x8000, getLSB(0x1234));
      state.writeMemory(0x8001, getMSB(0x1234));
      state.setFlag(Flag.Z, true);

      callFunctionConditional(state, Condition.NZ);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8002);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
      expect(state.getElapsedCycles()).toBe(3);
    });

    testCpuState("CALL Z, nn", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeRegisterPair(RegisterPair.SP, 0xfffe);
      state.writeMemory(0x8000, getLSB(0x1234));
      state.writeMemory(0x8001, getMSB(0x1234));
      state.setFlag(Flag.Z, true);

      callFunctionConditional(state, Condition.Z);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x1234);
      expect(state.readMemory(0xfffd)).toBe(0x80);
      expect(state.readMemory(0xfffc)).toBe(0x02);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
      expect(state.getElapsedCycles()).toBe(6);
    });

    testCpuState("CALL C, nn", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeRegisterPair(RegisterPair.SP, 0xfffe);
      state.writeMemory(0x8000, getLSB(0x1234));
      state.writeMemory(0x8001, getMSB(0x1234));
      state.setFlag(Flag.Z, true);

      callFunctionConditional(state, Condition.C);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8002);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
      expect(state.getElapsedCycles()).toBe(3);
    });

    testCpuState("CALL NC, nn", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeRegisterPair(RegisterPair.SP, 0xfffe);
      state.writeMemory(0x8000, getLSB(0x1234));
      state.writeMemory(0x8001, getMSB(0x1234));
      state.setFlag(Flag.Z, true);

      callFunctionConditional(state, Condition.NC);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x1234);
      expect(state.readMemory(0xfffd)).toBe(0x80);
      expect(state.readMemory(0xfffc)).toBe(0x02);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
      expect(state.getElapsedCycles()).toBe(6);
    });
  });

  testCpuState("RET", ({ state }) => {
    state.writeRegisterPair(RegisterPair.PC, 0x9000);
    state.writeRegisterPair(RegisterPair.SP, 0xfffc);
    state.writeMemory(0xfffd, getMSB(0x8003));
    state.writeMemory(0xfffc, getLSB(0x8003));

    returnFromFunction(state);

    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8003);
    expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
    expect(state.getElapsedCycles()).toBe(4);
  });

  describe("RET cc", () => {
    testCpuState("RET NZ", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x9000);
      state.writeRegisterPair(RegisterPair.SP, 0xfffc);
      state.writeMemory(0xfffd, getMSB(0x8003));
      state.writeMemory(0xfffc, getLSB(0x8003));
      state.setFlag(Flag.Z, true);

      returnFromFunctionConditional(state, Condition.NZ);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x9000);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
      expect(state.getElapsedCycles()).toBe(2);
    });

    testCpuState("RET Z", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x9000);
      state.writeRegisterPair(RegisterPair.SP, 0xfffc);
      state.writeMemory(0xfffd, getMSB(0x8003));
      state.writeMemory(0xfffc, getLSB(0x8003));
      state.setFlag(Flag.Z, true);

      returnFromFunctionConditional(state, Condition.Z);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8003);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
      expect(state.getElapsedCycles()).toBe(5);
    });

    testCpuState("RET C", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x9000);
      state.writeRegisterPair(RegisterPair.SP, 0xfffc);
      state.writeMemory(0xfffd, getMSB(0x8003));
      state.writeMemory(0xfffc, getLSB(0x8003));
      state.setFlag(Flag.Z, true);

      returnFromFunctionConditional(state, Condition.C);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x9000);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
      expect(state.getElapsedCycles()).toBe(2);
    });

    testCpuState("RET NC", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x9000);
      state.writeRegisterPair(RegisterPair.SP, 0xfffc);
      state.writeMemory(0xfffd, getMSB(0x8003));
      state.writeMemory(0xfffc, getLSB(0x8003));
      state.setFlag(Flag.Z, true);

      returnFromFunctionConditional(state, Condition.NC);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8003);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
      expect(state.getElapsedCycles()).toBe(5);
    });
  });

  testCpuState("RETI", ({ state }) => {
    state.writeRegisterPair(RegisterPair.PC, 0x9000);
    state.writeRegisterPair(RegisterPair.SP, 0xfffc);
    state.writeMemory(0xfffd, getMSB(0x8001));
    state.writeMemory(0xfffc, getLSB(0x8001));

    returnFromInterruptHandler(state);

    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8001);
    expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
    expect(state.isInterruptMasterEnabled()).toBe(true);
    expect(state.getElapsedCycles()).toBe(4);
  });

  testCpuState("RST t", ({ state }) => {
    state.writeRegisterPair(RegisterPair.PC, 0x8001);
    state.writeRegisterPair(RegisterPair.SP, 0xfffe);

    restartFunction(state, 0x10);

    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x0010);
    expect(state.readMemory(0xfffd)).toBe(0x80);
    expect(state.readMemory(0xfffc)).toBe(0x01);
    expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
    expect(state.getElapsedCycles()).toBe(4);
  });
});

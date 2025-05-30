import { describe, expect } from "vitest";

import { Flag, RegisterPair } from "../register";
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
import { getLSB, getMSB } from "../../utils";
import { testInstruction } from "./test-lib";
import { Condition } from "./lib";

describe("Control flow instructions", () => {
  testInstruction("JP nn", ({ state }) => {
    state.writeMemory(0x00, getLSB(0x8000));
    state.writeMemory(0x01, getMSB(0x8000));

    jump(state);

    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8000);
    expect(state.getElapsedCycles()).toBe(4);
  });

  testInstruction("JP (HL)", ({ state }) => {
    state.writeRegisterPair(RegisterPair.HL, 0x8000);

    jumpToHL(state);

    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8000);
    expect(state.getElapsedCycles()).toBe(1);
  });

  describe("JP cc,nn", () => {
    testInstruction("JP NZ, nn", ({ state }) => {
      state.writeMemory(0x00, getLSB(0x8000));
      state.writeMemory(0x01, getMSB(0x8000));
      state.setFlag(Flag.Z, true);

      jumpConditional(state, Condition.NZ);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x0002);
      expect(state.getElapsedCycles()).toBe(3);
    });

    testInstruction("JP Z, nn", ({ state }) => {
      state.writeMemory(0x00, getLSB(0x8000));
      state.writeMemory(0x01, getMSB(0x8000));
      state.setFlag(Flag.Z, true);

      jumpConditional(state, Condition.Z);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8000);
      expect(state.getElapsedCycles()).toBe(4);
    });

    testInstruction("JP C, nn", ({ state }) => {
      state.writeMemory(0x00, getLSB(0x8000));
      state.writeMemory(0x01, getMSB(0x8000));
      state.setFlag(Flag.Z, true);

      jumpConditional(state, Condition.C);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x0002);
      expect(state.getElapsedCycles()).toBe(3);
    });

    testInstruction("JP NC, nn", ({ state }) => {
      state.writeMemory(0x00, getLSB(0x8000));
      state.writeMemory(0x01, getMSB(0x8000));
      state.setFlag(Flag.Z, true);

      jumpConditional(state, Condition.NC);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8000);
      expect(state.getElapsedCycles()).toBe(4);
    });
  });

  testInstruction("JR e", ({ state }) => {
    state.writeRegisterPair(RegisterPair.PC, 0x8000);
    state.writeMemory(0x8000, 0x14);

    relativeJump(state);

    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8015);
    expect(state.getElapsedCycles()).toBe(3);
  });

  describe("JR cc,e", () => {
    testInstruction("JR NZ, e", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeMemory(0x8000, 0xfa);
      state.setFlag(Flag.Z, true);

      relativeJumpConditional(state, Condition.NZ);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8001);
      expect(state.getElapsedCycles()).toBe(2);
    });

    testInstruction("JR Z, e", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeMemory(0x8000, 0xfa);
      state.setFlag(Flag.Z, true);

      relativeJumpConditional(state, Condition.Z);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x7ffb);
      expect(state.getElapsedCycles()).toBe(3);
    });

    testInstruction("JR C, e", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeMemory(0x8000, 0xfa);
      state.setFlag(Flag.Z, true);

      relativeJumpConditional(state, Condition.C);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8001);
      expect(state.getElapsedCycles()).toBe(2);
    });

    testInstruction("JR NC, e", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeMemory(0x8000, 0xfa);
      state.setFlag(Flag.Z, true);

      relativeJumpConditional(state, Condition.NC);

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x7ffb);
      expect(state.getElapsedCycles()).toBe(3);
    });
  });

  testInstruction("CALL nn", ({ state }) => {
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
    testInstruction("CALL NZ, nn", ({ state }) => {
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

    testInstruction("CALL Z, nn", ({ state }) => {
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

    testInstruction("CALL C, nn", ({ state }) => {
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

    testInstruction("CALL NC, nn", ({ state }) => {
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

  testInstruction("RET", ({ state }) => {
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
    testInstruction("RET NZ", ({ state }) => {
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

    testInstruction("RET Z", ({ state }) => {
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

    testInstruction("RET C", ({ state }) => {
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

    testInstruction("RET NC", ({ state }) => {
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

  testInstruction("RETI", ({ state }) => {
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

  testInstruction("RST t", ({ state }) => {
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

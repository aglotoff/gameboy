import { describe, expect } from "vitest";

import { Flag, RegisterPair } from "../regs";
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
import { getLSB, getMSB } from "../utils";
import { testInstruction } from "./test-lib";

describe("Control flow instructions", () => {
  testInstruction("JP nn", ({ state }) => {
    state.writeBus(0x00, getLSB(0x8000));
    state.writeBus(0x01, getMSB(0x8000));

    jump(state);

    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8000);
  });

  testInstruction("JP (HL)", ({ state }) => {
    state.writeRegisterPair(RegisterPair.HL, 0x8000);

    jumpToHL(state);

    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8000);
  });

  describe("JP cc,nn", () => {
    testInstruction("JP NZ, nn", ({ state }) => {
      state.writeBus(0x00, getLSB(0x8000));
      state.writeBus(0x01, getMSB(0x8000));
      state.setFlag(Flag.Z, true);

      jumpConditional(state, "NZ");

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x0002);
    });

    testInstruction("JP Z, nn", ({ state }) => {
      state.writeBus(0x00, getLSB(0x8000));
      state.writeBus(0x01, getMSB(0x8000));
      state.setFlag(Flag.Z, true);

      jumpConditional(state, "Z");

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8000);
    });

    testInstruction("JP C, nn", ({ state }) => {
      state.writeBus(0x00, getLSB(0x8000));
      state.writeBus(0x01, getMSB(0x8000));
      state.setFlag(Flag.Z, true);

      jumpConditional(state, "C");

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x0002);
    });

    testInstruction("JP NC, nn", ({ state }) => {
      state.writeBus(0x00, getLSB(0x8000));
      state.writeBus(0x01, getMSB(0x8000));
      state.setFlag(Flag.Z, true);

      jumpConditional(state, "NC");

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8000);
    });
  });

  testInstruction("JR e", ({ state }) => {
    state.writeRegisterPair(RegisterPair.PC, 0x8000);
    state.writeBus(0x8000, 0x14);

    relativeJump(state);

    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8015);
  });

  describe("JR cc,e", () => {
    testInstruction("JR NZ, e", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeBus(0x8000, 0xfa);
      state.setFlag(Flag.Z, true);

      relativeJumpConditional(state, "NZ");

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8001);
    });

    testInstruction("JR Z, e", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeBus(0x8000, 0xfa);
      state.setFlag(Flag.Z, true);

      relativeJumpConditional(state, "Z");

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x7ffb);
    });

    testInstruction("JR C, e", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeBus(0x8000, 0xfa);
      state.setFlag(Flag.Z, true);

      relativeJumpConditional(state, "C");

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8001);
    });

    testInstruction("JR NC, e", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeBus(0x8000, 0xfa);
      state.setFlag(Flag.Z, true);

      relativeJumpConditional(state, "NC");

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x7ffb);
    });
  });

  testInstruction("CALL nn", ({ state }) => {
    state.writeRegisterPair(RegisterPair.PC, 0x8000);
    state.writeRegisterPair(RegisterPair.SP, 0xfffe);
    state.writeBus(0x8000, getLSB(0x1234));
    state.writeBus(0x8001, getMSB(0x1234));

    callFunction(state);

    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x1234);
    expect(state.readBus(0xfffd)).toBe(0x80);
    expect(state.readBus(0xfffc)).toBe(0x02);
    expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
  });

  describe("CALL cc, nn", () => {
    testInstruction("CALL NZ, nn", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeRegisterPair(RegisterPair.SP, 0xfffe);
      state.writeBus(0x8000, getLSB(0x1234));
      state.writeBus(0x8001, getMSB(0x1234));
      state.setFlag(Flag.Z, true);

      callFunctionConditional(state, "NZ");

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8002);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
    });

    testInstruction("CALL Z, nn", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeRegisterPair(RegisterPair.SP, 0xfffe);
      state.writeBus(0x8000, getLSB(0x1234));
      state.writeBus(0x8001, getMSB(0x1234));
      state.setFlag(Flag.Z, true);

      callFunctionConditional(state, "Z");

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x1234);
      expect(state.readBus(0xfffd)).toBe(0x80);
      expect(state.readBus(0xfffc)).toBe(0x02);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
    });

    testInstruction("CALL C, nn", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeRegisterPair(RegisterPair.SP, 0xfffe);
      state.writeBus(0x8000, getLSB(0x1234));
      state.writeBus(0x8001, getMSB(0x1234));
      state.setFlag(Flag.Z, true);

      callFunctionConditional(state, "C");

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8002);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
    });

    testInstruction("CALL NC, nn", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x8000);
      state.writeRegisterPair(RegisterPair.SP, 0xfffe);
      state.writeBus(0x8000, getLSB(0x1234));
      state.writeBus(0x8001, getMSB(0x1234));
      state.setFlag(Flag.Z, true);

      callFunctionConditional(state, "NC");

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x1234);
      expect(state.readBus(0xfffd)).toBe(0x80);
      expect(state.readBus(0xfffc)).toBe(0x02);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
    });
  });

  testInstruction("RET", ({ state }) => {
    state.writeRegisterPair(RegisterPair.PC, 0x9000);
    state.writeRegisterPair(RegisterPair.SP, 0xfffc);
    state.writeBus(0xfffd, getMSB(0x8003));
    state.writeBus(0xfffc, getLSB(0x8003));

    returnFromFunction(state);

    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8003);
    expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
  });

  describe("RET cc", () => {
    testInstruction("RET NZ", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x9000);
      state.writeRegisterPair(RegisterPair.SP, 0xfffc);
      state.writeBus(0xfffd, getMSB(0x8003));
      state.writeBus(0xfffc, getLSB(0x8003));
      state.setFlag(Flag.Z, true);

      returnFromFunctionConditional(state, "NZ");

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x9000);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
    });

    testInstruction("RET Z", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x9000);
      state.writeRegisterPair(RegisterPair.SP, 0xfffc);
      state.writeBus(0xfffd, getMSB(0x8003));
      state.writeBus(0xfffc, getLSB(0x8003));
      state.setFlag(Flag.Z, true);

      returnFromFunctionConditional(state, "Z");

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8003);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
    });

    testInstruction("RET C", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x9000);
      state.writeRegisterPair(RegisterPair.SP, 0xfffc);
      state.writeBus(0xfffd, getMSB(0x8003));
      state.writeBus(0xfffc, getLSB(0x8003));
      state.setFlag(Flag.Z, true);

      returnFromFunctionConditional(state, "C");

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x9000);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
    });

    testInstruction("RET NC", ({ state }) => {
      state.writeRegisterPair(RegisterPair.PC, 0x9000);
      state.writeRegisterPair(RegisterPair.SP, 0xfffc);
      state.writeBus(0xfffd, getMSB(0x8003));
      state.writeBus(0xfffc, getLSB(0x8003));
      state.setFlag(Flag.Z, true);

      returnFromFunctionConditional(state, "NC");

      expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8003);
      expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
    });
  });

  testInstruction("RETI", ({ state }) => {
    state.writeRegisterPair(RegisterPair.PC, 0x9000);
    state.writeRegisterPair(RegisterPair.SP, 0xfffc);
    state.writeBus(0xfffd, getMSB(0x8001));
    state.writeBus(0xfffc, getLSB(0x8001));

    returnFromInterruptHandler(state);

    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x8001);
    expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
    expect(state.getIME()).toBe(true);
  });

  testInstruction("RST t", ({ state }) => {
    state.writeRegisterPair(RegisterPair.PC, 0x8001);
    state.writeRegisterPair(RegisterPair.SP, 0xfffe);

    restartFunction(state, 0x10);

    expect(state.readRegisterPair(RegisterPair.PC)).toBe(0x0010);
    expect(state.readBus(0xfffd)).toBe(0x80);
    expect(state.readBus(0xfffc)).toBe(0x01);
    expect(state.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
  });
});

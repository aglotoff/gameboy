import { describe, expect } from "vitest";

import { RegisterPair, Flag } from "../register";
import { testInstructions } from "../test-lib";
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
import { Condition } from "./lib";

describe("Control flow instructions", () => {
  testInstructions("JP nn", ({ ctx, onCycle }) => {
    ctx.memory.write(0x00, getLSB(0x8000));
    ctx.memory.write(0x01, getMSB(0x8000));

    jump(ctx);

    expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8000);
    expect(onCycle).toBeCalledTimes(4);
  });

  testInstructions("JP (HL)", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.HL, 0x8000);

    jumpToHL(ctx);

    expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8000);
    expect(onCycle).toBeCalledTimes(1);
  });

  describe("JP cc,nn", () => {
    testInstructions("JP NZ, nn", ({ ctx, onCycle }) => {
      ctx.memory.write(0x00, getLSB(0x8000));
      ctx.memory.write(0x01, getMSB(0x8000));
      ctx.registers.setFlag(Flag.Z, true);

      jumpConditional(ctx, Condition.NZ);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x0002);
      expect(onCycle).toBeCalledTimes(3);
    });

    testInstructions("JP Z, nn", ({ ctx, onCycle }) => {
      ctx.memory.write(0x00, getLSB(0x8000));
      ctx.memory.write(0x01, getMSB(0x8000));
      ctx.registers.setFlag(Flag.Z, true);

      jumpConditional(ctx, Condition.Z);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8000);
      expect(onCycle).toBeCalledTimes(4);
    });

    testInstructions("JP C, nn", ({ ctx, onCycle }) => {
      ctx.memory.write(0x00, getLSB(0x8000));
      ctx.memory.write(0x01, getMSB(0x8000));
      ctx.registers.setFlag(Flag.Z, true);

      jumpConditional(ctx, Condition.C);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x0002);
      expect(onCycle).toBeCalledTimes(3);
    });

    testInstructions("JP NC, nn", ({ ctx, onCycle }) => {
      ctx.memory.write(0x00, getLSB(0x8000));
      ctx.memory.write(0x01, getMSB(0x8000));
      ctx.registers.setFlag(Flag.Z, true);

      jumpConditional(ctx, Condition.NC);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8000);
      expect(onCycle).toBeCalledTimes(4);
    });
  });

  testInstructions("JR e", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.PC, 0x8000);
    ctx.memory.write(0x8000, 0x14);

    relativeJump(ctx);

    expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8015);
    expect(onCycle).toBeCalledTimes(3);
  });

  describe("JR cc,e", () => {
    testInstructions("JR NZ, e", ({ ctx, onCycle }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x8000);
      ctx.memory.write(0x8000, 0xfa);
      ctx.registers.setFlag(Flag.Z, true);

      relativeJumpConditional(ctx, Condition.NZ);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8001);
      expect(onCycle).toBeCalledTimes(2);
    });

    testInstructions("JR Z, e", ({ ctx, onCycle }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x8000);
      ctx.memory.write(0x8000, 0xfa);
      ctx.registers.setFlag(Flag.Z, true);

      relativeJumpConditional(ctx, Condition.Z);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x7ffb);
      expect(onCycle).toBeCalledTimes(3);
    });

    testInstructions("JR C, e", ({ ctx, onCycle }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x8000);
      ctx.memory.write(0x8000, 0xfa);
      ctx.registers.setFlag(Flag.Z, true);

      relativeJumpConditional(ctx, Condition.C);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8001);
      expect(onCycle).toBeCalledTimes(2);
    });

    testInstructions("JR NC, e", ({ ctx, onCycle }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x8000);
      ctx.memory.write(0x8000, 0xfa);
      ctx.registers.setFlag(Flag.Z, true);

      relativeJumpConditional(ctx, Condition.NC);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x7ffb);
      expect(onCycle).toBeCalledTimes(3);
    });
  });

  testInstructions("CALL nn", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.PC, 0x8000);
    ctx.registers.writePair(RegisterPair.SP, 0xfffe);
    ctx.memory.write(0x8000, getLSB(0x1234));
    ctx.memory.write(0x8001, getMSB(0x1234));

    callFunction(ctx);

    expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x1234);
    expect(ctx.memory.read(0xfffd)).toBe(0x80);
    expect(ctx.memory.read(0xfffc)).toBe(0x02);
    expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffc);
    expect(onCycle).toBeCalledTimes(6);
  });

  describe("CALL cc, nn", () => {
    testInstructions("CALL NZ, nn", ({ ctx, onCycle }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x8000);
      ctx.registers.writePair(RegisterPair.SP, 0xfffe);
      ctx.memory.write(0x8000, getLSB(0x1234));
      ctx.memory.write(0x8001, getMSB(0x1234));
      ctx.registers.setFlag(Flag.Z, true);

      callFunctionConditional(ctx, Condition.NZ);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8002);
      expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffe);
      expect(onCycle).toBeCalledTimes(3);
    });

    testInstructions("CALL Z, nn", ({ ctx, onCycle }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x8000);
      ctx.registers.writePair(RegisterPair.SP, 0xfffe);
      ctx.memory.write(0x8000, getLSB(0x1234));
      ctx.memory.write(0x8001, getMSB(0x1234));
      ctx.registers.setFlag(Flag.Z, true);

      callFunctionConditional(ctx, Condition.Z);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x1234);
      expect(ctx.memory.read(0xfffd)).toBe(0x80);
      expect(ctx.memory.read(0xfffc)).toBe(0x02);
      expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffc);
      expect(onCycle).toBeCalledTimes(6);
    });

    testInstructions("CALL C, nn", ({ ctx, onCycle }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x8000);
      ctx.registers.writePair(RegisterPair.SP, 0xfffe);
      ctx.memory.write(0x8000, getLSB(0x1234));
      ctx.memory.write(0x8001, getMSB(0x1234));
      ctx.registers.setFlag(Flag.Z, true);

      callFunctionConditional(ctx, Condition.C);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8002);
      expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffe);
      expect(onCycle).toBeCalledTimes(3);
    });

    testInstructions("CALL NC, nn", ({ ctx, onCycle }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x8000);
      ctx.registers.writePair(RegisterPair.SP, 0xfffe);
      ctx.memory.write(0x8000, getLSB(0x1234));
      ctx.memory.write(0x8001, getMSB(0x1234));
      ctx.registers.setFlag(Flag.Z, true);

      callFunctionConditional(ctx, Condition.NC);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x1234);
      expect(ctx.memory.read(0xfffd)).toBe(0x80);
      expect(ctx.memory.read(0xfffc)).toBe(0x02);
      expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffc);
      expect(onCycle).toBeCalledTimes(6);
    });
  });

  testInstructions("RET", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.PC, 0x9000);
    ctx.registers.writePair(RegisterPair.SP, 0xfffc);
    ctx.memory.write(0xfffd, getMSB(0x8003));
    ctx.memory.write(0xfffc, getLSB(0x8003));

    returnFromFunction(ctx);

    expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8003);
    expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffe);
    expect(onCycle).toBeCalledTimes(4);
  });

  describe("RET cc", () => {
    testInstructions("RET NZ", ({ ctx, onCycle }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x9000);
      ctx.registers.writePair(RegisterPair.SP, 0xfffc);
      ctx.memory.write(0xfffd, getMSB(0x8003));
      ctx.memory.write(0xfffc, getLSB(0x8003));
      ctx.registers.setFlag(Flag.Z, true);

      returnFromFunctionConditional(ctx, Condition.NZ);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x9000);
      expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffc);
      expect(onCycle).toBeCalledTimes(2);
    });

    testInstructions("RET Z", ({ ctx, onCycle }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x9000);
      ctx.registers.writePair(RegisterPair.SP, 0xfffc);
      ctx.memory.write(0xfffd, getMSB(0x8003));
      ctx.memory.write(0xfffc, getLSB(0x8003));
      ctx.registers.setFlag(Flag.Z, true);

      returnFromFunctionConditional(ctx, Condition.Z);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8003);
      expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffe);
      expect(onCycle).toBeCalledTimes(5);
    });

    testInstructions("RET C", ({ ctx, onCycle }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x9000);
      ctx.registers.writePair(RegisterPair.SP, 0xfffc);
      ctx.memory.write(0xfffd, getMSB(0x8003));
      ctx.memory.write(0xfffc, getLSB(0x8003));
      ctx.registers.setFlag(Flag.Z, true);

      returnFromFunctionConditional(ctx, Condition.C);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x9000);
      expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffc);
      expect(onCycle).toBeCalledTimes(2);
    });

    testInstructions("RET NC", ({ ctx, onCycle }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x9000);
      ctx.registers.writePair(RegisterPair.SP, 0xfffc);
      ctx.memory.write(0xfffd, getMSB(0x8003));
      ctx.memory.write(0xfffc, getLSB(0x8003));
      ctx.registers.setFlag(Flag.Z, true);

      returnFromFunctionConditional(ctx, Condition.NC);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8003);
      expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffe);
      expect(onCycle).toBeCalledTimes(5);
    });
  });

  testInstructions("RETI", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.PC, 0x9000);
    ctx.registers.writePair(RegisterPair.SP, 0xfffc);
    ctx.memory.write(0xfffd, getMSB(0x8001));
    ctx.memory.write(0xfffc, getLSB(0x8001));

    returnFromInterruptHandler(ctx);

    expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8001);
    expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffe);
    expect(ctx.state.isInterruptMasterEnabled()).toBe(true);
    expect(onCycle).toBeCalledTimes(4);
  });

  testInstructions("RST t", ({ ctx, onCycle }) => {
    ctx.registers.writePair(RegisterPair.PC, 0x8001);
    ctx.registers.writePair(RegisterPair.SP, 0xfffe);

    restartFunction(ctx, 0x10);

    expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x0010);
    expect(ctx.memory.read(0xfffd)).toBe(0x80);
    expect(ctx.memory.read(0xfffc)).toBe(0x01);
    expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffc);
    expect(onCycle).toBeCalledTimes(4);
  });
});

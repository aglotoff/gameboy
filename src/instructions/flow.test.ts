import { describe, expect, test as baseTest } from "vitest";

import { Flag, InterruptFlags, RegisterFile, RegisterPair } from "../cpu";
import { Memory } from "../memory";

import { InstructionCtx } from "./lib";
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

const test = baseTest.extend({
  ctx: async ({}, use: (ctx: InstructionCtx) => Promise<void>) => {
    await use({
      regs: new RegisterFile(),
      memory: new Memory(),
      interruptFlags: new InterruptFlags(),
    });
  },
});

describe("Control flow instructions", () => {
  test("JP nn", ({ ctx }) => {
    ctx.memory.write(0x00, getLSB(0x8000));
    ctx.memory.write(0x01, getMSB(0x8000));

    jump(ctx);

    expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x8000);
  });

  test("JP (HL)", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.HL, 0x8000);

    jumpToHL(ctx);

    expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x8000);
  });

  describe("JP cc,nn", () => {
    test("JP NZ, nn", ({ ctx }) => {
      ctx.memory.write(0x00, getLSB(0x8000));
      ctx.memory.write(0x01, getMSB(0x8000));
      ctx.regs.setFlag(Flag.Z, true);

      jumpConditional(ctx, "NZ");

      expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x0002);
    });

    test("JP Z, nn", ({ ctx }) => {
      ctx.memory.write(0x00, getLSB(0x8000));
      ctx.memory.write(0x01, getMSB(0x8000));
      ctx.regs.setFlag(Flag.Z, true);

      jumpConditional(ctx, "Z");

      expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x8000);
    });

    test("JP C, nn", ({ ctx }) => {
      ctx.memory.write(0x00, getLSB(0x8000));
      ctx.memory.write(0x01, getMSB(0x8000));
      ctx.regs.setFlag(Flag.Z, true);

      jumpConditional(ctx, "C");

      expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x0002);
    });

    test("JP NC, nn", ({ ctx }) => {
      ctx.memory.write(0x00, getLSB(0x8000));
      ctx.memory.write(0x01, getMSB(0x8000));
      ctx.regs.setFlag(Flag.Z, true);

      jumpConditional(ctx, "NC");

      expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x8000);
    });
  });

  test("JR e", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.PC, 0x8000);
    ctx.memory.write(0x8000, 0x14);

    relativeJump(ctx);

    expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x8015);
  });

  describe("JR cc,e", () => {
    test("JR NZ, e", ({ ctx }) => {
      ctx.regs.writePair(RegisterPair.PC, 0x8000);
      ctx.memory.write(0x8000, 0xfa);
      ctx.regs.setFlag(Flag.Z, true);

      relativeJumpConditional(ctx, "NZ");

      expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x8001);
    });

    test("JR Z, e", ({ ctx }) => {
      ctx.regs.writePair(RegisterPair.PC, 0x8000);
      ctx.memory.write(0x8000, 0xfa);
      ctx.regs.setFlag(Flag.Z, true);

      relativeJumpConditional(ctx, "Z");

      expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x7ffb);
    });

    test("JR C, e", ({ ctx }) => {
      ctx.regs.writePair(RegisterPair.PC, 0x8000);
      ctx.memory.write(0x8000, 0xfa);
      ctx.regs.setFlag(Flag.Z, true);

      relativeJumpConditional(ctx, "C");

      expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x8001);
    });

    test("JR NC, e", ({ ctx }) => {
      ctx.regs.writePair(RegisterPair.PC, 0x8000);
      ctx.memory.write(0x8000, 0xfa);
      ctx.regs.setFlag(Flag.Z, true);

      relativeJumpConditional(ctx, "NC");

      expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x7ffb);
    });
  });

  test("CALL nn", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.PC, 0x8000);
    ctx.regs.writePair(RegisterPair.SP, 0xfffe);
    ctx.memory.write(0x8000, getLSB(0x1234));
    ctx.memory.write(0x8001, getMSB(0x1234));

    callFunction(ctx);

    expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x1234);
    expect(ctx.memory.read(0xfffd)).toBe(0x80);
    expect(ctx.memory.read(0xfffc)).toBe(0x02);
    expect(ctx.regs.readPair(RegisterPair.SP)).toBe(0xfffc);
  });

  describe("CALL cc, nn", () => {
    test("CALL NZ, nn", ({ ctx }) => {
      ctx.regs.writePair(RegisterPair.PC, 0x8000);
      ctx.regs.writePair(RegisterPair.SP, 0xfffe);
      ctx.memory.write(0x8000, getLSB(0x1234));
      ctx.memory.write(0x8001, getMSB(0x1234));
      ctx.regs.setFlag(Flag.Z, true);

      callFunctionConditional(ctx, "NZ");

      expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x8002);
      expect(ctx.regs.readPair(RegisterPair.SP)).toBe(0xfffe);
    });

    test("CALL Z, nn", ({ ctx }) => {
      ctx.regs.writePair(RegisterPair.PC, 0x8000);
      ctx.regs.writePair(RegisterPair.SP, 0xfffe);
      ctx.memory.write(0x8000, getLSB(0x1234));
      ctx.memory.write(0x8001, getMSB(0x1234));
      ctx.regs.setFlag(Flag.Z, true);

      callFunctionConditional(ctx, "Z");

      expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x1234);
      expect(ctx.memory.read(0xfffd)).toBe(0x80);
      expect(ctx.memory.read(0xfffc)).toBe(0x02);
      expect(ctx.regs.readPair(RegisterPair.SP)).toBe(0xfffc);
    });

    test("CALL C, nn", ({ ctx }) => {
      ctx.regs.writePair(RegisterPair.PC, 0x8000);
      ctx.regs.writePair(RegisterPair.SP, 0xfffe);
      ctx.memory.write(0x8000, getLSB(0x1234));
      ctx.memory.write(0x8001, getMSB(0x1234));
      ctx.regs.setFlag(Flag.Z, true);

      callFunctionConditional(ctx, "C");

      expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x8002);
      expect(ctx.regs.readPair(RegisterPair.SP)).toBe(0xfffe);
    });

    test("CALL NC, nn", ({ ctx }) => {
      ctx.regs.writePair(RegisterPair.PC, 0x8000);
      ctx.regs.writePair(RegisterPair.SP, 0xfffe);
      ctx.memory.write(0x8000, getLSB(0x1234));
      ctx.memory.write(0x8001, getMSB(0x1234));
      ctx.regs.setFlag(Flag.Z, true);

      callFunctionConditional(ctx, "NC");

      expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x1234);
      expect(ctx.memory.read(0xfffd)).toBe(0x80);
      expect(ctx.memory.read(0xfffc)).toBe(0x02);
      expect(ctx.regs.readPair(RegisterPair.SP)).toBe(0xfffc);
    });
  });

  test("RET", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.PC, 0x9000);
    ctx.regs.writePair(RegisterPair.SP, 0xfffc);
    ctx.memory.write(0xfffd, getMSB(0x8003));
    ctx.memory.write(0xfffc, getLSB(0x8003));

    returnFromFunction(ctx);

    expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x8003);
    expect(ctx.regs.readPair(RegisterPair.SP)).toBe(0xfffe);
  });

  describe("RET cc", () => {
    test("RET NZ", ({ ctx }) => {
      ctx.regs.writePair(RegisterPair.PC, 0x9000);
      ctx.regs.writePair(RegisterPair.SP, 0xfffc);
      ctx.memory.write(0xfffd, getMSB(0x8003));
      ctx.memory.write(0xfffc, getLSB(0x8003));
      ctx.regs.setFlag(Flag.Z, true);

      returnFromFunctionConditional(ctx, "NZ");

      expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x9000);
      expect(ctx.regs.readPair(RegisterPair.SP)).toBe(0xfffc);
    });

    test("RET Z", ({ ctx }) => {
      ctx.regs.writePair(RegisterPair.PC, 0x9000);
      ctx.regs.writePair(RegisterPair.SP, 0xfffc);
      ctx.memory.write(0xfffd, getMSB(0x8003));
      ctx.memory.write(0xfffc, getLSB(0x8003));
      ctx.regs.setFlag(Flag.Z, true);

      returnFromFunctionConditional(ctx, "Z");

      expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x8003);
      expect(ctx.regs.readPair(RegisterPair.SP)).toBe(0xfffe);
    });

    test("RET C", ({ ctx }) => {
      ctx.regs.writePair(RegisterPair.PC, 0x9000);
      ctx.regs.writePair(RegisterPair.SP, 0xfffc);
      ctx.memory.write(0xfffd, getMSB(0x8003));
      ctx.memory.write(0xfffc, getLSB(0x8003));
      ctx.regs.setFlag(Flag.Z, true);

      returnFromFunctionConditional(ctx, "C");

      expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x9000);
      expect(ctx.regs.readPair(RegisterPair.SP)).toBe(0xfffc);
    });

    test("RET NC", ({ ctx }) => {
      ctx.regs.writePair(RegisterPair.PC, 0x9000);
      ctx.regs.writePair(RegisterPair.SP, 0xfffc);
      ctx.memory.write(0xfffd, getMSB(0x8003));
      ctx.memory.write(0xfffc, getLSB(0x8003));
      ctx.regs.setFlag(Flag.Z, true);

      returnFromFunctionConditional(ctx, "NC");

      expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x8003);
      expect(ctx.regs.readPair(RegisterPair.SP)).toBe(0xfffe);
    });
  });

  test("RETI", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.PC, 0x9000);
    ctx.regs.writePair(RegisterPair.SP, 0xfffc);
    ctx.memory.write(0xfffd, getMSB(0x8001));
    ctx.memory.write(0xfffc, getLSB(0x8001));

    returnFromInterruptHandler(ctx);

    expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x8001);
    expect(ctx.regs.readPair(RegisterPair.SP)).toBe(0xfffe);
    expect(ctx.interruptFlags.isMasterEnabled()).toBe(true);
  });

  test("RST t", ({ ctx }) => {
    ctx.regs.writePair(RegisterPair.PC, 0x8001);
    ctx.regs.writePair(RegisterPair.SP, 0xfffe);

    restartFunction(ctx, 0x10);

    expect(ctx.regs.readPair(RegisterPair.PC)).toBe(0x0010);
    expect(ctx.memory.read(0xfffd)).toBe(0x80);
    expect(ctx.memory.read(0xfffc)).toBe(0x01);
    expect(ctx.regs.readPair(RegisterPair.SP)).toBe(0xfffc);
  });
});

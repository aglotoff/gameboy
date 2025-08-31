import { describe, expect } from "vitest";

import { Flag, RegisterPair } from "../register";
import { getLSB, getMSB } from "../../utils";

import { testInstruction } from "./test-lib";

import {
  callFunction,
  callFunctionConditionally,
  jumpToAddress,
  jumpToAddressConditionally,
  jumpToAddressInHL,
  jumpToRelative,
  jumpToRelativeConditionally,
  restartFunction,
  returnFromFunction,
  returnFromFunctionConditionally,
  returnFromInterruptHandler,
} from "./flow";
import { Condition } from "./lib";

describe("Control flow instructions", () => {
  testInstruction("JP n16", ({ ctx }) => {
    ctx.memory.write(0x00, getLSB(0x8000));
    ctx.memory.write(0x01, getMSB(0x8000));

    jumpToAddress(ctx);

    expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8000);
    expect(ctx.state.getElapsedCycles()).toBe(4);
  });

  testInstruction("JP HL", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.HL, 0x8000);

    jumpToAddressInHL(ctx);

    expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8000);
    expect(ctx.state.getElapsedCycles()).toBe(1);
  });

  describe("JP cc,n16", () => {
    testInstruction("JP NZ,n16", ({ ctx }) => {
      ctx.memory.write(0x00, getLSB(0x8000));
      ctx.memory.write(0x01, getMSB(0x8000));
      ctx.registers.setFlag(Flag.Z, true);

      jumpToAddressConditionally(ctx, Condition.NZ);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x0002);
      expect(ctx.state.getElapsedCycles()).toBe(3);
    });

    testInstruction("JP Z,n16", ({ ctx }) => {
      ctx.memory.write(0x00, getLSB(0x8000));
      ctx.memory.write(0x01, getMSB(0x8000));
      ctx.registers.setFlag(Flag.Z, true);

      jumpToAddressConditionally(ctx, Condition.Z);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8000);
      expect(ctx.state.getElapsedCycles()).toBe(4);
    });

    testInstruction("JP C,n16", ({ ctx }) => {
      ctx.memory.write(0x00, getLSB(0x8000));
      ctx.memory.write(0x01, getMSB(0x8000));
      ctx.registers.setFlag(Flag.Z, true);

      jumpToAddressConditionally(ctx, Condition.C);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x0002);
      expect(ctx.state.getElapsedCycles()).toBe(3);
    });

    testInstruction("JP NC,n16", ({ ctx }) => {
      ctx.memory.write(0x00, getLSB(0x8000));
      ctx.memory.write(0x01, getMSB(0x8000));
      ctx.registers.setFlag(Flag.Z, true);

      jumpToAddressConditionally(ctx, Condition.NC);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8000);
      expect(ctx.state.getElapsedCycles()).toBe(4);
    });
  });

  testInstruction("JR e8", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.PC, 0x8000);
    ctx.memory.write(0x8000, 0x14);

    jumpToRelative(ctx);

    expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8015);
    expect(ctx.state.getElapsedCycles()).toBe(3);
  });

  describe("JR cc,e8", () => {
    testInstruction("JR NZ,e8", ({ ctx }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x8000);
      ctx.memory.write(0x8000, 0xfa);
      ctx.registers.setFlag(Flag.Z, true);

      jumpToRelativeConditionally(ctx, Condition.NZ);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8001);
      expect(ctx.state.getElapsedCycles()).toBe(2);
    });

    testInstruction("JR Z,e8", ({ ctx }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x8000);
      ctx.memory.write(0x8000, 0xfa);
      ctx.registers.setFlag(Flag.Z, true);

      jumpToRelativeConditionally(ctx, Condition.Z);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x7ffb);
      expect(ctx.state.getElapsedCycles()).toBe(3);
    });

    testInstruction("JR C,e8", ({ ctx }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x8000);
      ctx.memory.write(0x8000, 0xfa);
      ctx.registers.setFlag(Flag.Z, true);

      jumpToRelativeConditionally(ctx, Condition.C);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8001);
      expect(ctx.state.getElapsedCycles()).toBe(2);
    });

    testInstruction("JR NC,e8", ({ ctx }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x8000);
      ctx.memory.write(0x8000, 0xfa);
      ctx.registers.setFlag(Flag.Z, true);

      jumpToRelativeConditionally(ctx, Condition.NC);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x7ffb);
      expect(ctx.state.getElapsedCycles()).toBe(3);
    });
  });

  testInstruction("CALL n16", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.PC, 0x8000);
    ctx.registers.writePair(RegisterPair.SP, 0xfffe);
    ctx.memory.write(0x8000, getLSB(0x1234));
    ctx.memory.write(0x8001, getMSB(0x1234));

    callFunction(ctx);

    expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x1234);
    expect(ctx.memory.read(0xfffd)).toBe(0x80);
    expect(ctx.memory.read(0xfffc)).toBe(0x02);
    expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffc);
    expect(ctx.state.getElapsedCycles()).toBe(6);
  });

  describe("CALL cc,n16", () => {
    testInstruction("CALL NZ,n16", ({ ctx }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x8000);
      ctx.registers.writePair(RegisterPair.SP, 0xfffe);
      ctx.memory.write(0x8000, getLSB(0x1234));
      ctx.memory.write(0x8001, getMSB(0x1234));
      ctx.registers.setFlag(Flag.Z, true);

      callFunctionConditionally(ctx, Condition.NZ);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8002);
      expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffe);
      expect(ctx.state.getElapsedCycles()).toBe(3);
    });

    testInstruction("CALL Z,n16", ({ ctx }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x8000);
      ctx.registers.writePair(RegisterPair.SP, 0xfffe);
      ctx.memory.write(0x8000, getLSB(0x1234));
      ctx.memory.write(0x8001, getMSB(0x1234));
      ctx.registers.setFlag(Flag.Z, true);

      callFunctionConditionally(ctx, Condition.Z);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x1234);
      expect(ctx.memory.read(0xfffd)).toBe(0x80);
      expect(ctx.memory.read(0xfffc)).toBe(0x02);
      expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffc);
      expect(ctx.state.getElapsedCycles()).toBe(6);
    });

    testInstruction("CALL C,n16", ({ ctx }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x8000);
      ctx.registers.writePair(RegisterPair.SP, 0xfffe);
      ctx.memory.write(0x8000, getLSB(0x1234));
      ctx.memory.write(0x8001, getMSB(0x1234));
      ctx.registers.setFlag(Flag.Z, true);

      callFunctionConditionally(ctx, Condition.C);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8002);
      expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffe);
      expect(ctx.state.getElapsedCycles()).toBe(3);
    });

    testInstruction("CALL NC,n16", ({ ctx }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x8000);
      ctx.registers.writePair(RegisterPair.SP, 0xfffe);
      ctx.memory.write(0x8000, getLSB(0x1234));
      ctx.memory.write(0x8001, getMSB(0x1234));
      ctx.registers.setFlag(Flag.Z, true);

      callFunctionConditionally(ctx, Condition.NC);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x1234);
      expect(ctx.memory.read(0xfffd)).toBe(0x80);
      expect(ctx.memory.read(0xfffc)).toBe(0x02);
      expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffc);
      expect(ctx.state.getElapsedCycles()).toBe(6);
    });
  });

  testInstruction("RET", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.PC, 0x9000);
    ctx.registers.writePair(RegisterPair.SP, 0xfffc);
    ctx.memory.write(0xfffd, getMSB(0x8003));
    ctx.memory.write(0xfffc, getLSB(0x8003));

    returnFromFunction(ctx);

    expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8003);
    expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffe);
    expect(ctx.state.getElapsedCycles()).toBe(4);
  });

  describe("RET cc", () => {
    testInstruction("RET NZ", ({ ctx }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x9000);
      ctx.registers.writePair(RegisterPair.SP, 0xfffc);
      ctx.memory.write(0xfffd, getMSB(0x8003));
      ctx.memory.write(0xfffc, getLSB(0x8003));
      ctx.registers.setFlag(Flag.Z, true);

      returnFromFunctionConditionally(ctx, Condition.NZ);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x9000);
      expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffc);
      expect(ctx.state.getElapsedCycles()).toBe(2);
    });

    testInstruction("RET Z", ({ ctx }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x9000);
      ctx.registers.writePair(RegisterPair.SP, 0xfffc);
      ctx.memory.write(0xfffd, getMSB(0x8003));
      ctx.memory.write(0xfffc, getLSB(0x8003));
      ctx.registers.setFlag(Flag.Z, true);

      returnFromFunctionConditionally(ctx, Condition.Z);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8003);
      expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffe);
      expect(ctx.state.getElapsedCycles()).toBe(5);
    });

    testInstruction("RET C", ({ ctx }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x9000);
      ctx.registers.writePair(RegisterPair.SP, 0xfffc);
      ctx.memory.write(0xfffd, getMSB(0x8003));
      ctx.memory.write(0xfffc, getLSB(0x8003));
      ctx.registers.setFlag(Flag.Z, true);

      returnFromFunctionConditionally(ctx, Condition.C);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x9000);
      expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffc);
      expect(ctx.state.getElapsedCycles()).toBe(2);
    });

    testInstruction("RET NC", ({ ctx }) => {
      ctx.registers.writePair(RegisterPair.PC, 0x9000);
      ctx.registers.writePair(RegisterPair.SP, 0xfffc);
      ctx.memory.write(0xfffd, getMSB(0x8003));
      ctx.memory.write(0xfffc, getLSB(0x8003));
      ctx.registers.setFlag(Flag.Z, true);

      returnFromFunctionConditionally(ctx, Condition.NC);

      expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8003);
      expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffe);
      expect(ctx.state.getElapsedCycles()).toBe(5);
    });
  });

  testInstruction("RETI", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.PC, 0x9000);
    ctx.registers.writePair(RegisterPair.SP, 0xfffc);
    ctx.memory.write(0xfffd, getMSB(0x8001));
    ctx.memory.write(0xfffc, getLSB(0x8001));

    returnFromInterruptHandler(ctx);

    expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x8001);
    expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffe);
    expect(ctx.state.isInterruptMasterEnabled()).toBe(true);
    expect(ctx.state.getElapsedCycles()).toBe(4);
  });

  testInstruction("RST vec", ({ ctx }) => {
    ctx.registers.writePair(RegisterPair.PC, 0x8001);
    ctx.registers.writePair(RegisterPair.SP, 0xfffe);

    restartFunction(ctx, 0x10);

    expect(ctx.registers.readPair(RegisterPair.PC)).toBe(0x0010);
    expect(ctx.memory.read(0xfffd)).toBe(0x80);
    expect(ctx.memory.read(0xfffc)).toBe(0x01);
    expect(ctx.registers.readPair(RegisterPair.SP)).toBe(0xfffc);
    expect(ctx.state.getElapsedCycles()).toBe(4);
  });
});

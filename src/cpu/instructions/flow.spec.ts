import { describe, expect } from "vitest";

import { RegisterPair, Flag } from "../register";
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
import { Condition } from "../cpu-state";

describe("Control flow instructions", () => {
  testCpuState("JP nn", ({ ctx, onCycle }) => {
    ctx.writeMemory(0x00, getLSB(0x8000));
    ctx.writeMemory(0x01, getMSB(0x8000));

    jump(ctx);

    expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x8000);
    expect(onCycle).toBeCalledTimes(4);
  });

  testCpuState("JP (HL)", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.HL, 0x8000);

    jumpToHL(ctx);

    expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x8000);
    expect(onCycle).toBeCalledTimes(1);
  });

  describe("JP cc,nn", () => {
    testCpuState("JP NZ, nn", ({ ctx, onCycle }) => {
      ctx.writeMemory(0x00, getLSB(0x8000));
      ctx.writeMemory(0x01, getMSB(0x8000));
      ctx.setFlag(Flag.Z, true);

      jumpConditional(ctx, Condition.NZ);

      expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x0002);
      expect(onCycle).toBeCalledTimes(3);
    });

    testCpuState("JP Z, nn", ({ ctx, onCycle }) => {
      ctx.writeMemory(0x00, getLSB(0x8000));
      ctx.writeMemory(0x01, getMSB(0x8000));
      ctx.setFlag(Flag.Z, true);

      jumpConditional(ctx, Condition.Z);

      expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x8000);
      expect(onCycle).toBeCalledTimes(4);
    });

    testCpuState("JP C, nn", ({ ctx, onCycle }) => {
      ctx.writeMemory(0x00, getLSB(0x8000));
      ctx.writeMemory(0x01, getMSB(0x8000));
      ctx.setFlag(Flag.Z, true);

      jumpConditional(ctx, Condition.C);

      expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x0002);
      expect(onCycle).toBeCalledTimes(3);
    });

    testCpuState("JP NC, nn", ({ ctx, onCycle }) => {
      ctx.writeMemory(0x00, getLSB(0x8000));
      ctx.writeMemory(0x01, getMSB(0x8000));
      ctx.setFlag(Flag.Z, true);

      jumpConditional(ctx, Condition.NC);

      expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x8000);
      expect(onCycle).toBeCalledTimes(4);
    });
  });

  testCpuState("JR e", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.PC, 0x8000);
    ctx.writeMemory(0x8000, 0x14);

    relativeJump(ctx);

    expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x8015);
    expect(onCycle).toBeCalledTimes(3);
  });

  describe("JR cc,e", () => {
    testCpuState("JR NZ, e", ({ ctx, onCycle }) => {
      ctx.writeRegisterPair(RegisterPair.PC, 0x8000);
      ctx.writeMemory(0x8000, 0xfa);
      ctx.setFlag(Flag.Z, true);

      relativeJumpConditional(ctx, Condition.NZ);

      expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x8001);
      expect(onCycle).toBeCalledTimes(2);
    });

    testCpuState("JR Z, e", ({ ctx, onCycle }) => {
      ctx.writeRegisterPair(RegisterPair.PC, 0x8000);
      ctx.writeMemory(0x8000, 0xfa);
      ctx.setFlag(Flag.Z, true);

      relativeJumpConditional(ctx, Condition.Z);

      expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x7ffb);
      expect(onCycle).toBeCalledTimes(3);
    });

    testCpuState("JR C, e", ({ ctx, onCycle }) => {
      ctx.writeRegisterPair(RegisterPair.PC, 0x8000);
      ctx.writeMemory(0x8000, 0xfa);
      ctx.setFlag(Flag.Z, true);

      relativeJumpConditional(ctx, Condition.C);

      expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x8001);
      expect(onCycle).toBeCalledTimes(2);
    });

    testCpuState("JR NC, e", ({ ctx, onCycle }) => {
      ctx.writeRegisterPair(RegisterPair.PC, 0x8000);
      ctx.writeMemory(0x8000, 0xfa);
      ctx.setFlag(Flag.Z, true);

      relativeJumpConditional(ctx, Condition.NC);

      expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x7ffb);
      expect(onCycle).toBeCalledTimes(3);
    });
  });

  testCpuState("CALL nn", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.PC, 0x8000);
    ctx.writeRegisterPair(RegisterPair.SP, 0xfffe);
    ctx.writeMemory(0x8000, getLSB(0x1234));
    ctx.writeMemory(0x8001, getMSB(0x1234));

    callFunction(ctx);

    expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x1234);
    expect(ctx.readMemory(0xfffd)).toBe(0x80);
    expect(ctx.readMemory(0xfffc)).toBe(0x02);
    expect(ctx.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
    expect(onCycle).toBeCalledTimes(6);
  });

  describe("CALL cc, nn", () => {
    testCpuState("CALL NZ, nn", ({ ctx, onCycle }) => {
      ctx.writeRegisterPair(RegisterPair.PC, 0x8000);
      ctx.writeRegisterPair(RegisterPair.SP, 0xfffe);
      ctx.writeMemory(0x8000, getLSB(0x1234));
      ctx.writeMemory(0x8001, getMSB(0x1234));
      ctx.setFlag(Flag.Z, true);

      callFunctionConditional(ctx, Condition.NZ);

      expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x8002);
      expect(ctx.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
      expect(onCycle).toBeCalledTimes(3);
    });

    testCpuState("CALL Z, nn", ({ ctx, onCycle }) => {
      ctx.writeRegisterPair(RegisterPair.PC, 0x8000);
      ctx.writeRegisterPair(RegisterPair.SP, 0xfffe);
      ctx.writeMemory(0x8000, getLSB(0x1234));
      ctx.writeMemory(0x8001, getMSB(0x1234));
      ctx.setFlag(Flag.Z, true);

      callFunctionConditional(ctx, Condition.Z);

      expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x1234);
      expect(ctx.readMemory(0xfffd)).toBe(0x80);
      expect(ctx.readMemory(0xfffc)).toBe(0x02);
      expect(ctx.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
      expect(onCycle).toBeCalledTimes(6);
    });

    testCpuState("CALL C, nn", ({ ctx, onCycle }) => {
      ctx.writeRegisterPair(RegisterPair.PC, 0x8000);
      ctx.writeRegisterPair(RegisterPair.SP, 0xfffe);
      ctx.writeMemory(0x8000, getLSB(0x1234));
      ctx.writeMemory(0x8001, getMSB(0x1234));
      ctx.setFlag(Flag.Z, true);

      callFunctionConditional(ctx, Condition.C);

      expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x8002);
      expect(ctx.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
      expect(onCycle).toBeCalledTimes(3);
    });

    testCpuState("CALL NC, nn", ({ ctx, onCycle }) => {
      ctx.writeRegisterPair(RegisterPair.PC, 0x8000);
      ctx.writeRegisterPair(RegisterPair.SP, 0xfffe);
      ctx.writeMemory(0x8000, getLSB(0x1234));
      ctx.writeMemory(0x8001, getMSB(0x1234));
      ctx.setFlag(Flag.Z, true);

      callFunctionConditional(ctx, Condition.NC);

      expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x1234);
      expect(ctx.readMemory(0xfffd)).toBe(0x80);
      expect(ctx.readMemory(0xfffc)).toBe(0x02);
      expect(ctx.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
      expect(onCycle).toBeCalledTimes(6);
    });
  });

  testCpuState("RET", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.PC, 0x9000);
    ctx.writeRegisterPair(RegisterPair.SP, 0xfffc);
    ctx.writeMemory(0xfffd, getMSB(0x8003));
    ctx.writeMemory(0xfffc, getLSB(0x8003));

    returnFromFunction(ctx);

    expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x8003);
    expect(ctx.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
    expect(onCycle).toBeCalledTimes(4);
  });

  describe("RET cc", () => {
    testCpuState("RET NZ", ({ ctx, onCycle }) => {
      ctx.writeRegisterPair(RegisterPair.PC, 0x9000);
      ctx.writeRegisterPair(RegisterPair.SP, 0xfffc);
      ctx.writeMemory(0xfffd, getMSB(0x8003));
      ctx.writeMemory(0xfffc, getLSB(0x8003));
      ctx.setFlag(Flag.Z, true);

      returnFromFunctionConditional(ctx, Condition.NZ);

      expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x9000);
      expect(ctx.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
      expect(onCycle).toBeCalledTimes(2);
    });

    testCpuState("RET Z", ({ ctx, onCycle }) => {
      ctx.writeRegisterPair(RegisterPair.PC, 0x9000);
      ctx.writeRegisterPair(RegisterPair.SP, 0xfffc);
      ctx.writeMemory(0xfffd, getMSB(0x8003));
      ctx.writeMemory(0xfffc, getLSB(0x8003));
      ctx.setFlag(Flag.Z, true);

      returnFromFunctionConditional(ctx, Condition.Z);

      expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x8003);
      expect(ctx.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
      expect(onCycle).toBeCalledTimes(5);
    });

    testCpuState("RET C", ({ ctx, onCycle }) => {
      ctx.writeRegisterPair(RegisterPair.PC, 0x9000);
      ctx.writeRegisterPair(RegisterPair.SP, 0xfffc);
      ctx.writeMemory(0xfffd, getMSB(0x8003));
      ctx.writeMemory(0xfffc, getLSB(0x8003));
      ctx.setFlag(Flag.Z, true);

      returnFromFunctionConditional(ctx, Condition.C);

      expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x9000);
      expect(ctx.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
      expect(onCycle).toBeCalledTimes(2);
    });

    testCpuState("RET NC", ({ ctx, onCycle }) => {
      ctx.writeRegisterPair(RegisterPair.PC, 0x9000);
      ctx.writeRegisterPair(RegisterPair.SP, 0xfffc);
      ctx.writeMemory(0xfffd, getMSB(0x8003));
      ctx.writeMemory(0xfffc, getLSB(0x8003));
      ctx.setFlag(Flag.Z, true);

      returnFromFunctionConditional(ctx, Condition.NC);

      expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x8003);
      expect(ctx.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
      expect(onCycle).toBeCalledTimes(5);
    });
  });

  testCpuState("RETI", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.PC, 0x9000);
    ctx.writeRegisterPair(RegisterPair.SP, 0xfffc);
    ctx.writeMemory(0xfffd, getMSB(0x8001));
    ctx.writeMemory(0xfffc, getLSB(0x8001));

    returnFromInterruptHandler(ctx);

    expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x8001);
    expect(ctx.readRegisterPair(RegisterPair.SP)).toBe(0xfffe);
    expect(ctx.isInterruptMasterEnabled()).toBe(true);
    expect(onCycle).toBeCalledTimes(4);
  });

  testCpuState("RST t", ({ ctx, onCycle }) => {
    ctx.writeRegisterPair(RegisterPair.PC, 0x8001);
    ctx.writeRegisterPair(RegisterPair.SP, 0xfffe);

    restartFunction(ctx, 0x10);

    expect(ctx.readRegisterPair(RegisterPair.PC)).toBe(0x0010);
    expect(ctx.readMemory(0xfffd)).toBe(0x80);
    expect(ctx.readMemory(0xfffc)).toBe(0x01);
    expect(ctx.readRegisterPair(RegisterPair.SP)).toBe(0xfffc);
    expect(onCycle).toBeCalledTimes(4);
  });
});

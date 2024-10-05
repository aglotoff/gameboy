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
import { test } from "./test-lib";

describe("Control flow instructions", () => {
  test("JP nn", ({ cpu, memory }) => {
    memory.write(0x00, getLSB(0x8000));
    memory.write(0x01, getMSB(0x8000));

    jump({ cpu, memory });

    expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x8000);
  });

  test("JP (HL)", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.HL, 0x8000);

    jumpToHL({ cpu, memory });

    expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x8000);
  });

  describe("JP cc,nn", () => {
    test("JP NZ, nn", ({ cpu, memory }) => {
      memory.write(0x00, getLSB(0x8000));
      memory.write(0x01, getMSB(0x8000));
      cpu.regs.setFlag(Flag.Z, true);

      jumpConditional({ cpu, memory }, "NZ");

      expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x0002);
    });

    test("JP Z, nn", ({ cpu, memory }) => {
      memory.write(0x00, getLSB(0x8000));
      memory.write(0x01, getMSB(0x8000));
      cpu.regs.setFlag(Flag.Z, true);

      jumpConditional({ cpu, memory }, "Z");

      expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x8000);
    });

    test("JP C, nn", ({ cpu, memory }) => {
      memory.write(0x00, getLSB(0x8000));
      memory.write(0x01, getMSB(0x8000));
      cpu.regs.setFlag(Flag.Z, true);

      jumpConditional({ cpu, memory }, "C");

      expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x0002);
    });

    test("JP NC, nn", ({ cpu, memory }) => {
      memory.write(0x00, getLSB(0x8000));
      memory.write(0x01, getMSB(0x8000));
      cpu.regs.setFlag(Flag.Z, true);

      jumpConditional({ cpu, memory }, "NC");

      expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x8000);
    });
  });

  test("JR e", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.PC, 0x8000);
    memory.write(0x8000, 0x14);

    relativeJump({ cpu, memory });

    expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x8015);
  });

  describe("JR cc,e", () => {
    test("JR NZ, e", ({ cpu, memory }) => {
      cpu.regs.writePair(RegisterPair.PC, 0x8000);
      memory.write(0x8000, 0xfa);
      cpu.regs.setFlag(Flag.Z, true);

      relativeJumpConditional({ cpu, memory }, "NZ");

      expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x8001);
    });

    test("JR Z, e", ({ cpu, memory }) => {
      cpu.regs.writePair(RegisterPair.PC, 0x8000);
      memory.write(0x8000, 0xfa);
      cpu.regs.setFlag(Flag.Z, true);

      relativeJumpConditional({ cpu, memory }, "Z");

      expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x7ffb);
    });

    test("JR C, e", ({ cpu, memory }) => {
      cpu.regs.writePair(RegisterPair.PC, 0x8000);
      memory.write(0x8000, 0xfa);
      cpu.regs.setFlag(Flag.Z, true);

      relativeJumpConditional({ cpu, memory }, "C");

      expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x8001);
    });

    test("JR NC, e", ({ cpu, memory }) => {
      cpu.regs.writePair(RegisterPair.PC, 0x8000);
      memory.write(0x8000, 0xfa);
      cpu.regs.setFlag(Flag.Z, true);

      relativeJumpConditional({ cpu, memory }, "NC");

      expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x7ffb);
    });
  });

  test("CALL nn", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.PC, 0x8000);
    cpu.regs.writePair(RegisterPair.SP, 0xfffe);
    memory.write(0x8000, getLSB(0x1234));
    memory.write(0x8001, getMSB(0x1234));

    callFunction({ cpu, memory });

    expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x1234);
    expect(memory.read(0xfffd)).toBe(0x80);
    expect(memory.read(0xfffc)).toBe(0x02);
    expect(cpu.regs.readPair(RegisterPair.SP)).toBe(0xfffc);
  });

  describe("CALL cc, nn", () => {
    test("CALL NZ, nn", ({ cpu, memory }) => {
      cpu.regs.writePair(RegisterPair.PC, 0x8000);
      cpu.regs.writePair(RegisterPair.SP, 0xfffe);
      memory.write(0x8000, getLSB(0x1234));
      memory.write(0x8001, getMSB(0x1234));
      cpu.regs.setFlag(Flag.Z, true);

      callFunctionConditional({ cpu, memory }, "NZ");

      expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x8002);
      expect(cpu.regs.readPair(RegisterPair.SP)).toBe(0xfffe);
    });

    test("CALL Z, nn", ({ cpu, memory }) => {
      cpu.regs.writePair(RegisterPair.PC, 0x8000);
      cpu.regs.writePair(RegisterPair.SP, 0xfffe);
      memory.write(0x8000, getLSB(0x1234));
      memory.write(0x8001, getMSB(0x1234));
      cpu.regs.setFlag(Flag.Z, true);

      callFunctionConditional({ cpu, memory }, "Z");

      expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x1234);
      expect(memory.read(0xfffd)).toBe(0x80);
      expect(memory.read(0xfffc)).toBe(0x02);
      expect(cpu.regs.readPair(RegisterPair.SP)).toBe(0xfffc);
    });

    test("CALL C, nn", ({ cpu, memory }) => {
      cpu.regs.writePair(RegisterPair.PC, 0x8000);
      cpu.regs.writePair(RegisterPair.SP, 0xfffe);
      memory.write(0x8000, getLSB(0x1234));
      memory.write(0x8001, getMSB(0x1234));
      cpu.regs.setFlag(Flag.Z, true);

      callFunctionConditional({ cpu, memory }, "C");

      expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x8002);
      expect(cpu.regs.readPair(RegisterPair.SP)).toBe(0xfffe);
    });

    test("CALL NC, nn", ({ cpu, memory }) => {
      cpu.regs.writePair(RegisterPair.PC, 0x8000);
      cpu.regs.writePair(RegisterPair.SP, 0xfffe);
      memory.write(0x8000, getLSB(0x1234));
      memory.write(0x8001, getMSB(0x1234));
      cpu.regs.setFlag(Flag.Z, true);

      callFunctionConditional({ cpu, memory }, "NC");

      expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x1234);
      expect(memory.read(0xfffd)).toBe(0x80);
      expect(memory.read(0xfffc)).toBe(0x02);
      expect(cpu.regs.readPair(RegisterPair.SP)).toBe(0xfffc);
    });
  });

  test("RET", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.PC, 0x9000);
    cpu.regs.writePair(RegisterPair.SP, 0xfffc);
    memory.write(0xfffd, getMSB(0x8003));
    memory.write(0xfffc, getLSB(0x8003));

    returnFromFunction({ cpu, memory });

    expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x8003);
    expect(cpu.regs.readPair(RegisterPair.SP)).toBe(0xfffe);
  });

  describe("RET cc", () => {
    test("RET NZ", ({ cpu, memory }) => {
      cpu.regs.writePair(RegisterPair.PC, 0x9000);
      cpu.regs.writePair(RegisterPair.SP, 0xfffc);
      memory.write(0xfffd, getMSB(0x8003));
      memory.write(0xfffc, getLSB(0x8003));
      cpu.regs.setFlag(Flag.Z, true);

      returnFromFunctionConditional({ cpu, memory }, "NZ");

      expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x9000);
      expect(cpu.regs.readPair(RegisterPair.SP)).toBe(0xfffc);
    });

    test("RET Z", ({ cpu, memory }) => {
      cpu.regs.writePair(RegisterPair.PC, 0x9000);
      cpu.regs.writePair(RegisterPair.SP, 0xfffc);
      memory.write(0xfffd, getMSB(0x8003));
      memory.write(0xfffc, getLSB(0x8003));
      cpu.regs.setFlag(Flag.Z, true);

      returnFromFunctionConditional({ cpu, memory }, "Z");

      expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x8003);
      expect(cpu.regs.readPair(RegisterPair.SP)).toBe(0xfffe);
    });

    test("RET C", ({ cpu, memory }) => {
      cpu.regs.writePair(RegisterPair.PC, 0x9000);
      cpu.regs.writePair(RegisterPair.SP, 0xfffc);
      memory.write(0xfffd, getMSB(0x8003));
      memory.write(0xfffc, getLSB(0x8003));
      cpu.regs.setFlag(Flag.Z, true);

      returnFromFunctionConditional({ cpu, memory }, "C");

      expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x9000);
      expect(cpu.regs.readPair(RegisterPair.SP)).toBe(0xfffc);
    });

    test("RET NC", ({ cpu, memory }) => {
      cpu.regs.writePair(RegisterPair.PC, 0x9000);
      cpu.regs.writePair(RegisterPair.SP, 0xfffc);
      memory.write(0xfffd, getMSB(0x8003));
      memory.write(0xfffc, getLSB(0x8003));
      cpu.regs.setFlag(Flag.Z, true);

      returnFromFunctionConditional({ cpu, memory }, "NC");

      expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x8003);
      expect(cpu.regs.readPair(RegisterPair.SP)).toBe(0xfffe);
    });
  });

  test("RETI", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.PC, 0x9000);
    cpu.regs.writePair(RegisterPair.SP, 0xfffc);
    memory.write(0xfffd, getMSB(0x8001));
    memory.write(0xfffc, getLSB(0x8001));

    returnFromInterruptHandler({ cpu, memory });

    expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x8001);
    expect(cpu.regs.readPair(RegisterPair.SP)).toBe(0xfffe);
    expect(cpu.ime).toBe(true);
  });

  test("RST t", ({ cpu, memory }) => {
    cpu.regs.writePair(RegisterPair.PC, 0x8001);
    cpu.regs.writePair(RegisterPair.SP, 0xfffe);

    restartFunction({ cpu, memory }, 0x10);

    expect(cpu.regs.readPair(RegisterPair.PC)).toBe(0x0010);
    expect(memory.read(0xfffd)).toBe(0x80);
    expect(memory.read(0xfffc)).toBe(0x01);
    expect(cpu.regs.readPair(RegisterPair.SP)).toBe(0xfffc);
  });
});

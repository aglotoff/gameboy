export function add(a: number, b: number, carryFlag = false) {
  const c = carryFlag ? 1 : 0;

  return {
    carryFrom3: (a & 0xf) + (b & 0xf) + c > 0xf,
    carryFrom7: (a & 0xff) + (b & 0xff) + c > 0xff,
    result: (a + b + c) & 0xff,
  };
}

export function add16(a: number, b: number, carryFlag = false) {
  const c = carryFlag ? 1 : 0;

  return {
    carryFrom3: (a & 0xf) + (b & 0xf) + c > 0xf,
    carryFrom7: (a & 0xff) + (b & 0xff) + c > 0xff,
    result: (a + b + c) & 0xffff,
  };
}

export function sub(a: number, b: number, carryFlag = false) {
  const c = carryFlag ? 1 : 0;

  return {
    borrowTo3: (a & 0xf) < (b & 0xf) + c,
    borrowTo7: (a & 0xff) < (b & 0xff) + c,
    result: (a - b - c) & 0xff,
  };
}

const VRAM_SIZE = 0x2000;

const BYTES_PER_TILE = 16;
const BYTES_PER_LINE = 2;

const TILE_PX_WIDTH = 8;
const TILE_PX_HEIGHT = 8;

const TILE_MAP_WIDTH = 32;
const TILE_MAP_HEIGHT = 32;
const TILE_MAP_SIZE = TILE_MAP_WIDTH * TILE_MAP_HEIGHT;

const TILE_MAP_PX_WIDTH = TILE_PX_WIDTH * TILE_MAP_WIDTH;
const TILE_MAP_PX_HEIGHT = TILE_PX_HEIGHT * TILE_MAP_HEIGHT;

const TILE_MAP_BASE = 0x1800;

export class VRAM {
  private memory = new Uint8Array(VRAM_SIZE);
  private isReadLocked = false;
  private isWriteLocked = false;

  public readTileDataLow(tileNo: number, y: number) {
    return this.memory[this.getTileDataOffset(tileNo, y)];
  }

  public readTileDataHigh(tileNo: number, y: number) {
    return this.memory[this.getTileDataOffset(tileNo, y) + 1];
  }

  private getTileDataOffset(tileNo: number, y: number) {
    return tileNo * BYTES_PER_TILE + (y % TILE_PX_HEIGHT) * BYTES_PER_LINE;
  }

  public readTileMap(area: number, x: number, y: number) {
    const tileIndex = this.getTileMapIndex(x, y);
    return this.memory[TILE_MAP_BASE + area * TILE_MAP_SIZE + tileIndex];
  }

  private getTileMapIndex(x: number, y: number) {
    const mapX = x % TILE_MAP_PX_WIDTH;
    const mapY = y % TILE_MAP_PX_HEIGHT;

    const tileX = Math.floor(mapX / TILE_PX_WIDTH) % TILE_MAP_WIDTH;
    const tileY = Math.floor(mapY / TILE_PX_HEIGHT);

    return (tileY * TILE_MAP_WIDTH + tileX) % TILE_MAP_SIZE;
  }

  public lockRead() {
    this.isReadLocked = true;
  }

  public unlockRead() {
    this.isReadLocked = false;
  }

  public lockWrite() {
    this.isWriteLocked = true;
  }

  public unlockWrite() {
    this.isWriteLocked = false;
  }

  public read(offset: number) {
    return this.isReadLocked ? 0xff : this.memory[offset];
  }

  public write(offset: number, value: number) {
    if (!this.isWriteLocked) {
      this.memory[offset] = value;
    }
  }
}

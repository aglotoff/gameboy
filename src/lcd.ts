import { ILCD } from "./hw/graphics";

export class LCD implements ILCD {
  private imageData: ImageData;

  constructor(private context: CanvasRenderingContext2D) {
    this.imageData = context.createImageData(160 * 2, 144 * 2);
  }

  public render() {
    this.context.putImageData(this.imageData, 0, 0);
  }

  public setPixel(x: number, y: number, color: number) {
    this.setImagePixel(x * 2, y * 2, color);
    this.setImagePixel(x * 2 + 1, y * 2, color);
    this.setImagePixel(x * 2, y * 2 + 1, color);
    this.setImagePixel(x * 2 + 1, y * 2 + 1, color);
    //this.setImagePixel(x, y, color);
  }

  private setImagePixel(x: number, y: number, color: number) {
    const idx = (y * this.imageData.width + x) * 4;
    this.imageData.data[idx] = (color >> 24) & 0xff;
    this.imageData.data[idx + 1] = (color >> 16) & 0xff;
    this.imageData.data[idx + 2] = (color >> 8) & 0xff;
    this.imageData.data[idx + 3] = (color >> 0) & 0xff;
  }
}

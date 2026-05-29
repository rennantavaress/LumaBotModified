import sharp from "sharp";
import path from "path";
import { CONFIG, STICKER_METADATA } from "../config/constants.js";
import { Exif } from "../utils/Exif.js";

export class ImageProcessor {
  static async toSticker(buffer) {
    const webpBuffer = await sharp(buffer)
      .resize(CONFIG.STICKER_SIZE, CONFIG.STICKER_SIZE, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: CONFIG.STICKER_QUALITY })
      .toBuffer();

    return await Exif.writeExif(
      webpBuffer,
      STICKER_METADATA.PACK_NAME,
      STICKER_METADATA.AUTHOR
    );
  }

  static async toPng(buffer) {
    return sharp(buffer).png({ quality: 100 }).toBuffer();
  }

  static async toPdf(buffer) {
    const { data: imageBuffer, info } = await sharp(buffer)
      .rotate()
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 92 })
      .toBuffer({ resolveWithObject: true });

    return createSingleImagePdf(imageBuffer, info.width, info.height);
  }

  static async extractFrame(buffer, pageIndex, outputDir) {
    const framePath = path.join(
      outputDir,
      `frame_${String(pageIndex).padStart(3, "0")}.png`
    );

    await sharp(buffer, { page: pageIndex })
      .resize(CONFIG.STICKER_SIZE, CONFIG.STICKER_SIZE, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toFile(framePath);

    return framePath;
  }

  static async getMetadata(buffer) {
    return sharp(buffer).metadata();
  }
}

function createSingleImagePdf(jpegBuffer, width, height) {
  const objects = [];
  const content = `q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ\n`;

  objects.push(Buffer.from("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"));
  objects.push(Buffer.from("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"));
  objects.push(Buffer.from(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] ` +
    `/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  ));
  objects.push(Buffer.concat([
    Buffer.from(
      `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBuffer.length} >>\nstream\n`
    ),
    jpegBuffer,
    Buffer.from("\nendstream\nendobj\n"),
  ]));
  objects.push(Buffer.from(
    `5 0 obj\n<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}endstream\nendobj\n`
  ));

  const parts = [Buffer.from("%PDF-1.4\n")];
  const offsets = [0];
  let byteOffset = parts[0].length;

  for (const object of objects) {
    offsets.push(byteOffset);
    parts.push(object);
    byteOffset += object.length;
  }

  const xrefOffset = byteOffset;
  const xref = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF",
    "",
  ].join("\n");

  parts.push(Buffer.from(xref));
  return Buffer.concat(parts);
}

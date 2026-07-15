import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

/**
 * Local file storage for tribute photos.
 *
 * In production this would be swapped for Cloudinary or S3, but the public
 * interface (saveUpload -> returns a URL path) stays identical. Photos are
 * stored under /home/z/my-project/public/uploads/ and served from
 * /uploads/<filename>.
 *
 * Constraints:
 *  - JPEG, PNG, WebP only
 *  - Max 5 MB per file
 *  - Re-encoded to WebP at quality 80, max 1600px on the long edge, to
 *    keep storage and bandwidth modest.
 */

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads";
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

async function ensureDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function saveUpload(file: File): Promise<string> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new UploadError("Please upload a photo in JPEG, PNG, or WebP format.");
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError("Each photo must be 5 MB or smaller.");
  }

  const buf = Buffer.from(await file.arrayBuffer());

  // Re-encode through sharp — also validates that the bytes really are an image.
  let webpBuf: Buffer;
  try {
    webpBuf = await sharp(buf)
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw new UploadError("That photo could not be processed. Please try another image.");
  }

  await ensureDir();
  const name = `${crypto.randomBytes(16).toString("hex")}.webp`;
  const fullPath = path.join(UPLOAD_DIR, name);
  await fs.writeFile(fullPath, webpBuf);

  return `${PUBLIC_PREFIX}/${name}`;
}

/**
 * Delete an uploaded file. Used when a tribute is rejected so we don't
 * keep unwanted images forever. Best-effort — failure is logged but not
 * thrown, since the moderation state change has already happened.
 */
export async function deleteUpload(url: string): Promise<void> {
  if (!url.startsWith(PUBLIC_PREFIX)) return;
  const fullPath = path.join(UPLOAD_DIR, path.basename(url));
  try {
    await fs.unlink(fullPath);
  } catch {
    // ignore — file may already be gone
  }
}

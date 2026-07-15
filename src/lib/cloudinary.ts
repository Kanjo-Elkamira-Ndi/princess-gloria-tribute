import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary configuration and upload helpers.
 *
 * Environment variables required:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *   CLOUDINARY_FOLDER (optional — defaults to "gloria-memorial")
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const FOLDER = process.env.CLOUDINARY_FOLDER || "gloria-memorial";

export class CloudinaryUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CloudinaryUploadError";
  }
}

/**
 * Upload an image file to Cloudinary.
 * Returns the secure URL of the uploaded image.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        resource_type: "image",
        transformation: [
          { width: 1600, height: 1600, fit: "limit", crop: "limit" },
          { quality: "auto:good", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          reject(
            new CloudinaryUploadError(
              `Upload failed: ${error.message || "Unknown error"}`
            )
          );
          return;
        }
        if (!result?.secure_url) {
          reject(
            new CloudinaryUploadError("Upload failed: no URL returned.")
          );
          return;
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buf);
  });
}

/**
 * Delete an image from Cloudinary by its URL.
 * Best-effort — logs but doesn't throw on failure.
 */
export async function deleteFromCloudinary(url: string): Promise<void> {
  // Extract the public_id from the URL
  // Cloudinary URLs look like: https://res.cloudinary.com/<cloud>/image/upload/v1234/folder/filename.ext
  try {
    const parts = url.split("/");
    const uploadIdx = parts.indexOf("upload");
    if (uploadIdx === -1) return;

    // Everything after "upload/" and before the file extension is the public_id
    const pathAfterUpload = parts.slice(uploadIdx + 1).join("/");
    // Remove the version prefix (v1234/) if present
    const withoutVersion = pathAfterUpload.replace(/^v\d+\//, "");
    // Remove file extension
    const publicId = withoutVersion.replace(/\.[^.]+$/, "");

    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Best-effort deletion
  }
}

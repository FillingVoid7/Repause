import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

function ensureCloudinaryConfig(): void {
  if (isConfigured) {
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  isConfigured = true;
}

export type UploadFolder =
  | "stackfold/avatars"
  | "stackfold/exports"
  | "stackfold/screenshots";

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  format: string;
  bytes: number;
}

/**
 * Upload a buffer (PDF export, avatar image, etc.) to Cloudinary.
 */
export async function uploadBuffer(
  buffer: Buffer,
  options: {
    folder: UploadFolder;
    filename: string;
    resourceType?: "image" | "raw" | "auto";
    format?: string;
  },
): Promise<UploadResult> {
  ensureCloudinaryConfig();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.filename,
        resource_type: options.resourceType ?? "auto",
        format: options.format,
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          format: result.format ?? "",
          bytes: result.bytes,
        });
      },
    );

    uploadStream.end(buffer);
  });
}

/**
 * Remove an asset by public ID (e.g. when replacing an avatar).
 */
export async function deleteAsset(
  publicId: string,
  resourceType: "image" | "raw" | "video" = "image",
): Promise<void> {
  ensureCloudinaryConfig();
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

/**
 * Build a transformed Cloudinary URL for thumbnails or optimized delivery.
 */
export function getTransformedUrl(
  publicId: string,
  transformations?: Record<string, string | number>,
): string {
  ensureCloudinaryConfig();
  return cloudinary.url(publicId, {
    secure: true,
    transformation: transformations ? [transformations] : undefined,
  });
}

export { cloudinary };

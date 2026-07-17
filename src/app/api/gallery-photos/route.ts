import { NextRequest, NextResponse } from "next/server";
import { createPendingGalleryPhotos, getApprovedGalleryPhotos } from "@/lib/gallery-photos";
import { rateLimit } from "@/lib/rate-limit";
import { uploadToCloudinary, CloudinaryUploadError } from "@/lib/cloudinary";

/**
 * Public gallery photo endpoint.
 *
 * POST — submit one or more photos for admin review (uploaded to Cloudinary).
 *        Each photo becomes its own pending row, reviewed independently.
 * GET  — list approved photos.
 *
 * Security: honeypot, rate limit, server validation.
 */

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_PHOTOS = 10;
const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_CAPTION = 300;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * GET — list APPROVED gallery photos only.
 */
export async function GET() {
  const photos = await getApprovedGalleryPhotos();
  return NextResponse.json({ photos });
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const limit = rateLimit(`gallery-photo:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      {
        error:
          "You have submitted several photos already. Please pause for a few minutes before sharing another.",
      },
      { status: 429 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Please send your photo as a form." },
      { status: 400 }
    );
  }

  const name = (form.get("name") as string | null)?.trim() ?? "";
  const email = (form.get("email") as string | null)?.trim() ?? "";
  const caption = (form.get("caption") as string | null)?.trim() ?? "";
  const company = (form.get("company") as string | null)?.trim() ?? "";

  // Honeypot
  if (company) {
    return NextResponse.json(
      {
        ok: true,
        message: "Thank you for remembering Princess Gloria with such love.",
      },
      { status: 200 }
    );
  }

  if (!name) {
    return NextResponse.json(
      { error: "Please add your name so we know who is sharing." },
      { status: 400 }
    );
  }
  if (name.length > MAX_NAME) {
    return NextResponse.json(
      { error: "Please keep your name under 120 characters." },
      { status: 400 }
    );
  }
  if (email && email.length > MAX_EMAIL) {
    return NextResponse.json(
      { error: "That email address looks too long — please check it." },
      { status: 400 }
    );
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "That email address doesn’t look quite right." },
      { status: 400 }
    );
  }
  if (caption && caption.length > MAX_CAPTION) {
    return NextResponse.json(
      { error: "Please keep your caption under 300 characters." },
      { status: 400 }
    );
  }

  // Photos — one or more
  const photoFiles = form
    .getAll("photo")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (photoFiles.length === 0) {
    return NextResponse.json(
      { error: "Please select at least one photo to share." },
      { status: 400 }
    );
  }

  if (photoFiles.length > MAX_PHOTOS) {
    return NextResponse.json(
      { error: `Please choose up to ${MAX_PHOTOS} photos.` },
      { status: 400 }
    );
  }

  for (const file of photoFiles) {
    if (file.size > MAX_PHOTO_BYTES) {
      return NextResponse.json(
        { error: "Each photo must be 5 MB or smaller." },
        { status: 400 }
      );
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Photos must be in JPEG, PNG, or WebP format." },
        { status: 400 }
      );
    }
  }

  const photoUrls: string[] = [];
  for (const file of photoFiles) {
    try {
      photoUrls.push(await uploadToCloudinary(file));
    } catch (err) {
      if (err instanceof CloudinaryUploadError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      return NextResponse.json(
        { error: "One of your photos could not be saved. Please try again." },
        { status: 500 }
      );
    }
  }

  try {
    await createPendingGalleryPhotos({
      name,
      email: email || undefined,
      photoUrls,
      caption: caption || undefined,
      company,
    });
  } catch (err) {
    console.error("[gallery-photos] failed to insert pending photos", err);
    return NextResponse.json(
      {
        error: "We couldn’t save your photos just now. Please try again in a moment.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      message: "Thank you for remembering Princess Gloria with such love.",
    },
    { status: 201 }
  );
}

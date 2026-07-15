import { NextRequest, NextResponse } from "next/server";
import { createPendingGalleryPhoto, getApprovedGalleryPhotos } from "@/lib/gallery-photos";
import { rateLimit } from "@/lib/rate-limit";
import { saveUpload, UploadError } from "@/lib/storage";

/**
 * Public gallery photo endpoint.
 *
 * POST — submit a photo for admin review.
 * GET  — list approved photos.
 *
 * Same security model as tributes: honeypot, rate limit, server validation,
 * re-encoded through sharp.
 */

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_CAPTION = 300;

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
        message: "Thank you. Your photo has been received and is pending review.",
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
      { error: "That email address doesn\u2019t look quite right." },
      { status: 400 }
    );
  }
  if (caption && caption.length > MAX_CAPTION) {
    return NextResponse.json(
      { error: "Please keep your caption under 300 characters." },
      { status: 400 }
    );
  }

  // Photo — exactly 1
  const photoFile = form
    .getAll("photo")
    .find((f): f is File => f instanceof File && f.size > 0);

  if (!photoFile) {
    return NextResponse.json(
      { error: "Please select a photo to share." },
      { status: 400 }
    );
  }

  let photoUrl: string;
  try {
    photoUrl = await saveUpload(photoFile);
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Your photo could not be saved. Please try again." },
      { status: 500 }
    );
  }

  try {
    await createPendingGalleryPhoto({
      name,
      email: email || undefined,
      photoUrl,
      caption: caption || undefined,
      company,
    });
  } catch (err) {
    console.error("[gallery-photos] failed to insert pending photo", err);
    return NextResponse.json(
      {
        error: "We couldn\u2019t save your photo just now. Please try again in a moment.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      message: "Thank you. Your photo has been received and is pending review.",
    },
    { status: 201 }
  );
}

import { NextRequest, NextResponse } from "next/server";
import { createPendingTribute, getApprovedTributes } from "@/lib/tributes";
import { rateLimit } from "@/lib/rate-limit";
import { saveUpload, UploadError } from "@/lib/storage";

/**
 * Public tribute endpoint.
 *
 * Security:
 *  - Honeypot field `company` — if filled, silently return success but
 *    drop the submission. Bots tend to fill every field.
 *  - Rate limited per IP (max 3 per 10 min).
 *  - Server-side validation of all fields.
 *  - Photos re-encoded through sharp — strips any embedded payload.
 *
 * Moderation:
 *  - Always inserted with status "pending". Never returned by any public
 *    route. Confirmation message is generic — no ID, no preview.
 */

const MAX_PHOTOS = 3;
const MAX_MESSAGE = 4000;
const MAX_NAME = 120;
const MAX_RELATIONSHIP = 120;
const MAX_EMAIL = 254;
const MAX_PHONE = 40;

/**
 * GET — list APPROVED tributes only.
 * Pending and rejected are NEVER surfaced. This is enforced inside
 * getApprovedTributes() and there is no other public path to the data.
 */
export async function GET() {
  const tributes = await getApprovedTributes();
  return NextResponse.json({ tributes });
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const limit = rateLimit(`tribute:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      {
        error:
          "You have shared several tributes already. Please pause for a few minutes before sharing another.",
      },
      { status: 429 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Please send your tribute as a form." },
      { status: 400 }
    );
  }

  const name = (form.get("name") as string | null)?.trim() ?? "";
  const relationship = (form.get("relationship") as string | null)?.trim() ?? "";
  const message = (form.get("message") as string | null)?.trim() ?? "";
  const email = (form.get("email") as string | null)?.trim() ?? "";
  const phone = (form.get("phone") as string | null)?.trim() ?? "";
  // Honeypot — must be empty for a real submission
  const company = (form.get("company") as string | null)?.trim() ?? "";

  // Honeypot: silently drop. Return the same calm confirmation so the
  // bot can't tell it was rejected.
  if (company) {
    return NextResponse.json(
      {
        ok: true,
        message:
          "Thank you for remembering Princess Gloria with such love.",
      },
      { status: 200 }
    );
  }

  // Validation — kind, specific messages
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
  if (!relationship) {
    return NextResponse.json(
      {
        error:
          "Please tell us your relationship to her — for example, “niece”, “friend”, “colleague”.",
      },
      { status: 400 }
    );
  }
  if (relationship.length > MAX_RELATIONSHIP) {
    return NextResponse.json(
      { error: "Please keep the relationship field under 120 characters." },
      { status: 400 }
    );
  }
  if (!message) {
    return NextResponse.json(
      { error: "Please write a short message before submitting." },
      { status: 400 }
    );
  }
  if (message.length > MAX_MESSAGE) {
    return NextResponse.json(
      { error: "Please keep your message under 4,000 characters." },
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
  if (phone && phone.length > MAX_PHONE) {
    return NextResponse.json(
      { error: "That phone number looks too long — please check it." },
      { status: 400 }
    );
  }

  // Photos — up to 3
  const photoFiles = form
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (photoFiles.length > MAX_PHOTOS) {
    return NextResponse.json(
      { error: "Please choose up to 3 photos." },
      { status: 400 }
    );
  }

  const photoUrls: string[] = [];
  for (const file of photoFiles) {
    try {
      const url = await saveUpload(file);
      photoUrls.push(url);
    } catch (err) {
      if (err instanceof UploadError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      return NextResponse.json(
        { error: "One of your photos could not be saved. Please try again." },
        { status: 500 }
      );
    }
  }

  try {
    await createPendingTribute({
      name,
      relationship,
      message,
      email: email || undefined,
      phone: phone || undefined,
      photos: photoUrls,
      company,
    });
  } catch (err) {
    console.error("[tributes] failed to insert pending tribute", err);
    return NextResponse.json(
      {
        error:
          "We couldn’t save your tribute just now. Please try again in a moment.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      message:
        "Thank you for remembering Princess Gloria with such love.",
    },
    { status: 201 }
  );
}

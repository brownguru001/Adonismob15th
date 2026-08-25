import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

// Magic-byte checks so a file can't get through just by lying about its
// browser-reported Content-Type — the client's `file.type` is otherwise
// fully attacker-controlled.
const SIGNATURES: Record<string, (buf: Buffer) => boolean> = {
  "image/jpeg": (buf) => buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  "image/png": (buf) =>
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47,
  "image/gif": (buf) => buf.toString("ascii", 0, 3) === "GIF",
  "image/webp": (buf) => buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP",
};

// Authenticated-only, allowlisted-mimetype upload used for design/product
// artwork and custom-order reference images. Stored in Vercel Blob (not
// local disk) since Vercel's serverless functions don't have persistent
// filesystem storage — anything written to disk here would vanish on the
// next invocation or deploy. Requires BLOB_READ_WRITE_TOKEN, which Vercel
// injects automatically once Blob storage is enabled on the project.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = checkRateLimit(`upload:${session.user.id}`, 20, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: limited.error }, { status: 429 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const matchesSignature = SIGNATURES[file.type]?.(buffer) ?? false;
  if (!matchesSignature) {
    return NextResponse.json({ error: "File content doesn't match its declared type" }, { status: 400 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "File storage isn't configured on this deployment yet." },
      { status: 503 }
    );
  }

  const filename = `${randomUUID()}.${ext}`;
  const blob = await put(filename, buffer, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}

import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getAdminWriteToken } from "@/lib/admin-write-token";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const PV_STORYBOARD_BUCKET = "pv-storyboard";

const MAX_BYTES = 8 * 1024 * 1024;

const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/x-png",
  "image/gif",
  "image/webp",
  "image/avif",
]);

function sniffImageMimeFromBytes(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.subarray(0, 8).equals(pngSig)) return "image/png";
  if (
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38 &&
    (buf[4] === 0x37 || buf[4] === 0x39)
  ) {
    return "image/gif";
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

function normalizeReportedMime(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (t === "image/jpg") return "image/jpeg";
  if (t === "image/x-png") return "image/png";
  return t;
}

function inferImageMime(
  file: File,
  sniffed: string | null
): { ok: true; mime: string } | { ok: false; error: string } {
  if (sniffed && ALLOWED.has(sniffed)) {
    return { ok: true, mime: sniffed === "image/x-png" ? "image/png" : sniffed };
  }

  const name = file.name.toLowerCase();
  if (name.endsWith(".heic") || name.endsWith(".heif")) {
    return {
      ok: false,
      error:
        "HEIC 形式は未対応です。JPEG または PNG に書き出してから選び直してください。",
    };
  }

  const raw = normalizeReportedMime(file.type || "");

  if (raw && raw !== "application/octet-stream") {
    if (ALLOWED.has(raw)) {
      return { ok: true, mime: raw === "image/x-png" ? "image/png" : raw };
    }
  }

  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return { ok: true, mime: "image/jpeg" };
  if (name.endsWith(".png")) return { ok: true, mime: "image/png" };
  if (name.endsWith(".webp")) return { ok: true, mime: "image/webp" };
  if (name.endsWith(".gif")) return { ok: true, mime: "image/gif" };
  if (name.endsWith(".avif")) return { ok: true, mime: "image/avif" };

  if (sniffed) {
    return { ok: true, mime: sniffed === "image/x-png" ? "image/png" : sniffed };
  }

  return {
    ok: false,
    error: "画像形式を判別できませんでした。JPEG / PNG 等をご利用ください。",
  };
}

function extFromMimeString(mime: string): string {
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  if (mime === "image/png" || mime === "image/x-png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "image/avif") return "avif";
  return "jpg";
}

function extFromImage(file: File, resolvedMime: string): string {
  const n = file.name.toLowerCase();
  if (n.endsWith(".png")) return "png";
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "jpg";
  if (n.endsWith(".webp")) return "webp";
  if (n.endsWith(".gif")) return "gif";
  if (n.endsWith(".avif")) return "avif";
  return extFromMimeString(resolvedMime);
}

function contentTypeForExt(ext: string): string {
  if (ext === "jpg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "avif") return "image/avif";
  return "image/jpeg";
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export async function POST(req: Request) {
  const expected = getAdminWriteToken();
  if (!expected) {
    return NextResponse.json(
      {
        ok: false,
        error: "環境変数 ADMIN_BROADCAST_TOKEN（管理者ページと同じ）が未設定です。",
      },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const token = formData.get("token");
  if (typeof token !== "string" || !timingSafeEqual(token, expected)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const file = formData.get("file");
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "ファイルがありません" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "8MB 以下の画像にしてください" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImageMimeFromBytes(buf);
  const fileObj = file instanceof File ? file : new File([], "upload.jpg");
  const inferred = inferImageMime(fileObj, sniffed);
  if (!inferred.ok) {
    return NextResponse.json({ ok: false, error: inferred.error }, { status: 400 });
  }
  const mime = inferred.mime;
  const ext = extFromImage(fileObj, mime);
  const storagePath = `boards/${randomUUID()}.${ext}`;

  const supabase = getSupabaseAdminClient();
  const uploadContentType =
    mime === "image/jpg" ? "image/jpeg" : mime === "application/octet-stream" ? contentTypeForExt(ext) : mime;

  const { error: upErr } = await supabase.storage.from(PV_STORYBOARD_BUCKET).upload(storagePath, buf, {
    contentType: uploadContentType,
    upsert: false,
  });

  if (upErr) {
    console.error("[pv-board upload]", upErr);
    const hint =
      upErr.message?.includes("Bucket not found") || upErr.message?.includes("not found")
        ? " Supabase にバケット「pv-storyboard」を作成してください（sql/pv_production_board.sql）。"
        : "";
    return NextResponse.json(
      { ok: false, error: (upErr.message || "Storage に保存できませんでした") + hint },
      { status: 500 }
    );
  }

  const { data: pub } = supabase.storage.from(PV_STORYBOARD_BUCKET).getPublicUrl(storagePath);

  return NextResponse.json({
    ok: true,
    publicUrl: pub.publicUrl,
    storagePath,
  });
}

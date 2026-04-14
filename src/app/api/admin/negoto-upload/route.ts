import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** nemumi-audio と並ぶ公開バケット。Supabase で作成が必要（scripts/negoto_storage_bucket.sql） */
export const NEGOTO_IMAGES_BUCKET = "negoto-images";

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

/** 先頭バイトで形式判定（拡張子なし・MIME が octet-stream の PNG など） */
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

/** スマホで file.type が空・octet-stream になりがちなので拡張子・スニッフィングも見る */
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
        "HEIC 形式は未対応です。写真を JPEG または PNG に書き出してから、もう一度選び直してください。",
    };
  }

  let raw = normalizeReportedMime(file.type || "");

  if (raw && raw !== "application/octet-stream") {
    if (ALLOWED.has(raw)) {
      return { ok: true, mime: raw === "image/x-png" ? "image/png" : raw };
    }
    if (raw.startsWith("image/")) {
      return {
        ok: false,
        error: `この画像形式は対応していません（${raw}）。JPEG / PNG / GIF / WebP / AVIF をお使いください。`,
      };
    }
  }

  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return { ok: true, mime: "image/jpeg" };
  if (name.endsWith(".png")) return { ok: true, mime: "image/png" };
  if (name.endsWith(".webp")) return { ok: true, mime: "image/webp" };
  if (name.endsWith(".gif")) return { ok: true, mime: "image/gif" };
  if (name.endsWith(".avif")) return { ok: true, mime: "image/avif" };

  if (sniffed) {
    return {
      ok: true,
      mime: sniffed === "image/x-png" ? "image/png" : sniffed,
    };
  }

  if (!raw || raw === "application/octet-stream") {
    return {
      ok: false,
      error:
        "画像形式を判別できませんでした。ファイル名に .jpg / .png などの拡張子があるか確認するか、別のフォルダから選び直してください。",
    };
  }

  return {
    ok: false,
    error: "JPEG / PNG / GIF / WebP / AVIF の画像のみアップロードできます。",
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

export async function POST(req: Request) {
  const envToken = process.env.ADMIN_BROADCAST_TOKEN;
  if (!envToken) {
    return NextResponse.json(
      { ok: false, error: "Missing env: ADMIN_BROADCAST_TOKEN" },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const token = formData.get("token");
  if (typeof token !== "string" || token !== envToken) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const file = formData.get("file");
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "ファイルがありません" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "8MB 以下の画像にしてください" },
      { status: 400 }
    );
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
  const storagePath = `negoto/${randomUUID()}.${ext}`;

  const supabase = getSupabaseAdminClient();
  const uploadContentType =
    mime === "image/jpg" ? "image/jpeg" : mime === "application/octet-stream" ? contentTypeForExt(ext) : mime;

  const { error: upErr } = await supabase.storage
    .from(NEGOTO_IMAGES_BUCKET)
    .upload(storagePath, buf, {
      contentType: uploadContentType,
      upsert: false,
    });

  if (upErr) {
    console.error("[negoto-upload]", upErr);
    const hint =
      upErr.message?.includes("Bucket not found") || upErr.message?.includes("not found")
        ? " Supabase にバケット「negoto-images」を作成してください（scripts/negoto_storage_bucket.sql）。"
        : "";
    return NextResponse.json(
      { ok: false, error: (upErr.message || "Storage に保存できませんでした") + hint },
      { status: 500 }
    );
  }

  const { data: pub } = supabase.storage
    .from(NEGOTO_IMAGES_BUCKET)
    .getPublicUrl(storagePath);

  return NextResponse.json({
    ok: true,
    publicUrl: pub.publicUrl,
    storagePath,
  });
}

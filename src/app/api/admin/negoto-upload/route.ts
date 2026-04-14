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
  "image/gif",
  "image/webp",
  "image/avif",
]);

/** スマホで file.type が空・octet-stream になりがちなので拡張子も見る */
function inferImageMime(file: File): { ok: true; mime: string } | { ok: false; error: string } {
  const name = file.name.toLowerCase();
  if (name.endsWith(".heic") || name.endsWith(".heif")) {
    return {
      ok: false,
      error:
        "HEIC 形式は未対応です。写真を JPEG または PNG に書き出してから、もう一度選び直してください。",
    };
  }

  let raw = (file.type || "").trim().toLowerCase();
  if (raw === "image/jpg") raw = "image/jpeg";

  if (raw && raw !== "application/octet-stream") {
    if (ALLOWED.has(raw)) return { ok: true, mime: raw };
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

function extFromImage(file: File): string {
  const n = file.name.toLowerCase();
  if (n.endsWith(".png")) return "png";
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "jpg";
  if (n.endsWith(".webp")) return "webp";
  if (n.endsWith(".gif")) return "gif";
  if (n.endsWith(".avif")) return "avif";
  const m = file.type;
  if (m === "image/jpeg") return "jpg";
  if (m === "image/png") return "png";
  if (m === "image/webp") return "webp";
  if (m === "image/gif") return "gif";
  if (m === "image/avif") return "avif";
  return "jpg";
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

  const fileObj = file instanceof File ? file : new File([], "upload.jpg");
  const inferred = inferImageMime(fileObj);
  if (!inferred.ok) {
    return NextResponse.json({ ok: false, error: inferred.error }, { status: 400 });
  }
  const mime = inferred.mime;

  const ext = extFromImage(fileObj);
  const storagePath = `negoto/${randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

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

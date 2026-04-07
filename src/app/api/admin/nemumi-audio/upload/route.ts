import { NextResponse } from "next/server";
import { getRegistryEntry, isKnownNemumiTrackId } from "@/lib/nemumi-audio-registry";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_BYTES = 50 * 1024 * 1024;

const ALLOWED = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/mp4",
  "application/octet-stream",
]);

function extFromMime(mime: string, filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".mp3")) return "mp3";
  if (lower.endsWith(".wav")) return "wav";
  if (lower.endsWith(".ogg")) return "ogg";
  if (lower.endsWith(".m4a")) return "m4a";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("ogg")) return "ogg";
  return "mp3";
}

function folderForCategory(cat: string): string {
  if (cat === "interactive") return "interactive";
  if (cat === "extra") return "extra";
  if (cat === "bgm") return "bgm";
  return "se";
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

  const trackId = formData.get("trackId");
  if (typeof trackId !== "string" || !isKnownNemumiTrackId(trackId)) {
    return NextResponse.json({ ok: false, error: "Invalid trackId" }, { status: 400 });
  }

  const entry = getRegistryEntry(trackId);
  if (!entry) {
    return NextResponse.json({ ok: false, error: "Unknown track" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "File too large (max 50MB)" }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";
  if (!ALLOWED.has(mime) && !mime.startsWith("audio/")) {
    return NextResponse.json({ ok: false, error: "Unsupported file type" }, { status: 400 });
  }

  const fname =
    file instanceof File && file.name ? file.name : `upload.${extFromMime(mime, "upload.mp3")}`;
  const ext = extFromMime(mime, fname);
  const folder = folderForCategory(entry.category);
  const storagePath = `${folder}/${trackId}.${ext}`;

  const buf = Buffer.from(await file.arrayBuffer());

  const supabase = getSupabaseAdminClient();
  const { error: upErr } = await supabase.storage
    .from("nemumi-audio")
    .upload(storagePath, buf, {
      contentType: mime === "application/octet-stream" ? `audio/${ext}` : mime,
      upsert: true,
    });

  if (upErr) {
    console.error("[nemumi-audio upload]", upErr);
    return NextResponse.json(
      { ok: false, error: upErr.message || "Storage upload failed" },
      { status: 500 }
    );
  }

  const { data: pub } = supabase.storage.from("nemumi-audio").getPublicUrl(storagePath);
  const publicUrl = pub.publicUrl;

  const { error: dbErr } = await supabase.from("nemumi_audio_assets").upsert(
    {
      track_id: trackId,
      storage_path: storagePath,
      public_url: publicUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "track_id" }
  );

  if (dbErr) {
    console.error("[nemumi-audio db]", dbErr);
    return NextResponse.json({ ok: false, error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, trackId, storagePath, publicUrl });
}

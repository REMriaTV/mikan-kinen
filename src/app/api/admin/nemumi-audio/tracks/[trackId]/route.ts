import { NextResponse } from "next/server";
import type { NemumiRegistryCategory } from "@/lib/nemumi-audio-registry";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type PatchBody = {
  token?: string;
  label?: string;
  category?: NemumiRegistryCategory;
  sort_order?: number;
};

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ trackId: string }> }
) {
  const envToken = process.env.ADMIN_BROADCAST_TOKEN;
  if (!envToken) {
    return NextResponse.json(
      { ok: false, error: "Missing env: ADMIN_BROADCAST_TOKEN" },
      { status: 500 }
    );
  }

  const { trackId: rawId } = await ctx.params;
  const trackId = decodeURIComponent(rawId ?? "");

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.token || body.token !== envToken) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const patch: Record<string, string | number> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof body.label === "string" && body.label.trim()) {
    patch.label = body.label.trim();
  }

  if (body.category !== undefined) {
    const c = body.category;
    if (c !== "bgm" && c !== "se" && c !== "interactive" && c !== "extra") {
      return NextResponse.json({ ok: false, error: "category が不正です" }, { status: 400 });
    }
    patch.category = c;
  }

  if (typeof body.sort_order === "number" && Number.isFinite(body.sort_order)) {
    patch.sort_order = body.sort_order;
  }

  const hasField =
    patch.label !== undefined ||
    patch.category !== undefined ||
    patch.sort_order !== undefined;
  if (!hasField) {
    return NextResponse.json({ ok: false, error: "変更する項目がありません" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("nemumi_audio_tracks").update(patch).eq("track_id", trackId);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, trackId });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ trackId: string }> }
) {
  const envToken = process.env.ADMIN_BROADCAST_TOKEN;
  if (!envToken) {
    return NextResponse.json(
      { ok: false, error: "Missing env: ADMIN_BROADCAST_TOKEN" },
      { status: 500 }
    );
  }

  const { trackId: rawId } = await ctx.params;
  const trackId = decodeURIComponent(rawId ?? "");

  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token || token !== envToken) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdminClient();

    const { data: asset } = await supabase
      .from("nemumi_audio_assets")
      .select("storage_path")
      .eq("track_id", trackId)
      .maybeSingle();

    if (asset?.storage_path) {
      await supabase.storage.from("nemumi-audio").remove([asset.storage_path]);
    }

    await supabase.from("nemumi_audio_assets").delete().eq("track_id", trackId);

    const { error } = await supabase.from("nemumi_audio_tracks").delete().eq("track_id", trackId);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, trackId });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

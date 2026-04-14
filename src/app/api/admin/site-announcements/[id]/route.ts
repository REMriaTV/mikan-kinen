import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { SiteAnnouncementAdminRow } from "@/lib/site-announcements";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

type PatchBody = {
  token?: string;
  title?: string;
  summary?: string | null;
  link_url?: string | null;
  published?: boolean;
  published_at?: string;
};

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const envToken = process.env.ADMIN_BROADCAST_TOKEN;
  if (!envToken) {
    return NextResponse.json(
      { ok: false, error: "Missing env: ADMIN_BROADCAST_TOKEN" },
      { status: 500 }
    );
  }

  const { id } = await ctx.params;

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.token || body.token !== envToken) return unauthorized();

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ ok: false, error: "title required" }, { status: 400 });
  }

  const summary = body.summary?.trim() || null;
  const link_url = body.link_url?.trim() || null;
  const published = Boolean(body.published);
  const published_at = body.published_at?.trim();
  if (!published_at) {
    return NextResponse.json(
      { ok: false, error: "published_at required" },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("site_announcements")
      .update({
        title,
        summary,
        link_url,
        published,
        published_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        "id, title, summary, link_url, published, published_at, created_at, updated_at"
      )
      .single();

    if (error) {
      console.error("[admin site-announcements PATCH]", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, item: data as SiteAnnouncementAdminRow });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

type DeleteBody = {
  token?: string;
};

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const envToken = process.env.ADMIN_BROADCAST_TOKEN;
  if (!envToken) {
    return NextResponse.json(
      { ok: false, error: "Missing env: ADMIN_BROADCAST_TOKEN" },
      { status: 500 }
    );
  }

  const { id } = await ctx.params;

  let body: DeleteBody;
  try {
    body = (await req.json()) as DeleteBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.token || body.token !== envToken) return unauthorized();

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("site_announcements").delete().eq("id", id);

    if (error) {
      console.error("[admin site-announcements DELETE]", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { SiteAnnouncementAdminRow } from "@/lib/site-announcements";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: Request) {
  const envToken = process.env.ADMIN_BROADCAST_TOKEN;
  if (!envToken) {
    return NextResponse.json(
      { ok: false, error: "Missing env: ADMIN_BROADCAST_TOKEN" },
      { status: 500 }
    );
  }
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token || token !== envToken) return unauthorized();

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("site_announcements")
      .select(
        "id, title, summary, link_url, published, published_at, created_at, updated_at"
      )
      .order("published_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      ok: true,
      items: data as SiteAnnouncementAdminRow[],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

type PostBody = {
  token?: string;
  title?: string;
  summary?: string | null;
  link_url?: string | null;
  published?: boolean;
  published_at?: string;
};

export async function POST(req: Request) {
  const envToken = process.env.ADMIN_BROADCAST_TOKEN;
  if (!envToken) {
    return NextResponse.json(
      { ok: false, error: "Missing env: ADMIN_BROADCAST_TOKEN" },
      { status: 500 }
    );
  }

  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
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
  const published_at =
    body.published_at?.trim() || new Date().toISOString();

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("site_announcements")
      .insert({
        title,
        summary,
        link_url,
        published,
        published_at,
      })
      .select(
        "id, title, summary, link_url, published, published_at, created_at, updated_at"
      )
      .single();

    if (error) {
      console.error("[admin site-announcements POST]", error);
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

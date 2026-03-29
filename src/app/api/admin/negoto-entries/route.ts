import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  generateSlugForDate,
  isValidAuthor,
  type NegotoEntryRow,
} from "@/lib/negoto";

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
      .from("negoto_entries")
      .select(
        "id, slug, title, topic, author, body, published, date, created_at, updated_at"
      )
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, entries: data as NegotoEntryRow[] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

type PostBody = {
  token?: string;
  date?: string;
  author?: string;
  title?: string;
  topic?: string;
  body?: string;
  published?: boolean;
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

  const date = body.date?.trim();
  const title = body.title?.trim();
  const text = body.body ?? "";
  const author = body.author?.trim() ?? "";

  if (!date) {
    return NextResponse.json({ ok: false, error: "date required" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ ok: false, error: "title required" }, { status: 400 });
  }
  if (!author || !isValidAuthor(author)) {
    return NextResponse.json({ ok: false, error: "invalid author" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const slug = await generateSlugForDate(supabase, date);
    const topic = body.topic?.trim() || null;
    const published = Boolean(body.published);

    const { data, error } = await supabase
      .from("negoto_entries")
      .insert({
        slug,
        title,
        topic,
        author,
        body: text,
        published,
        date,
      })
      .select(
        "id, slug, title, topic, author, body, published, date, created_at, updated_at"
      )
      .single();

    if (error) {
      console.error("[admin negoto POST]", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, entry: data as NegotoEntryRow });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { isValidAuthor, type NegotoEntryRow } from "@/lib/negoto";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

type PatchBody = {
  token?: string;
  date?: string;
  author?: string;
  title?: string;
  topic?: string;
  body?: string;
  published?: boolean;
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

  const topic = body.topic?.trim() || null;
  const published = Boolean(body.published);

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("negoto_entries")
      .update({
        date,
        author,
        title,
        topic,
        body: text,
        published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        "id, slug, title, topic, author, body, published, date, created_at, updated_at"
      )
      .single();

    if (error) {
      console.error("[admin negoto PATCH]", error);
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
    const { error } = await supabase.from("negoto_entries").delete().eq("id", id);

    if (error) {
      console.error("[admin negoto DELETE]", error);
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

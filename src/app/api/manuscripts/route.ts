import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { ManuscriptInput } from "@/lib/manuscripts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("manuscripts")
      .select("id, work_id, title, author, status, position, body, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, manuscripts: data ?? [] });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

type SaveBody = {
  token?: string;
  manuscript?: ManuscriptInput;
};

export async function POST(req: Request) {
  try {
    const envToken = process.env.ADMIN_BROADCAST_TOKEN;
    if (!envToken) {
      return NextResponse.json({ ok: false, error: "Missing ADMIN_BROADCAST_TOKEN" }, { status: 500 });
    }
    const body = (await req.json()) as SaveBody;
    if (!body.token || body.token !== envToken) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!body.manuscript) {
      return NextResponse.json({ ok: false, error: "Missing manuscript" }, { status: 400 });
    }

    const payload = body.manuscript;
    if (!payload.work_id || !payload.title) {
      return NextResponse.json(
        { ok: false, error: "work_id and title are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("manuscripts")
      .upsert(
        {
          work_id: payload.work_id,
          title: payload.title,
          author: payload.author,
          status: payload.status,
          position: payload.position,
          body: payload.body,
        },
        { onConflict: "work_id" }
      )
      .select("id, work_id, title, author, status, position, body, created_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, manuscript: data });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}


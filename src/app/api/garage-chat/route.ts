import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const ROOM_KEY = "garage-room";
const MAX_BODY = 4000;
const MAX_NAME = 120;
const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawLimit = searchParams.get("limit");
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, rawLimit ? parseInt(rawLimit, 10) || DEFAULT_LIMIT : DEFAULT_LIMIT)
  );

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("garage_chat_messages")
      .select("id, from_name, body, is_system, created_at")
      .eq("room_key", ROOM_KEY)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[garage-chat GET]", error);
      return NextResponse.json({ messages: [] });
    }
    const rows = data ?? [];
    rows.sort(
      (a, b) =>
        new Date(a.created_at as string).getTime() - new Date(b.created_at as string).getTime()
    );
    return NextResponse.json({ messages: rows });
  } catch (e) {
    console.error("[garage-chat GET]", e);
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const o = body as { fromName?: unknown; body?: unknown; isSystem?: unknown };
  const fromName = typeof o.fromName === "string" ? o.fromName.trim() : "";
  const text = typeof o.body === "string" ? o.body : "";
  const isSystem = o.isSystem === true;

  if (!fromName || fromName.length > MAX_NAME) {
    return NextResponse.json({ error: "Invalid fromName" }, { status: 400 });
  }
  if (!text || text.length > MAX_BODY) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("garage_chat_messages")
      .insert({
        room_key: ROOM_KEY,
        from_name: fromName,
        body: text,
        is_system: isSystem,
      })
      .select("id, from_name, body, is_system, created_at")
      .single();

    if (error) {
      console.error("[garage-chat POST]", error);
      return NextResponse.json({ error: "Save failed" }, { status: 500 });
    }
    return NextResponse.json({ message: data });
  } catch (e) {
    console.error("[garage-chat POST]", e);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}

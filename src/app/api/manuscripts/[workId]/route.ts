import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workId: string }> }
) {
  try {
    const { workId } = await params;
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("manuscripts")
      .select("id, work_id, title, author, status, position, body, created_at, updated_at")
      .eq("work_id", workId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, exists: !!data, manuscript: data ?? null });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}


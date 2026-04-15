import { NextResponse } from "next/server";
import { getAdminWriteToken } from "@/lib/admin-write-token";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  PV_BOARD_DEFAULT_SLUG,
  defaultPvBoardData,
  normalizePvBoardData,
  type PvBoardData,
} from "@/lib/pv-board";

export const dynamic = "force-dynamic";

const MAX_JSON_BYTES = 900_000;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

function readBearer(req: Request): string {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return "";
  return h.slice(7).trim();
}

/** 公開 GET: 制作プロセスの閲覧用（書き込みは別途トークン） */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = (searchParams.get("slug") || PV_BOARD_DEFAULT_SLUG).trim() || PV_BOARD_DEFAULT_SLUG;

  try {
    const supabase = getSupabaseAdminClient();
    const { data: row, error } = await supabase
      .from("pv_production_boards")
      .select("data, updated_at")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("[pv-board GET]", error);
      return NextResponse.json(
        { ok: false, error: error.message || "読み込みに失敗しました" },
        { status: 500 }
      );
    }

    if (!row) {
      return NextResponse.json({
        ok: true,
        slug,
        data: defaultPvBoardData(),
        updatedAt: null,
        seeded: true,
      });
    }

    const data = normalizePvBoardData(row.data);
    return NextResponse.json({
      ok: true,
      slug,
      data,
      updatedAt: row.updated_at,
      seeded: false,
    });
  } catch (e) {
    console.error("[pv-board GET]", e);
    const msg = e instanceof Error ? e.message : "不明なエラー";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const token = getAdminWriteToken();
  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "環境変数 ADMIN_BROADCAST_TOKEN（管理者ページと同じ）が未設定のため保存できません。",
      },
      { status: 503 }
    );
  }

  const bearer = readBearer(req);
  let bodyToken = bearer;
  let body: unknown;
  try {
    const text = await req.text();
    if (text.length > MAX_JSON_BYTES) {
      return NextResponse.json({ ok: false, error: "データが大きすぎます" }, { status: 413 });
    }
    body = JSON.parse(text) as unknown;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON が不正です" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "不正なリクエスト" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  if (!bodyToken && typeof o.token === "string") bodyToken = o.token;
  if (!timingSafeEqual(bodyToken, token)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const slug =
    typeof o.slug === "string" && o.slug.trim() ? o.slug.trim() : PV_BOARD_DEFAULT_SLUG;
  const data = normalizePvBoardData(o.data) as PvBoardData;

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("pv_production_boards").upsert(
      {
        slug,
        data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    );

    if (error) {
      console.error("[pv-board PUT]", error);
      return NextResponse.json(
        { ok: false, error: error.message || "保存に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, slug });
  } catch (e) {
    console.error("[pv-board PUT]", e);
    const msg = e instanceof Error ? e.message : "不明なエラー";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

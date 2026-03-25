import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  normalizeBroadcastConfig,
  type BroadcastConfig,
} from "@/lib/broadcast-config";

export const dynamic = "force-dynamic";

function getSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) {
    throw new Error("Missing env: SUPABASE_URL");
  }
  if (!serviceRoleKey) {
    throw new Error("Missing env: SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

type AdminPostBody = {
  token?: string;
  config?: BroadcastConfig;
};

export async function POST(req: Request) {
  try {
    const envToken = process.env.ADMIN_BROADCAST_TOKEN;
    if (!envToken) {
      return NextResponse.json(
        { ok: false, error: "Missing env: ADMIN_BROADCAST_TOKEN" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as AdminPostBody;
    const token = body.token;
    if (!token || token !== envToken) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!body.config) {
      return NextResponse.json(
        { ok: false, error: "Missing config" },
        { status: 400 }
      );
    }

    const normalized = normalizeBroadcastConfig(body.config);
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("broadcast_config")
      .upsert(
        {
          id: "singleton",
          config: normalized,
        },
        { onConflict: "id" }
      );

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, config: normalized });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}


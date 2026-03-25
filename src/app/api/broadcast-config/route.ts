import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  defaultBroadcastConfig,
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

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("broadcast_config")
      .select("config")
      .eq("id", "singleton")
      .maybeSingle();

    if (error) {
      // フォールバックを返して表示を止めない
      return NextResponse.json({ config: defaultBroadcastConfig });
    }

    const rawConfig: unknown = (data as { config?: unknown } | null | undefined)?.config;
    const normalized: BroadcastConfig =
      normalizeBroadcastConfig(rawConfig);
    return NextResponse.json({ config: normalized });
  } catch {
    return NextResponse.json({ config: defaultBroadcastConfig });
  }
}


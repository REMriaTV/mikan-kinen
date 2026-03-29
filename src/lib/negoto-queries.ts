import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { NegotoEntryRow } from "@/lib/negoto";

export async function listPublishedNegotoEntries(): Promise<NegotoEntryRow[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("negoto_entries")
    .select(
      "id, slug, title, topic, author, body, published, date, created_at, updated_at"
    )
    .eq("published", true)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as NegotoEntryRow[];
}

export async function getPublishedNegotoBySlug(
  slug: string
): Promise<NegotoEntryRow | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("negoto_entries")
    .select(
      "id, slug, title, topic, author, body, published, date, created_at, updated_at"
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as NegotoEntryRow) ?? null;
}

/** date DESC 順（新しい→古い）での隣接。「次」= より新しい、「前」= より古い */
export async function getPublishedNeighbors(slug: string): Promise<{
  newer: NegotoEntryRow | null;
  older: NegotoEntryRow | null;
}> {
  const list = await listPublishedNegotoEntries();
  const i = list.findIndex((e) => e.slug === slug);
  if (i < 0) return { newer: null, older: null };
  return {
    newer: i > 0 ? list[i - 1]! : null,
    older: i < list.length - 1 ? list[i + 1]! : null,
  };
}

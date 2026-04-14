import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export type SiteAnnouncementRow = {
  id: string;
  title: string;
  summary: string | null;
  link_url: string | null;
  published_at: string;
};

export async function getPublishedSiteAnnouncements(
  limit = 30
): Promise<SiteAnnouncementRow[]> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("site_announcements")
      .select("id, title, summary, link_url, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[site_announcements]", error.message);
      return [];
    }
    return (data ?? []) as SiteAnnouncementRow[];
  } catch (e) {
    console.error("[site_announcements]", e);
    return [];
  }
}

export function formatAnnouncementDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

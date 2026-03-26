import Link from "next/link";
import { getWorkBySlug } from "@/data/works";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { splitPagesFromBody } from "@/lib/manuscripts";
import TategakiReaderClient from "@/components/TategakiReaderClient";

export const dynamic = "force-dynamic";

export default async function ReadPage({
  params,
}: {
  params: Promise<{ work_id: string }>;
}) {
  const { work_id } = await params;
  const work = getWorkBySlug(work_id);

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("manuscripts")
      .select("work_id, title, author, status, position, body")
      .eq("work_id", work_id)
      .maybeSingle();

    if (error || !data) {
      return (
        <main className="min-h-[100dvh] bg-[#0D0F12] text-[#E8E4DF] flex items-center justify-center px-6">
          <div className="max-w-[560px] text-center">
            <p className="mb-4 text-[rgba(232,228,223,0.7)]">原稿データが見つかりません。</p>
            <Link href="/works" className="text-gold hover:underline">
              番組表へ戻る
            </Link>
          </div>
        </main>
      );
    }

    const sections = splitPagesFromBody(data.body ?? "");
    return (
      <TategakiReaderClient
        workId={work_id}
        title={data.title || work?.title || work_id}
        author={data.author || "百面惣"}
        status={data.status || "執筆中"}
        position={data.position || "LUCID × 眉月"}
        sections={sections}
      />
    );
  } catch {
    return (
      <main className="min-h-[100dvh] bg-[#0D0F12] text-[#E8E4DF] flex items-center justify-center px-6">
        <div className="max-w-[560px] text-center">
          <p className="mb-4 text-[rgba(232,228,223,0.7)]">原稿データの読み込みに失敗しました。</p>
          <Link href="/works" className="text-gold hover:underline">
            番組表へ戻る
          </Link>
        </div>
      </main>
    );
  }
}


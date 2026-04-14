/**
 * トップページ「お知らせ」欄の内容。
 * ここを編集してコミット・デプロイすると反映されます。
 * （将来的に Supabase や管理画面と連携する場合は、この配列の読み込み元を差し替え可能）
 *
 * リンク例:
 * - 内部: href: "/negoto" または href: "/works"
 * - 外部: href: "https://..." と external: true（別タブ）
 *
 * 配列を空にするとお知らせブロック自体を非表示にします。
 */
export type HomeAnnouncement = {
  id: string;
  /** 表示用（例: 2026-04-14） */
  date: string;
  title: string;
  /** 1行説明（任意） */
  summary?: string;
  /** 内部リンク（/negoto など）または https:// の外部リンク */
  href?: string;
  /** href が http(s) のとき true（別タブ） */
  external?: boolean;
};

export const homeAnnouncements: HomeAnnouncement[] = [
  {
    id: "news-section-open",
    date: "2026-04-14",
    title: "トップページにお知らせ欄を追加しました",
    summary:
      "コラムの更新・作品データの連携・次回予定など、随時ここに載せていきます。",
  },
];

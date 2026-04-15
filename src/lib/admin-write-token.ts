/**
 * 管理系の書き込み用トークン。
 * 放送設定・寝言帳アップロード等と同じ `ADMIN_BROADCAST_TOKEN` を使う。
 * 別名で上書きしたい場合のみ `PV_BOARD_TOKEN`（任意）。
 */
export function getAdminWriteToken(): string | null {
  const broadcast = process.env.ADMIN_BROADCAST_TOKEN?.trim();
  const pvOnly = process.env.PV_BOARD_TOKEN?.trim();
  return broadcast || pvOnly || null;
}

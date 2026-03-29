# 寝言帳（/negoto）セカンドオピニオン用 引き継ぎ

**作成日**: 2026-03-30  
**更新（同日）**: `sessionStorage` / `NegotoHomeHeroReveal` 方式は **廃止** 済み。コラムトップは **`NegotoPageReveal`**（動画 `canplaythrough` 待ち → `.negoto-page.ready` で 2.5s フェード）に差し替え。本文の「旧仕組み」記述は歴史的参考として残す。

**リポジトリ**: `mikan-kinen`（Next.js 16 / App Router / `src/app/`）  
**依頼者の状況**: 実装は一通り入っているが、**演出・雰囲気がイメージと一致していない**ため、別の実装方針・調整を検討したい。

---

## 1. プロダクト上の「正」として共有すべきイメージ

依頼者（Kaihei）が言語化してきた意図の要約（会話ログベース。**ここを優先して解釈してほしい**）。

### 1.1 サイトトップ（`/`）→ コラムトップ（`/negoto`）の遷移

- **富士山・湖畔のヘッダー動画**（`public/videos/negoto-header.mp4`）は世界観の核。**雰囲気を損なう演出は避けたい**。
- 望ましいイメージ:
  - **黒い画面からのディゾルブ（フェード）**で、映像とタイトルが**ゆっくり「浮かび上がる」**。
  - 「下からせり上がってくる」ような動きも言及あり（**映像＋タイトルが一体となって**見えることが重要）。
- **やってはいけない／避けたい例**（過去の試行で不満が出た方向）:
  - コラム**全体**をまとめてフェード／スライドさせると、湖畔の見せ方が台無しに感じられた。
  - **一覧→記事**（`/negoto` → `/negoto/[slug]`）まで同じ「ページ入り」アニメをかけるのは意図と違う（**元に戻した**）。

### 1.2 コラム記事ページ（`/negoto/[slug]`）

- **活かしておきたい**: 最初は**タイトル周りと下向き矢印だけ**、本文は**スクロールに応じて段落ごとフェードイン**する挙動（`NegotoEntryClient`）。
- 水面背景動画は負荷対策で **短いループ・軽量 mp4** に再エンコード済み。

### 1.3 コラムからサイトトップへ戻る導線

- 文言は **「浮上する」**（ボタンをグラグラさせるアニメではない。**テキストそのものが「浮上する」という語**）。
- **枠線なし**のシンプルなテキストリンク。
- **画面固定ではなく**、**下までスクロールしたら表示**（IntersectionObserver）。

### 1.4 サイトトップ上の「番組表」と「コラム」の並び

- **番組表（Works）がメイン**、コラムは**同列の大きさ・強さに見えない**方がよい（横並び2カラムは却下され、**主従つきの縦配置**に変更済み）。

---

## 2. 現状の実装概要（ファイルマップ）

| 領域 | 主なファイル |
|------|----------------|
| コラムトップ | `src/app/negoto/page.tsx`, `src/app/negoto/negoto.css`, `src/app/negoto/layout.tsx` |
| コラム記事 | `src/app/negoto/[slug]/page.tsx`, `src/components/NegotoEntryClient.tsx` |
| トップ→コラム印 | `src/components/HomeToNegotoLink.tsx`（`sessionStorage` キー `negoto-enter-from-home`） |
| ヘッダー演出 | `src/components/NegotoHomeHeroReveal.tsx` + `.negoto-hero-reveal-*` in `negoto.css` |
| 戻りリンク | `src/components/NegotoBackToHome.tsx`（`layout` から読込） |
| 管理 | `src/app/admin/negoto/`, `src/app/api/admin/negoto-entries/` |
| DB | `scripts/negoto_entries.sql`（Supabase で手動実行想定） |
| 動画 | `public/videos/negoto-header.mp4`, `negoto-water.mp4` |

認証: 管理画面は **`ADMIN_BROADCAST_TOKEN`** と `?token=`（broadcast 管理と共通）。

---

## 3. 現在の「トップ→コラムトップ」演出の仕組み（技術）

1. サイトトップのコラム導線だけ **`HomeToNegotoLink`** を使用。クリック時に `sessionStorage.setItem('negoto-enter-from-home', '1')`。
2. `/negoto` の **`negoto-video-header` だけ**を **`NegotoHomeHeroReveal`** でラップ。
3. `useLayoutEffect` でフラグを読み、**true のときだけ**:
   - 黒カーテン `div.negoto-hero-reveal__curtain`（opacity アニメ）
   - 内側 `div.negoto-hero-reveal__lift` に動画＋タイトル（translateY + opacity アニメ）

フラグは読み取り後に削除。**直接 URL や他ページから `/negoto` には印が付かない**。

---

## 4. 依頼者が「イメージ通りになっていない」と感じている点（推測・要確認）

セカンドオピニオン側で **必ず本人に確認**してほしい点:

- **タイミング・イージング・秒数**: カーテンとリフトの長さ（現状 CSS で 2.5s / 2.75s 前後）が、映画のような「黒→湖畔」に足りているか。
- **first paint**: `sessionStorage` はクライアントのみ。初回描画とアニメ開始の間に**一瞬のフラッシュ**が出ていないか（未検証の懸念）。
- **「ディゾルブ」の意味**: 単純な黒オーバーレイのフェードで足りるか、**映像とのクロスフェード**や **clip-path** など別表現が必要か。
- **本文ブロック**（説明文・カード一覧）に**何もアニメをかけていない**が、ヘッダーとの**境界**が気になるか。

---

## 5. セカンドオピニオンに期待すること（提案タスク）

1. **演出の再設計**: View Transitions API、`next-view-transitions`、または **フルスクリーンオーバーレイ**を別レイヤーで管理する等、**技術的により意図に合う**案の検討。
2. **プロトタイプとの対比**: 元 HTML は Dropbox 側にあった（`negoto-top-v2.html` 等）。**見た目・動きの差分リスト**を作ると調整しやすい。
3. **アクセシビリティ**: `prefers-reduced-motion` は一部対応済み。アニメを増やす場合は継続考慮。
4. **パフォーマンス**: ヘッダー動画は既に mp4。不要な再レンダーや二重アニメに注意。

---

## 6. ローカル確認の目安

```bash
cd mikan-kinen
npm run dev
```

- `/` → Column の「コラムを読む →」から `/negoto`（印付き）
- 別タブで `/negoto` を開く（印なし・演出なし）

---

## 7. 注意（コンテンツ）

依頼者の方針: **コラム本文は AI が勝手に書き換えない**。管理画面からの入力が正。

---

*この文書は会話履歴とコードベースの現状に基づく。数値・ファイル名はリポジトリ変更時は要更新。*

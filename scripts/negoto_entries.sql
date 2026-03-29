-- Run in Supabase SQL Editor (or psql)
-- negoto_entries: 寝言帳コラム

CREATE TABLE IF NOT EXISTS negoto_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  topic TEXT,
  author TEXT NOT NULL DEFAULT '百面惣の寝言',
  body TEXT NOT NULL,
  published BOOLEAN DEFAULT false,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS negoto_entries_date_desc ON negoto_entries (date DESC);
CREATE INDEX IF NOT EXISTS negoto_entries_published_date ON negoto_entries (published, date DESC);

-- Optional: updated_at auto-update (requires extension in some projects)
-- CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
-- BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
-- $$ LANGUAGE plpgsql;
-- CREATE TRIGGER tr_negoto_entries_updated BEFORE UPDATE ON negoto_entries
-- FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed (slug は日付ベース)
INSERT INTO negoto_entries (slug, title, topic, author, body, published, date) VALUES (
  '2026-03-29',
  'レムテレの存在意義',
  'お笑い的なポジションのレムテレ',
  '百面惣の寝言',
  $negoto$
...言ったら結構、レムリアテレビはお笑いみたいな感じなんだよね。だから、そういう意味では本当に唯一無二の存在だなっていう。すごいものは表に出る。素晴らしい事例はちゃんと語られる。でも、語るほどでもないものは誰もわざわざ言わない。レムリアテレビはまさにその程度のしょぼさ、ポンコツの類なんだけど、実はそれが売りなんだなってことに今夜は気付かされたね。

ほら...コロナの時とか、特に東日本大震災の時とかって、エンタメ業界全体が「不要不急」というかさ、「今はちょっと自粛しよう」みたいなムードってあったじゃない。

だけど、ああいう時でも意外と、くだらないものというか、「こんなのあってもなくても同じでしょ」みたいなものが、あることで——「あ、でもこういう人もいるんだ」って。なんか、それがあることで日常に戻れるみたいな。安心とはちょっと違うかもしれないけど。それがある限りは、まだ世の中は平和なんだなって思えるというか。

---

## 下には下がいる

僕はね、昔から一貫して安定して低クオリティなんだよ。それは逆にいうと、「変わらない味」みたいな、一つの信頼できる価値なんだよね（笑）

そこが自分の価値なんだなっていうのが、今夜わかったわけですよ。

---

## 空気の読めない自分でいい

今夜のミーティングではね、今まではこうありたいみたいな像を持ってたけど、多分そんなちゃんとはできないだろうと。それで、もうある種の割り切りというか、開き直りというか。そういう感じで行っちゃおうかなって思えたんだよね。

アイデンティティというかね、やっぱ自分らしさみたいなとこで言うと、まあ、この世界一このくだらなくて、しょうもなくて、クオリティが低いっていうね。三拍子揃っている。これはね、実はね、ブランド価値なんだなって。

---

## 世界の防波堤でありたい

みんなに伝えたいことはね、レムリアテレビが健在な限りはこの世界は安泰ですよっていう。守られた空間なわけですよ、ここは。そういうね、存在でありたいと、思ったね今夜は。
$negoto$,
  true,
  '2026-03-29'
) ON CONFLICT (slug) DO NOTHING;

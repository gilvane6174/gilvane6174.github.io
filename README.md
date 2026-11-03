# Yoshioka Yutaka — 個人サイト

吉岡有隆の個人サイト。HTML / CSS / JavaScript だけの静的サイトで、サーバー処理・データベース・外部ライブラリ・Cookie・アクセス解析は使っていません。

## 構成

| ファイル | 内容 |
|---|---|
| `index.html` | HOME |
| `about.html` | ABOUT |
| `novel.html` | NOVEL / ARTICLE |
| `work.html` | ご依頼の方へ |
| `404.html` | ページが見つからないときの画面（GitHub Pages が自動で使用） |
| `403.html` | アクセス拒否時の画面。配信側で403を返す設定がある場合のみ使用（GitHub Pages 単体では使われない） |
| `maintenance.html` | 改造中画面（差し替え用） |
| `data/news.js` | 更新履歴（HOMEに表示） |
| `data/links.js` | リンク集（ABOUTに表示） |
| `css/` `js/` `favicon.svg` | 見た目と演出 |
| `ogp.png` | SNSで共有したときに表示される画像 |
| `.nojekyll` | GitHub Pages の Jekyll 処理を止める |

## 安全設計

- 全ページに Content Security Policy を設定。自サイト以外のスクリプト・画像・フォント・通信を読み込まない
- インラインスクリプト・インラインスタイル・`eval`・`innerHTML` を使わない。URL のパラメータやハッシュを読まず、画面にも表示しない
- サイト自体は外部へデータを送らない。お問い合わせは Google フォームへの通常リンクのみ
- 外部リンクはすべて `rel="noopener noreferrer"`
- 他サイトの iframe 内に表示された場合は表示を止める（JavaScript による補助的な対策。GitHub Pages では HTTP ヘッダーを設定できず、frame-ancestors を使えないため完全ではない）
- エラー画面（404/403）は JavaScript を一切使わない。URL や入力値を画面に表示しない
- `data/` のファイルの内容は文字としてだけ表示し、`https://` 以外のURLは表示しない
- ブラウザの localStorage に「この端末での訪問回数」の数字だけを保存（カウンター演出用。外部送信なし）

アクセスカウンター・管理人ステータス・更新表示は演出で、実際の数値や状況ではありません。

## ライセンス

文章・作品・デザイン等の著作権は、特別な記載がある場合を除き、各制作者・権利者に帰属します。法令上認められる場合を除き、無断転載・複製・再配布や、生成AI等の学習データとしての無断利用はご遠慮ください。

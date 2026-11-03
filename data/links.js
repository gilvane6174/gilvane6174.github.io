/*
 * ============================================================
 *  リンク集（ABOUTの「リンク集」欄に表示されます）
 * ============================================================
 *
 *  ■ 書き方
 *    group が見出し、items がその中のリンクです。
 *
 *    { name: "表示する名前", url: "https://〜" },
 *
 *    ・リンクを足す  ：同じグループの items の中に1行足す
 *    ・リンクを消す  ：その1行を消す
 *    ・グループを足す：{ group: "見出し", items: [ ... ] }, を丸ごと足す
 *
 *  ■ 注意
 *    ・URL は https:// で始まるものだけ表示されます（http:// などは安全のため無視されます）
 *    ・文字は必ず "  " （半角のダブルクォート）で囲む
 *    ・各行の最後に , （半角カンマ）を付ける
 *    ・ここで変えられるのはABOUTの「リンク集」だけです。
 *      ほかのページの本文中のリンク（ご依頼ページなど）は各HTMLファイルを直してください。
 *
 *  ■ 書き間違えたとき
 *    リンク集の欄に「表示できませんでした」と出るだけで、ほかのページは壊れません。
 * ============================================================
 */
window.YY_LINKS = [
  {
    group: "創作・執筆",
    items: [
      { name: "note", url: "https://note.com/yoshiokayutaka" },
      { name: "noteメンバーシップ", url: "https://note.com/yoshiokayutaka/membership" },
      { name: "Kindle", url: "https://www.amazon.co.jp/dp/B0FTSFD9T6" },
      { name: "BOOTH", url: "https://yoshiokayutaka.booth.pm/" },
      { name: "はてなブログ", url: "https://yoshiokayutaka.hateblo.jp/" }
    ]
  },
  {
    group: "開発・制作",
    items: [
      { name: "GitHub", url: "https://github.com/gilvane6174" },
      { name: "Tomoshibi Atlas", url: "https://gilvane6174.github.io/Tomoshibi-atlas/" }
    ]
  },
  {
    group: "お仕事",
    items: [
      { name: "ココナラ（名義別）", url: "https://coconala.com/users/4410764" },
      { name: "クラウドワークス（名義別）", url: "https://crowdworks.jp/public/employees/7142500" }
    ]
  },
  {
    group: "わいさぽ",
    items: [
      { name: "わいさぽ（lit.link）", url: "https://lit.link/ysupport" },
      { name: "わいさぽブログ（アメブロ）", url: "https://ameblo.jp/yoshioka-y/" }
    ]
  },
  {
    group: "SNS・その他",
    items: [
      { name: "X", url: "https://x.com/yoshiokayutaka_" },
      { name: "Instagram", url: "https://www.instagram.com/yoshio6174_/" },
      { name: "YouTube", url: "https://www.youtube.com/@yoshiokayutaka" },
      { name: "Suno", url: "https://suno.com/@yoshiokayutaka" }
    ]
  },
  {
    group: "支援",
    items: [
      { name: "Buy Me a Coffee", url: "https://buymeacoffee.com/yoshiokayutaka" },
      { name: "OFUSE", url: "https://ofuse.me/yoshiokayutaka" }
    ]
  }
];

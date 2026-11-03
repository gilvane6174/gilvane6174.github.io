/*
 * common.js — 全ページ共通
 * ・他サイトの iframe に埋め込まれたら表示を止める（クリックジャッキング対策）
 *   GitHub Pages は HTTP ヘッダーを設定できず、frame-ancestors を
 *   <meta> CSP で指定しても無効なため、JS 側で補う。
 * ・外部への通信は一切しない。
 */
(function () {
  "use strict";
  try {
    if (window.top !== window.self) {
      document.documentElement.style.display = "none";
      window.top.location.replace(window.self.location.href);
    }
  } catch (e) {
    // 別オリジンで top にアクセスできない場合も表示を止めたまま
    document.documentElement.style.display = "none";
  }
})();

/*
 * retro.js — レトロページの演出
 *  1. 読み込み中画面（クリック/キーで飛ばせる。2回目以降の閲覧では短縮）
 *  2. 増え続けるアクセスカウンター＋キリ番（演出。実アクセス数ではない）
 *  3. 管理人ステータス（いる/いない/見てる）
 *  4. なぜか更新されている過去記事
 *  5. 地下室の打鍵表示
 *  0. 更新履歴・リンク集の表示（data/ フォルダのファイルから）
 *
 * 安全方針：
 *  - 外部通信なし（fetch / XHR / 外部画像 / 解析タグを使わない）
 *  - DOM へは textContent と createElement だけで書き込む（innerHTML 不使用）
 *  - URL パラメータやハッシュを読まない（反射型 XSS の入口を作らない）
 *  - localStorage は「この端末で何回来たか」の数字だけ。失敗しても動く
 */
(function () {
  "use strict";

  /* ---------- 小道具 ---------- */
  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, String(val));
    } catch (e) { /* プライベートモード等では黙って無視 */ }
    return null;
  }

  // 日本時間の Date 相当（年月日時分を取り出すだけ）
  function jstParts(d) {
    var t = new Date(d.getTime() + (9 * 60 + d.getTimezoneOffset()) * 60000);
    return {
      y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate(),
      h: t.getHours(), min: t.getMinutes(), dow: t.getDay()
    };
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  // 決まった種から決まった乱数（同じ日なら同じ“異変”が起きる）
  function seeded(seed) {
    var x = seed % 2147483647;
    if (x <= 0) x += 2147483646;
    return function () { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; };
  }

  var now = new Date();
  var J = jstParts(now);
  var daySeed = J.y * 10000 + J.m * 100 + J.d;

  var visits = parseInt(store("yy_visits") || "0", 10) + 1;
  if (!isFinite(visits) || visits < 1) visits = 1;
  store("yy_visits", visits);


  /* ---------- 0. 更新履歴・リンク集（data/news.js・data/links.js） ----------
   * 有隆が編集するデータを表示する。安全のため：
   *  - 文字は textContent でのみ出す（HTMLとして解釈しない）
   *  - URL は https: のものだけ使う。それ以外は捨てる
   *  - 件数・文字数に上限を設け、型が違うものは無視する
   */
  function str(v, max) {
    return (typeof v === "string") ? v.slice(0, max) : "";
  }
  function safeUrl(u) {
    if (typeof u !== "string") return null;
    try {
      var x = new URL(u);
      return x.protocol === "https:" ? x.href : null;
    } catch (e) { return null; }
  }
  function fmtDate(d) {
    // "2026-11-03 12:34" → 表示 "2026.11.03 12:34"、datetime "2026-11-03T12:34"
    if (!/^\d{4}-\d{2}(-\d{2}( \d{2}:\d{2})?)?$/.test(d)) return null;
    return { view: d.replace(/-/g, "."), attr: d.replace(" ", "T") };
  }

  function renderNews() {
    var ul = document.getElementById("news-list");
    if (!ul) return;
    var data = window.YY_NEWS;
    if (!Array.isArray(data)) {
      var p = document.createElement("li");
      p.textContent = "更新履歴を表示できませんでした。";
      ul.appendChild(p);
      return;
    }
    for (var i = 0; i < data.length && i < 50; i++) {
      var n = data[i];
      if (!n || typeof n !== "object") continue;
      var title = str(n.title, 120);
      if (!title) continue;
      var li = document.createElement("li");
      var d = fmtDate(str(n.date, 16));
      if (d) {
        var t = document.createElement("time");
        t.setAttribute("datetime", d.attr);
        t.textContent = d.view;
        li.appendChild(t);
      }
      li.appendChild(document.createTextNode(title));
      if (n.isNew === true) {
        var nw = document.createElement("span");
        nw.className = "new";
        nw.textContent = "NEW!";
        li.appendChild(nw);
      }
      var body = str(n.body, 600);
      var b = document.createElement("span");
      b.className = "body";
      b.textContent = body;
      li.appendChild(b);
      if (n.weird === true) {
        li.setAttribute("data-weird", "");
        var u = document.createElement("span");
        u.className = "upd";
        li.appendChild(u);
      }
      ul.appendChild(li);
    }
  }

  function renderLinks() {
    var box = document.getElementById("link-groups");
    if (!box) return;
    var data = window.YY_LINKS;
    if (!Array.isArray(data)) {
      var p = document.createElement("p");
      p.textContent = "リンク集を表示できませんでした。";
      box.appendChild(p);
      return;
    }
    for (var i = 0; i < data.length && i < 20; i++) {
      var g = data[i];
      if (!g || !Array.isArray(g.items)) continue;
      var h = document.createElement("p");
      h.className = "note-small";
      h.textContent = str(g.group, 40);
      var ul = document.createElement("ul");
      ul.className = "linklist";
      for (var j = 0; j < g.items.length && j < 40; j++) {
        var it = g.items[j];
        if (!it) continue;
        var url = safeUrl(it.url);
        var name = str(it.name, 60);
        if (!url || !name) continue;
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.className = "ext";
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = name;
        li.appendChild(a);
        ul.appendChild(li);
      }
      if (ul.firstChild) { box.appendChild(h); box.appendChild(ul); }
    }
  }

  /* ---------- 1. 読み込み中 ---------- */
  function loading() {
    if (!document.body.hasAttribute("data-loading")) return;
    // 動きを減らす設定の人には読み込み演出を出さない
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var ov = document.createElement("div");
    ov.className = "loading";
    ov.setAttribute("role", "status");
    ov.setAttribute("aria-label", "読み込み中");

    var t = document.createElement("div");
    t.className = "loading__title";
    t.textContent = "NOW LOADING...";
    var bar = document.createElement("div");
    bar.className = "loading__bar";
    var fill = document.createElement("div");
    fill.className = "loading__fill";
    bar.appendChild(fill);
    var note = document.createElement("div");
    note.className = "loading__note";
    var notes = [
      "56kbpsモデムで接続しています",
      "ピーーーガガガ……",
      "管理人を起こしています",
      "このサイトは 800×600 推奨です",
      "クリックで飛ばせます"
    ];
    note.textContent = notes[(visits + J.min) % notes.length];
    ov.appendChild(t); ov.appendChild(bar); ov.appendChild(note);
    document.body.appendChild(ov);

    var wait = visits > 1 ? 650 : 1250;
    var done = false;
    function close() {
      if (done) return; done = true;
      ov.classList.add("is-done");
      window.setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 400);
    }
    window.setTimeout(close, wait);
    ov.addEventListener("click", close);
    document.addEventListener("keydown", close, { once: true });
  }

  /* ---------- 2. カウンター ---------- */
  function counter() {
    var box = document.getElementById("counter");
    if (!box) return;
    var digitsEl = box.querySelector(".counter__digits");
    var kiri = document.getElementById("kiriban");

    // 開設日 2023-09-21 からの経過で「なぜか」増え続ける数
    var start = Date.UTC(2023, 8, 21, 8, 17); // 17:17 JST
    var minutes = Math.max(0, Math.floor((now.getTime() - start) / 60000));
    var target = 4096 + Math.floor(minutes / 23) + visits * 7;

    var rnd = seeded(daySeed + visits);
    var forceKiri = rnd() < 0.08; // ときどき強制キリ番
    if (forceKiri) target = Math.ceil(target / 1000) * 1000;

    function render(n) {
      var s = String(n);
      while (s.length < 7) s = "0" + s;
      while (digitsEl.firstChild) digitsEl.removeChild(digitsEl.firstChild);
      for (var i = 0; i < s.length; i++) {
        var sp = document.createElement("span");
        sp.textContent = s.charAt(i);
        digitsEl.appendChild(sp);
      }
      digitsEl.setAttribute("aria-label", "アクセス数 " + n);
    }

    var cur = target - 40;
    render(cur);
    var timer = window.setInterval(function () {
      cur += 1 + Math.floor(Math.random() * 3);
      if (cur >= target) {
        cur = target;
        window.clearInterval(timer);
        render(cur);
        afterCount(cur);
        return;
      }
      render(cur);
    }, 35);

    function isKiri(n) {
      var s = String(n);
      return /000$/.test(s) || /^(\d)\1+$/.test(s) || /7777$/.test(s) || /1234$/.test(s);
    }

    function afterCount(n) {
      if (kiri && isKiri(n)) {
        kiri.textContent = "☆★ キリ番 " + n + " おめでとう！ 報告は不要です。管理人は知っています ★☆";
        kiri.classList.add("is-on");
      }
      // 見ている間も、たまに勝手に増える
      window.setInterval(function () {
        if (Math.random() < 0.35) { n += 1; render(n); }
      }, 4200);
    }
  }

  /* ---------- 3. 管理人ステータス ---------- */
  function adminStatus() {
    var el = document.getElementById("admin-status");
    if (!el) return;
    var lamp = el.querySelector(".status__lamp");
    var text = el.querySelector(".status__text");

    var slot = Math.floor((J.h * 60 + J.min) / 10); // 10分ごとに変わる
    var r = seeded(daySeed * 7 + slot)();
    var s;
    if (J.h >= 2 && J.h < 5) {
      s = r < 0.7 ? ["is-watch", "管理人：見てる"] : ["is-away", "管理人：寝てる（はず）"];
    } else if (J.h >= 9 && J.h < 18 && J.dow > 0 && J.dow < 6) {
      s = r < 0.6 ? ["is-in", "管理人：仕事中（たぶん）"] : r < 0.85 ? ["is-away", "管理人：不在"] : ["is-watch", "管理人：見てる"];
    } else {
      var opts = [
        ["is-in", "管理人：在室"],
        ["is-in", "管理人：執筆中"],
        ["is-away", "管理人：不在"],
        ["is-away", "管理人：たぶん不在"],
        ["is-watch", "管理人：見てる"],
        ["is-watch", "管理人：さっきから見てる"]
      ];
      s = opts[Math.floor(r * opts.length)];
    }
    lamp.classList.add(s[0]);
    text.textContent = s[1];

    // 長居すると変化する
    window.setTimeout(function () {
      lamp.className = "status__lamp is-watch";
      text.textContent = "管理人：……まだいる？";
    }, 90000);
  }

  /* ---------- 4. なぜか更新された過去記事 ---------- */
  function weirdLog() {
    var items = document.querySelectorAll("[data-weird]");
    var whispers = [
      "（追記：誰か見てる？）",
      "（追記：この記事、書いた覚えがない）",
      "（追記：。）",
      "（追記：キリ番を踏んだ人、ありがとう）",
      "（追記：更新はしていません）",
      ""
    ];
    for (var i = 0; i < items.length; i++) {
      var li = items[i];
      var rnd = seeded(daySeed + i * 131 + (J.h >> 2));
      var upd = li.querySelector(".upd");
      var body = li.querySelector(".body");
      // 最終更新は「今日の、少し前」
      var back = 3 + Math.floor(rnd() * 170);
      var t = new Date(now.getTime() - back * 60000);
      var P = jstParts(t);
      if (upd) {
        upd.textContent = "最終更新：" + P.y + "." + pad(P.m) + "." + pad(P.d) + " " + pad(P.h) + ":" + pad(P.min);
        upd.classList.add("is-weird");
      }
      var w = whispers[Math.floor(rnd() * whispers.length)];
      if (body && w) {
        var add = document.createElement("span");
        add.className = "note-small";
        add.textContent = " " + w;
        body.appendChild(add);
      }
    }
  }

  /* ---------- 5. 地下室の打鍵表示 ---------- */
  function typed() {
    var el = document.querySelector("[data-type]");
    if (!el) return;
    var full = el.textContent;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    el.textContent = "";
    var i = 0;
    var tm = window.setInterval(function () {
      i += 1;
      el.textContent = full.slice(0, i);
      if (i >= full.length) window.clearInterval(tm);
    }, 38);
    el.addEventListener("click", function () { window.clearInterval(tm); el.textContent = full; });
  }

  function run() {
    renderNews(); renderLinks();
    loading(); counter(); adminStatus(); weirdLog(); typed();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();

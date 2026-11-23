/*
 * ripple.js — ご依頼ページ（work.html）の背景演出
 *  画面中央付近にランダムに水滴を落とし、モノクロの波紋を描く。
 *
 * 安全・負荷の方針：
 *  - 外部通信なし。DOM へは書き込まず、canvas に描くだけ
 *  - 計算は縦横数百マス程度の低解像度で行い、表示はブラウザの拡大に任せる
 *  - タブが裏に回ったら止める。戻ったときに溜まった分を一気に計算しない
 *  - 「視差効果を減らす」設定の人には、動かない一枚絵だけを出す
 */
(function () {
  "use strict";

  var canvas = document.querySelector(".ripple");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var DAMPING = 0.986;     // 波の減衰（1に近いほど長く残る）
  var STEP_MS = 1000 / 60; // 計算の刻み
  var MAX_COLS = 240;      // 横方向の最大マス数
  var EDGE = 12;           // 端で波を吸収する幅（マス）

  var cols, rows, cur, prev, base, damp, image, viewW, viewH;
  var nextDropAt = 0, lastTime = 0, carry = 0, frameId = 0;

  function setup() {
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    cols = Math.max(80, Math.min(MAX_COLS, Math.round(viewW / 4)));
    rows = Math.max(80, Math.round(cols * viewH / viewW));
    canvas.width = cols;
    canvas.height = rows;
    cur = new Float32Array(cols * rows);
    prev = new Float32Array(cols * rows);
    image = ctx.createImageData(cols, rows);

    // 中央がわずかに明るい下地（水面に光が当たっている見え方）
    base = new Float32Array(cols * rows);
    damp = new Float32Array(cols * rows);
    var cx = cols / 2, cy = rows / 2, maxD = Math.sqrt(cx * cx + cy * cy);
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / maxD;
        var i = y * cols + x, o = i * 4;
        base[i] = 34 - 26 * d;
        // 画面の端で波を吸収し、四角い反射が出ないようにする
        var edge = Math.min(x, y, cols - 1 - x, rows - 1 - y);
        damp[i] = edge < EDGE ? DAMPING * (0.86 + 0.14 * edge / EDGE) : DAMPING;
        image.data[o] = image.data[o + 1] = image.data[o + 2] = base[i];
        image.data[o + 3] = 255;
      }
    }
  }

  // 中央付近のランダムな位置に水滴を落とす
  function drop() {
    var x = Math.round(cols / 2 + (Math.random() - 0.5) * cols * 0.24);
    var y = Math.round(rows / 2 + (Math.random() - 0.5) * rows * 0.24);
    var r = 3 + Math.floor(Math.random() * 2);
    var power = 120 + Math.random() * 140;
    for (var dy = -r; dy <= r; dy++) {
      for (var dx = -r; dx <= r; dx++) {
        var px = x + dx, py = y + dy;
        if (px < 1 || py < 1 || px >= cols - 1 || py >= rows - 1) continue;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > r) continue;
        cur[py * cols + px] += power * (0.5 + 0.5 * Math.cos(Math.PI * dist / r));
      }
    }
  }

  function step() {
    for (var y = 1; y < rows - 1; y++) {
      for (var x = 1; x < cols - 1; x++) {
        var i = y * cols + x;
        // 上下左右と斜めの平均を使い、波紋が四角くならないようにする
        var avg = (2 * (cur[i - 1] + cur[i + 1] + cur[i - cols] + cur[i + cols]) +
                   cur[i - cols - 1] + cur[i - cols + 1] + cur[i + cols - 1] + cur[i + cols + 1]) / 12;
        var v = (2 * avg - prev[i]) * damp[i];
        prev[i] = (v > -0.01 && v < 0.01) ? 0 : v; // 極小値を0にして計算を軽く保つ
      }
    }
    var t = cur; cur = prev; prev = t;
  }

  function draw() {
    var px = image.data;
    for (var y = 1; y < rows - 1; y++) {
      for (var x = 1; x < cols - 1; x++) {
        var i = y * cols + x;
        // 左上から光が当たったときの面の傾きで明暗をつける
        var slope = (cur[i - 1] - cur[i + 1]) * 0.55 + (cur[i - cols] - cur[i + cols]) * 0.85;
        var v = base[i] + slope * 1.15;
        if (slope > 18) v += (slope - 18) * 1.6; // 波の稜線の照り返し
        var o = i * 4;
        px[o] = px[o + 1] = px[o + 2] = v;
        px[o + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
  }

  function loop(time) {
    frameId = window.requestAnimationFrame(loop);
    if (!lastTime) lastTime = time;
    carry += Math.min(time - lastTime, 100); // 復帰時にまとめて計算しない
    lastTime = time;
    if (time >= nextDropAt) {
      drop();
      nextDropAt = time + 900 + Math.random() * 1600;
    }
    var stepped = false;
    while (carry >= STEP_MS) { step(); carry -= STEP_MS; stepped = true; }
    if (stepped) draw();
  }

  function start() {
    if (frameId) return;
    lastTime = 0; carry = 0;
    frameId = window.requestAnimationFrame(loop);
  }
  function stop() {
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
  }

  function stillImage() {
    for (var n = 0; n < 3; n++) {
      drop();
      for (var k = 0; k < 45; k++) step();
    }
    draw();
  }

  setup();
  if (reduceMotion) { stillImage(); return; }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });

  // スマホのアドレスバー出入り程度の高さ変化では作り直さない
  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      var w = window.innerWidth, h = window.innerHeight;
      if (w === viewW && Math.abs(h - viewH) / viewH < 0.25) return;
      setup();
    }, 200);
  });

  start();
})();

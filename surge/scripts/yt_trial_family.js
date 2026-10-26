/**
 * Surge http-response 脚本 —— YouTube Premium 强开试用（个人 + 家庭组）
 *
 * 原理：Google 下发的 productId 带 _NFT（Non-Free-Trial，无试用商品）。
 *      替换成 App Store 里真实存在的「带 intro offer」商品，StoreKit 就会
 *      按该商品的试用资格弹「免费试用」确认框。
 *
 * 替换策略（与官方试用态响应结构一致：个人/家庭交替成对出现）：
 *   第 1、3、5… 个 personal -> com.google.youtube.red.subscription        （个人试用）
 *   第 2、4、6… 个 personal -> com.google.youtube.family.red.subscription （家庭组试用）
 *
 * MODE:
 *   "both"     -> 交替（推荐，个人+家庭都有）
 *   "personal" -> 全部个人
 *   "family"   -> 全部家庭
 *
 * [Script]
 * yt-force-trial = type=http-response, pattern=^https://youtubei\.googleapis\.com/youtubei/v1/browse, requires-body=1, max-size=0, binary-body-mode=1, script-path=<URL>
 */
(function () {
  var MODE = "family";
  var TAG = "[force-trial:" + MODE + "]";

  var SRC_PERSONAL = "com.google.youtube.red.subscription_NFT";
  var SRC_LITE     = "com.google.youtube.premiumLite.subscriptionLiteGroup_NFT";
  var DST_PERSONAL = "com.google.youtube.red.subscription";
  var DST_FAMILY   = "com.google.youtube.family.red.subscription";
  var DST_LITE     = "com.google.youtube.premiumLite.subscriptionLiteGroup";

  // ---------- protobuf ----------
  function readVarint(b, i) {
    var r = 0, s = 0, x;
    do { x = b[i++]; r += (x & 0x7f) * Math.pow(2, s); s += 7; } while (x & 0x80);
    return [r, i];
  }
  function writeVarint(n) {
    var o = [];
    while (true) {
      var b = n & 0x7f; n = Math.floor(n / 128);
      if (n > 0) o.push(b | 0x80); else { o.push(b); break; }
    }
    return o;
  }
  function parseFields(b, start, end) {
    var out = [], i = start;
    while (i < end) {
      var kv = readVarint(b, i), key = kv[0]; i = kv[1];
      var fn = Math.floor(key / 8), wt = key & 7;
      if (wt === 0) { var r = readVarint(b, i); out.push([fn, 0, r[0]]); i = r[1]; }
      else if (wt === 2) {
        var lr = readVarint(b, i), len = lr[0], vs = lr[1], ve = vs + len;
        if (ve > end) throw "overrun";
        out.push([fn, 2, b.slice(vs, ve)]); i = ve;
      } else if (wt === 1) { out.push([fn, 1, b.slice(i, i + 8)]); i += 8; }
      else if (wt === 5) { out.push([fn, 5, b.slice(i, i + 4)]); i += 4; }
      else throw "wt";
    }
    return out;
  }
  function serialize(fields) {
    var out = [];
    for (var k = 0; k < fields.length; k++) {
      var fn = fields[k][0], wt = fields[k][1], v = fields[k][2];
      var kb = writeVarint(fn * 8 + wt);
      for (var a = 0; a < kb.length; a++) out.push(kb[a]);
      if (wt === 0) { var vb = writeVarint(v); for (var b = 0; b < vb.length; b++) out.push(vb[b]); }
      else if (wt === 2) {
        var lb = writeVarint(v.length);
        for (var c = 0; c < lb.length; c++) out.push(lb[c]);
        for (var d = 0; d < v.length; d++) out.push(v[d]);
      } else { for (var e = 0; e < v.length; e++) out.push(v[e]); }
    }
    return out;
  }
  function toStr(u8) {
    var s = "", CH = 8192;
    for (var i = 0; i < u8.length; i += CH) {
      s += String.fromCharCode.apply(null, u8.subarray(i, Math.min(i + CH, u8.length)));
    }
    return s;
  }
  function strToBytes(str) {
    var a = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) a[i] = str.charCodeAt(i) & 0xff;
    return a;
  }
  function looksLikeMsg(b) {
    if (!b || b.length < 2) return false;
    try { return parseFields(b, 0, b.length).length > 0; } catch (e) { return false; }
  }

  // ---------- 改写 ----------
  var seenPersonal = 0, seenLite = 0, outLog = [];

  function pickPersonal() {
    if (MODE === "personal") return DST_PERSONAL;
    if (MODE === "family")   return DST_FAMILY;
    // both: 交替（1,3,5.. -> personal；2,4,6.. -> family）
    seenPersonal++;
    return (seenPersonal % 2 === 1) ? DST_PERSONAL : DST_FAMILY;
  }

  function transform(buf) {
    var fields;
    try { fields = parseFields(buf, 0, buf.length); } catch (e) { return null; }
    var changed = false, outFields = [];
    for (var i = 0; i < fields.length; i++) {
      var fn = fields[i][0], wt = fields[i][1], v = fields[i][2];
      if (wt === 2 && v.length > 20 && v.length < 120) {
        var t = toStr(v);
        if (t === SRC_PERSONAL) {
          var rep = pickPersonal();
          outFields.push([fn, 2, strToBytes(rep)]);
          outLog.push(rep.replace("com.google.youtube.", ""));
          changed = true; continue;
        }
        if (t === SRC_LITE) {
          outFields.push([fn, 2, strToBytes(DST_LITE)]);
          seenLite++;
          changed = true; continue;
        }
      }
      if (wt === 2 && v.length > 2 && looksLikeMsg(v)) {
        var sub = transform(v);
        if (sub) { outFields.push([fn, 2, sub]); changed = true; continue; }
      }
      outFields.push([fn, wt, v]);
    }
    return changed ? serialize(outFields) : null;
  }

  var body = $response.body;
  if (!body || typeof body.length !== "number") { $done({}); return; }

  var probe = toStr(body);
  if (probe.indexOf("com.google.youtube.") < 0) {
    console.log(TAG + " skip (no productId)");
    $done({}); return;
  }

  var res = transform(body);
  if (!res || !outLog.length) { console.log(TAG + " nothing patched"); $done({}); return; }

  console.log(TAG + " " + body.length + "->" + res.length + "B  personal=" + seenPersonal +
              " lite=" + seenLite + "  [" + outLog.join(", ") + "]");
  $done({ body: new Uint8Array(res) });
})();

/**
 * Surge http-response 脚本 —— YouTube Premium 整页接管（个人 + 家庭组）
 *
 * 三层改写：
 *   A. productId（结构化重写，长度自适应）
 *        com.google.youtube.red.subscription_NFT -> family.red.subscription
 *        com.google.youtube.premiumLite..._NFT   -> 去掉 _NFT
 *   B. 档位标签（同长度字节替换，零风险）
 *        "Premium" -> "Family!"   (7 -> 7)
 *   C. 价格文案（同长度字节替换）
 *        "US$20.99" -> "US$34.99" (8 -> 8)  家庭组定价
 *
 * MODE: "family" | "personal"
 */
(function () {
  var MODE = "family";
  var TAG = "[yt-full:" + MODE + "]";

  var SRC_P = "com.google.youtube.red.subscription_NFT";
  var SRC_L = "com.google.youtube.premiumLite.subscriptionLiteGroup_NFT";
  var DST_P = "com.google.youtube.red.subscription";
  var DST_F = "com.google.youtube.family.red.subscription";
  var DST_L = "com.google.youtube.premiumLite.subscriptionLiteGroup";

  function readVarint(b, i) {
    var r = 0, s = 0, x;
    do { x = b[i++]; r += (x & 0x7f) * Math.pow(2, s); s += 7; } while (x & 0x80);
    return [r, i];
  }
  function writeVarint(n) {
    var o = [];
    while (true) { var b = n & 0x7f; n = Math.floor(n / 128); if (n > 0) o.push(b | 0x80); else { o.push(b); break; } }
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
    for (var i = 0; i < u8.length; i += CH) s += String.fromCharCode.apply(null, u8.subarray(i, Math.min(i + CH, u8.length)));
    return s;
  }
  function s2b(str) {
    var a = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) a[i] = str.charCodeAt(i) & 0xff;
    return a;
  }
  function looksMsg(b) {
    if (!b || b.length < 2) return false;
    try { return parseFields(b, 0, b.length).length > 0; } catch (e) { return false; }
  }

  var nP = 0, nL = 0;

  // A. productId 结构化重写
  function rewritePid(buf) {
    var fields;
    try { fields = parseFields(buf, 0, buf.length); } catch (e) { return null; }
    var changed = false, outF = [];
    for (var i = 0; i < fields.length; i++) {
      var fn = fields[i][0], wt = fields[i][1], v = fields[i][2];
      if (wt === 2 && v.length > 18 && v.length < 120) {
        var t = toStr(v);
        if (t === SRC_P) { outF.push([fn, 2, s2b(MODE === "family" ? DST_F : DST_P)]); nP++; changed = true; continue; }
        if (t === SRC_L) { outF.push([fn, 2, s2b(DST_L)]); nL++; changed = true; continue; }
      }
      if (wt === 2 && v.length > 2 && looksMsg(v)) {
        var sub = rewritePid(v);
        if (sub) { outF.push([fn, 2, sub]); changed = true; continue; }
      }
      outF.push([fn, wt, v]);
    }
    return changed ? serialize(outF) : null;
  }

  // B/C. 同长度字节替换
  function sameLenReplace(u8, from, to, requirePrefix) {
    if (from.length !== to.length) return { out: u8, n: 0 };
    var n = 0, out = new Uint8Array(u8);
    for (var i = 0; i + from.length <= u8.length; i++) {
      var ok = true;
      for (var j = 0; j < from.length; j++) { if (u8[i + j] !== from[j]) { ok = false; break; } }
      if (!ok) continue;
      // 可选前缀校验：只有紧跟在指定字节序列后才替换（用于定位 protobuf 字段）
      if (requirePrefix) {
        var p = requirePrefix, fit = (i >= p.length);
        if (fit) {
          for (var q = 0; q < p.length; q++) {
            if (u8[i - p.length + q] !== p[q]) { fit = false; break; }
          }
        }
        if (!fit) continue;
      }
      for (var k = 0; k < to.length; k++) out[i + k] = to[k];
      n++; i += from.length - 1;
    }
    return { out: out, n: n };
  }

  var body = $response.body;
  if (!body || typeof body.length !== "number") { $done({}); return; }
  var probe = toStr(body);
  if (probe.indexOf("com.google.youtube.") < 0) { console.log(TAG + " skip"); $done({}); return; }

  // A
  var r1 = rewritePid(body);
  var cur = r1 ? new Uint8Array(r1) : body;

  // B/C
  var nLabel = 0, nPrice = 0;
  if (MODE === "family") {
    // 只替换档位标签: field1 len7 "Premium" -> field1 len7 "Family!"
    var rb = sameLenReplace(cur, s2b("Premium"), s2b("Family!"), s2b("\x0a\x07"));
    cur = rb.out; nLabel = rb.n;
    var rp = sameLenReplace(cur, s2b("US$20.99"), s2b("US$34.99"));
    cur = rp.out; nPrice = rp.n;
  }

  if (!nP && !nL) { console.log(TAG + " nothing"); $done({}); return; }

  console.log(TAG + " " + body.length + "->" + cur.length + "B pid=" + nP + "/" + nL +
              " label=" + nLabel + " price=" + nPrice);
  $done({ body: cur });
})();

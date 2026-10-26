/**
 * Surge http-response —— YouTube Premium 整页接管：注入家庭组按钮
 *
 * 流程：
 *   1. 定位第一张 personal 卡（含 red.subscription_NFT 的最小卡片单元）
 *   2. 复制它，把 productId 改成 family.red.subscription
 *   3. 把改造后的卡插回原卡之后，修正所有祖先长度
 *   4. 可选：把 personal 卡的 _NFT 也去掉（个人试用）
 *
 * MODE: "inject"  只注入家庭组，原卡保持正价
 *       "both"    注入家庭组 + 原卡改个人试用
 */
(function () {
  var MODE = "inject";
  var TAG = "[inject-family:" + MODE + "]";

  var SRC_P = "com.google.youtube.red.subscription_NFT";
  var DST_P = "com.google.youtube.red.subscription";
  var DST_F = "com.google.youtube.family.red.subscription";

  // ---------- protobuf ----------
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
  function parseOffsets(buf, base) {
    var out = [], i = 0, n = buf.length;
    while (i < n) {
      var ks = i, kv;
      try { kv = readVarint(buf, i); } catch (e) { break; }
      var key = kv[0], j = kv[1];
      var fn = Math.floor(key / 8), wt = key & 7;
      if (wt === 0) {
        var r; try { r = readVarint(buf, j); } catch (e) { break; }
        out.push([fn, 0, r[0], base + ks, base + r[1]]); i = r[1];
      } else if (wt === 2) {
        var lr; try { lr = readVarint(buf, j); } catch (e) { break; }
        var vs = lr[1], ve = vs + lr[0];
        if (ve > n) break;
        out.push([fn, 2, buf.slice(vs, ve), base + ks, base + ve]); i = ve;
      } else if (wt === 1) { out.push([fn, 1, buf.slice(j, j + 8), base + ks, base + j + 8]); i = j + 8; }
      else if (wt === 5) { out.push([fn, 5, buf.slice(j, j + 4), base + ks, base + j + 4]); i = j + 4; }
      else break;
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
    try { return parseOffsets(b, 0).length > 0; } catch (e) { return false; }
  }

  // ---------- 1. 找 personal 卡 ----------
  // 卡片 = 含 SRC_P 且长度 500-3000 的最小节点
  var cardRange = null;   // {start, end} 绝对位置（字段边界，含 key+len）
  var cardBuf = null;

  function findCard(buf, base, depth) {
    if (depth > 70) return;
    var fs = parseOffsets(buf, base);
    for (var i = 0; i < fs.length; i++) {
      var fn = fs[i][0], wt = fs[i][1], v = fs[i][2], s = fs[i][3], e = fs[i][4];
      if (wt !== 2 || !(v instanceof Uint8Array)) continue;
      var t = toStr(v);
      if (t.indexOf(SRC_P) >= 0) {
        var len = e - s;
        if (len >= 400 && len <= 3500) {
          // 候选卡：记录并继续往内找更小的
          cardRange = { start: s, end: e };
          cardBuf = v;
          findCard(v, s + (e - s - v.length), depth + 1);
          return;
        }
        findCard(v, s + (e - s - v.length), depth + 1);
        return;
      }
      if (v.length > 8 && looksMsg(v)) {
        findCard(v, s + (e - s - v.length), depth + 1);
        if (cardRange) return;
      }
    }
  }

  // ---------- 2. 改 pid ----------
  function convertPid(buf, from, to) {
    var fs = parseOffsets(buf, 0);
    var changed = false, out = [];
    for (var i = 0; i < fs.length; i++) {
      var fn = fs[i][0], wt = fs[i][1], v = fs[i][2];
      if (wt === 2 && v.length > 18 && v.length < 120) {
        var t = toStr(v);
        if (t === from) { out.push([fn, 2, s2b(to)]); changed = true; continue; }
      }
      if (wt === 2 && v.length > 2 && looksMsg(v)) {
        var sub = convertPid(v, from, to);
        if (sub) { out.push([fn, 2, sub]); changed = true; continue; }
      }
      out.push([fn, wt, v]);
    }
    return changed ? serialize(out) : null;
  }

  // ---------- 3. 在绝对位置插入 ----------
  function insertInto(buf, base, targetPos, payloadFields) {
    var fs = parseOffsets(buf, base);
    if (!fs.length) return null;
    var first = fs[0][3], last = fs[fs.length - 1][4];
    if (targetPos < first || targetPos > last) return null;

    // 优先深入子字段
    for (var i = 0; i < fs.length; i++) {
      var fn = fs[i][0], wt = fs[i][1], v = fs[i][2], s = fs[i][3], e = fs[i][4];
      if (wt === 2 && v instanceof Uint8Array && s < targetPos && targetPos < e) {
        var vstart = s + (e - s - v.length);
        var nv = insertInto(v, vstart, targetPos, payloadFields);
        if (nv) {
          var out = [];
          for (var k = 0; k < fs.length; k++) {
            if (fs[k][3] === s && fs[k][4] === e) out.push([fn, 2, nv]);
            else out.push([fs[k][0], fs[k][1], fs[k][2]]);
          }
          return serialize(out);
        }
      }
    }
    // 兄弟之间插入
    var out2 = [], done = false;
    for (var j = 0; j < fs.length; j++) {
      if (!done && targetPos <= fs[j][3]) {
        for (var p = 0; p < payloadFields.length; p++) out2.push(payloadFields[p]);
        done = true;
      }
      out2.push([fs[j][0], fs[j][1], fs[j][2]]);
    }
    if (!done) for (var q = 0; q < payloadFields.length; q++) out2.push(payloadFields[q]);
    return serialize(out2);
  }

  // ---------- 主流程 ----------
  var body = $response.body;
  if (!body || typeof body.length !== "number") { $done({}); return; }
  var probe = toStr(body);
  if (probe.indexOf(SRC_P) < 0) { console.log(TAG + " no " + SRC_P); $done({}); return; }

  findCard(body, 0, 0);
  if (!cardRange || !cardBuf) { console.log(TAG + " card not found"); $done({}); return; }
  console.log(TAG + " card [" + cardRange.start + "," + cardRange.end + ") " + (cardRange.end - cardRange.start) + "B");

  // 复制 + 改 pid 成 family
  var famCard = convertPid(cardBuf, SRC_P, DST_F);
  if (!famCard) { console.log(TAG + " convert failed"); $done({}); return; }

  // 构造插入 payload：需要完整的字段（含 key+len）
  // cardBuf 是卡片「内容」，其外层 key+len 在原始字节里
  // 直接从 body 里取完整字段字节再改
  var rawCard = body.subarray(cardRange.start, cardRange.end);
  // rawCard 的头是 key+len，内容 = cardBuf
  var famRaw = convertPid(rawCard, SRC_P, DST_F);
  if (!famRaw) { console.log(TAG + " raw convert failed"); $done({}); return; }

  var payloadFields = [];
  var pfs = parseOffsets(famRaw, 0);
  for (var i = 0; i < pfs.length; i++) payloadFields.push([pfs[i][0], pfs[i][1], pfs[i][2]]);

  var res = insertInto(body, 0, cardRange.end, payloadFields);
  if (!res) { console.log(TAG + " insert failed"); $done({}); return; }

  var out = new Uint8Array(res);

  // 可选：原 personal 卡也去掉 _NFT
  if (MODE === "both") {
    var r2 = convertPid(out, SRC_P, DST_P);
    if (r2) out = new Uint8Array(r2);
  }

  console.log(TAG + " " + body.length + " -> " + out.length + "B  injected=1");
  $done({ body: out });
})();

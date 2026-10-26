/**
 * Surge http-response 脚本 —— YouTube Premium productId 去 _NFT
 * 结构化 protobuf 重写：解析 -> 修改 -> 重新序列化（自动修正所有祖先长度）
 *
 * [Script]
 * yt-strip-nft = type=http-response, pattern=^https://youtubei\.googleapis\.com/youtubei/v1/browse, requires-body=1, max-size=0, binary-body-mode=1, script-path=yt_strip_nft.js
 */
(function () {
  var TAG = "[strip-nft]";
  var SUFFIX = "_NFT";
  var PREFIX = "com.google.youtube.";

  // ---------- protobuf 基础 ----------
  function readVarint(b, i) {
    var r = 0, s = 0, x;
    do {
      if (i >= b.length) throw "eof";
      x = b[i++];
      r += (x & 0x7f) * Math.pow(2, s);
      s += 7;
    } while (x & 0x80);
    return [r, i];
  }

  function writeVarint(n) {
    var out = [];
    while (true) {
      var b = n & 0x7f;
      n = Math.floor(n / 128);
      if (n > 0) out.push(b | 0x80);
      else { out.push(b); break; }
    }
    return out;
  }

  function parseFields(b, start, end) {
    var out = [], i = start;
    while (i < end) {
      var kv = readVarint(b, i);
      var key = kv[0]; i = kv[1];
      var fn = Math.floor(key / 8), wt = key & 7;
      if (wt === 0) {
        var r = readVarint(b, i);
        out.push([fn, 0, r[0]]); i = r[1];
      } else if (wt === 2) {
        var lr = readVarint(b, i);
        var len = lr[0]; var vs = lr[1]; var ve = vs + len;
        if (ve > end) throw "overrun";
        out.push([fn, 2, b.slice(vs, ve)]); i = ve;
      } else if (wt === 1) {
        out.push([fn, 1, b.slice(i, i + 8)]); i += 8;
      } else if (wt === 5) {
        out.push([fn, 5, b.slice(i, i + 4)]); i += 4;
      } else throw "wt" + wt;
    }
    return out;
  }

  function serialize(fields) {
    var out = [];
    for (var k = 0; k < fields.length; k++) {
      var f = fields[k], fn = f[0], wt = f[1], v = f[2];
      var key = writeVarint(fn * 8 + wt);
      for (var a = 0; a < key.length; a++) out.push(key[a]);
      if (wt === 0) {
        var vb = writeVarint(v);
        for (var b2 = 0; b2 < vb.length; b2++) out.push(vb[b2]);
      } else if (wt === 2) {
        var lb = writeVarint(v.length);
        for (var c = 0; c < lb.length; c++) out.push(lb[c]);
        for (var d = 0; d < v.length; d++) out.push(v[d]);
      } else {
        for (var e = 0; e < v.length; e++) out.push(v[e]);
      }
    }
    return out;
  }

  function looksLikeMsg(b) {
    if (!b || b.length < 2) return false;
    try {
      var fs = parseFields(b, 0, b.length);
      return fs.length > 0;
    } catch (err) { return false; }
  }

  // ---------- 递归改写 ----------
  var patched = 0;

  function transform(buf) {
    var fields;
    try { fields = parseFields(buf, 0, buf.length); }
    catch (e) { return null; }              // 不是合法 protobuf，原样返回
    var changed = false;
    var outFields = [];
    for (var i = 0; i < fields.length; i++) {
      var fn = fields[i][0], wt = fields[i][1], v = fields[i][2];
      if (wt === 2) {
        // 是否是目标 productId
        if (v.length > PREFIX.length && v.length < 120) {
          var t = "";
          for (var j = 0; j < v.length; j++) t += String.fromCharCode(v[j]);
          if (t.indexOf(PREFIX) === 0 && t.length >= 4 &&
              t.substring(t.length - 4) === SUFFIX) {
            var nv = v.slice(0, v.length - 4);
            outFields.push([fn, 2, nv]);
            patched++; changed = true;
            continue;
          }
        }
        // 递归
        if (v.length > 2 && looksLikeMsg(v)) {
          var sub = transform(v);
          if (sub && sub.length !== v.length) { changed = true; }
          if (sub) { outFields.push([fn, 2, sub]); continue; }
        }
      }
      outFields.push([fn, wt, v]);
    }
    if (!changed) return null;              // 未改动 -> 上层保留原字节
    return serialize(outFields);
  }

  // ---------- 主流程 ----------
  var body = $response.body;
  if (!body || typeof body.length !== "number") { $done({}); return; }

  var probe = "";
  for (var i = 0; i < Math.min(body.length, 4096); i++) probe += String.fromCharCode(body[i]);
  if (probe.indexOf(PREFIX) < 0 && probe.indexOf("browse_id") < 0) {
    console.log(TAG + " not premium page");
    $done({}); return;
  }

  var result = transform(body);
  if (!result || !patched) {
    console.log(TAG + " nothing patched");
    $done({}); return;
  }

  console.log(TAG + " patched " + patched + ": " + body.length + " -> " + result.length);
  $done({ body: new Uint8Array(result) });
})();

/**
 * yt_trial.js —— YouTube Premium 试用页统一处理（Surge http-response）
 *
 * 目标：任何账号打开 Premium 页，都至少有一个可点的方案按钮。
 *
 * 设计铁律（血泪教训）：
 *   能冻进脚本的只有“数据”，绝不冻渲染器。
 *   旧版把整页换成旧模板，里面冻着 lp2_option_selection_flow_step|57e2e2c3…，
 *   线上早已是 6867b0a3…，于是好页面被换坏 -> 白屏。
 *   旧版按钮还故意不带购买令牌（command.10），于是“看得到点不动”。
 *
 * 本版按页面状态分三档，只在前两档动手：
 *
 *   A 好页面：有真实商品号，且无 _NFT
 *       -> 原样放行，一个字节都不改（好账号靠这档，绝不制造白屏）
 *
 *   B 无试用：有商品号，但带 _NFT 后缀
 *       -> 原地去掉 _NFT，换成带试用的真实 SKU，页面结构不动
 *
 *   C 无按钮 / 空方案区：页面里没有任何商品号
 *       -> 把内置的方案卡块（真实抓包，4.7KB）插到 sectionList 最前面。
 *          该块只依赖 lp_section_group 渲染器（跨版本未变），
 *          不含会话令牌，属于纯数据注入，App 升级不受影响。
 *
 * 注入块来源：iOS 21.42.4 真实响应 sectionList.contents[1]
 *   productId: unlimited.P.AAAABP9AbpQ / Abps / unlimited-B-ruby...87H1Y
 *   渲染器: lp_section_group.eml-js-fe|4f74332729180f54
 *   长 token(>=200): 0   flowStateEntityKey: 0   roundtrip: 无损
 *
 * [Script]
 * yt-trial = type=http-response, pattern=^https://youtubei\.googleapis\.com/youtubei/v1/browse, requires-body=1, max-size=0, binary-body-mode=1, script-path=<URL>
 */
(function () {
  var TAG = "[yt-trial]";

  // B 档：无试用 SKU -> 带试用 SKU
  var SKU_MAP = {
    "com.google.youtube.red.subscription_NFT":                  "com.google.youtube.red.subscription",
    "com.google.youtube.family.red.subscription_NFT":           "com.google.youtube.family.red.subscription",
    "com.google.youtube.premiumLite.subscriptionLiteGroup_NFT": "com.google.youtube.premiumLite.subscriptionLiteGroup"
  };

  // C 档：内置方案卡块（真实响应 sectionList.contents[1]，纯数据）
  var OFFER_B64 =
    "ssC9vwGUJQrbJJLJzskE1CQqHAhQELsvGAEiEwip5t+9xOOXAxVwkuUHHez+D3m6+9KSBa8kCuIjyuvqgwXbIxozksuhkAUt" +
    "CitscF9zZWN0aW9uX2dyb3VwLmVtbC1qcy1mZXw0Zjc0MzMyNzI5MTgwZjU0KsohyqmiqQzDIQrSGPLG+oMOyxgKqg2Kyvav" +
    "DqMNCj8KK0pvaW4gb3ZlciAxMjUgbWlsbGlvbiBQcmVtaXVt4oGgIOKBoG1lbWJlcnMyBAgAEAoyBAgKEAMyBAgNEBoS/gWS" +
    "yvavDvcFChIKCkluZGl2aWR1YWwyBAgAEAoSFnl0X291dGxpbmVfcGVyc29uXzI0cHQaqQWy1PevDqIFCg8KB01vbnRobHky" +
    "BAgAEAcSFwoPJDIwLjk54oCLL21vbnRoMgQIABANGikKFTEtbW9udGggdHJpYWwgZm9yICQwIDIECAAQEjIECBIQAjIECBQQ" +
    "ASLcAQo+RnJlZSB0cmlhbCBmb3IgZWxpZ2libGUgbmV3IG1lbWJlcnMgb25seS4gUmVzdHJpY3Rpb25zIGFwcGx5LiAqfAgq" +
    "EBMadrKtyYYFcBIkCFcQ7dIKGAAiEwip5t+9xOOXAxVwkuUHHez+D3nKAQTJEgbsqrnBvQFECkBodHRwczovL3d3dy55b3V0" +
    "dWJlLmNvbS90L3Rlcm1zX3BhaWRzZXJ2aWNlP2Nocm9tZWxlc3M9MSNwcmVtaXVtEAEyBAgAECkyBAgpEAEyCggqEBMo1L+Z" +
    "+A8yBAg9EAEqmwL6l+TeDZQCIqsBsq3JhgWkARIzCFgQnacBIhMIqebfvcTjlwMVcJLlBx3s/g95Mg95cGNfdHJhbnNhY3Rp" +
    "b27KAQTJEgbs+uvOvQFpEmcSIghYEJ2nASITCKnm373E45cDFXCS5Qcd7P4PecoBBMkSBuzSoN25AT0SC1NQdW5saW1pdGVk" +
    "GiRrZ01UT2dJSUFVb05DQVlTQ1hWdWJHbHRhWFJsWkElM0QlM0QiCC9wcmVtaXVtKhJUcnkgMSBtb250aCBmb3IgJDA4AUIb" +
    "CFgQnacBIhMIqebfvcTjlwMVcJLlBx3s/g95WAFoBHABigETaWQueXBjLm9mZmVyLmJ1dHRvbpoBFAoSVHJ5IDEgbW9udGgg" +
    "Zm9yICQwMhd1bmxpbWl0ZWQuUC5BQUFBQlA5QWJwUao+NAoyuj4vCh0IVxDt0goYACITCKnm373E45cDFXCS5Qcd7P4PeSIC" +
    "CAw6Cgi42RAQoub7uwEqHQhXEO3SChgAIhMIqebfvcTjlwMVcJLlBx3s/g95Er8Gksr2rw64BgoOCgZGYW1pbHkyBAgAEAYS" +
    "Fnl0X291dGxpbmVfcGVvcGxlXzI0cHQa7gWy1PevDucFCg8KB01vbnRobHkyBAgAEAcSFwoPJDM0Ljk54oCLL21vbnRoMgQI" +
    "ABANGikKFTEtbW9udGggdHJpYWwgZm9yICQwIDIECAAQEjIECBIQAjIECBQQASKhAgp3QWRkIHVwIHRvIDUgZmFtaWx5IG1l" +
    "bWJlcnMgKGFnZXMgMTMrKSBpbiB5b3VyIGhvdXNlaG9sZC4gRnJlZSB0cmlhbCBmb3IgZWxpZ2libGUgbmV3IG1lbWJlcnMg" +
    "b25seS4gUmVzdHJpY3Rpb25zIGFwcGx5LiAqfAhjEBMadrKtyYYFcBIkCFUQ7dIKGAEiEwip5t+9xOOXAxVwkuUHHez+D3nK" +
    "AQTJEgbsqrnBvQFECkBodHRwczovL3d3dy55b3V0dWJlLmNvbS90L3Rlcm1zX3BhaWRzZXJ2aWNlP2Nocm9tZWxlc3M9MSNw" +
    "cmVtaXVtEAEyBAgAEDgyBAg4EAEyBAg5ECkyBAhiEAEyCghjEBMo1L+Z+A8yBAh2EAEqmwL6l+TeDZQCIqsBsq3JhgWkARIz" +
    "CFYQnacBIhMIqebfvcTjlwMVcJLlBx3s/g95Mg95cGNfdHJhbnNhY3Rpb27KAQTJEgbs+uvOvQFpEmcSIghWEJ2nASITCKnm" +
    "373E45cDFXCS5Qcd7P4PecoBBMkSBuzSoN25AT0SC1NQdW5saW1pdGVkGiRrZ01UT2dJSUNFb05DQVlTQ1hWdWJHbHRhWFJs" +
    "WkElM0QlM0QiCC9wcmVtaXVtKhJUcnkgMSBtb250aCBmb3IgJDA4AUIbCFYQnacBIhMIqebfvcTjlwMVcJLlBx3s/g95WAVo" +
    "BHABigETaWQueXBjLm9mZmVyLmJ1dHRvbpoBFAoSVHJ5IDEgbW9udGggZm9yICQwMhd1bmxpbWl0ZWQuUC5BQUFBQlA5QWJw" +
    "c6o+NAoyuj4vCh0IVRDt0goYASITCKnm373E45cDFXCS5Qcd7P4PeSICCAw6Cgi42RAQoeb7uwEqHQhVEO3SChgBIhMIqebf" +
    "vcTjlwMVcJLlBx3s/g95Ih0IVBCVjwoYAyITCKnm373E45cDFXCS5Qcd7P4PeQqiCorK9q8OmwoKLwobU2F2ZSA0MyUgd2l0" +
    "aCBQcmVtaXVtIExpdGUqMgQIABAFMgQIBRADMgQICBATEpsIksr2rw6UCAoUCgxQcmVtaXVtIExpdGUyBAgAEAwSFnl0X291" +
    "dGxpbmVfcGVyc29uXzI0cHQalAey1PevDo0HCg8KB01vbnRobHkyBAgAEAcSFwoPJDExLjk54oCLL21vbnRoMgQIABANGikK" +
    "FTEtbW9udGggdHJpYWwgZm9yICQwIDIECAAQEjIECBIQAjIECBQQASKsAgqWAVByZW1pdW0gTGl0ZSBiZW5lZml0cyBhdmFp" +
    "bGFibGUgb24gbW9zdCBub24tbXVzaWMgY29udGVudCwgZXhjbHVkaW5nIFNob3J0cy4gQWRzIG1heSBhcHBlYXIgd2hlbiB5" +
    "b3Ugc2VhcmNoIG9yIGJyb3dzZS4gUmVzdHJpY3Rpb25zIGFwcGx5LiBMZWFybiBtb3JlLip9CIsBEAsadrKtyYYFcBIkCFIQ" +
    "7dIKGAAiEwip5t+9xOOXAxVwkuUHHez+D3nKAQTJEgbsqrnBvQFECkJodHRwczovL3N1cHBvcnQuZ29vZ2xlLmNvbS95b3V0" +
    "dWJlL2Fuc3dlci8xNTk2ODg4MyNiYWNrZ3JvdW5kX3BsYXkyBQgAEIsBMgsIiwEQCyjUv5n4DyqlAvqX5N4NngIitQGyrcmG" +
    "Ba4BEjMIUxCdpwEiEwip5t+9xOOXAxVwkuUHHez+D3kyD3lwY190cmFuc2FjdGlvbsoBBMkSBuz66869AXMScRIiCFMQnacB" +
    "IhMIqebfvcTjlwMVcJLlBx3s/g95ygEEyRIG7NKg3bkBRxILU1B1bmxpbWl0ZWQaKmtnTWFPZ0lJQVVvVUNBWVNFSFZ1Ykds" +
    "dGFYUmxaQzFDTFhKMVluayUzRCIML3ByZW1pdW1saXRlKhJUcnkgMSBtb250aCBmb3IgJDA4AUIbCFMQnacBIhMIqebfvcTj" +
    "lwMVcJLlBx3s/g95WAFoBHABigETaWQueXBjLm9mZmVyLmJ1dHRvbpoBFAoSVHJ5IDEgbW9udGggZm9yICQwMh51bmxpbWl0" +
    "ZWQtQi1ydWJ5LlAuQUFBQUJQODdIMVlKH/ppHAjYARIVCg1BZC1mcmVlIHZpZGVvMgQIABANGANKIfppHgjYARIXCg9CYWNr" +
    "Z3JvdW5kIHBsYXkyBAgAEA8YA0ob+mkYCNgBEhEKCURvd25sb2FkczIECAAQCRgDSif6aSQI1wESHQoVQWQtZnJlZSBZb3VU" +
    "dWJlIE11c2ljMgQIABAVGASqPjQKMro+LwodCFIQ7dIKGAAiEwip5t+9xOOXAxVwkuUHHez+D3kiAggMOgoIuNkQEKDm+7sB" +
    "Kh0IUhDt0goYACITCKnm373E45cDFXCS5Qcd7P4PeUIu2kcrCghTYXZlIDQzJRguIh0IUhDt0goYACITCKnm373E45cDFXCS" +
    "5Qcd7P4PeSIdCFEQlY8KGAQiEwip5t+9xOOXAxVwkuUHHez+D3kyYApYRW5qb3kgYWQtZnJlZSB2aWRlb3MsIGRvd25sb2Fk" +
    "cywgYW5kIHBsYXkgaW4gdGhlIGJhY2tncm91bmQgKGV4Y2x1ZGluZyBtdXNpYyBhbmQgU2hvcnRzKTIECAAQWDpJCjUqNDMl" +
    "IGNoZWFwZXIgdGhhbiB0aGUgUHJlbWl1bSBNb250aGx5IEluZGl2aWR1YWwgcGxhbjIECAAQATIECAEQAzIECAQQMRoSb2Zm" +
    "ZXJfY2FyZF9zZWN0aW9uMmMveW91dHViZS9lY29tbWVyY2UvcHJvbW9fdGFyZ2V0aW5nL2Zyb250ZW5kL2ZpbGxlcnMvZmxl" +
    "eGlibGUvcHJlbWl1bS9ub19vcF9wcmVtaXVtX3N0YXRlX2VudGl0eV9rZXka5Qj6PgQIBRABkj8Ayj8ECgIIAcK4ib4KiQMK" +
    "hAM4AUABUAFYAWAFmAEBoAEB4AEBiAIBoAIB0AIBmAMBoAMB0AMB6AMBmAQB0AQB6AQBsAUB2AUB5QXNzEw/7QXNzEw/9QVm" +
    "ZuY/iAYBmAYBoAYBuAYB4AYB6AYBlQcAAFJEuAcBsAgB8AgBiAkBuAkB4AkB+AkBgAoBiAoB4AoB6AoBmAsBoAsByAsB8AsB" +
    "iAwBmAwBuAwB2AwBgA0BkA0BoA0BqA0BsA0BuA0ByA0B8A0B+A0BgA4BiA4BmA4BqA4BsA4B0A4B4A4B8A4B+A4B0A8B4A8B" +
    "6A8B8A8BgBABkBABoBABqBABsBABuBAByBAB2BABqBEBuBEByBEB2BEB8BEBiBIBsBIBwBIByBIB0BIB6BIB8BIB+BIBiBMB" +
    "mBMBwBMB2BMB4BMB6BMB8BMB+BMBgBQBiBQBkBQBoBQBqBQBwBQB1RQAAIBB2BQB4BQB6BQB8BQB+BQBgBUBqBUBsBUB2BUB" +
    "4BUB+BUBwBcB8BcB+BcBkBgBuBgB0BgB2BgB4BgBEAXKuIm+CiIKIAgBEAE4AUABUAFYAXgBqAEBsAEBuAEByAEB6AEB+AEB" +
    "isKjxg0LCICw59/16Ky8hQG6pPODDhgKFnRoZW1lfDM4MWMzMTk4N2QwOWRlMDGyuZ6LDi4KLAgBQAFQAVgBdQAAgD+FATMz" +
    "Mz+NAQAAAD+wAQHQAafOnPkPqAIBuAIB6AIBoq/gjQ76Awr3A6gBAaACiCftAwAAAD+oBAGABQGVBQAAAD/lBc3MTD7tBQAA" +
    "AD/9BQAAIEGIBgGoBgGwBgHFBs3MzD7QBgXYBwG4CAHYCAGQCQGyCQdkaXNtaXNzwAkB0AkBiAoB2AoBoAsB2AsB3QwAAIC/" +
    "7QwAAIC/9QwAAIC/pQ4AAIC/rQ4AAIC/mA8BqBAB0BAB4BAB6BABkBEBmBEB5REAAIBA9REAAIBAhRIAAIBAlRIAAIBApRIA" +
    "AIBAsBIB4BIB+BIBiBMBqBMBzRMAAIBA3RMAAIBA4BMB6BMBgBQBmBQBoBQBshQkS0VOX0JVUk5TX0FOSU1BVElPTl9UWVBF" +
    "X1VOU1BFQ0lGSUVEuBQB0BQB2BQB6BQB/RQAAIBAkBUBqBUBsBUBuBUBwBUB0BUB2BUB4BUB6BUBiBYBkBYBoBYBsBYBuBYB" +
    "wBYB0BYCiBcBmBcBqBcB2BcB8BcBuBgBgBkBiBkBkBkBoBkBsBkBuBkBwBkByBkB0BkB4BkB6BkB+BkBgBoBiBoBmBoBoBoB" +
    "qBoBsBoBuBoQ2BoBiBsBkBsBmBsBoBsB0BsB2BsB4BsB6BsBgBwBsBwQuBwBwBwByBwBiB0BkB0BmB0BoB0BqB0B2B0B4B0B" +
    "8B0BkB4BmB4B4B4B+B4YsB8BuB8B+B8BwCAB6CAB+CABiCIB0r+Zpw4ECgI4AcrDyKcOGBIWEAEgAaABAfABAdADAfADAYgE" +
    "AdgEAbrilq8PCgoECAQQARICCAEiACoCKAEy1gG6l4TPBXcKbwpjL3lvdXR1YmUvZWNvbW1lcmNlL3Byb21vX3RhcmdldGlu" +
    "Zy9mcm9udGVuZC9maWxsZXJzL2ZsZXhpYmxlL3ByZW1pdW0vbm9fb3BfcHJlbWl1bV9zdGF0ZV9lbnRpdHlfa2V5GAEY7qi/" +
    "4AEYBxCZpZTFAarx38ELJAocChgKFnRoZW1lfDM4MWMzMTk4N2QwOWRlMDEQBBCZpZTFAbLx38ELKQohCh1jYXBhYmlsaXRp" +
    "ZXN8NTY2MmQwZjk0NzQ1YzBhNxAGEJmllMUBEkjChqW7BUIKK2xwX3NlY3Rpb25fZ3JvdXAuZW1sLWpzLWZlfDRmNzQzMzI3" +
    "MjkxODBmNTQyEzE3OTM0MjQ5MjcyMjIzOTUzNjUiHAhQELsvGAEiEwip5t+9xOOXAxVwkuUHHez+D3k6Em9mZmVyX2NhcmRf" +
    "c2VjdGlvblICCAA=";;

  // ---------------- protobuf 基础 ----------------
  function readVarint(b, i) {
    var r = 0, s = 0, x;
    do { if (i >= b.length) throw "eof"; x = b[i++]; r += (x & 0x7f) * Math.pow(2, s); s += 7; } while (x & 0x80);
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
        out.push([fn, 2, b.subarray(vs, ve)]); i = ve;
      } else if (wt === 1) { out.push([fn, 1, b.subarray(i, i + 8)]); i += 8; }
      else if (wt === 5) { out.push([fn, 5, b.subarray(i, i + 4)]); i += 4; }
      else throw "wt" + wt;
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
  function strToBytes(str) {
    var a = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) a[i] = str.charCodeAt(i) & 0xff;
    return a;
  }
  function b64decode(str) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var map = {}, i;
    for (i = 0; i < chars.length; i++) map[chars[i]] = i;
    var out = [], buf = 0, bits = 0;
    for (i = 0; i < str.length; i++) {
      var c = str[i];
      if (c === "=") break;
      var v = map[c];
      if (v === undefined) continue;
      buf = (buf << 6) | v; bits += 6;
      if (bits >= 8) { bits -= 8; out.push((buf >> bits) & 0xff); }
    }
    return new Uint8Array(out);
  }
  function looksLikeMsg(b) {
    if (!b || b.length < 2) return false;
    try { return parseFields(b, 0, b.length).length > 0; } catch (e) { return false; }
  }

  // ---------------- B 档：只改 SKU 字符串 ----------------
  var skuPatched = [];
  function deNFT(buf) {
    var fields;
    try { fields = parseFields(buf, 0, buf.length); } catch (e) { return null; }
    var changed = false, out = [];
    for (var i = 0; i < fields.length; i++) {
      var fn = fields[i][0], wt = fields[i][1], v = fields[i][2];
      if (wt === 2 && v.length > 15 && v.length < 120) {
        var t = toStr(v);
        if (SKU_MAP[t]) {
          out.push([fn, 2, strToBytes(SKU_MAP[t])]);
          skuPatched.push(t.replace("com.google.youtube.", ""));
          changed = true; continue;
        }
      }
      if (wt === 2 && v.length > 2 && looksLikeMsg(v)) {
        var sub = deNFT(v);
        if (sub) { out.push([fn, 2, sub]); changed = true; continue; }
      }
      out.push([fn, wt, v]);
    }
    return changed ? serialize(out) : null;
  }

  // ---------------- C 档：把方案卡块插到 sectionList 最前 ----------------
  // iOS browse 响应里 sectionListRenderer 的固定路径：
  //   field9 -> 58173949 -> 1 -> 58174010 -> 4 -> 49399797
  var SL_PATH = [58173949, 1, 58174010, 4, 49399797];

  function injectIntoSectionList(buf) {
    var fields;
    try { fields = parseFields(buf, 0, buf.length); } catch (e) { return null; }
    var offer = b64decode(OFFER_B64);
    var out = [], placed = false;
    for (var i = 0; i < fields.length; i++) {
      var fn = fields[i][0], wt = fields[i][1], v = fields[i][2];
      // contents 是 repeated field 1，插到第一条之前
      if (fn === 1 && wt === 2 && !placed) { out.push([1, 2, offer]); placed = true; }
      out.push([fn, wt, v]);
    }
    if (!placed) { out.unshift([1, 2, offer]); placed = true; }
    return placed ? serialize(out) : null;
  }

  function descend(buf, depth) {
    if (depth >= SL_PATH.length) return injectIntoSectionList(buf);
    var target = SL_PATH[depth], fields;
    try { fields = parseFields(buf, 0, buf.length); } catch (e) { return null; }
    var out = [], done = false;
    for (var i = 0; i < fields.length; i++) {
      var fn = fields[i][0], wt = fields[i][1], v = fields[i][2];
      if (fn === target && wt === 2 && !done) {
        var sub = descend(v, depth + 1);
        if (sub) { out.push([fn, 2, sub]); done = true; continue; }
      }
      out.push([fn, wt, v]);
    }
    return done ? serialize(out) : null;
  }

  // ---------------- 主流程 ----------------
  var body = $response.body;
  if (!body || typeof body.length !== "number") { $done({}); return; }

  var probe = toStr(body);
  var isPremium = probe.indexOf("premium_page_section_list") >= 0;
  if (!isPremium) { $done({}); return; }               // 不是 Premium 页，放行

  var hasSku = probe.indexOf("com.google.youtube.") >= 0 || probe.indexOf("unlimited.P.") >= 0;

  // A 档：好页面（有真实商品号且无 _NFT）—— 原样放行
  if (hasSku && probe.indexOf("_NFT") < 0) {
    console.log(TAG + " A: good page -> pass untouched");
    $done({}); return;
  }

  // B 档：有商品号但带 _NFT —— 只去 _NFT
  if (hasSku) {
    var r1 = deNFT(body);
    if (r1 && skuPatched.length) {
      console.log(TAG + " B: de-NFT [" + skuPatched.join(", ") + "] " + body.length + "->" + r1.length + "B");
      $done({ body: new Uint8Array(r1) }); return;
    }
    console.log(TAG + " B: _NFT present but unmapped -> pass");
    $done({}); return;
  }

  // C 档：没有商品号（无按钮/空方案区）—— 注入方案卡块
  var top, fields9 = null;
  try { top = parseFields(body, 0, body.length); } catch (e) { top = null; }
  if (top) {
    for (var i = 0; i < top.length; i++) if (top[i][0] === 9 && top[i][1] === 2) fields9 = top[i][2];
  }
  if (!fields9) { console.log(TAG + " C: no field9 -> pass"); $done({}); return; }

  var newF9 = descend(fields9, 0);
  if (!newF9) { console.log(TAG + " C: sectionList not found -> pass"); $done({}); return; }

  var out = [], hit = false;
  for (var k = 0; k < top.length; k++) {
    if (top[k][0] === 9 && top[k][1] === 2 && !hit) { out.push([9, 2, newF9]); hit = true; }
    else out.push([top[k][0], top[k][1], top[k][2]]);
  }
  var res = new Uint8Array(serialize(out));
  console.log(TAG + " C: injected offer cards " + body.length + " -> " + res.length + "B");
  $done({ body: res });
})();

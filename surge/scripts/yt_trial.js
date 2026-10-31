/**
 * yt_trial.js —— YouTube Premium 极简页（Surge http-response）
 *
 * 目标：不管什么账号、原页面是什么样，Premium 页一律换成我们自己的极简页
 *       ——只有方案按钮（Individual / Family / Premium Lite），没有任何
 *       营销、FAQ、评价、轮播。
 *
 * 做法：
 *   1. 不再区分“页面有没有方案卡”，一律用内置方案卡块替换 sectionList；
 *   2. 内置块是冻结数据，但里面的渲染器/主题/能力标识符
 *      （lp_section_group.eml-js-fe|<hash>、theme|<hash>、capabilities|<hash>）
 *      每次运行都从“当前响应”里读出真实值替换进去 —— 内容固定，
 *      渲染器永远跟服务端当版一致，App 升级不会因为哈希变化而白屏；
 *   3. 只在确认是 Premium 页（含 premium_page_section_list）时动手，
 *      其它 browse 请求（首页/订阅/搜索）原样放行。
 *
 * 内置块来源：iOS 21.42.4 真实响应 sectionList.contents[1]
 *   Individual unlimited.P.AAAABP9AbpQ ($20.99/mo, 试用1个月$0)
 *   Family     unlimited.P.AAAABP9Abps ($34.99/mo, 试用1个月$0)
 *   Lite       unlimited-B-ruby.P.AAAABP87H1Y ($11.99/mo)
 *   无会话令牌，protobuf roundtrip 无损。
 *
 * 说明：按钮点击走的是响应里自带的 ypc_transaction 命令，最终是否弹出
 *       Apple 购买框由账号资格与 App Store 登录状态决定。
 *
 * [Script]
 * yt-trial = type=http-response, pattern=^https://youtubei\.googleapis\.com/youtubei/v1/browse, requires-body=1, max-size=0, binary-body-mode=1, script-path=<URL>
 */
(function () {
  var TAG = "[yt-trial]";

  // 内置美区方案卡块（冻结数据，运行时按当前响应校准标识符）
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

  // ---------------- protobuf ----------------
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
  function contains(buf, needle) {
    if (!buf || buf.length < needle.length) return false;
    var m = needle.length, win = "";
    for (var i = 0; i < buf.length; i++) {
      win += String.fromCharCode(buf[i]);
      if (win.length > m) win = win.slice(1);
      if (win.length === m && win === needle) return true;
    }
    return false;
  }

  // 从整包响应里收集所有 "<name>|<16位hex>" 标识符，按名字建表
  function collectIds(bodyStr) {
    var table = {};
    var re = /([a-z0-9_]+\.eml-(?:js-)?fe|theme|capabilities)\|([0-9a-f]{16})/g;
    var m;
    while ((m = re.exec(bodyStr)) !== null) {
      if (!table[m[1]]) table[m[1]] = m[2];
    }
    return table;
  }

  // 用当前响应的标识符校准内置块：只替换 hash，保持块结构不变
  function calibrate(blockStr, ids) {
    var changed = [];
    var re = /([a-z0-9_]+\.eml-(?:js-)?fe|theme|capabilities)\|([0-9a-f]{16})/g;
    var out = blockStr.replace(re, function (all, name, oldHash) {
      if (ids[name] && ids[name] !== oldHash) {
        changed.push(name + ":" + oldHash + "->" + ids[name]);
        return name + "|" + ids[name];
      }
      return all;
    });
    return { text: out, changed: changed };
  }

  // sectionListRenderer 在 iOS browse 响应里的固定路径
  var SL_PATH = [58173949, 1, 58174010, 4, 49399797];

  // 把 sectionList 的 contents 整个换成内置块（保留 targetId 等其它字段）
  function replaceSectionList(buf, block) {
    var fields;
    try { fields = parseFields(buf, 0, buf.length); } catch (e) { return null; }
    var out = [], placed = false;
    for (var i = 0; i < fields.length; i++) {
      var fn = fields[i][0], wt = fields[i][1], v = fields[i][2];
      if (fn === 1 && wt === 2) {
        if (!placed) { out.push([1, 2, block]); placed = true; }
        continue;                                  // 其余旧 section 全丢
      }
      out.push([fn, wt, v]);
    }
    if (!placed) out.unshift([1, 2, block]);
    return serialize(out);
  }

  function descend(buf, depth, block) {
    var fields;
    try { fields = parseFields(buf, 0, buf.length); } catch (e) { return null; }
    if (depth >= SL_PATH.length) return replaceSectionList(buf, block);
    var target = SL_PATH[depth], out = [], done = false;
    for (var i = 0; i < fields.length; i++) {
      var fn = fields[i][0], wt = fields[i][1], v = fields[i][2];
      if (fn === target && wt === 2 && !done) {
        var sub = descend(v, depth + 1, block);
        if (sub) { out.push([fn, 2, sub]); done = true; continue; }
      }
      out.push([fn, wt, v]);
    }
    return done ? serialize(out) : null;
  }

  // ---------------- 主流程 ----------------
  var body = $response.body;
  if (!body || typeof body.length !== "number") { $done({}); return; }

  var bodyStr = toStr(body);
  if (bodyStr.indexOf("premium_page_section_list") < 0) { $done({}); return; }  // 非 Premium 页放行

  var top;
  try { top = parseFields(body, 0, body.length); } catch (e) { console.log(TAG + " parse fail"); $done({}); return; }

  var f9 = null;
  for (var i = 0; i < top.length; i++) if (top[i][0] === 9 && top[i][1] === 2) f9 = top[i][2];
  if (!f9) { console.log(TAG + " no field9"); $done({}); return; }

  // 校准内置块：以 field777（渲染器注册表，标识符最全）为主，field9 兜底
  var ids = {};
  var reg = null;
  for (var r = 0; r < top.length; r++) if (top[r][0] === 777 && top[r][1] === 2) reg = top[r][2];
  if (reg) ids = collectIds(toStr(reg));
  var pageIds = collectIds(bodyStr);
  for (var key in pageIds) if (!ids[key]) ids[key] = pageIds[key];
  var blockStr = toStr(b64decode(OFFER_B64));
  var cal = calibrate(blockStr, ids);
  var block = strToBytes(cal.text);

  var newF9 = descend(f9, 0, block);
  if (!newF9) { console.log(TAG + " sectionList not found -> pass"); $done({}); return; }

  var out = [], hit = false;
  for (var k = 0; k < top.length; k++) {
    if (top[k][0] === 9 && top[k][1] === 2 && !hit) { out.push([9, 2, newF9]); hit = true; }
    else out.push([top[k][0], top[k][1], top[k][2]]);
  }
  var final = new Uint8Array(serialize(out));
  console.log(TAG + " builtin-only " + body.length + " -> " + final.length + "B" +
              (cal.changed.length ? "  recalibrated[" + cal.changed.join(", ") + "]" : "  ids-ok"));
  $done({ body: final });
})();

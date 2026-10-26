/**
 * Surge http-response —— YouTube Premium 整页接管（只留两个试用按钮）
 *
 * 保留文件名 yt_slim.js 是为了让已挂载的 script-path 继续有效，配置不用改。
 *
 * 为什么换掉旧版判断：
 *   旧版要求响应里出现 com.google.youtube.（即下发了 productId）才动手。
 *   新号被判不适用试用时，服务端下发的是 no_op_premium_state_entity_key
 *   页面，里面一个 productId 都没有，旧版直接 skip，于是页面只剩
 *   「我们无法验证你所在的国家/地区 / 无法享受此优惠」。
 *
 * 本版做法：
 *   1. 识别条件换成 premium_page_section_list —— 无资格页也带这个指纹；
 *   2. 无视服务端下发的任何 section，把响应 field 9（页面 body）
 *      整体换成内置模板；
 *   3. 模板只留选择方案面板 + 两个按钮（个人 / 家庭组），
 *      营销文案、FAQ、轮播、背景图全部丢弃，90KB+ 压到约 20KB。
 *
 * 按钮显示修复（2026-10-26）：
 *   旧模板的按钮节点取自更早版本的响应，只有 command.4（商品信息），
 *   缺少 command.5 / 19（按钮显示文字）、command.17（按钮 id）
 *   以及整个 f3 描述块，于是按钮渲染成空白但点击区域仍然存在。
 *   现已按当前 App 的 schema 补齐这些字段（取自真实响应，
 *   但不含 command.10 那个绑定会话的一次性购买 token）。
 *
 * 按钮携带真实 productId（unlimited.P.AAAABP9AbpQ / Abps），
 * 点击走 StoreKit 原生购买流程。
 *
 * [Script]
 * yt-slim = type=http-response, pattern=^https://youtubei\.googleapis\.com/youtubei/v1/browse, requires-body=1, max-size=0, binary-body-mode=1, script-path=<URL>
 */
(function () {
  var TAG = "[slim-page]";
  var NEED = "premium_page_section_list";   // Premium 页指纹（无资格页也有）
  var B64 =
    "6p/13QGUSQqRSdKj9d0BikkYASLjSKr/uLwB3EgK2UiywL2/AdJICp1IksnOyQSWSCocCGAQuy8Y" +
    "ACITCIm9xpm615cDFa5hQQIdAgMsHbr70pIF8UcKpEfK6+qDBZ1HGjOSy6GQBS0KK2xwX3NlY3Rp" +
    "b25fZ3JvdXAuZW1sLWpzLWZlfDRmNzQzMzI3MjkxODBmNTQqjEXKqaKpDIVFCoA78sb6gw75Ogrt" +
    "NKrT7oQO5jRCHAhhEOBZGAMiEwiJvcaZuteXAxWuYUECHQIDLB1SuTQKK+i0reS5sOWutuW6reS8" +
    "muWRmOacjeWKoe+8jOS6q+abtOWkmuS8mOaDoCAq6zMIAhAEGuQzsq3JhgXdMxIjCGEQ4FkYAyIT" +
    "CIm9xpm615cDFa5hQQIdAgMsHcoBBLw0Jdjy7ZmYBbEzCu4xEiMIYRDgWRgDIhMIib3GmbrXlwMV" +
    "rmFBAh0CAywdygEEvDQl2JLbg5EEwjESoTHSroORBJoxEsgB4syDkQTBAQoWCgkKB+iuoumYhSAK" +
    "CQoHUHJlbWl1bUKJAYqxxfgBggEIARABGABCAwjXAWoaCH0Q8FsiEwiJvcaZuteXAxWuYUECHQID" +
    "LB2CAQ7Sz/GgAggSBuWFs+mXrZoBRxIhCH0Q8FsiEwiJvcaZuteXAxWuYUECHQIDLB3KAQS8NCXY" +
    "4vXguwUeIhwIAhoYbXVsdGlfc3RlcF9wdXJjaGFzZV9mbG93YhsIcRDTjQQiEwiJvcaZuteXAxWu" +
    "YUECHQIDLB0aoS/K55uKC5ovChhtdWx0aV9zdGVwX3B1cmNoYXNlX2Zsb3ca6S26rbTqCuItCg5w" +
    "bGFuX3NlbGVjdGlvbhKBH5LJzskE+h4qGwhxENONBCITCIm9xpm615cDFa5hQQIdAgMsHbr70pIF" +
    "1h4K+x3K6+qDBfQdGkGSy6GQBTsKOWxwMl9vcHRpb25fc2VsZWN0aW9uX2Zsb3dfc3RlcC5lbWwt" +
    "anMtZmV8NTdlMmUyYzM1OWM4YzlhNCrDHLqz27INvBwK1RIKFioUCgzpgInmi6nmlrnmoYgyBAgA" +
    "EAQSBCoCCgAazRGK4siLDsYRChEqDwoHUHJlbWl1bTIECAAQBxKyCPqj+NkNqwgKGioYChDwn46B" +
    "5Liq5Lq66K+V55SoMgQIABACElcqVQo7VVMkMOivleeUqCAxIOS4quaciCDigKIg5LmL5ZCO5Lu3" +
    "5qC85Li6IFVTJDIwLjk54oGgL+KBoOaciCAyBAgAEAsyBAgLEAkyBAgUEAwyBAggEAEargEqqwEK" +
    "GemcgOmBteWuiOebuOWFs+mZkOWItuOAgiAqfAgAEAgadrKtyYYFcBIkCDoQgPkJGAAiEwiJvcaZ" +
    "uteXAxWuYUECHQIDLB3KAQS8NCXYqrnBvQFECkBodHRwczovL3d3dy55b3V0dWJlLmNvbS90L3Rl" +
    "cm1zX3BhaWRzZXJ2aWNlP2Nocm9tZWxlc3M9MSNwcmVtaXVtEAEyCggAEAgo1L+Z+A8yBAgIEAEi" +
    "F3VubGltaXRlZC5QLkFBQUFCUDlBYnBRKgdzdW1tYXJ5Mr0F+pfk3g22BSLwBLKtyYYF6QSysOft" +
    "AuIECiNjb20uZ29vZ2xlLnlvdXR1YmUucmVkLnN1YnNjcmlwdGlvbhICVVM6AkFFOgJBUjoCQVM6" +
    "AkFUOgJBVToCQVc6AkFaOgJCQToCQkQ6AkJFOgJCRzoCQkg6AkJNOgJCTzoCQlI6AkJZOgJDQToC" +
    "Q0g6AkNMOgJDTzoCQ1I6AkNZOgJDWjoCREU6AkRLOgJETzoCRFo6AkVDOgJFRToCRUc6AkVTOgJG" +
    "SToCRlI6AkdCOgJHRToCR0Y6AkdIOgJHUDoCR1I6AkdUOgJHVToCSEs6AkhOOgJIUjoCSFU6AklE" +
    "OgJJRToCSUw6AklOOgJJUToCSVM6AklUOgJKTToCSk86AkpQOgJLRToCS0g6AktSOgJLVzoCS1k6" +
    "AktaOgJMQToCTEI6AkxJOgJMSzoCTFQ6AkxVOgJMVjoCTFk6Ak1BOgJNSzoCTVA6Ak1UOgJNWDoC" +
    "TVk6Ak5HOgJOSToCTkw6Ak5POgJOUDoCTlo6Ak9NOgJQQToCUEU6AlBGOgJQRzoCUEg6AlBLOgJQ" +
    "TDoCUFI6AlBUOgJQWToCUUE6AlJFOgJSTzoCUlM6AlJVOgJTQToCU0U6AlNHOgJTSToCU0s6AlNO" +
    "OgJTVjoCVEM6AlRIOgJUTjoCVFI6AlRXOgJUWjoCVUE6AlVHOgJVUzoCVVk6AlZFOgJWSToCVk46" +
    "AllFOgJaQToCWldCVwgBEgtBQUFBQlA5QWJwURoJdW5saW1pdGVkKAVYAWABeAaKASEKH2xwcjIt" +
    "YWNxLWMtZWxldmF0ZS1ydWJ5LWNhcmRzLW2wAQnCAQJVU8gBAfABAvgBASoP6K+V55SoIDEg5Liq" +
    "5pyIOAFYAWgEcAGKARNpZC55cGMub2ZmZXIuYnV0dG9umgERCg/or5XnlKggMSDkuKrmnIhCHQh3" +
    "EID5CRgCIhMIib3GmbrXlwMVrmFBAh0CAywdUAFYAxL7CPqj+NkN9AgKGioYChDwn46B5a625bqt" +
    "6K+V55SoMgQIABACElcqVQo7VVMkMOivleeUqCAxIOS4quaciCDigKIg5LmL5ZCO5Lu35qC85Li6" +
    "IFVTJDM0Ljk54oGgL+KBoOaciCAyBAgAEAsyBAgLEAkyBAgUEAwyBAggEAEa8gEq7wEKUemcgOmB" +
    "teWuiOebuOWFs+mZkOWItuOAgiDmnIDlpJrlj6/mt7vliqAgNSDkvY3lubTmu6EgMTMg5ZGo5bKB" +
    "55qE5a625bqt5oiQ5ZGY44CCICp8CAAQCBp2sq3JhgVwEiQINxCA+QkYASITCIm9xpm615cDFa5h" +
    "QQIdAgMsHcoBBLw0JdiqucG9AUQKQGh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3QvdGVybXNfcGFp" +
    "ZHNlcnZpY2U/Y2hyb21lbGVzcz0xI3ByZW1pdW0QATIKCAAQCCjUv5n4DzIECAgQATIECAkQFzIE" +
    "CCAQASIXdW5saW1pdGVkLlAuQUFBQUJQOUFicHMqB3N1bW1hcnkyxgX6l+TeDb8FIvkEsq3JhgXy" +
    "BLKw5+0C6wQKKmNvbS5nb29nbGUueW91dHViZS5mYW1pbHkucmVkLnN1YnNjcmlwdGlvbhICVVM6" +
    "AkFFOgJBUjoCQVM6AkFUOgJBVToCQVc6AkFaOgJCQToCQkQ6AkJFOgJCRzoCQkg6AkJNOgJCTzoC" +
    "QlI6AkJZOgJDQToCQ0g6AkNMOgJDTzoCQ1I6AkNZOgJDWjoCREU6AkRLOgJETzoCRFo6AkVDOgJF" +
    "RToCRUc6AkVTOgJGSToCRlI6AkdCOgJHRToCR0Y6AkdIOgJHUDoCR1I6AkdUOgJHVToCSEs6AkhO" +
    "OgJIUjoCSFU6AklEOgJJRToCSUw6AklOOgJJUToCSVM6AklUOgJKTToCSk86AkpQOgJLRToCS0g6" +
    "AktSOgJLVzoCS1k6AktaOgJMQToCTEI6AkxJOgJMSzoCTFQ6AkxVOgJMVjoCTFk6Ak1BOgJNSzoC" +
    "TVA6Ak1UOgJNWDoCTVk6Ak5HOgJOSToCTkw6Ak5POgJOUDoCTlo6Ak9NOgJQQToCUEU6AlBGOgJQ" +
    "RzoCUEg6AlBLOgJQTDoCUFI6AlBUOgJQWToCUUE6AlJFOgJSTzoCUlM6AlJVOgJTQToCU0U6AlNH" +
    "OgJTSToCU0s6AlNOOgJTVjoCVEM6AlRIOgJUTjoCVFI6AlRXOgJUWjoCVUE6AlVHOgJVUzoCVVk6" +
    "AlZFOgJWSToCVk46AllFOgJaQToCWldCWQgBEgtBQUFBQlA5QWJwcxoJdW5saW1pdGVkKAU4AVgC" +
    "YAF4BooBIQofbHByMi1hY3EtYy1lbGV2YXRlLXJ1YnktY2FyZHMtbbABCcIBAlVTyAEB8AEC+AEB" +
    "Kg/or5XnlKggMSDkuKrmnIg4AVgBaARwAYoBE2lkLnlwYy5vZmZlci5idXR0b26aAREKD+ivleeU" +
    "qCAxIOS4quaciEIdCHQQgPkJGAMiEwiJvcaZuteXAxWuYUECHQIDLB0qGwhzEM2wByITCIm9xpm6" +
    "15cDFa5hQQIdAgMsHTIwRWhodGRXeDBhVjl6ZEdWd1gzQjFjbU5vWVhObFgyWnNiM2NnX0FFb0FR" +
    "JTNEJTNEOAJCAiIASABaDnBsYW5fc2VsZWN0aW9uGuEJ+j4ECAUQAZI/BAoCCAHKPwQKAggBwriJ" +
    "vgroAwrlAzgBQAFQAVgBYAVwAXgBgAEBkAEBmAEBoAEByAEB4AEBiAIBkAIBmAIBoAIB0AIBmAMB" +
    "oAMBsAMB0AMB2AMB6AMBkAQBmAQBuAQBwAQB6AQBsAUB2AUB5QXNzEw/7QXNzEw/9QVmZuY/iAYB" +
    "mAYBoAYBqAYBuAYBwAYB4AYB6AYBlQcAABZEoAcBuAcBwAcByAcB8AcBsAgB8AgBiAkBuAkB4AkB" +
    "+AkBgAoBiAoBqAoB4AoB6AoBmAsBoAsByAsB8AsBiAwBmAwBuAwB2AwBgA0BiA0BkA0BoA0BqA0B" +
    "sA0BuA0ByA0B8A0B+A0BgA4BiA4BmA4BqA4BsA4B0A4B4A4B8A4B+A4BoA8BsA8BuA8BwA8B0A8B" +
    "4A8B6A8B8A8BgBABkBABoBABqBABsBABuBAByBAB0BAB2BABgBEBoBEBqBEBuBEByBEB2BEB8BEB" +
    "iBIBkBIBsBIBwBIByBIB0BIB2BIB8BIB+BIBgBMBiBMBmBMBwBMB2BMB4BMB6BMB8BMB+BMBgBQB" +
    "iBQBkBQBoBQBqBQBwBQB1RQAAIBB2BQB4BQB6BQB8BQB+BQBgBUBmBUBoBUBqBUBsBUB0BUB2BUB" +
    "4BUB+BUBgBYBkBYB0BYB2BYB8BcB+BcBkBgBuBgB2BgB4BgByriJvgonCiUIARABOAFAAVABWAFg" +
    "AXgBmAEBqAEBsAEBuAEByAEB6AEB+AEBisKjxg0LCICw59/16Ky8hQG6pPODDhgKFnRoZW1lfDU0" +
    "Y2ZiMTg2NDY1YzdmMDCyuZ6LDi4KLAgBQAFQAVgBdQAAgD+FATMzMz+NAQAAAD+wAQHQAafOnPkP" +
    "qAIBuAIB6AIBoq/gjQ7rAwroA6gBAaACiCftAwAAAD+oBAGABQGVBQAAAD/lBc3MTD7tBQAAAD/9" +
    "BQAAIEGIBgGoBgGwBgHFBs3MzD7QBgW4BwHYBwG4CAHYCAGQCQGyCQdkaXNtaXNzwAkB0AkBiAoB" +
    "2AoBoAsB2AsB3QwAAIC/7QwAAIC/9QwAAIC/pQ4AAIC/rQ4AAIC/mA8BqBAB0BAB4BAB6BABkBEB" +
    "mBEB5REAAIBA9REAAIBAhRIAAIBAlRIAAIBApRIAAIBAsBIB4BIB+BIBiBMBqBMBzRMAAIBA3RMA" +
    "AIBA4BMB6BMBgBQBmBQBoBQBshQkS0VOX0JVUk5TX0FOSU1BVElPTl9UWVBFX1VOU1BFQ0lGSUVE" +
    "uBQB0BQB2BQB6BQB/RQAAIBAkBUBqBUBsBUBuBUBwBUB0BUB2BUB4BUB6BUBiBYBkBYBoBYBsBYB" +
    "uBYBwBYB0BYCiBcBmBcBqBcB8BcBgBkBiBkBkBkBoBkBsBkBuBkBwBkByBkB0BkB4BkB6BkB+BkB" +
    "gBoBiBoBmBoBoBoBqBoBsBoBuBoQ2BoBiBsBkBsBmBsBoBsB0BsB2BsB4BsB6BsBsBwQuBwBwBwB" +
    "yBwBiB0BkB0BmB0BoB0BqB0B4B0B8B0BmB4B4B4B+B4YsB8BuB8B+B8BwCAB6CAB+CAB0r+Zpw4E" +
    "CgIwAcrDyKcOGBIWEAEgAaABAfABAdADAfADAYgEAdgEAbrilq8PCgoECAQQARICCAGSlPayDx1j" +
    "YXBhYmlsaXRpZXN8NGU1MTkyY2M4NTVkNWY5ZjJpmuj5qQYKCLe2q9YBEAQiAKrx38ELJAocChgK" +
    "FnRoZW1lfDU0Y2ZiMTg2NDY1YzdmMDAQAhC3tqvWAbLx38ELKQohCh1jYXBhYmlsaXRpZXN8NGU1" +
    "MTkyY2M4NTVkNWY5ZhAFELe2q9YBElbChqW7BVAKOWxwMl9vcHRpb25fc2VsZWN0aW9uX2Zsb3df" +
    "c3RlcC5lbWwtanMtZmV8NTdlMmUyYzM1OWM4YzlhNDITMTc5MzAwOTg1MDA5MTIyMzgyMBoeqrnj" +
    "7goYChYKCQoH6K6i6ZiFIAoJCgdQcmVtaXVtIqkOksnOyQSiDiobCHEQ040EIhMIib3GmbrXlwMV" +
    "rmFBAh0CAywduvvSkgX+DQq1Dcrr6oMFrg0aL5LLoZAFKQonZmxvd19ib3R0b21fYmFyLmVtbC1m" +
    "ZXxjZTI0YjE1MmMyOTQ2ODVmKp8MwqOLywuYDAq4Ago40rTt5g0yCjBFaGh0ZFd4MGFWOXpkR1Z3" +
    "WDNCMWNtTm9ZWE5sWDJac2IzY2dfQUVvQVElM0QlM0QS+QH6l+TeDfIBIpUBsq3JhgWOARIiCHIQ" +
    "zrUHIhMIib3GmbrXlwMVrmFBAh0CAywdygEEvDQl2PL+kpcMZAoYbXVsdGlfc3RlcF9wdXJjaGFz" +
    "ZV9mbG93EkgSIghyEM61ByITCIm9xpm615cDFa5hQQIdAgMsHcoBBLw0Jdji9eC7BR4iHAgCGhht" +
    "dWx0aV9zdGVwX3B1cmNoYXNlX2Zsb3cqBuWPlua2iDgBQhsIchDOtQciEwiJvcaZuteXAxWuYUEC" +
    "HQIDLB1YBWgEmgEICgblj5bmtoi6PiEKGwhyEM61ByITCIm9xpm615cDFa5hQQIdAgMsHSICCAwY" +
    "BhraCfo+BAgFEAGSPwQKAggByj8ECgIIAfI/ByIFqP3WAQHCuIm+CugDCuUDOAFAAVABWAFgBXAB" +
    "eAGAAQGQAQGYAQGgAQHIAQHgAQGIAgGQAgGYAgGgAgHQAgGYAwGgAwGwAwHQAwHYAwHoAwGQBAGY" +
    "BAG4BAHABAHoBAGwBQHYBQHlBc3MTD/tBc3MTD/1BWZm5j+IBgGYBgGgBgGoBgG4BgHABgHgBgHo" +
    "BgGVBwAAFkSgBwG4BwHABwHIBwHwBwGwCAHwCAGICQG4CQHgCQH4CQGACgGICgGoCgHgCgHoCgGY" +
    "CwGgCwHICwHwCwGIDAGYDAG4DAHYDAGADQGIDQGQDQGgDQGoDQGwDQG4DQHIDQHwDQH4DQGADgGI" +
    "DgGYDgGoDgGwDgHQDgHgDgHwDgH4DgGgDwGwDwG4DwHADwHQDwHgDwHoDwHwDwGAEAGQEAGgEAGo" +
    "EAGwEAG4EAHIEAHQEAHYEAGAEQGgEQGoEQG4EQHIEQHYEQHwEQGIEgGQEgGwEgHAEgHIEgHQEgHY" +
    "EgHwEgH4EgGAEwGIEwGYEwHAEwHYEwHgEwHoEwHwEwH4EwGAFAGIFAGQFAGgFAGoFAHAFAHVFAAA" +
    "gEHYFAHgFAHoFAHwFAH4FAGAFQGYFQGgFQGoFQGwFQHQFQHYFQHgFQH4FQGAFgGQFgHQFgHYFgHw" +
    "FwH4FwGQGAG4GAHYGAHgGAHKuIm+CicKJQgBEAE4AUABUAFYAWABeAGYAQGoAQGwAQG4AQHIAQHo" +
    "AQH4AQG6pPODDhgKFnRoZW1lfDU0Y2ZiMTg2NDY1YzdmMDCyuZ6LDi4KLAgBQAFQAVgBdQAAgD+F" +
    "ATMzMz+NAQAAAD+wAQHQAafOnPkPqAIBuAIB6AIBoq/gjQ7rAwroA6gBAaACiCftAwAAAD+oBAGA" +
    "BQGVBQAAAD/lBc3MTD7tBQAAAD/9BQAAIEGIBgGoBgGwBgHFBs3MzD7QBgW4BwHYBwG4CAHYCAGQ" +
    "CQGyCQdkaXNtaXNzwAkB0AkBiAoB2AoBoAsB2AsB3QwAAIC/7QwAAIC/9QwAAIC/pQ4AAIC/rQ4A" +
    "AIC/mA8BqBAB0BAB4BAB6BABkBEBmBEB5REAAIBA9REAAIBAhRIAAIBAlRIAAIBApRIAAIBAsBIB" +
    "4BIB+BIBiBMBqBMBzRMAAIBA3RMAAIBA4BMB6BMBgBQBmBQBoBQBshQkS0VOX0JVUk5TX0FOSU1B" +
    "VElPTl9UWVBFX1VOU1BFQ0lGSUVEuBQB0BQB2BQB6BQB/RQAAIBAkBUBqBUBsBUBuBUBwBUB0BUB" +
    "2BUB4BUB6BUBiBYBkBYBoBYBsBYBuBYBwBYB0BYCiBcBmBcBqBcB8BcBgBkBiBkBkBkBoBkBsBkB" +
    "uBkBwBkByBkB0BkB4BkB6BkB+BkBgBoBiBoBmBoBoBoBqBoBsBoBuBoQ2BoBiBsBkBsBmBsBoBsB" +
    "0BsB2BsB4BsB6BsBsBwQuBwBwBwByBwBiB0BkB0BmB0BoB0BqB0B4B0B8B0BmB4B4B4B+B4YsB8B" +
    "uB8B+B8BwCAB6CAB+CAB0r+Zpw4ECgIwAcrDyKcOGBIWEAEgAaABAfABAdADAfADAYgEAdgEAbri" +
    "lq8PCgoECAQQARICCAGSlPayDx1jYXBhYmlsaXRpZXN8NGU1MTkyY2M4NTVkNWY5ZjJZqvHfwQsk" +
    "ChwKGAoWdGhlbWV8NTRjZmIxODY0NjVjN2YwMBACELi0sbkBsvHfwQspCiEKHWNhcGFiaWxpdGll" +
    "c3w0ZTUxOTJjYzg1NWQ1ZjlmEAQQuLSxuQESRMKGpbsFPgonZmxvd19ib3R0b21fYmFyLmVtbC1m" +
    "ZXxjZTI0YjE1MmMyOTQ2ODVmMhMxNzkzMDA5ODUwMDkxMjIzODIxWAAiMEVoaHRkV3gwYVY5emRH" +
    "VndYM0IxY21Ob1lYTmxYMlpzYjNjZ19BRW9BUSUzRCUzRDpeEiIIcRDTjQQiEwiJvcaZuteXAxWu" +
    "YUECHQIDLB3KAQS8NCXYoqKgpAw0CjBFaGh0ZFd4MGFWOXpkR1Z3WDNCMWNtTm9ZWE5sWDJac2Iz" +
    "Y2dfQUVvQVElM0QlM0QQAUgBKPeABWgBkgEcCAIaGG11bHRpX3N0ZXBfcHVyY2hhc2VfZmxvd6AB" +
    "AagBAlIcCAIaGG11bHRpX3N0ZXBfcHVyY2hhc2VfZmxvdwq9ARIjCGEQ4FkYAyITCIm9xpm615cD" +
    "Fa5hQQIdAgMsHcoBBLw0JdiSmN75CJEBCo4BCosBCjBFaGh0ZFd4MGFWOXpkR1Z3WDNCMWNtTm9Z" +
    "WE5sWDJac2IzY2dfQUVvQVElM0QlM0QQARpV4g9SCjBFaGh0ZFd4MGFWOXpkR1Z3WDNCMWNtTm9Z" +
    "WE5sWDJac2IzY2dfQUVvQVElM0QlM0QSDnBsYW5fc2VsZWN0aW9uGg5wbGFuX3NlbGVjdGlvbjIE" +
    "CAAQAjIKCAIQBCjUv5n4DzIECAYQCDIECA4QAVoKR1RNLU5RTkZTORKRBQq+AgpnCl9odHRwczov" +
    "L3d3dy5nc3RhdGljLmNvbS95b3V0dWJlL2ltZy9wcm9tb3MvZ3Jvd3RoL3l0cF9scDJfYmFja2dy" +
    "b3VuZF9waG9uZV9wb3J0cmFpdF8zNjB4NzgwLmpwZyDoAiiMBgpoCmBodHRwczovL3d3dy5nc3Rh" +
    "dGljLmNvbS95b3V0dWJlL2ltZy9wcm9tb3MvZ3Jvd3RoL3l0cF9scDJfYmFja2dyb3VuZF9waG9u" +
    "ZV9wb3J0cmFpdF83MjB4MTU2MC5qcGcg0AUomAwKaQphaHR0cHM6Ly93d3cuZ3N0YXRpYy5jb20v" +
    "eW91dHViZS9pbWcvcHJvbW9zL2dyb3d0aC95dHBfbHAyX2JhY2tncm91bmRfcGhvbmVfcG9ydHJh" +
    "aXRfMTA4MHgyMzQwLmpwZyC4CCikEhLNAgpsCmRodHRwczovL3d3dy5nc3RhdGljLmNvbS95b3V0" +
    "dWJlL2ltZy9wcm9tb3MvZ3Jvd3RoL3l0cF9scDJfYmFja2dyb3VuZF9waG9uZV9wb3J0cmFpdF9k" +
    "YXJrXzM2MHg3ODAuanBnIOgCKIwGCm0KZWh0dHBzOi8vd3d3LmdzdGF0aWMuY29tL3lvdXR1YmUv" +
    "aW1nL3Byb21vcy9ncm93dGgveXRwX2xwMl9iYWNrZ3JvdW5kX3Bob25lX3BvcnRyYWl0X2Rhcmtf" +
    "NzIweDE1NjAuanBnINAFKJgMCm4KZmh0dHBzOi8vd3d3LmdzdGF0aWMuY29tL3lvdXR1YmUvaW1n" +
    "L3Byb21vcy9ncm93dGgveXRwX2xwMl9iYWNrZ3JvdW5kX3Bob25lX3BvcnRyYWl0X2RhcmtfMTA4" +
    "MHgyMzQwLmpwZyC4CCikEhoOaGVhZGVyX3NlY3Rpb24yYy95b3V0dWJlL2Vjb21tZXJjZS9wcm9t" +
    "b190YXJnZXRpbmcvZnJvbnRlbmQvZmlsbGVycy9mbGV4aWJsZS9wcmVtaXVtL25vX29wX3ByZW1p" +
    "dW1fc3RhdGVfZW50aXR5X2tleRrrCfo+BAgFEAGSPwQKAggByj8ECgIIAfI/ByIFqP3WAQHCuIm+" +
    "CugDCuUDOAFAAVABWAFgBXABeAGAAQGQAQGYAQGgAQHIAQHgAQGIAgGQAgGYAgGgAgHQAgGYAwGg" +
    "AwGwAwHQAwHYAwHoAwGQBAGYBAG4BAHABAHoBAGwBQHYBQHlBc3MTD/tBc3MTD/1BWZm5j+IBgGY" +
    "BgGgBgGoBgG4BgHABgHgBgHoBgGVBwAAFkSgBwG4BwHABwHIBwHwBwGwCAHwCAGICQG4CQHgCQH4" +
    "CQGACgGICgGoCgHgCgHoCgGYCwGgCwHICwHwCwGIDAGYDAG4DAHYDAGADQGIDQGQDQGgDQGoDQGw" +
    "DQG4DQHIDQHwDQH4DQGADgGIDgGYDgGoDgGwDgHQDgHgDgHwDgH4DgGgDwGwDwG4DwHADwHQDwHg" +
    "DwHoDwHwDwGAEAGQEAGgEAGoEAGwEAG4EAHIEAHQEAHYEAGAEQGgEQGoEQG4EQHIEQHYEQHwEQGI" +
    "EgGQEgGwEgHAEgHIEgHQEgHYEgHwEgH4EgGAEwGIEwGYEwHAEwHYEwHgEwHoEwHwEwH4EwGAFAGI" +
    "FAGQFAGgFAGoFAHAFAHVFAAAgEHYFAHgFAHoFAHwFAH4FAGAFQGYFQGgFQGoFQGwFQHQFQHYFQHg" +
    "FQH4FQGAFgGQFgHQFgHYFgHwFwH4FwGQGAG4GAHYGAHgGAHKuIm+CicKJQgBEAE4AUABUAFYAWAB" +
    "eAGYAQGoAQGwAQG4AQHIAQHoAQH4AQGKwqPGDQsIgLDn3/XorLyFAbqk84MOGAoWdGhlbWV8NTRj" +
    "ZmIxODY0NjVjN2YwMLK5nosOLgosCAFAAVABWAF1AACAP4UBMzMzP40BAAAAP7ABAdABp86c+Q+o" +
    "AgG4AgHoAgGir+CNDusDCugDqAEBoAKIJ+0DAAAAP6gEAYAFAZUFAAAAP+UFzcxMPu0FAAAAP/0F" +
    "AAAgQYgGAagGAbAGAcUGzczMPtAGBbgHAdgHAbgIAdgIAZAJAbIJB2Rpc21pc3PACQHQCQGICgHY" +
    "CgGgCwHYCwHdDAAAgL/tDAAAgL/1DAAAgL+lDgAAgL+tDgAAgL+YDwGoEAHQEAHgEAHoEAGQEQGY" +
    "EQHlEQAAgED1EQAAgECFEgAAgECVEgAAgEClEgAAgECwEgHgEgH4EgGIEwGoEwHNEwAAgEDdEwAA" +
    "gEDgEwHoEwGAFAGYFAGgFAGyFCRLRU5fQlVSTlNfQU5JTUFUSU9OX1RZUEVfVU5TUEVDSUZJRUS4" +
    "FAHQFAHYFAHoFAH9FAAAgECQFQGoFQGwFQG4FQHAFQHQFQHYFQHgFQHoFQGIFgGQFgGgFgGwFgG4" +
    "FgHAFgHQFgKIFwGYFwGoFwHwFwGAGQGIGQGQGQGgGQGwGQG4GQHAGQHIGQHQGQHgGQHoGQH4GQGA" +
    "GgGIGgGYGgGgGgGoGgGwGgG4GhDYGgGIGwGQGwGYGwGgGwHQGwHYGwHgGwHoGwGwHBC4HAHAHAHI" +
    "HAGIHQGQHQGYHQGgHQGoHQHgHQHwHQGYHgHgHgH4HhiwHwG4HwH4HwHAIAHoIAH4IAHSv5mnDgQK" +
    "AjABysPIpw4YEhYQASABoAEB8AEB0AMB8AMBiAQB2AQBuuKWrw8KCgQIBBABEgIIAZKU9rIPHWNh" +
    "cGFiaWxpdGllc3w0ZTUxOTJjYzg1NWQ1ZjlmIgAqECIKDQCAu0MVAMAmRCgBMAAy1gG6l4TPBXcK" +
    "bwpjL3lvdXR1YmUvZWNvbW1lcmNlL3Byb21vX3RhcmdldGluZy9mcm9udGVuZC9maWxsZXJzL2Zs" +
    "ZXhpYmxlL3ByZW1pdW0vbm9fb3BfcHJlbWl1bV9zdGF0ZV9lbnRpdHlfa2V5GAEY7qi/4AEYBxCZ" +
    "pZTFAarx38ELJAocChgKFnRoZW1lfDU0Y2ZiMTg2NDY1YzdmMDAQBBCZpZTFAbLx38ELKQohCh1j" +
    "YXBhYmlsaXRpZXN8NGU1MTkyY2M4NTVkNWY5ZhAGEJmllMUBEkjChqW7BUIKK2xwX3NlY3Rpb25f" +
    "Z3JvdXAuZW1sLWpzLWZlfDRmNzQzMzI3MjkxODBmNTQyEzE3OTMwMDk4NTAwOTEyMjM4MjIiHAhg" +
    "ELsvGAAiEwiJvcaZuteXAxWuYUECHQIDLB06DmhlYWRlcl9zZWN0aW9uUgIIADoAch4IARDwkwEY" +
    "ggEiEwiJvcaZuteXAxWuYUECHQIDLB0=";;

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
  function parseFields(buf) {
    var out = [], i = 0, n = buf.length;
    while (i < n) {
      var kv; try { kv = readVarint(buf, i); } catch (e) { break; }
      var key = kv[0], j = kv[1], fn = Math.floor(key / 8), wt = key & 7;
      if (wt === 0) { var r; try { r = readVarint(buf, j); } catch (e) { break; } out.push([fn, 0, r[0]]); i = r[1]; }
      else if (wt === 2) {
        var lr; try { lr = readVarint(buf, j); } catch (e) { break; }
        var vs = lr[1], ve = vs + lr[0];
        if (ve > n) break;
        out.push([fn, 2, buf.subarray(vs, ve)]); i = ve;
      } else if (wt === 1) { out.push([fn, 1, buf.subarray(j, j + 8)]); i = j + 8; }
      else if (wt === 5) { out.push([fn, 5, buf.subarray(j, j + 4)]); i = j + 4; }
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
  function b64decode(str) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var map = {};
    for (var i = 0; i < chars.length; i++) map[chars[i]] = i;
    var out = [], buf = 0, bits = 0;
    for (var k = 0; k < str.length; k++) {
      var ch = str[k];
      if (ch === "=") break;
      var v = map[ch];
      if (v === undefined) continue;
      buf = (buf << 6) | v; bits += 6;
      if (bits >= 8) { bits -= 8; out.push((buf >> bits) & 0xff); }
    }
    return new Uint8Array(out);
  }
  // 整包做一次 ASCII 扫描，判断这屏是不是 Premium 页
  function hasMarker(body, marker) {
    var m = marker.length, win = "";
    for (var i = 0; i < body.length; i++) {
      win += String.fromCharCode(body[i]);
      if (win.length > m) win = win.slice(1);
      if (win.length === m && win === marker) return true;
    }
    return false;
  }

  var body = $response.body;
  if (!body || typeof body.length !== "number") { $done({}); return; }
  if (!hasMarker(body, NEED)) { console.log(TAG + " skip (not premium page)"); $done({}); return; }

  var fields = parseFields(body);
  if (!fields.length) { console.log(TAG + " parse fail"); $done({}); return; }

  var tpl = b64decode(B64);
  var out = [], hit = 0;
  for (var k = 0; k < fields.length; k++) {
    var fn = fields[k][0], wt = fields[k][1], v = fields[k][2];
    if (fn === 9 && wt === 2) { out.push([fn, 2, tpl]); hit++; }
    else out.push([fn, wt, v]);
  }
  if (!hit) { console.log(TAG + " no field 9, untouched"); $done({}); return; }

  var res = new Uint8Array(serialize(out));
  console.log(TAG + " " + body.length + " -> " + res.length + "B (slim: 2 gift buttons)");
  $done({ body: res });
})();

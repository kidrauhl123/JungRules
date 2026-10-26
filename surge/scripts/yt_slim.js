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
    "6p/13QHoRArlRNKj9d0B3kQYASK3RKr/uLwBsEQKrUSywL2/AaZECvFDksnOyQTqQyocCGAQuy8YACITCIm9xpm615cDFa5hQQIdAgMsHbr70pIFxUMK+ELK6+qDBfFCGjOSy6GQBS0KK2xwX3NlY3Rpb25fZ3JvdXAuZW1sLWpzLWZlfDRmNzQzMzI3MjkxODBmNTQq" +
    "4EDKqaKpDNlACtQ28sb6gw7NNgrBMKrT7oQOujBCHAhhEOBZGAMiEwiJvcaZuteXAxWuYUECHQIDLB1SjTAKK+i0reS5sOWutuW6reS8muWRmOacjeWKoe+8jOS6q+abtOWkmuS8mOaDoCAqvy8IAhAEGrgvsq3JhgWxLxIjCGEQ4FkYAyITCIm9xpm615cDFa5hQQId" +
    "AgMsHcoBBLw0Jdjy7ZmYBYUvCsItEiMIYRDgWRgDIhMIib3GmbrXlwMVrmFBAh0CAywdygEEvDQl2JLbg5EEli0S9SzSroORBO4sEsgB4syDkQTBAQoWCgkKB+iuoumYhSAKCQoHUHJlbWl1bUKJAYqxxfgBggEIARABGABCAwjXAWoaCH0Q8FsiEwiJvcaZuteXAxWu" +
    "YUECHQIDLB2CAQ7Sz/GgAggSBuWFs+mXrZoBRxIhCH0Q8FsiEwiJvcaZuteXAxWuYUECHQIDLB3KAQS8NCXY4vXguwUeIhwIAhoYbXVsdGlfc3RlcF9wdXJjaGFzZV9mbG93YhsIcRDTjQQiEwiJvcaZuteXAxWuYUECHQIDLB0a9SrK55uKC+4qChhtdWx0aV9zdGVw" +
    "X3B1cmNoYXNlX2Zsb3cavSm6rbTqCrYpCg5wbGFuX3NlbGVjdGlvbhLVGpLJzskEzhoqGwhxENONBCITCIm9xpm615cDFa5hQQIdAgMsHbr70pIFqhoKzxnK6+qDBcgZGkGSy6GQBTsKOWxwMl9vcHRpb25fc2VsZWN0aW9uX2Zsb3dfc3RlcC5lbWwtanMtZmV8NTdl" +
    "MmUyYzM1OWM4YzlhNCqXGLqz27INkBgKqQ4KFioUCgzpgInmi6nmlrnmoYgyBAgAEAQSBCoCCgAaoQ2K4siLDpoNChEqDwoHUHJlbWl1bTIECAAQBxK+Bvqj+NkNtwYKGioYChDwn46B5Liq5Lq66K+V55SoMgQIABACElcqVQo7VVMkMOivleeUqCAxIOS4quaciCDi" +
    "gKIg5LmL5ZCO5Lu35qC85Li6IFVTJDIwLjk54oGgL+KBoOaciCAyBAgAEAsyBAgLEAkyBAgUEAwyBAggEAEiF3VubGltaXRlZC5QLkFBQUFCUDlBYnBRKgdzdW1tYXJ5MvoE+pfk3g3zBCLwBLKtyYYF6QSysOftAuIECiNjb20uZ29vZ2xlLnlvdXR1YmUucmVkLnN1" +
    "YnNjcmlwdGlvbhICVVM6AkFFOgJBUjoCQVM6AkFUOgJBVToCQVc6AkFaOgJCQToCQkQ6AkJFOgJCRzoCQkg6AkJNOgJCTzoCQlI6AkJZOgJDQToCQ0g6AkNMOgJDTzoCQ1I6AkNZOgJDWjoCREU6AkRLOgJETzoCRFo6AkVDOgJFRToCRUc6AkVTOgJGSToCRlI6AkdC" +
    "OgJHRToCR0Y6AkdIOgJHUDoCR1I6AkdUOgJHVToCSEs6AkhOOgJIUjoCSFU6AklEOgJJRToCSUw6AklOOgJJUToCSVM6AklUOgJKTToCSk86AkpQOgJLRToCS0g6AktSOgJLVzoCS1k6AktaOgJMQToCTEI6AkxJOgJMSzoCTFQ6AkxVOgJMVjoCTFk6Ak1BOgJNSzoC" +
    "TVA6Ak1UOgJNWDoCTVk6Ak5HOgJOSToCTkw6Ak5POgJOUDoCTlo6Ak9NOgJQQToCUEU6AlBGOgJQRzoCUEg6AlBLOgJQTDoCUFI6AlBUOgJQWToCUUE6AlJFOgJSTzoCUlM6AlJVOgJTQToCU0U6AlNHOgJTSToCU0s6AlNOOgJTVjoCVEM6AlRIOgJUTjoCVFI6AlRX" +
    "OgJUWjoCVUE6AlVHOgJVUzoCVVk6AlZFOgJWSToCVk46AllFOgJaQToCWldCVwgBEgtBQUFBQlA5QWJwURoJdW5saW1pdGVkKAVYAWABeAaKASEKH2xwcjItYWNxLWMtZWxldmF0ZS1ydWJ5LWNhcmRzLW2wAQnCAQJVU8gBAfABAvgBAUIdCHcQgPkJGAIiEwiJvcaZ" +
    "uteXAxWuYUECHQIDLB1QAVgDEsMG+qP42Q28BgoaKhgKEPCfjoHlrrbluq3or5XnlKgyBAgAEAISVypVCjtVUyQw6K+V55SoIDEg5Liq5pyIIOKAoiDkuYvlkI7ku7fmoLzkuLogVVMkMzQuOTnigaAv4oGg5pyIIDIECAAQCzIECAsQCTIECBQQDDIECCAQASIXdW5s" +
    "aW1pdGVkLlAuQUFBQUJQOUFicHMqB3N1bW1hcnkygwX6l+TeDfwEIvkEsq3JhgXyBLKw5+0C6wQKKmNvbS5nb29nbGUueW91dHViZS5mYW1pbHkucmVkLnN1YnNjcmlwdGlvbhICVVM6AkFFOgJBUjoCQVM6AkFUOgJBVToCQVc6AkFaOgJCQToCQkQ6AkJFOgJCRzoC" +
    "Qkg6AkJNOgJCTzoCQlI6AkJZOgJDQToCQ0g6AkNMOgJDTzoCQ1I6AkNZOgJDWjoCREU6AkRLOgJETzoCRFo6AkVDOgJFRToCRUc6AkVTOgJGSToCRlI6AkdCOgJHRToCR0Y6AkdIOgJHUDoCR1I6AkdUOgJHVToCSEs6AkhOOgJIUjoCSFU6AklEOgJJRToCSUw6AklO" +
    "OgJJUToCSVM6AklUOgJKTToCSk86AkpQOgJLRToCS0g6AktSOgJLVzoCS1k6AktaOgJMQToCTEI6AkxJOgJMSzoCTFQ6AkxVOgJMVjoCTFk6Ak1BOgJNSzoCTVA6Ak1UOgJNWDoCTVk6Ak5HOgJOSToCTkw6Ak5POgJOUDoCTlo6Ak9NOgJQQToCUEU6AlBGOgJQRzoC" +
    "UEg6AlBLOgJQTDoCUFI6AlBUOgJQWToCUUE6AlJFOgJSTzoCUlM6AlJVOgJTQToCU0U6AlNHOgJTSToCU0s6AlNOOgJTVjoCVEM6AlRIOgJUTjoCVFI6AlRXOgJUWjoCVUE6AlVHOgJVUzoCVVk6AlZFOgJWSToCVk46AllFOgJaQToCWldCWQgBEgtBQUFBQlA5QWJw" +
    "cxoJdW5saW1pdGVkKAU4AVgCYAF4BooBIQofbHByMi1hY3EtYy1lbGV2YXRlLXJ1YnktY2FyZHMtbbABCcIBAlVTyAEB8AEC+AEBQh0IdBCA+QkYAyITCIm9xpm615cDFa5hQQIdAgMsHSobCHMQzbAHIhMIib3GmbrXlwMVrmFBAh0CAywdMjBFaGh0ZFd4MGFWOXpk" +
    "R1Z3WDNCMWNtTm9ZWE5sWDJac2IzY2dfQUVvQVElM0QlM0Q4AkICIgBIAFoOcGxhbl9zZWxlY3Rpb24a4Qn6PgQIBRABkj8ECgIIAco/BAoCCAHCuIm+CugDCuUDOAFAAVABWAFgBXABeAGAAQGQAQGYAQGgAQHIAQHgAQGIAgGQAgGYAgGgAgHQAgGYAwGgAwGwAwHQ" +
    "AwHYAwHoAwGQBAGYBAG4BAHABAHoBAGwBQHYBQHlBc3MTD/tBc3MTD/1BWZm5j+IBgGYBgGgBgGoBgG4BgHABgHgBgHoBgGVBwAAFkSgBwG4BwHABwHIBwHwBwGwCAHwCAGICQG4CQHgCQH4CQGACgGICgGoCgHgCgHoCgGYCwGgCwHICwHwCwGIDAGYDAG4DAHYDAGA" +
    "DQGIDQGQDQGgDQGoDQGwDQG4DQHIDQHwDQH4DQGADgGIDgGYDgGoDgGwDgHQDgHgDgHwDgH4DgGgDwGwDwG4DwHADwHQDwHgDwHoDwHwDwGAEAGQEAGgEAGoEAGwEAG4EAHIEAHQEAHYEAGAEQGgEQGoEQG4EQHIEQHYEQHwEQGIEgGQEgGwEgHAEgHIEgHQEgHYEgHw" +
    "EgH4EgGAEwGIEwGYEwHAEwHYEwHgEwHoEwHwEwH4EwGAFAGIFAGQFAGgFAGoFAHAFAHVFAAAgEHYFAHgFAHoFAHwFAH4FAGAFQGYFQGgFQGoFQGwFQHQFQHYFQHgFQH4FQGAFgGQFgHQFgHYFgHwFwH4FwGQGAG4GAHYGAHgGAHKuIm+CicKJQgBEAE4AUABUAFYAWAB" +
    "eAGYAQGoAQGwAQG4AQHIAQHoAQH4AQGKwqPGDQsIgLDn3/XorLyFAbqk84MOGAoWdGhlbWV8NTRjZmIxODY0NjVjN2YwMLK5nosOLgosCAFAAVABWAF1AACAP4UBMzMzP40BAAAAP7ABAdABp86c+Q+oAgG4AgHoAgGir+CNDusDCugDqAEBoAKIJ+0DAAAAP6gEAYAF" +
    "AZUFAAAAP+UFzcxMPu0FAAAAP/0FAAAgQYgGAagGAbAGAcUGzczMPtAGBbgHAdgHAbgIAdgIAZAJAbIJB2Rpc21pc3PACQHQCQGICgHYCgGgCwHYCwHdDAAAgL/tDAAAgL/1DAAAgL+lDgAAgL+tDgAAgL+YDwGoEAHQEAHgEAHoEAGQEQGYEQHlEQAAgED1EQAAgECF" +
    "EgAAgECVEgAAgEClEgAAgECwEgHgEgH4EgGIEwGoEwHNEwAAgEDdEwAAgEDgEwHoEwGAFAGYFAGgFAGyFCRLRU5fQlVSTlNfQU5JTUFUSU9OX1RZUEVfVU5TUEVDSUZJRUS4FAHQFAHYFAHoFAH9FAAAgECQFQGoFQGwFQG4FQHAFQHQFQHYFQHgFQHoFQGIFgGQFgGg" +
    "FgGwFgG4FgHAFgHQFgKIFwGYFwGoFwHwFwGAGQGIGQGQGQGgGQGwGQG4GQHAGQHIGQHQGQHgGQHoGQH4GQGAGgGIGgGYGgGgGgGoGgGwGgG4GhDYGgGIGwGQGwGYGwGgGwHQGwHYGwHgGwHoGwGwHBC4HAHAHAHIHAGIHQGQHQGYHQGgHQGoHQHgHQHwHQGYHgHgHgH4" +
    "HhiwHwG4HwH4HwHAIAHoIAH4IAHSv5mnDgQKAjABysPIpw4YEhYQASABoAEB8AEB0AMB8AMBiAQB2AQBuuKWrw8KCgQIBBABEgIIAZKU9rIPHWNhcGFiaWxpdGllc3w0ZTUxOTJjYzg1NWQ1ZjlmMmma6PmpBgoIt7ar1gEQBCIAqvHfwQskChwKGAoWdGhlbWV8NTRj" +
    "ZmIxODY0NjVjN2YwMBACELe2q9YBsvHfwQspCiEKHWNhcGFiaWxpdGllc3w0ZTUxOTJjYzg1NWQ1ZjlmEAUQt7ar1gESVsKGpbsFUAo5bHAyX29wdGlvbl9zZWxlY3Rpb25fZmxvd19zdGVwLmVtbC1qcy1mZXw1N2UyZTJjMzU5YzhjOWE0MhMxNzkzMDA5ODUwMDkx" +
    "MjIzODIwGh6quePuChgKFgoJCgforqLpmIUgCgkKB1ByZW1pdW0iqQ6Syc7JBKIOKhsIcRDTjQQiEwiJvcaZuteXAxWuYUECHQIDLB26+9KSBf4NCrUNyuvqgwWuDRovksuhkAUpCidmbG93X2JvdHRvbV9iYXIuZW1sLWZlfGNlMjRiMTUyYzI5NDY4NWYqnwzCo4vL" +
    "C5gMCrgCCjjStO3mDTIKMEVoaHRkV3gwYVY5emRHVndYM0IxY21Ob1lYTmxYMlpzYjNjZ19BRW9BUSUzRCUzRBL5AfqX5N4N8gEilQGyrcmGBY4BEiIIchDOtQciEwiJvcaZuteXAxWuYUECHQIDLB3KAQS8NCXY8v6SlwxkChhtdWx0aV9zdGVwX3B1cmNoYXNlX2Zs" +
    "b3cSSBIiCHIQzrUHIhMIib3GmbrXlwMVrmFBAh0CAywdygEEvDQl2OL14LsFHiIcCAIaGG11bHRpX3N0ZXBfcHVyY2hhc2VfZmxvdyoG5Y+W5raIOAFCGwhyEM61ByITCIm9xpm615cDFa5hQQIdAgMsHVgFaASaAQgKBuWPlua2iLo+IQobCHIQzrUHIhMIib3GmbrX" +
    "lwMVrmFBAh0CAywdIgIIDBgGGtoJ+j4ECAUQAZI/BAoCCAHKPwQKAggB8j8HIgWo/dYBAcK4ib4K6AMK5QM4AUABUAFYAWAFcAF4AYABAZABAZgBAaABAcgBAeABAYgCAZACAZgCAaACAdACAZgDAaADAbADAdADAdgDAegDAZAEAZgEAbgEAcAEAegEAbAFAdgFAeUF" +
    "zcxMP+0FzcxMP/UFZmbmP4gGAZgGAaAGAagGAbgGAcAGAeAGAegGAZUHAAAWRKAHAbgHAcAHAcgHAfAHAbAIAfAIAYgJAbgJAeAJAfgJAYAKAYgKAagKAeAKAegKAZgLAaALAcgLAfALAYgMAZgMAbgMAdgMAYANAYgNAZANAaANAagNAbANAbgNAcgNAfANAfgNAYAO" +
    "AYgOAZgOAagOAbAOAdAOAeAOAfAOAfgOAaAPAbAPAbgPAcAPAdAPAeAPAegPAfAPAYAQAZAQAaAQAagQAbAQAbgQAcgQAdAQAdgQAYARAaARAagRAbgRAcgRAdgRAfARAYgSAZASAbASAcASAcgSAdASAdgSAfASAfgSAYATAYgTAZgTAcATAdgTAeATAegTAfATAfgT" +
    "AYAUAYgUAZAUAaAUAagUAcAUAdUUAACAQdgUAeAUAegUAfAUAfgUAYAVAZgVAaAVAagVAbAVAdAVAdgVAeAVAfgVAYAWAZAWAdAWAdgWAfAXAfgXAZAYAbgYAdgYAeAYAcq4ib4KJwolCAEQATgBQAFQAVgBYAF4AZgBAagBAbABAbgBAcgBAegBAfgBAbqk84MOGAoW" +
    "dGhlbWV8NTRjZmIxODY0NjVjN2YwMLK5nosOLgosCAFAAVABWAF1AACAP4UBMzMzP40BAAAAP7ABAdABp86c+Q+oAgG4AgHoAgGir+CNDusDCugDqAEBoAKIJ+0DAAAAP6gEAYAFAZUFAAAAP+UFzcxMPu0FAAAAP/0FAAAgQYgGAagGAbAGAcUGzczMPtAGBbgHAdgH" +
    "AbgIAdgIAZAJAbIJB2Rpc21pc3PACQHQCQGICgHYCgGgCwHYCwHdDAAAgL/tDAAAgL/1DAAAgL+lDgAAgL+tDgAAgL+YDwGoEAHQEAHgEAHoEAGQEQGYEQHlEQAAgED1EQAAgECFEgAAgECVEgAAgEClEgAAgECwEgHgEgH4EgGIEwGoEwHNEwAAgEDdEwAAgEDgEwHo" +
    "EwGAFAGYFAGgFAGyFCRLRU5fQlVSTlNfQU5JTUFUSU9OX1RZUEVfVU5TUEVDSUZJRUS4FAHQFAHYFAHoFAH9FAAAgECQFQGoFQGwFQG4FQHAFQHQFQHYFQHgFQHoFQGIFgGQFgGgFgGwFgG4FgHAFgHQFgKIFwGYFwGoFwHwFwGAGQGIGQGQGQGgGQGwGQG4GQHAGQHI" +
    "GQHQGQHgGQHoGQH4GQGAGgGIGgGYGgGgGgGoGgGwGgG4GhDYGgGIGwGQGwGYGwGgGwHQGwHYGwHgGwHoGwGwHBC4HAHAHAHIHAGIHQGQHQGYHQGgHQGoHQHgHQHwHQGYHgHgHgH4HhiwHwG4HwH4HwHAIAHoIAH4IAHSv5mnDgQKAjABysPIpw4YEhYQASABoAEB8AEB" +
    "0AMB8AMBiAQB2AQBuuKWrw8KCgQIBBABEgIIAZKU9rIPHWNhcGFiaWxpdGllc3w0ZTUxOTJjYzg1NWQ1ZjlmMlmq8d/BCyQKHAoYChZ0aGVtZXw1NGNmYjE4NjQ2NWM3ZjAwEAIQuLSxuQGy8d/BCykKIQodY2FwYWJpbGl0aWVzfDRlNTE5MmNjODU1ZDVmOWYQBBC4" +
    "tLG5ARJEwoaluwU+CidmbG93X2JvdHRvbV9iYXIuZW1sLWZlfGNlMjRiMTUyYzI5NDY4NWYyEzE3OTMwMDk4NTAwOTEyMjM4MjFYACIwRWhodGRXeDBhVjl6ZEdWd1gzQjFjbU5vWVhObFgyWnNiM2NnX0FFb0FRJTNEJTNEOl4SIghxENONBCITCIm9xpm615cDFa5h" +
    "QQIdAgMsHcoBBLw0JdiioqCkDDQKMEVoaHRkV3gwYVY5emRHVndYM0IxY21Ob1lYTmxYMlpzYjNjZ19BRW9BUSUzRCUzRBABSAEo94AFaAGSARwIAhoYbXVsdGlfc3RlcF9wdXJjaGFzZV9mbG93oAEBqAECUhwIAhoYbXVsdGlfc3RlcF9wdXJjaGFzZV9mbG93Cr0B" +
    "EiMIYRDgWRgDIhMIib3GmbrXlwMVrmFBAh0CAywdygEEvDQl2JKY3vkIkQEKjgEKiwEKMEVoaHRkV3gwYVY5emRHVndYM0IxY21Ob1lYTmxYMlpzYjNjZ19BRW9BUSUzRCUzRBABGlXiD1IKMEVoaHRkV3gwYVY5emRHVndYM0IxY21Ob1lYTmxYMlpzYjNjZ19BRW9B" +
    "USUzRCUzRBIOcGxhbl9zZWxlY3Rpb24aDnBsYW5fc2VsZWN0aW9uMgQIABACMgoIAhAEKNS/mfgPMgQIBhAIMgQIDhABWgpHVE0tTlFORlM5EpEFCr4CCmcKX2h0dHBzOi8vd3d3LmdzdGF0aWMuY29tL3lvdXR1YmUvaW1nL3Byb21vcy9ncm93dGgveXRwX2xwMl9i" +
    "YWNrZ3JvdW5kX3Bob25lX3BvcnRyYWl0XzM2MHg3ODAuanBnIOgCKIwGCmgKYGh0dHBzOi8vd3d3LmdzdGF0aWMuY29tL3lvdXR1YmUvaW1nL3Byb21vcy9ncm93dGgveXRwX2xwMl9iYWNrZ3JvdW5kX3Bob25lX3BvcnRyYWl0XzcyMHgxNTYwLmpwZyDQBSiYDApp" +
    "CmFodHRwczovL3d3dy5nc3RhdGljLmNvbS95b3V0dWJlL2ltZy9wcm9tb3MvZ3Jvd3RoL3l0cF9scDJfYmFja2dyb3VuZF9waG9uZV9wb3J0cmFpdF8xMDgweDIzNDAuanBnILgIKKQSEs0CCmwKZGh0dHBzOi8vd3d3LmdzdGF0aWMuY29tL3lvdXR1YmUvaW1nL3By" +
    "b21vcy9ncm93dGgveXRwX2xwMl9iYWNrZ3JvdW5kX3Bob25lX3BvcnRyYWl0X2RhcmtfMzYweDc4MC5qcGcg6AIojAYKbQplaHR0cHM6Ly93d3cuZ3N0YXRpYy5jb20veW91dHViZS9pbWcvcHJvbW9zL2dyb3d0aC95dHBfbHAyX2JhY2tncm91bmRfcGhvbmVfcG9y" +
    "dHJhaXRfZGFya183MjB4MTU2MC5qcGcg0AUomAwKbgpmaHR0cHM6Ly93d3cuZ3N0YXRpYy5jb20veW91dHViZS9pbWcvcHJvbW9zL2dyb3d0aC95dHBfbHAyX2JhY2tncm91bmRfcGhvbmVfcG9ydHJhaXRfZGFya18xMDgweDIzNDAuanBnILgIKKQSGg5oZWFkZXJf" +
    "c2VjdGlvbjJjL3lvdXR1YmUvZWNvbW1lcmNlL3Byb21vX3RhcmdldGluZy9mcm9udGVuZC9maWxsZXJzL2ZsZXhpYmxlL3ByZW1pdW0vbm9fb3BfcHJlbWl1bV9zdGF0ZV9lbnRpdHlfa2V5GusJ+j4ECAUQAZI/BAoCCAHKPwQKAggB8j8HIgWo/dYBAcK4ib4K6AMK" +
    "5QM4AUABUAFYAWAFcAF4AYABAZABAZgBAaABAcgBAeABAYgCAZACAZgCAaACAdACAZgDAaADAbADAdADAdgDAegDAZAEAZgEAbgEAcAEAegEAbAFAdgFAeUFzcxMP+0FzcxMP/UFZmbmP4gGAZgGAaAGAagGAbgGAcAGAeAGAegGAZUHAAAWRKAHAbgHAcAHAcgHAfAH" +
    "AbAIAfAIAYgJAbgJAeAJAfgJAYAKAYgKAagKAeAKAegKAZgLAaALAcgLAfALAYgMAZgMAbgMAdgMAYANAYgNAZANAaANAagNAbANAbgNAcgNAfANAfgNAYAOAYgOAZgOAagOAbAOAdAOAeAOAfAOAfgOAaAPAbAPAbgPAcAPAdAPAeAPAegPAfAPAYAQAZAQAaAQAagQ" +
    "AbAQAbgQAcgQAdAQAdgQAYARAaARAagRAbgRAcgRAdgRAfARAYgSAZASAbASAcASAcgSAdASAdgSAfASAfgSAYATAYgTAZgTAcATAdgTAeATAegTAfATAfgTAYAUAYgUAZAUAaAUAagUAcAUAdUUAACAQdgUAeAUAegUAfAUAfgUAYAVAZgVAaAVAagVAbAVAdAVAdgV" +
    "AeAVAfgVAYAWAZAWAdAWAdgWAfAXAfgXAZAYAbgYAdgYAeAYAcq4ib4KJwolCAEQATgBQAFQAVgBYAF4AZgBAagBAbABAbgBAcgBAegBAfgBAYrCo8YNCwiAsOff9eisvIUBuqTzgw4YChZ0aGVtZXw1NGNmYjE4NjQ2NWM3ZjAwsrmeiw4uCiwIAUABUAFYAXUAAIA/" +
    "hQEzMzM/jQEAAAA/sAEB0AGnzpz5D6gCAbgCAegCAaKv4I0O6wMK6AOoAQGgAogn7QMAAAA/qAQBgAUBlQUAAAA/5QXNzEw+7QUAAAA//QUAACBBiAYBqAYBsAYBxQbNzMw+0AYFuAcB2AcBuAgB2AgBkAkBsgkHZGlzbWlzc8AJAdAJAYgKAdgKAaALAdgLAd0MAACA" +
    "v+0MAACAv/UMAACAv6UOAACAv60OAACAv5gPAagQAdAQAeAQAegQAZARAZgRAeURAACAQPURAACAQIUSAACAQJUSAACAQKUSAACAQLASAeASAfgSAYgTAagTAc0TAACAQN0TAACAQOATAegTAYAUAZgUAaAUAbIUJEtFTl9CVVJOU19BTklNQVRJT05fVFlQRV9VTlNQ" +
    "RUNJRklFRLgUAdAUAdgUAegUAf0UAACAQJAVAagVAbAVAbgVAcAVAdAVAdgVAeAVAegVAYgWAZAWAaAWAbAWAbgWAcAWAdAWAogXAZgXAagXAfAXAYAZAYgZAZAZAaAZAbAZAbgZAcAZAcgZAdAZAeAZAegZAfgZAYAaAYgaAZgaAaAaAagaAbAaAbgaENgaAYgbAZAb" +
    "AZgbAaAbAdAbAdgbAeAbAegbAbAcELgcAcAcAcgcAYgdAZAdAZgdAaAdAagdAeAdAfAdAZgeAeAeAfgeGLAfAbgfAfgfAcAgAeggAfggAdK/macOBAoCMAHKw8inDhgSFhABIAGgAQHwAQHQAwHwAwGIBAHYBAG64pavDwoKBAgEEAESAggBkpT2sg8dY2FwYWJpbGl0" +
    "aWVzfDRlNTE5MmNjODU1ZDVmOWYiACoQIgoNAIC7QxUAwCZEKAEwADLWAbqXhM8FdwpvCmMveW91dHViZS9lY29tbWVyY2UvcHJvbW9fdGFyZ2V0aW5nL2Zyb250ZW5kL2ZpbGxlcnMvZmxleGlibGUvcHJlbWl1bS9ub19vcF9wcmVtaXVtX3N0YXRlX2VudGl0eV9r" +
    "ZXkYARjuqL/gARgHEJmllMUBqvHfwQskChwKGAoWdGhlbWV8NTRjZmIxODY0NjVjN2YwMBAEEJmllMUBsvHfwQspCiEKHWNhcGFiaWxpdGllc3w0ZTUxOTJjYzg1NWQ1ZjlmEAYQmaWUxQESSMKGpbsFQgorbHBfc2VjdGlvbl9ncm91cC5lbWwtanMtZmV8NGY3NDMz" +
    "MjcyOTE4MGY1NDITMTc5MzAwOTg1MDA5MTIyMzgyMiIcCGAQuy8YACITCIm9xpm615cDFa5hQQIdAgMsHToOaGVhZGVyX3NlY3Rpb25SAggAOgByHggBEPCTARiCASITCIm9xpm615cDFa5hQQIdAgMsHQ==";

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

(function(){
  var TPL_B64="6p/13QGRJwqOJ9Kj9d0BhycYASLgJqr/uLwB2SYKniaywL2/AZcmCuElksnOyQTaJSocCAYQuy8YCyITCJDi8fLY45cDFY0nFQUdRZctObr70pIFtSUK6CTK6+qDBeEkGjOSy6GQBS0KK2xwX3NlY3Rpb25fZ3JvdXAuZW1sLWpzLWZlfDRmNzQzMzI3MjkxODBmNTQq0CLKqaKpDMkiCrQY8sb6gw6tGArAC6rT7oQOuQsijAv6l+TeDYULIp0Ksq3JhgWWChIjCIEBEJ2nASITCJDi8fLY45cDFY0nFQUdRZctOcoBBC2XoiiysOftAuoJCiNjb20uZ29vZ2xlLnlvdXR1YmUucmVkLnN1YnNjcmlwdGlvbhICVVMqZJren/EDXgo+ChUKE+ato+WcqOa/gOa0u+S9oOeahCAKEQoPWW91VHViZSBQcmVtaXVtChIKECDkvJrlkZjotYTmoLzvvIFCHAiCARDZzwEiEwiQ4vHy2OOXAxWNJxUFHUWXLTk6AkFFOgJBUjoCQVM6AkFUOgJBVToCQVc6AkFaOgJCQToCQkQ6AkJFOgJCRzoCQkg6AkJNOgJCTzoCQlI6AkJZOgJDQToCQ0g6AkNMOgJDTzoCQ1I6AkNZOgJDWjoCREU6AkRLOgJETzoCRFo6AkVDOgJFRToCRUc6AkVTOgJGSToCRlI6AkdCOgJHRToCR0Y6AkdIOgJHUDoCR1I6AkdUOgJHVToCSEs6AkhOOgJIUjoCSFU6AklEOgJJRToCSUw6AklOOgJJUToCSVM6AklUOgJKTToCSk86AkpQOgJLRToCS0g6AktSOgJLVzoCS1k6AktaOgJMQToCTEI6AkxJOgJMSzoCTFQ6AkxVOgJMVjoCTFk6Ak1BOgJNSzoCTVA6Ak1UOgJNWDoCTVk6Ak5HOgJOSToCTkw6Ak5POgJOUDoCTlo6Ak9NOgJQQToCUEU6AlBGOgJQRzoCUEg6AlBLOgJQTDoCUFI6AlBUOgJQWToCUUE6AlJFOgJSTzoCUlM6AlJVOgJTQToCU0U6AlNHOgJTSToCU0s6AlNOOgJTVjoCVEM6AlRIOgJUTjoCVFI6AlRXOgJUWjoCVUE6AlVHOgJVUzoCVVk6AlZFOgJWSToCVk46AllFOgJaQToCWldCUAgBEgtBQUFBQlA5QWJwURoJdW5saW1pdGVkKAVYAWABeAaKARoKGGxwcjItYWNxLWMtdXMtY2F0Y2hhbGwtbbABCcIBAlVTyAEB8AEC+AEBUqYEeXRjZUFJaE5iZjZpRkFRaGJCeDlLY1RUbGpyS21Na1NoMlRaa0wzaVE5Ymxya0hpNkN6Ykx6OHRvYlM3ZndBNGhiR3RFRktpcG53ZS1fNWZZa2VtdEpOQ1BKUXhZV0c1Rzh2dXZBWnU5UGNvTFhVT244NFp0eG9pXzRaclEtbjEwQ2tkb0tRUGt5NG9zNlFGTWVUaHdYb1ZsSDk1MVZ5ODM5Zk8zZDZvUEl5QlB5NFlYVnJBcTZIbG1oWmJ1MTFFTmNwci1jZ3o4c1lEajVzMkNub1VJdEx4aXcweGZERmNQSXU4UEh3M3ZGb2paeVNSWkJsWFM0b2phME95eHF6c1R2cU1SeHRoc3poNllPNGtQN2J1MlhmbWxZSXV6LTh3RWxwNmFvZmFnaHp5MjNacTVOZDNBUVpjMGtVNkxGWVJZbjF6QVktVmxTckthN0poaGQ0MzBmWWRWMEtTc20wQWZCWmxZWjY0TzdkQUpzZkNaaE1HdGdfMTY5dFJCNzdub2NDQUl5Zmo4QTI1UU9HZGRLSklZRE1xM2NLZUhoQ3hDYmJKV0N4WW1xY3RoT0I0NGFqbF8xMnVYaG5ucDB0RzJtT1RUUVUyMU55ZnVkcXRCRnFSZzY5QzR0OG5DUVhpVWZPVVBYNzMyVlJGV1lraWFBTkVCY3FDWVNwLXBDa3llRXlkOXp5UDdwaVZMRDJMUzhYNkU2d1J1dXVCM3NRLXZWTWZBQSoM5Liq5Lq66K+V55SoOAFCGwh5ELnWByITCJDi8fLY45cDFY0nFQUdRZctOVgBaAJwAYoBEmlkLnlwYy5tc29mLmJ1dHRvbpoBGgoM5Liq5Lq66K+V55SoMgQIABAEMgQIBBAHQhwIZxDgWRgDIhMIkOLx8tjjlwMVjScVBR1Fly05WgpHVE0tTlFORlM5CvELqtPuhA7qCyK9C/qX5N4NtgsizgqyrcmGBccKEiIIfhCdpwEiEwiQ4vHy2OOXAxWNJxUFHUWXLTnKAQQtl6IosrDn7QKcCgoqY29tLmdvb2dsZS55b3V0dWJlLmZhbWlseS5yZWQuc3Vic2NyaXB0aW9uEgJVUypjmt6f8QNdCj4KFQoT5q2j5Zyo5r+A5rS75L2g55qEIAoRCg9Zb3VUdWJlIFByZW1pdW0KEgoQIOS8muWRmOi1hOagvO+8gUIbCH8Q2c8BIhMIkOLx8tjjlwMVjScVBR1Fly05OgJBRToCQVI6AkFTOgJBVDoCQVU6AkFXOgJBWjoCQkE6AkJEOgJCRToCQkc6AkJIOgJCTToCQk86AkJSOgJCWToCQ0E6AkNIOgJDTDoCQ086AkNSOgJDWToCQ1o6AkRFOgJESzoCRE86AkRaOgJFQzoCRUU6AkVHOgJFUzoCRkk6AkZSOgJHQjoCR0U6AkdGOgJHSDoCR1A6AkdSOgJHVDoCR1U6AkhLOgJITjoCSFI6AkhVOgJJRDoCSUU6AklMOgJJTjoCSVE6AklTOgJJVDoCSk06AkpPOgJKUDoCS0U6AktIOgJLUjoCS1c6AktZOgJLWjoCTEE6AkxCOgJMSToCTEs6AkxUOgJMVToCTFY6AkxZOgJNQToCTUs6Ak1QOgJNVDoCTVg6Ak1ZOgJORzoCTkk6Ak5MOgJOTzoCTlA6Ak5aOgJPTToCUEE6AlBFOgJQRjoCUEc6AlBIOgJQSzoCUEw6AlBSOgJQVDoCUFk6AlFBOgJSRToCUk86AlJTOgJSVToCU0E6AlNFOgJTRzoCU0k6AlNLOgJTTjoCU1Y6AlRDOgJUSDoCVE46AlRSOgJUVzoCVFo6AlVBOgJVRzoCVVM6AlVZOgJWRToCVkk6AlZOOgJZRToCWkE6AlpXQlIIARILQUFBQUJQOUFicHMaCXVubGltaXRlZCgFOAFYAmABeAaKARoKGGxwcjItYWNxLWMtdXMtY2F0Y2hhbGwtbbABCcIBAlVTyAEB8AEC+AEBUtAEeXRjZUFJaE5iZjVHMUQyWGVXTzc2Z2hkeFRJUG1ZMldxYUtvOGRqbzYzUzJsNmtXdjM2VW9YeklNdmhlYk1wcGN3TGZlRkZVTjNsSkxoQUVJYjlGY2VHYlZIX2hHWlZGc3BYSHRYOExGb0JmM3ZIVlQ5RUd5aGtheFYxSWFnRnhTMEhJMGl0ci0ta3AwUzZDaDA4cDJHNVNIc0JFWUdjcEM3RnB1QjNSWjFzZjR2M3ZwcTBvTlEyZXhsSGczRkd2LWJDZ19VdE1uM2ZCSE1MRUltWlhDaS0zbWVtYnpfMFJyYkc3c0hyLUtxamxqbmJPSUsxT2kzN3BkMlp5b3pJQ0NYUlNNbml5OG5VZnczV2U4azZrZmg2NXNEVVhaYnFUOXpIazF6b1RSWnk0SUlIRkpBN2VGdkp3UXdmQmlDRC1taG9UdWR4U0s2aW9MLUxrUEo3cEJkOGk2RnBuZ3gwMmxfcXA4dnBIbFREd19vb3VSZ1NDSjc0dDd5Nkk5d3JBeGh3VjctdF92VU9IMXRLN1NKZjlSbWUxX0lzM25mMkhsYWE3M0RNaEI2bFJjTW9GbFduWDZTZW1vNndCM0swOUs3QXJIT1c5cVduRHF3N0RocXFWbFpDMVQ1ZnB2Z1FaSVFkODVybG1HelcyUzBROFpXRFdtcklMM2RfZEMxWVpIdkpvenk1V0hzc1RkQnFSNFU0QXNYaDJhb1RMajhWTVR3YmRNWHNFZ3FyQWVhUXpqWHRSdnBRN2thTk9paEZ6U0tDRW14MDltd3M3REtQVyoM5a625bqt6K+V55SoOAFCGwh5ELnWByITCJDi8fLY45cDFY0nFQUdRZctOVgBaAJwAYoBEmlkLnlwYy5tc29mLmJ1dHRvbpoBGgoM5a625bqt6K+V55SoMgQIABAEMgQIBBAHQhwIZxDgWRgDIhMIkOLx8tjjlwMVjScVBR1Fly05WgpHVE0tTlFORlM5Gg9oZWFkZXJfc2VjdGlvbjIyYy95b3V0dWJlL2Vjb21tZXJjZS9wcm9tb190YXJnZXRpbmcvZnJvbnRlbmQvZmlsbGVycy9mbGV4aWJsZS9wcmVtaXVtL25vX29wX3ByZW1pdW1fc3RhdGVfZW50aXR5X2tleRr7Cfo+BAgFEAGSPwQKAggByj8ECgIIAfI/ByIFqP3WAQHCuIm+CvQDCvEDOAFAAVABWAFgBXABeAGAAQGQAQGYAQGgAQHIAQHgAQGIAgGQAgGYAgGgAgHQAgGYAwGgAwGwAwHQAwHYAwHoAwGQBAGYBAG4BAHABAHoBAGwBQHYBQHlBc3MTD/tBc3MTD/1BWZm5j+IBgGYBgGgBgGoBgG4BgHABgHgBgHoBgGVBwAAFkSgBwG4BwHABwHIBwHwBwGwCAHwCAGICQG4CQHgCQH4CQGACgGICgGoCgHgCgHoCgGYCwGgCwHICwHwCwGIDAGYDAG4DAHYDAGADQGIDQGQDQGgDQGoDQGwDQG4DQHIDQHwDQH4DQGADgGIDgGYDgGoDgGwDgHQDgHgDgHwDgH4DgGgDwGwDwG4DwHADwHQDwHgDwHoDwHwDwGAEAGQEAGYEAGgEAGoEAGwEAG4EAHIEAHQEAHYEAGAEQGgEQGoEQG4EQHIEQHYEQHwEQGIEgGQEgGwEgHAEgHIEgHQEgHYEgHoEgHwEgH4EgGAEwGIEwGYEwHAEwHYEwHgEwHoEwHwEwH4EwGAFAGIFAGQFAGgFAGoFAHAFAHVFAAAgEHYFAHgFAHoFAHwFAH4FAGAFQGYFQGgFQGoFQGwFQHQFQHYFQHgFQH4FQGAFgGQFgHQFgHYFgHAFwHwFwH4FwGQGAG4GAHQGAHYGAHgGAHKuIm+CicKJQgBEAE4AUABUAFYAWABeAGYAQGoAQGwAQG4AQHIAQHoAQH4AQGKwqPGDQsIgLDn3/XorLyFAbqk84MOGAoWdGhlbWV8YzU2NWU2NjZkZWRhMDE5MbK5nosOMAouCAFAAVABWAFgAXUAAIA/hQEzMzM/jQEAAAA/sAEB0AGnzpz5D6gCAbgCAegCAaKv4I0O6wMK6AOoAQGgAogn7QMAAAA/qAQBgAUBlQUAAAA/5QXNzEw+7QUAAAA//QUAACBBiAYBqAYBsAYBxQbNzMw+0AYF2AcBuAgB2AgBkAkBsgkHZGlzbWlzc8AJAdAJAYgKAdgKAaALAdgLAd0MAACAv+0MAACAv/UMAACAv6UOAACAv60OAACAv5gPAagQAdAQAeAQAegQAZARAZgRAeURAACAQPURAACAQIUSAACAQJUSAACAQKUSAACAQLASAeASAfgSAYgTAagTAc0TAACAQN0TAACAQOATAegTAYAUAZgUAaAUAbIUJEtFTl9CVVJOU19BTklNQVRJT05fVFlQRV9VTlNQRUNJRklFRLgUAdAUAdgUAegUAf0UAACAQJAVAagVAbAVAbgVAcAVAdAVAdgVAeAVAegVAYgWAZAWAaAWAbAWAbgWAcAWAdAWAogXAZgXAagXAfAXAYAZAYgZAZAZAaAZAbAZAbgZAcAZAcgZAdAZAeAZAegZAfgZAYAaAYgaAZgaAaAaAagaAbAaAbgaENgaAYgbAZAbAZgbAaAbAdAbAdgbAeAbAegbAYAcAbAcELgcAcAcAcgcAYgdAZAdAZgdAaAdAagdAeAdAfAdAZgeAeAeAfgeGLAfAbgfAfgfAcAgAeggAfggAdK/macOBgoEMAE4AcrDyKcOGBIWEAEgAaABAfABAdADAfADAYgEAdgEAbrilq8PCgoECAQQARICCAGSlPayDx1jYXBhYmlsaXRpZXN8NTY2MmQwZjk0NzQ1YzBhNyIAKhAiCg0AgLtDFQDAJkQoATAAMtYBupeEzwV3Cm8KYy95b3V0dWJlL2Vjb21tZXJjZS9wcm9tb190YXJnZXRpbmcvZnJvbnRlbmQvZmlsbGVycy9mbGV4aWJsZS9wcmVtaXVtL25vX29wX3ByZW1pdW1fc3RhdGVfZW50aXR5X2tleRgBGO6ov+ABGAcQmaWUxQGq8d/BCyQKHAoYChZ0aGVtZXxjNTY1ZTY2NmRlZGEwMTkxEAQQmaWUxQGy8d/BCykKIQodY2FwYWJpbGl0aWVzfDU2NjJkMGY5NDc0NWMwYTcQBhCZpZTFARJIwoaluwVCCitscF9zZWN0aW9uX2dyb3VwLmVtbC1qcy1mZXw0Zjc0MzMyNzI5MTgwZjU0MhMxNzkzNDMwNDA3MzcxNDg2NDIzIhwIBhC7LxgLIhMIkOLx8tjjlwMVjScVBR1Fly05Og9oZWFkZXJfc2VjdGlvbjJSAggAIhsIAhC62gUiEwiQ4vHy2OOXAxWNJxUFHUWXLTlqGXByZW1pdW1fcGFnZV9zZWN0aW9uX2xpc3Q6AHIeCAEQ8JMBGIIBIhMIkOLx8tjjlwMVjScVBR1Fly05";

  function b64dec(s){var bin=atob(s),a=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a;}
  function rv(b,i){var r=0,s=0,x;do{x=b[i++];r+=(x&0x7f)*Math.pow(2,s);s+=7;}while(x&0x80);return[r,i];}
  function wv(n){var o=[];while(true){var b=n&0x7f;n=Math.floor(n/128);if(n>0)o.push(b|0x80);else{o.push(b);break;}}return o;}
  function parse(b,st,en){var out=[],i=st;while(i<en){var kv=rv(b,i),k=kv[0];i=kv[1];var fn=Math.floor(k/8),wt=k&7;
    if(wt===0){var r=rv(b,i);out.push([fn,0,r[0]]);i=r[1];}
    else if(wt===2){var lr=rv(b,i),l=lr[0],vs=lr[1],ve=vs+l;out.push([fn,2,b.subarray(vs,ve)]);i=ve;}
    else if(wt===1){out.push([fn,1,b.subarray(i,i+8)]);i+=8;}
    else if(wt===5){out.push([fn,5,b.subarray(i,i+4)]);i+=4;}
    else throw "wt"+wt;}return out;}
  function ser(fs){var o=[];for(var k=0;k<fs.length;k++){var fn=fs[k][0],wt=fs[k][1],v=fs[k][2];var kb=wv(fn*8+wt);
    for(var a=0;a<kb.length;a++)o.push(kb[a]);
    if(wt===0){var vb=wv(v);for(var b=0;b<vb.length;b++)o.push(vb[b]);}
    else if(wt===2){var lb=wv(v.length);for(var c=0;c<lb.length;c++)o.push(lb[c]);for(var d=0;d<v.length;d++)o.push(v[d]);}
    else{for(var e=0;e<v.length;e++)o.push(v[e]);}}return new Uint8Array(o);}
  function ts(u8){var s="",CH=8192;for(var i=0;i<u8.length;i+=CH)s+=String.fromCharCode.apply(null,u8.subarray(i,Math.min(i+CH,u8.length)));return s;}
  function has(buf,nd){return ts(buf).indexOf(nd)>=0;}
  function eq(a,b){if(a.length!==b.length)return false;for(var i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;}

  // 从当前响应提取商品对应的购买命令(<2500B)
  function findCmd(buf,productKey){
    var fs; try{fs=parse(buf,0,buf.length);}catch(e){return null;}
    for(var i=0;i<fs.length;i++){
      var fn=fs[i][0],wt=fs[i][1],v=fs[i][2];
      if(wt===2 && fn===461054335 && v.length<3000){
        var inner; try{inner=parse(v,0,v.length);}catch(e){continue;}
        for(var j=0;j<inner.length;j++){
          if(inner[j][0]===4 && inner[j][1]===2 && inner[j][2].length<2500 && ts(inner[j][2]).indexOf(productKey)>=0) return inner[j][2];
        }
      }
      if(wt===2 && v.length>50){ var r=findCmd(v,productKey); if(r) return r; }
    }
    return null;
  }

  var body=$response.body;
  if(!body || typeof body.length!=="number"){ $done({}); return; }
  if(!has(body,"premium_page_section_list")){ $done({}); return; }   // 只处理premium页

  var TPL=b64dec(TPL_B64);

  // 若当前响应有真实购买命令，替换模板里冻结的命令(保证新鲜)
  var cmdP=findCmd(body,"com.google.youtube.red.subscription");
  var cmdF=findCmd(body,"com.google.youtube.family.red.subscription");
  function swapCmd(f9, productKey, newCmd){
    if(!newCmd) return f9;
    function rec(buf){
      var fs; try{fs=parse(buf,0,buf.length);}catch(e){return buf;}
      var out=[],ch=false;
      for(var i=0;i<fs.length;i++){
        var f=fs[i][0],w=fs[i][1],v=fs[i][2];
        if(w===2 && f===461054335 && v.length<3000){
          var inner; try{inner=parse(v,0,v.length);}catch(e){inner=null;}
          if(inner){
            var hit=false, io=[];
            for(var j=0;j<inner.length;j++){
              if(inner[j][0]===4 && inner[j][1]===2 && inner[j][2].length<2500 && ts(inner[j][2]).indexOf(productKey)>=0) hit=true;
            }
            if(hit){ io=[[4,2,newCmd]]; for(var j2=0;j2<inner.length;j2++){ if(inner[j2][0]!==4) io.push([inner[j2][0],inner[j2][1],inner[j2][2]]); } out.push([f,w,ser(io)]); ch=true; continue; }
          }
        }
        if(w===2 && v.length>50){ var d=rec(v); if(d!==v){ out.push([f,w,d]); ch=true; continue; } }
        out.push([f,w,v]);
      }
      return ch?ser(out):buf;
    }
    return rec(f9);
  }
  var tplF9 = TPL;
  if(cmdP) tplF9 = swapCmd(tplF9,"com.google.youtube.red.subscription",cmdP);
  if(cmdF) tplF9 = swapCmd(tplF9,"com.google.youtube.family.red.subscription",cmdF);

  // 从当前响应 field777 提取 hash 映射
  var top; try{top=parse(body,0,body.length);}catch(e){ $done({}); return; }
  var f777=null;
  for(var i=0;i<top.length;i++) if(top[i][0]===777 && top[i][1]===2) f777=top[i][2];
  if(!f777){ console.log("[uni] 无777注册表，放行"); $done({}); return; }
  // 从整个响应体提取hash（capabilities等可能在field9而非777）
  var reg=ts(body);
  function regHash(name){
    var m=reg.match(new RegExp(name.replace(/[.]/g,"\\.")+"\\|([0-9a-f]{12,20})"));
    return m?m[1]:null;
  }
  // 模板里各名字的旧hash（用于匹配替换）
  var tplStr=ts(TPL);
  var NAMES=["theme","capabilities","lp_section_group.eml-js-fe"];
  // 逐个精确替换：先找模板里 name|oldhash，换成 name|newhash（protobuf感知）
  var REPL={};
  for(var n=0;n<NAMES.length;n++){
    var nm=NAMES[n];
    var tm=tplStr.match(new RegExp(nm.replace(/[.]/g,"\\.")+"\\|([0-9a-f]{12,20})"));
    var rh=regHash(nm);
    if(tm && rh) REPL[nm+"|"+tm[1]] = nm+"|"+rh;
  }
  function recalc(buf){
    var fs; try{fs=parse(buf,0,buf.length);}catch(e){return buf;}
    var out=[],ch=false;
    for(var i=0;i<fs.length;i++){
      var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(w===2 && v.length<200){
        var s=ts(v);
        if(REPL[s]){ out.push([f,w,new Uint8Array(Array.from(REPL[s]).map(function(c){return c.charCodeAt(0)&0xff;}))]); ch=true; continue; }
      }
      if(w===2 && v.length>20){ var d=recalc(v); if(d!==v){ out.push([f,w,d]); ch=true; continue; } }
      out.push([f,w,v]);
    }
    return ch?ser(out):buf;
  }
  var finalF9 = recalc(tplF9);

  // 组装：保留当前响应的框架(1/13/16/30/777)，只换 field9
  var out=[],hit=false;
  for(var k=0;k<top.length;k++){
    if(top[k][0]===9 && top[k][1]===2 && !hit){ out.push([9,2,finalF9]); hit=true; }
    else out.push([top[k][0],top[k][1],top[k][2]]);
  }
  var final=ser(out);
  console.log("[uni] "+body.length+" -> "+final.length+"B 强制替换premium页 cmdP="+(cmdP?cmdP.length:0)+" cmdF="+(cmdF?cmdF.length:0));
  $done({body:final});
})();

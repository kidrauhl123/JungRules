(function(){
  var IS_QX=(typeof $task!=="undefined");
  var body;
  if(IS_QX){var bb=$response.bodyBytes;if(bb==null)bb=$response.body;body=(bb instanceof Uint8Array)?bb:new Uint8Array(bb);}
  else{body=$response.body;if(body&&!(body instanceof Uint8Array)&&typeof body!=="string")body=new Uint8Array(body);}
  if(!body||typeof body.length!=="number"){$done({});return;}

  var BAKED_P="sq3JhgWHCRIiCFoQnacBIhMIhIP6rNTulwMVsOhMAh3JHzalygEEwW/uA7Kw5+0C3AgKI2NvbS5nb29nbGUueW91dHViZS5yZWQuc3Vic2NyaXB0aW9uEgJVUypjmt6f8QNdCj4KFQoT5q2j5Zyo5r+A5rS75L2g55qEIAoRCg9Zb3VUdWJlIFByZW1pdW0KEgoQIOS8muWRmOi1hOagvO+8gUIbCFsQ2c8BIhMIhIP6rNTulwMVsOhMAh3JHzalOgJBRToCQVI6AkFTOgJBVDoCQVU6AkFXOgJBWjoCQkE6AkJEOgJCRToCQkc6AkJIOgJCTToCQk86AkJSOgJCWToCQ0E6AkNIOgJDTDoCQ086AkNSOgJDWToCQ1o6AkRFOgJESzoCRE86AkRaOgJFQzoCRUU6AkVHOgJFUzoCRkk6AkZSOgJHQjoCR0U6AkdGOgJHSDoCR1A6AkdSOgJHVDoCR1U6AkhLOgJITjoCSFI6AkhVOgJJRDoCSUU6AklMOgJJTjoCSVE6AklTOgJJVDoCSk06AkpPOgJKUDoCS0U6AktIOgJLUjoCS1c6AktZOgJLWjoCTEE6AkxCOgJMSToCTEs6AkxUOgJMVToCTFY6AkxZOgJNQToCTUs6Ak1QOgJNVDoCTVg6Ak1ZOgJORzoCTkk6Ak5MOgJOTzoCTlA6Ak5aOgJPTToCUEE6AlBFOgJQRjoCUEc6AlBIOgJQSzoCUEw6AlBSOgJQVDoCUFk6AlFBOgJSRToCUk86AlJTOgJSVToCU0E6AlNFOgJTRzoCU0k6AlNLOgJTTjoCU1Y6AlRDOgJUSDoCVE46AlRSOgJUVzoCVFo6AlVBOgJVRzoCVVM6AlVZOgJWRToCVkk6AlZOOgJZRToCWkE6AlpXQkMIARoJdW5saW1pdGVkKAVYAWABeAaKARoKGGxwcjItYWNxLWMtdXMtY2F0Y2hhbGwtbbABCcIBAlVTyAEB8AEC+AEBUqYDeXRjZUFJaE5iZjV1ejBLSFdKdFJGTF9aREZqMGtJMUU2LTNFNHZja093RV9MYTFBQnZPZGxrUWtDNVJCbkFRbmhhV2tnLXBOcDE1ZDJMbC1VSUFXMk1PUFJxMDBha3lGX3Q2WjhrMVhrM2VHaF9XRmttTTVkWVhwQzVvMV81SjVZNzkySU5wRDh0aGs4RUY3V01FWVpqZzZId3FYX1IzNTI0UjlHajdUWGg0WGJ1Rjhhem82ZWUtTndlR0YwY1Q1N2htMjhLX0JXWDl0eU9DZmhiRDYzSWlvRmQ4cFBpTDJFNXBTcEtGWHVQUndQTnRPV3ZpY2lLRC1HQ3dvLWJ6VmphNFZld0pVZHdpVHhxN25EdEE1UVI1UGdyc3dxYkppc3U3TVpPRkFsdlA5dmVMY25ZU2o2MEtvWGNIR1ZBT0V1RjctLUJuaDg5NldSWkdUdWZSQmwxWVNHWXRCa2dWME5HSXpjLTdaQmdlUzU2OHBrcmxuX2JQTkZaZGVwS2VxYUFLM3hnLVMzYnVQSlZrSnRxc243TE1SdkNWdDR4TmZGbXd2blE=", BAKED_F="sq3JhgW8CRIiCFcQnacBIhMIhIP6rNTulwMVsOhMAh3JHzalygEEwW/uA7Kw5+0CkQkKKmNvbS5nb29nbGUueW91dHViZS5mYW1pbHkucmVkLnN1YnNjcmlwdGlvbhICVVMqY5ren/EDXQo+ChUKE+ato+WcqOa/gOa0u+S9oOeahCAKEQoPWW91VHViZSBQcmVtaXVtChIKECDkvJrlkZjotYTmoLzvvIFCGwhYENnPASITCISD+qzU7pcDFbDoTAIdyR82pToCQUU6AkFSOgJBUzoCQVQ6AkFVOgJBVzoCQVo6AkJBOgJCRDoCQkU6AkJHOgJCSDoCQk06AkJPOgJCUjoCQlk6AkNBOgJDSDoCQ0w6AkNPOgJDUjoCQ1k6AkNaOgJERToCREs6AkRPOgJEWjoCRUM6AkVFOgJFRzoCRVM6AkZJOgJGUjoCR0I6AkdFOgJHRjoCR0g6AkdQOgJHUjoCR1Q6AkdVOgJISzoCSE46AkhSOgJIVToCSUQ6AklFOgJJTDoCSU46AklROgJJUzoCSVQ6AkpNOgJKTzoCSlA6AktFOgJLSDoCS1I6AktXOgJLWToCS1o6AkxBOgJMQjoCTEk6AkxLOgJMVDoCTFU6AkxWOgJMWToCTUE6Ak1LOgJNUDoCTVQ6Ak1YOgJNWToCTkc6Ak5JOgJOTDoCTk86Ak5QOgJOWjoCT006AlBBOgJQRToCUEY6AlBHOgJQSDoCUEs6AlBMOgJQUjoCUFQ6AlBZOgJRQToCUkU6AlJPOgJSUzoCUlU6AlNBOgJTRToCU0c6AlNJOgJTSzoCU046AlNWOgJUQzoCVEg6AlROOgJUUjoCVFc6AlRaOgJVQToCVUc6AlVTOgJVWToCVkU6AlZJOgJWTjoCWUU6AlpBOgJaV0JHCAEaCXVubGltaXRlZCgFOAFAAVgCYAF4BooBGgoYbHByMi1hY3EtYy11cy1jYXRjaGFsbC1tsAEJwgECVVPIAQHwAQL4AQFS0AN5dGNlQUloTmJmNkVVRW45YTdVbVRoOU9USUFnRmNXcW1QVDNqVkFmS2E2bXpLT1UwOHFFdGhhVDNlV0dxbG13ZFJNTm5DMURXSVdnYW5tWGt0X1FkeEVvRHpNMzhWdUMxc00xcExXMEJfbUI1M0hrU0JDZnVfdHhveGF5SHNRY2F1YmN3VWhnYmJmWmRnV09sQkpnVHpjV2VjYWNyOTl3b1lTLXNockVjbVhhNG5KVjVyZUI0Ymtyb3pqaUJpLTZSRGpjYzg3Y0dZVWpYUE5OWEt5QlI4Q0JHWm4yS3ZQcllORXNud0ZJS0pfWDNORHY4VWVxRFJVTHplM2VGZGNPbWZVWWVJYnEyZ3puVnptTGU5akpEZDg5UG5ZNVd3YXJrY3h4MTdGX21QSzk5MlFkQ0VaUWhqcEIxcmN6M2JpZUxFZWIyRTBnYjZTMEJ2cWs2RXpEVHVCLWRVaGhuTTdFVUZ2cWl5eTV1R1lzc05pVVlLeDVGOVRxSDA3dW55ckp5SGpJTkp6djQwdDZyX2s1RkJnZ085V0R1d0lZQU1kWjhmMmVzcTZrcHpPc0ZOS3lJLU9hQ2xjbTBHV2t0OWZqUnNnYzIyWU0zZ3R1SHFSUg==";

  function rv(b,i){var r=0,s=0,x;do{x=b[i++];r+=(x&0x7f)*Math.pow(2,s);s+=7;}while(x&0x80);return[r,i];}
  function wv(n){var o=[];while(true){var x=n&0x7f;n=Math.floor(n/128);if(n>0)o.push(x|0x80);else{o.push(x);break;}}return o;}
  function parse(b,st,en){if(en==null)en=b.length;var out=[],i=st;while(i<en){var kv=rv(b,i),k=kv[0];i=kv[1];var fn=Math.floor(k/8),wt=k&7;
    if(wt===0){var r=rv(b,i);out.push([fn,0,r[0]]);i=r[1];}
    else if(wt===2){var lr=rv(b,i),l=lr[0],vs=lr[1],ve=vs+l;out.push([fn,2,b.subarray(vs,ve)]);i=ve;}
    else if(wt===1){out.push([fn,1,b.subarray(i,i+8)]);i+=8;}
    else if(wt===5){out.push([fn,5,b.subarray(i,i+4)]);i+=4;}
    else throw "wt"+wt;}return out;}
  function ser(fs){var o=[];for(var k=0;k<fs.length;k++){var fn=fs[k][0],wt=fs[k][1],v=fs[k][2];var kb=wv(fn*8+wt);for(var a=0;a<kb.length;a++)o.push(kb[a]);
    if(wt===0){var vb=wv(v);for(var b=0;b<vb.length;b++)o.push(vb[b]);}
    else if(wt===2){var lb=wv(v.length);for(var c=0;c<lb.length;c++)o.push(lb[c]);for(var d=0;d<v.length;d++)o.push(v[d]);}
    else{for(var e=0;e<v.length;e++)o.push(v[e]);}}return new Uint8Array(o);}
  function ts(u8){var s="",CH=8192;for(var i=0;i<u8.length;i+=CH)s+=String.fromCharCode.apply(null,u8.subarray(i,Math.min(i+CH,u8.length)));return s;}
  function has(buf,nd){return ts(buf).indexOf(nd)>=0;}
  function enc(s){var a=[];for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);if(c<128)a.push(c);else if(c<2048){a.push(0xc0|(c>>6),0x80|(c&0x3f));}else{a.push(0xe0|(c>>12),0x80|((c>>6)&0x3f),0x80|(c&0x3f));}}return new Uint8Array(a);}
  function b64dec(s){var B="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var t={};for(var i=0;i<B.length;i++)t[B.charCodeAt(i)]=i;
    var o=[],buf=0,bits=0;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);if(c===61)break;var v=t[c];if(v===undefined)continue;buf=(buf<<6)|v;bits+=6;if(bits>=8){bits-=8;o.push((buf>>bits)&0xff);}}return new Uint8Array(o);}
  function findn(buf,fn,res){if(res==null)res=[];var fs;try{fs=parse(buf,0,buf.length);}catch(e){return res;}
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];if(f===fn&&w===2)res.push(v);if(w===2&&v.length>0)findn(v,fn,res);}return res;}
  function nav(buf,path){var cur=buf;for(var i=0;i<path.length;i++){var fs;try{fs=parse(cur,0,cur.length);}catch(e){return null;}var nx=null;for(var j=0;j<fs.length;j++)if(fs[j][0]===path[i]&&fs[j][1]===2){nx=fs[j][2];break;}if(nx==null)return null;cur=nx;}return cur;}

  if(!has(body,"premium_page_section_list")){$done({});return;}

  // ===== 转换命令为试用 =====
  function fixOffer(buf){var fs;try{fs=parse(buf,0,buf.length);}catch(e){return buf;}var out=[],ch=false;
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(f===1&&w===2&&v.length>4){var s=ts(v);if(s.length>=4&&s.substring(s.length-4)==="_NFT"){out.push([1,2,enc(s.substring(0,s.length-4))]);ch=true;continue;}}
      if(f===8&&w===2){var io=[],f8=parse(v,0,v.length);
        for(var j=0;j<f8.length;j++){var ff=f8[j][0],ww=f8[j][1],vv=f8[j][2];
          if(ff===31)io.push([31,0,1]);else if(ff===2){}else if(ff===17)io.push([17,2,ser([[1,2,enc("lpr2-acq-c-us-catchall-m")]])]);else io.push([ff,ww,vv]);}
        out.push([8,2,ser(io)]);ch=true;continue;}
      out.push([f,w,v]);}
    return ch?ser(out):buf;}
  function toTrialCmd(cmd){var fs;try{fs=parse(cmd,0,cmd.length);}catch(e){return cmd;}var out=[];
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(w===2&&f===169495254){var io=[],in2=parse(v,0,v.length);
        for(var j=0;j<in2.length;j++){var f2=in2[j][0],w2=in2[j][1],v2=in2[j][2];if(f2===95894278)io.push([f2,w2,fixOffer(v2)]);else io.push([f2,w2,v2]);}
        out.push([f,w,ser(io)]);}else out.push([f,w,v]);}
    return ser(out);}
  function findPurchaseCmd(buf,key){var fs;try{fs=parse(buf,0,buf.length);}catch(e){return null;}
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(w===2&&f===461054335&&v.length<3000){var s=ts(v);if(s.indexOf(key)>=0&&s.indexOf("premiumLite")<0){var inner=parse(v,0,v.length);for(var j=0;j<inner.length;j++)if(inner[j][0]===4&&inner[j][1]===2&&inner[j][2].length<2500)return inner[j][2];}}
      if(w===2&&v.length>50){var r=findPurchaseCmd(v,key);if(r)return r;}}
    return null;}

  // ===== Case A: 482325666 卡片转换 =====
  function fixButton(wrapper,label){var fs;try{fs=parse(wrapper,0,wrapper.length);}catch(e){return wrapper;}var out=[];
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(f===461054335&&w===2){var io=[],bd=parse(v,0,v.length);
        for(var j=0;j<bd.length;j++){var ff=bd[j][0],ww=bd[j][1],vv=bd[j][2];
          if(ff===4)io.push([4,2,toTrialCmd(vv)]);else if(ff===5)io.push([5,2,enc(label)]);
          else if(ff===19){var so=[],sf=parse(vv,0,vv.length);for(var m=0;m<sf.length;m++)so.push(sf[m][0]===1?[1,2,enc(label)]:[sf[m][0],sf[m][1],sf[m][2]]);io.push([19,2,ser(so)]);}
          else io.push([ff,ww,vv]);}
        out.push([f,w,ser(io)]);}else out.push([f,w,v]);}
    return ser(out);}
  function fixPrice(p,label){var fs;try{fs=parse(p,0,p.length);}catch(e){return p;}var out=[];
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(f===5&&w===2)out.push([5,2,fixButton(v,label)]);
      else if(f===2&&w===2&&v.length<40){var isP=false;try{var pf=parse(v,0,v.length);for(var q=0;q<pf.length;q++)if(pf[q][0]===1&&pf[q][1]===2){var ss=ts(pf[q][2]);if(ss.indexOf("US$")>=0||ss.indexOf("/月")>=0)isP=true;}}catch(e){}
        if(isP){var po=[],pv=parse(v,0,v.length);for(var r=0;r<pv.length;r++)po.push(pv[r][0]===1?[1,2,enc("US$0 试用 1 个月")]:[pv[r][0],pv[r][1],pv[r][2]]);out.push([2,2,ser(po)]);}else out.push([f,w,v]);}
      else out.push([f,w,v]);}
    return ser(out);}
  function fixCard(card,label){var fs;try{fs=parse(card,0,card.length);}catch(e){return card;}var out=[];
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(f===3&&w===2){var io=[],p=parse(v,0,v.length);for(var j=0;j<p.length;j++){var f2=p[j][0],w2=p[j][1],v2=p[j][2];if(f2===482327878)io.push([f2,w2,fixPrice(v2,label)]);else io.push([f2,w2,v2]);}out.push([f,w,ser(io)]);}
      else out.push([f,w,v]);}
    return ser(out);}
  function cardProduct(card){var btns=findn(card,461054335);for(var i=0;i<btns.length;i++){var cmd=null,fs=parse(btns[i],0,btns[i].length);for(var j=0;j<fs.length;j++)if(fs[j][0]===4&&fs[j][1]===2)cmd=fs[j][2];
    if(cmd){var s=ts(cmd);if(s.indexOf("premiumLite")>=0)return "lite";if(s.indexOf("family.red.subscription")>=0)return "family";if(s.indexOf("red.subscription")>=0)return "personal";}}return null;}
  function process470(buf){var fs;try{fs=parse(buf,0,buf.length);}catch(e){return buf;}var out=[];
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(f===1&&w===2){var itemfs;try{itemfs=parse(v,0,v.length);}catch(e){out.push([f,w,v]);continue;}var cg=null;for(var j=0;j<itemfs.length;j++)if(itemfs[j][0]===482325665)cg=itemfs[j][2];
        if(!cg){out.push([f,w,v]);continue;}var cgfs=parse(cg,0,cg.length),newcg=[];
        for(var j=0;j<cgfs.length;j++){var ff=cgfs[j][0],ww=cgfs[j][1],vv=cgfs[j][2];
          if(ff===2&&ww===2){var h666=false;try{var iv=parse(vv,0,vv.length);for(var z=0;z<iv.length;z++)if(iv[z][0]===482325666)h666=true;}catch(e){}
            if(h666){var card=null,iv2=parse(vv,0,vv.length);for(var z=0;z<iv2.length;z++)if(iv2[z][0]===482325666)card=iv2[z][2];var pr=cardProduct(card);
              if(pr==="personal")newcg.push([2,2,ser([[482325666,2,fixCard(card,"个人试用")]])]);else if(pr==="family")newcg.push([2,2,ser([[482325666,2,fixCard(card,"家庭试用")]])]);}
            else newcg.push([ff,ww,vv]);}else newcg.push([ff,ww,vv]);}
        if(newcg.length===0)continue;var rest=[];for(var j=0;j<itemfs.length;j++)if(itemfs[j][0]!==482325665)rest.push([itemfs[j][0],itemfs[j][1],itemfs[j][2]]);
        out.push([f,w,ser([[482325665,2,ser(newcg)]].concat(rest))]);}else out.push([f,w,v]);}
    return ser(out);}
  function recalcTarget(buf){var fs;try{fs=parse(buf,0,buf.length);}catch(e){return buf;}var out=[],ch=false;
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(f===470799470&&w===2){out.push([f,w,process470(v)]);ch=true;continue;}
      if(w===2&&v.length>50){var nv=recalcTarget(v);if(nv!==v){out.push([f,w,nv]);ch=true;continue;}}
      out.push([f,w,v]);}
    return ch?ser(out):buf;}

  var top;try{top=parse(body,0,body.length);}catch(e){$done({});return;}
  var f9=null;for(var i=0;i<top.length;i++)if(top[i][0]===9&&top[i][1]===2)f9=top[i][2];
  if(!f9){$done({});return;}
  var PATH=[58173949,1,58174010,4,49399797];
  var node=nav(f9,PATH);
  if(!node){console.log("[yt] 无section list");$done({});return;}
  var sections=[],nf=parse(node,0,node.length);
  for(var i=0;i<nf.length;i++)if(nf[i][0]===1&&nf[i][1]===2)sections.push(nf[i][2]);

  function replaceSec(newSec){
    function rep(buf,d){var fs;try{fs=parse(buf,0,buf.length);}catch(e){return buf;}
      if(d===PATH.length)return ser([[1,2,newSec]].concat(fs.filter(function(x){return !(x[0]===1&&x[1]===2);}).map(function(x){return [x[0],x[1],x[2]];})));
      var out=[];for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];if(f===PATH[d]&&w===2)out.push([f,w,rep(v,d+1)]);else out.push([f,w,v]);}return ser(out);}
    var nf9=rep(f9,0);var outb=[];
    for(var i=0;i<top.length;i++){if(top[i][0]===9&&top[i][1]===2)outb.push([9,2,nf9]);else outb.push([top[i][0],top[i][1],top[i][2]]);}
    return ser(outb);
  }

  // ---- 尝试 Case A ----
  var target=null;
  for(var si=0;si<sections.length;si++){var f470s=findn(sections[si],470799470);
    for(var q=0;q<f470s.length;q++){var cards=findn(f470s[q],482325666);var prods={};for(var c=0;c<cards.length;c++)prods[cardProduct(cards[c])]=1;
      if(prods["personal"]||prods["family"]){target=sections[si];break;}}if(target)break;}

  if(target){
    var newTarget=recalcTarget(target);
    var final=replaceSec(newTarget);
    console.log("[yt] CaseA 卡片转换 "+body.length+" -> "+final.length+"B");
    if(IS_QX){$done({bodyBytes:final.buffer});}else{$done({body:final});}
    return;
  }

  // ---- Case C: 强制接管 ----
  var blocks=findn(body,471037237);
  if(!blocks.length){console.log("[yt] 无471037237块，无法接管，放行");$done({});return;}
  var tplBlock=blocks[0];
  // 命令来源: 页面真实命令优先, 否则内置
  var pageP=findPurchaseCmd(body,"red.subscription");
  var pageF=findPurchaseCmd(body,"family.red.subscription");
  var cmdP=pageP?toTrialCmd(pageP):b64dec(BAKED_P);
  var cmdF=pageF?toTrialCmd(pageF):b64dec(BAKED_F);
  console.log("[yt] 接管: 页面命令 P="+(pageP?"有":"无")+" F="+(pageF?"有":"无"));

  function buildBlock(tpl,title,label,cmd){var fs;try{fs=parse(tpl,0,tpl.length);}catch(e){return tpl;}var out=[];
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(f===2&&w===2){var io=[],pf=parse(v,0,v.length);for(var j=0;j<pf.length;j++)io.push(pf[j][0]===1?[1,2,enc(title)]:[pf[j][0],pf[j][1],pf[j][2]]);out.push([2,2,ser(io)]);continue;}
      if(f===4&&w===2){var io2=[],wf=parse(v,0,v.length);
        for(var j=0;j<wf.length;j++){var f2=wf[j][0],w2=wf[j][1],v2=wf[j][2];
          if(f2===461054335){var bio=[],bf=parse(v2,0,v2.length);
            for(var k=0;k<bf.length;k++){var ff=bf[k][0],ww=bf[k][1],vv=bf[k][2];
              if(ff===4)bio.push([4,2,cmd]);else if(ff===5)bio.push([5,2,enc(label)]);
              else if(ff===19){var so=[],sf=parse(vv,0,vv.length);for(var m=0;m<sf.length;m++)so.push(sf[m][0]===1?[1,2,enc(label)]:[sf[m][0],sf[m][1],sf[m][2]]);bio.push([19,2,ser(so)]);}
              else bio.push([ff,ww,vv]);}
            io2.push([f2,w2,ser(bio)]);}else io2.push([f2,w2,v2]);}
        out.push([4,2,ser(io2)]);continue;}
      out.push([f,w,v]);}
    return ser(out);}

  var bp=buildBlock(tplBlock,"个人方案","个人试用",cmdP);
  var bf=buildBlock(tplBlock,"家庭方案","家庭试用",cmdF);

  // 找到含 470799470 的 section, 用它的结构
  var host=null;
  for(var si=0;si<sections.length;si++){if(findn(sections[si],470799470).length){host=sections[si];break;}}
  if(!host){console.log("[yt] 无470799470宿主,放行");$done({});return;}
  var hostF470=findn(host,470799470)[0];
  var others=parse(hostF470,0,hostF470.length).filter(function(x){return x[0]!==1;}).map(function(x){return [x[0],x[1],x[2]];});
  var new470=ser([[1,2,ser([[471037237,2,bp]])],[1,2,ser([[471037237,2,bf]])]].concat(others));
  // 用 setpath 替换 host 内的 470799470
  var HOSTPATH=[50195462,1,153515154,172660663,1,168777401,5,413471385,1,470799470];
  function setpath(buf,path,nv,i){var fs;try{fs=parse(buf,0,buf.length);}catch(e){return buf;}var out=[];
    for(var j=0;j<fs.length;j++){var f=fs[j][0],w=fs[j][1],v=fs[j][2];if(f===path[i]&&w===2)out.push([f,w,i===path.length-1?nv:setpath(v,path,nv,i+1)]);else out.push([f,w,v]);}return ser(out);}
  var newHost=setpath(host,HOSTPATH,new470,0);
  var final2=replaceSec(newHost);
  console.log("[yt] CaseC 强制接管 "+body.length+" -> "+final2.length+"B");
  if(IS_QX){$done({bodyBytes:final2.buffer});}else{$done({body:final2});}
})();

(function(){
  // ===== 平台自适应 =====
  var IS_QX = (typeof $task !== "undefined");
  var body;
  if(IS_QX){
    var bb=$response.bodyBytes; if(bb==null) bb=$response.body;
    body=(bb instanceof Uint8Array)?bb:new Uint8Array(bb);
  } else {
    body=$response.body;
    if(body && !(body instanceof Uint8Array) && typeof body!=="string"){ body=new Uint8Array(body); }
  }
  if(!body || typeof body.length!=="number"){ $done({}); return; }

  // ===== protobuf 基础 =====
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
  function findn(buf,fn,res){if(res==null)res=[];var fs;try{fs=parse(buf,0,buf.length);}catch(e){return res;}
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];if(f===fn&&w===2)res.push(v);if(w===2&&v.length>0)findn(v,fn,res);}return res;}
  function nav(buf,path){var cur=buf;for(var i=0;i<path.length;i++){var fs;try{fs=parse(cur,0,cur.length);}catch(e){return null;}
    var nxt=null;for(var j=0;j<fs.length;j++){if(fs[j][0]===path[i]&&fs[j][1]===2){nxt=fs[j][2];break;}}if(nxt==null)return null;cur=nxt;}return cur;}
  function enc(s){var a=[];for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);if(c<128)a.push(c);else if(c<2048){a.push(0xc0|(c>>6),0x80|(c&0x3f));}else{a.push(0xe0|(c>>12),0x80|((c>>6)&0x3f),0x80|(c&0x3f));}}return new Uint8Array(a);}

  if(!has(body,"premium_page_section_list")){ $done({}); return; }

  // ===== 转换函数 =====
  function fixOffer(buf){
    var fs;try{fs=parse(buf,0,buf.length);}catch(e){return buf;}
    var out=[],ch=false;
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(f===1&&w===2&&v.length>4){var s=ts(v);
        if(s.length>=4 && s.substring(s.length-4)==="_NFT"){out.push([1,2,enc(s.substring(0,s.length-4))]);ch=true;continue;}}
      if(f===8&&w===2){
        var io=[],f8=parse(v,0,v.length);
        for(var j=0;j<f8.length;j++){var ff=f8[j][0],ww=f8[j][1],vv=f8[j][2];
          if(ff===31) io.push([31,0,1]);
          else if(ff===2) { /* 删商品码 */ }
          else if(ff===17) io.push([17,2,ser([[1,2,enc("lpr2-acq-c-us-catchall-m")]])]);
          else io.push([ff,ww,vv]);
        }
        out.push([8,2,ser(io)]);ch=true;continue;
      }
      out.push([f,w,v]);
    }
    return ch?ser(out):buf;
  }
  function toTrialCmd(cmd){
    var fs;try{fs=parse(cmd,0,cmd.length);}catch(e){return cmd;}
    var out=[];
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(w===2&&f===169495254){
        var io=[],inner=parse(v,0,v.length);
        for(var j=0;j<inner.length;j++){var f2=inner[j][0],w2=inner[j][1],v2=inner[j][2];
          if(f2===95894278) io.push([f2,w2,fixOffer(v2)]);
          else io.push([f2,w2,v2]);}
        out.push([f,w,ser(io)]);
      } else out.push([f,w,v]);
    }
    return ser(out);
  }
  function fixButton(wrapper,label){
    var fs;try{fs=parse(wrapper,0,wrapper.length);}catch(e){return wrapper;}
    var out=[];
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(f===461054335&&w===2){
        var io=[],bd=parse(v,0,v.length);
        for(var j=0;j<bd.length;j++){var ff=bd[j][0],ww=bd[j][1],vv=bd[j][2];
          if(ff===4) io.push([4,2,toTrialCmd(vv)]);
          else if(ff===5) io.push([5,2,enc(label)]);
          else if(ff===19){var so=[],sf=parse(vv,0,vv.length);for(var m=0;m<sf.length;m++){so.push(sf[m][0]===1?[1,2,enc(label)]:[sf[m][0],sf[m][1],sf[m][2]]);}io.push([19,2,ser(so)]);}
          else io.push([ff,ww,vv]);
        }
        out.push([f,w,ser(io)]);
      } else out.push([f,w,v]);
    }
    return ser(out);
  }
  function fixPrice(p,label){
    var fs;try{fs=parse(p,0,p.length);}catch(e){return p;}
    var out=[];
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(f===5&&w===2) out.push([5,2,fixButton(v,label)]);
      else if(f===2&&w===2&&v.length<40){ // 价格文案 -> 试用文案
        var isPrice=false; try{var pf=parse(v,0,v.length);for(var q=0;q<pf.length;q++){if(pf[q][0]===1&&pf[q][1]===2){var ss=ts(pf[q][2]);if(ss.indexOf("US$")>=0||ss.indexOf("/月")>=0)isPrice=true;}}}catch(e){}
        if(isPrice){var po=[],pv=parse(v,0,v.length);for(var r=0;r<pv.length;r++){po.push(pv[r][0]===1?[1,2,enc("US$0 试用 1 个月")]:[pv[r][0],pv[r][1],pv[r][2]]);}out.push([2,2,ser(po)]);}
        else out.push([f,w,v]);
      }
      else out.push([f,w,v]);
    }
    return ser(out);
  }
  function fixCard(card,label){
    var fs;try{fs=parse(card,0,card.length);}catch(e){return card;}
    var out=[];
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(f===3&&w===2){
        var io=[],p=parse(v,0,v.length);
        for(var j=0;j<p.length;j++){var f2=p[j][0],w2=p[j][1],v2=p[j][2];
          if(f2===482327878) io.push([f2,w2,fixPrice(v2,label)]);
          else io.push([f2,w2,v2]);}
        out.push([f,w,ser(io)]);
      } else out.push([f,w,v]);
    }
    return ser(out);
  }
  function cardProduct(card){
    var btns=findn(card,461054335);
    for(var i=0;i<btns.length;i++){
      var cmd=null,fs=parse(btns[i],0,btns[i].length);
      for(var j=0;j<fs.length;j++) if(fs[j][0]===4&&fs[j][1]===2) cmd=fs[j][2];
      if(cmd){var s=ts(cmd); if(s.indexOf("premiumLite")>=0)return "lite"; if(s.indexOf("family.red.subscription")>=0)return "family"; if(s.indexOf("red.subscription")>=0)return "personal";}
    }
    return null;
  }

  // ===== 定位 section =====
  var top;try{top=parse(body,0,body.length);}catch(e){$done({});return;}
  var f9=null;for(var i=0;i<top.length;i++) if(top[i][0]===9&&top[i][1]===2) f9=top[i][2];
  if(!f9){$done({});return;}
  var node=nav(f9,[58173949,1,58174010,4,49399797]);
  if(!node){ console.log("[yt] 无section list"); $done({}); return; }
  var sections=[];var nf=parse(node,0,node.length);
  for(var i=0;i<nf.length;i++) if(nf[i][0]===1&&nf[i][1]===2) sections.push(nf[i][2]);

  var target=null;
  for(var si=0;si<sections.length;si++){
    var f470s=findn(sections[si],470799470);
    for(var q=0;q<f470s.length;q++){
      var cards=findn(f470s[q],482325666);
      var prods={}; for(var c=0;c<cards.length;c++){prods[cardProduct(cards[c])]=1;}
      if(prods["personal"]&&prods["family"]){ target=sections[si]; break; }
    }
    if(target)break;
  }
  if(!target){ console.log("[yt] 未找到含个人+家庭的方案区，放行"); $done({}); return; }

  function process470(buf){
    var fs;try{fs=parse(buf,0,buf.length);}catch(e){return buf;}
    var out=[];
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(f===1&&w===2){
        var itemfs;try{itemfs=parse(v,0,v.length);}catch(e){out.push([f,w,v]);continue;}
        var cg=null;for(var j=0;j<itemfs.length;j++) if(itemfs[j][0]===482325665) cg=itemfs[j][2];
        if(!cg){out.push([f,w,v]);continue;}
        var cgfs=parse(cg,0,cg.length),newcg=[];
        for(var j=0;j<cgfs.length;j++){var ff=cgfs[j][0],ww=cgfs[j][1],vv=cgfs[j][2];
          if(ff===2&&ww===2){
            var has666=false;try{var iv=parse(vv,0,vv.length);for(var z=0;z<iv.length;z++)if(iv[z][0]===482325666)has666=true;}catch(e){}
            if(has666){
              var card=null;var iv2=parse(vv,0,vv.length);for(var z=0;z<iv2.length;z++)if(iv2[z][0]===482325666)card=iv2[z][2];
              var prod=cardProduct(card);
              if(prod==="personal") newcg.push([2,2,ser([[482325666,2,fixCard(card,"个人试用")]])]);
              else if(prod==="family") newcg.push([2,2,ser([[482325666,2,fixCard(card,"家庭试用")]])]);
              // lite 丢弃
            } else newcg.push([ff,ww,vv]);
          } else newcg.push([ff,ww,vv]);
        }
        if(newcg.length===0) continue; // 整个item只剩lite
        var rest=[];for(var j=0;j<itemfs.length;j++) if(itemfs[j][0]!==482325665) rest.push([itemfs[j][0],itemfs[j][1],itemfs[j][2]]);
        out.push([f,w,ser([[482325665,2,ser(newcg)]].concat(rest))]);
      } else out.push([f,w,v]);
    }
    return ser(out);
  }
  function recalcTarget(buf){
    var fs;try{fs=parse(buf,0,buf.length);}catch(e){return buf;}
    var out=[],ch=false;
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(f===470799470&&w===2){out.push([f,w,process470(v)]);ch=true;continue;}
      if(w===2&&v.length>50){var nv=recalcTarget(v);if(nv!==v){out.push([f,w,nv]);ch=true;continue;}}
      out.push([f,w,v]);
    }
    return ch?ser(out):buf;
  }
  var newTarget=recalcTarget(target);
  // 关键：保留 field9 的完整包装链 58173949/1/58174010/4/49399797，只替换 49399797 的 section 列表
  var PATH=[58173949,1,58174010,4,49399797];
  function replaceSections(buf,depth){
    var fs;try{fs=parse(buf,0,buf.length);}catch(e){return buf;}
    if(depth===PATH.length){
      // 到达 49399797：field1 列表换成 [newTarget]，保留 f4/f13 等其它字段
      var out=[[1,2,newTarget]];
      for(var i=0;i<fs.length;i++){ if(!(fs[i][0]===1&&fs[i][1]===2)) out.push([fs[i][0],fs[i][1],fs[i][2]]); }
      return ser(out);
    }
    var out=[];
    for(var i=0;i<fs.length;i++){var f=fs[i][0],w=fs[i][1],v=fs[i][2];
      if(f===PATH[depth]&&w===2){ out.push([f,w,replaceSections(v,depth+1)]); }
      else out.push([f,w,v]);
    }
    return ser(out);
  }
  var newF9=replaceSections(f9,0);
  var outb=[];
  for(var i=0;i<top.length;i++){
    if(top[i][0]===9&&top[i][1]===2) outb.push([9,2,newF9]);
    else outb.push([top[i][0],top[i][1],top[i][2]]);
  }
  var final=ser(outb);
  console.log("[yt] "+body.length+" -> "+final.length+"B 试用化完成");
  if(IS_QX){ $done({bodyBytes: final.buffer}); }
  else { $done({body: final}); }
})();

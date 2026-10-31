(function(){
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
    else{for(var e=0;e<v.length;e++)o.push(v[e]);}}return o;}
  function ts(u8){var s="",CH=8192;for(var i=0;i<u8.length;i+=CH)s+=String.fromCharCode.apply(null,u8.subarray(i,Math.min(i+CH,u8.length)));return s;}
  function tb(str){
    // 正确 UTF-8 编码（中文 3 字节）
    var out=[];
    for(var i=0;i<str.length;i++){
      var c=str.charCodeAt(i);
      if(c<0x80) out.push(c);
      else if(c<0x800){ out.push(0xc0|(c>>6), 0x80|(c&0x3f)); }
      else { out.push(0xe0|(c>>12), 0x80|((c>>6)&0x3f), 0x80|(c&0x3f)); }
    }
    return new Uint8Array(out);
  }
  function has(buf,needle){return ts(buf).indexOf(needle)>=0;}

  var LBL={ "family.red.subscription":"家庭试用", "premiumLite":"Lite 试用", "red.subscription":"个人试用" };
  function labelFor(s){
    if(s.indexOf("family.red.subscription")>=0) return LBL["family.red.subscription"];
    if(s.indexOf("premiumLite")>=0) return LBL["premiumLite"];
    if(s.indexOf("red.subscription")>=0) return LBL["red.subscription"];
    return null;
  }

  // 改按钮文字
  function relabel(btn,label){
    if(!label) return btn;
    var fs; try{fs=parse(btn,0,btn.length);}catch(e){return btn;}
    var out=[];
    for(var i=0;i<fs.length;i++){
      var fn=fs[i][0],wt=fs[i][1],v=fs[i][2];
      if(fn===461054335 && wt===2){
        var inner; try{inner=parse(v,0,v.length);}catch(e){out.push([fn,wt,v]);continue;}
        var io=[];
        for(var j=0;j<inner.length;j++){
          var f2=inner[j][0],w2=inner[j][1],v2=inner[j][2];
          if(f2===5 && w2===2) io.push([5,2,tb(label)]);
          else if(f2===11 && w2===0) io.push([11,0,1]);   // 统一为深蓝主按钮样式
          else if(f2===19 && w2===2){
            var sf; try{sf=parse(v2,0,v2.length);}catch(e){io.push([f2,w2,v2]);continue;}
            var so=[];
            for(var k=0;k<sf.length;k++){ if(sf[k][0]===1) so.push([1,2,tb(label)]); else so.push([sf[k][0],sf[k][1],sf[k][2]]); }
            io.push([19,2,new Uint8Array(ser(so))]);
          } else io.push([f2,w2,v2]);
        }
        out.push([fn,wt,new Uint8Array(ser(io))]);
      } else out.push([fn,wt,v]);
    }
    return new Uint8Array(ser(out));
  }

  // 削卡：留 f1(名称) + f3 里的按钮(f5)和商品号(f6)
  function stripCard(fs,label){
    var out=[];
    for(var i=0;i<fs.length;i++){
      var fn=fs[i][0],wt=fs[i][1],v=fs[i][2];
      if(fn===3 && wt===2){
        var pf; try{pf=parse(v,0,v.length);}catch(e){continue;}
        var po=[];
        for(var k=0;k<pf.length;k++){
          if(pf[k][0]===482327878 && pf[k][1]===2){
            var df; try{df=parse(pf[k][2],0,pf[k][2].length);}catch(e){continue;}
            var dout=[];
            for(var m=0;m<df.length;m++){
              var f4=df[m][0];
              if(f4===5) dout.push([5,2,relabel(df[m][2],label)]);
              else if(f4===6) dout.push([6,2,df[m][2]]);
            }
            po.push([482327878,2,new Uint8Array(ser(dout))]);
          }
        }
        out.push([3,2,new Uint8Array(ser(po))]);
      }
    }
    return new Uint8Array(ser(out));
  }


  // 只在字段号为 482325666（卡片内容）时削卡，避免误伤祖先节点
  function walk(buf,parentField){
    var fs; try{fs=parse(buf,0,buf.length);}catch(e){return null;}
    var out=[],changed=false;
    for(var i=0;i<fs.length;i++){
      var fn=fs[i][0],wt=fs[i][1],v=fs[i][2];
      // 卡片组 482325665：丢掉 f1 标题("加入超过125百万名...")
      if(wt===2 && fn===482325665){
        var gf; try{gf=parse(v,0,v.length);}catch(e){gf=null;}
        if(gf){
          var go=[],gch=false;
          for(var q=0;q<gf.length;q++){
            if(gf[q][0]===1){ gch=true; continue; }
            var qv=gf[q][2];
            if(gf[q][0]===2 && gf[q][1]===2 && qv.length>100){
              // 跳过 Lite 卡（不需要）
              var qs=ts(qv);
              if(qs.indexOf("premiumLite")>=0 || qs.indexOf("87H1Y")>=0){ gch=true; continue; }
              var sub2=walk(qv,2);
              if(sub2){ go.push([2,2,sub2]); gch=true; continue; }
            }
            go.push([gf[q][0],gf[q][1],qv]);
          }
          if(gch){ out.push([fn,2,new Uint8Array(ser(go))]); changed=true; continue; }
        }
      }
      if(wt===2 && fn===482325666 && v.length>300 && v.length<6000){
        var sub; try{sub=parse(v,0,v.length);}catch(e){sub=null;}
        if(sub){
          var lab=labelFor(ts(v));
          var st=stripCard(sub,lab);
          out.push([fn,2,st]); changed=true; continue;
        }
      }
      if(wt===2 && v.length>100){
        var deeper=walk(v,fn);
        if(deeper){ out.push([fn,2,deeper]); changed=true; continue; }
      }
      out.push([fn,wt,v]);
    }
    return changed ? new Uint8Array(ser(out)) : null;
  }


  // 判定：含 482325666 节点且其直接子字段恰为 {1,3}
  function hasStrippedCard(buf){
    var fs; try{fs=parse(buf,0,buf.length);}catch(e){return false;}
    for(var i=0;i<fs.length;i++){
      var fn=fs[i][0],wt=fs[i][1],v=fs[i][2];
      if(wt===2 && fn===482325666 && v.length>200){
        var sf; try{sf=parse(v,0,v.length);}catch(e){continue;}
        var sig={}; for(var j=0;j<sf.length;j++) sig[sf[j][0]]=1;
        // 已削卡特征：只有 f3(按钮)，无 f2(图标)，无 f5
        if(sig[3] && !sig[2] && !sig[5]) return true;
      }
      if(wt===2 && v.length>100 && hasStrippedCard(v)) return true;
    }
    return false;
  }

  // 只保留含按钮的那个 section，其余营销区块全删
  function slimSectionList(buf){
    var fs; try{fs=parse(buf,0,buf.length);}catch(e){return null;}
    var contents=[],others=[];
    for(var i=0;i<fs.length;i++){
      if(fs[i][0]===1 && fs[i][1]===2) contents.push(fs[i][2]);
      else others.push([fs[i][0],fs[i][1],fs[i][2]]);
    }
    var keep=[];
    for(var j=0;j<contents.length;j++){
      // 只保留含"已削卡"(482325666 子字段恰为 1,3)的 section
      if(hasStrippedCard(contents[j])) keep.push(contents[j]);
    }
    if(!keep.length) return null;
    var out=[];
    for(var k=0;k<keep.length;k++) out.push([1,2,keep[k]]);
    for(var m=0;m<others.length;m++) out.push(others[m]);
    return new Uint8Array(ser(out));
  }

  var SL=[58173949,1,58174010,4,49399797];
  function descend(buf,d){
    var fs; try{fs=parse(buf,0,buf.length);}catch(e){return null;}
    if(d>=SL.length){ return slimSectionList(buf); }
    var target=SL[d], out=[], done=false;
    for(var i=0;i<fs.length;i++){
      var fn=fs[i][0],wt=fs[i][1],v=fs[i][2];
      if(fn===target && wt===2 && !done){
        var sub=descend(v,d+1);
        if(sub){ out.push([fn,2,sub]); done=true; continue; }
      }
      out.push([fn,wt,v]);
    }
    return done ? new Uint8Array(ser(out)) : null;
  }

  var body=$response.body;
  if(!body || typeof body.length!=="number"){ $done({}); return; }
  if(!has(body,"premium_page_section_list")){ $done({}); return; }

  // 先削卡片
  var r1=walk(body,0);
  var stage1 = r1 ? r1 : body;

  // 再只留按钮 section
  var top; try{top=parse(stage1,0,stage1.length);}catch(e){ $done({}); return; }
  var f9=null;
  for(var i=0;i<top.length;i++) if(top[i][0]===9 && top[i][1]===2) f9=top[i][2];
  if(!f9){ $done({}); return; }
  var newF9=descend(f9,0);
  if(!newF9){ console.log("[mini] sectionList not found -> pass"); $done({}); return; }

  var out=[],hit=false;
  for(var k=0;k<top.length;k++){
    if(top[k][0]===9 && top[k][1]===2 && !hit){ out.push([9,2,newF9]); hit=true; }
    else out.push([top[k][0],top[k][1],top[k][2]]);
  }
  var final=new Uint8Array(ser(out));
  console.log("[mini] " + body.length + " -> " + final.length + "B");
  $done({body:final});
})();

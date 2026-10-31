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
    else{for(var e=0;e<v.length;e++)o.push(v[e]);}}return new Uint8Array(o);}
  function ts(u8){var s="",CH=8192;for(var i=0;i<u8.length;i+=CH)s+=String.fromCharCode.apply(null,u8.subarray(i,Math.min(i+CH,u8.length)));return s;}
  function tb(str){var o=[];for(var i=0;i<str.length;i++){var c=str.charCodeAt(i);if(c<0x80)o.push(c);else if(c<0x800){o.push(0xc0|(c>>6),0x80|(c&0x3f));}else{o.push(0xe0|(c>>12),0x80|((c>>6)&0x3f),0x80|(c&0x3f));}}return new Uint8Array(o);}
  function has(buf,nd){return ts(buf).indexOf(nd)>=0;}
  function hasField(buf,num){try{return parse(buf,0,buf.length).some(function(x){return x[0]===num;});}catch(e){return false;}}

  // 提取商品对应的购买命令（按钮自身 f4，<2500B）
  function findCmd(buf, productKey){
    var fs; try{fs=parse(buf,0,buf.length);}catch(e){return null;}
    for(var i=0;i<fs.length;i++){
      var fn=fs[i][0],wt=fs[i][1],v=fs[i][2];
      if(wt===2 && fn===461054335 && v.length<3000){
        var inner; try{inner=parse(v,0,v.length);}catch(e){continue;}
        for(var j=0;j<inner.length;j++){
          if(inner[j][0]===4 && inner[j][1]===2 && inner[j][2].length<2500){
            if(ts(inner[j][2]).indexOf(productKey)>=0) return inner[j][2];
          }
        }
      }
      if(wt===2 && v.length>50){ var r=findCmd(v,productKey); if(r) return r; }
    }
    return null;
  }

  // 找第一个 471037237 裸按钮块模板
  function findBlock(buf){
    var fs; try{fs=parse(buf,0,buf.length);}catch(e){return null;}
    for(var i=0;i<fs.length;i++){
      var fn=fs[i][0],wt=fs[i][1],v=fs[i][2];
      if(wt===2 && fn===471037237) return v;
      if(wt===2 && v.length>50){ var r=findBlock(v); if(r) return r; }
    }
    return null;
  }

  // 用模板块 + 命令 + 文字，构造新块（只留 f4按钮, f8追踪, f9, f11）
  function buildBlock(tpl, cmd, label){
    var tfs=parse(tpl,0,tpl.length);
    // 取模板里的按钮数据(461054335 内容)
    var btnData=null;
    for(var i=0;i<tfs.length;i++){
      if(tfs[i][0]===4 && tfs[i][1]===2){
        var w1; try{w1=parse(tfs[i][2],0,tfs[i][2].length);}catch(e){continue;}
        for(var j=0;j<w1.length;j++) if(w1[j][0]===461054335) btnData=w1[j][2];
      }
    }
    if(!btnData) return null;
    // 改按钮：f4=cmd, f5/f19=label
    var bd=parse(btnData,0,btnData.length), nb=[];
    for(var k=0;k<bd.length;k++){
      var f=bd[k][0],w=bd[k][1],v=bd[k][2];
      if(f===4) nb.push([4,2,cmd]);
      else if(f===13) nb.push([13,0,2]);
      else if(f===5) nb.push([5,2,tb(label)]);
      else if(f===19){
        var so=[]; var sf=parse(v,0,v.length);
        for(var m=0;m<sf.length;m++) so.push(sf[m][0]===1?[1,2,tb(label)]:[sf[m][0],sf[m][1],sf[m][2]]);
        nb.push([19,2,ser(so)]);
      } else nb.push([f,w,v]);
    }
    var newBtnData=ser(nb);
    // 重组块：f4包裹按钮, 保留 f8/f9/f11
    var out=[];
    for(var q=0;q<tfs.length;q++){
      var f2=tfs[q][0];
      if(f2===4) out.push([4,2,ser([[461054335,2,newBtnData]])]);
      else if(f2===8||f2===9||f2===11) out.push([tfs[q][0],tfs[q][1],tfs[q][2]]);
    }
    return ser(out);
  }

  var body=$response.body;
  if(!body || typeof body.length!=="number"){ $done({}); return; }
  if(!has(body,"premium_page_section_list")){ $done({}); return; }

  var cmdP=findCmd(body,"com.google.youtube.red.subscription");
  var cmdF=findCmd(body,"com.google.youtube.family.red.subscription");
  var tpl=findBlock(body);
  if(!cmdP || !cmdF || !tpl){ console.log("[hdr] 缺命令或模板，放行"); $done({}); return; }

  var blkP=buildBlock(tpl,cmdP,"个人试用");
  var blkF=buildBlock(tpl,cmdF,"家庭试用");
  if(!blkP||!blkF){ console.log("[hdr] 构造失败，放行"); $done({}); return; }

  // 把含 471037237 的内容列表(470799470)替换为两个块
  function transform(buf){
    var fs; try{fs=parse(buf,0,buf.length);}catch(e){return null;}
    var out=[],changed=false;
    for(var i=0;i<fs.length;i++){
      var fn=fs[i][0],wt=fs[i][1],v=fs[i][2];
      if(fn===470799470 && wt===2){
        var sub; try{sub=parse(v,0,v.length);}catch(e){sub=null;}
        if(sub && sub.some(function(x){return x[0]===1&&x[1]===2&&hasField(x[2],471037237);})){
          var others=sub.filter(function(x){return x[0]!==1;}).map(function(x){return [x[0],x[1],x[2]];});
          var inner=[[1,2,ser([[471037237,2,blkP]])],[1,2,ser([[471037237,2,blkF]])]].concat(others);
          out.push([470799470,2,ser(inner)]); changed=true; continue;
        }
      }
      if(wt===2 && v.length>80){
        var d=transform(v);
        if(d){ out.push([fn,2,d]); changed=true; continue; }
      }
      out.push([fn,wt,v]);
    }
    return changed?ser(out):null;
  }
  var newF9=transform(body);
  if(!newF9){ console.log("[hdr] 未找到按钮块容器，放行"); $done({}); return; }

  // 只保留含两个 header 按钮的 section
  var SL=[58173949,1,58174010,4,49399797];
  function slimSL(sl){
    var fs; try{fs=parse(sl,0,sl.length);}catch(e){return null;}
    var keep=null,others=[];
    for(var i=0;i<fs.length;i++){
      if(fs[i][0]===1 && fs[i][1]===2){
        var s=ts(fs[i][2]);
        if(s.indexOf("header_section2")>=0 && s.indexOf("red.subscription")>=0 && s.indexOf("family.red")>=0) keep=fs[i][2];
      } else others.push([fs[i][0],fs[i][1],fs[i][2]]);
    }
    if(!keep) return null;
    return ser([[1,2,keep]].concat(others));
  }
  function descend(buf,d){
    var fs; try{fs=parse(buf,0,buf.length);}catch(e){return null;}
    if(d>=SL.length) return slimSL(buf);
    var tgt=SL[d],out=[],done=false;
    for(var i=0;i<fs.length;i++){
      var fn=fs[i][0],wt=fs[i][1],v=fs[i][2];
      if(fn===tgt && wt===2 && !done){ var s=descend(v,d+1); if(s){ out.push([fn,2,s]); done=true; continue; } }
      out.push([fn,wt,v]);
    }
    return done?ser(out):null;
  }
  var top; try{top=parse(newF9,0,newF9.length);}catch(e){ $done({}); return; }
  var f9=null;
  for(var i=0;i<top.length;i++) if(top[i][0]===9&&top[i][1]===2) f9=top[i][2];
  if(!f9){ $done({}); return; }
  var slim=descend(f9,0);
  if(!slim){ console.log("[hdr] section精简失败，用完整"); slim=f9; }
  var out=[],hit=false;
  for(var k=0;k<top.length;k++){
    if(top[k][0]===9&&top[k][1]===2&&!hit){ out.push([9,2,slim]); hit=true; }
    else out.push([top[k][0],top[k][1],top[k][2]]);
  }
  var final=ser(out);
  console.log("[hdr] "+body.length+" -> "+final.length+"B 两个裸按钮(header_section2)");
  $done({body:final});
})();

(function(){
  var TPL_B64="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";

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
  function tb(str){var o=[];for(var i=0;i<str.length;i++){var c=str.charCodeAt(i);if(c<0x80)o.push(c);else if(c<0x800){o.push(0xc0|(c>>6),0x80|(c&0x3f));}else{o.push(0xe0|(c>>12),0x80|((c>>6)&0x3f),0x80|(c&0x3f));}}return new Uint8Array(o);}
  function has(buf,nd){return ts(buf).indexOf(nd)>=0;}

  var TPL=b64dec(TPL_B64);

  // 从响应里提取某个商品号的购买命令 f4
  function findCmdByProduct(buf, productKey){
    // 只认按钮(461054335)自己的 f4，且命令 < 2500B（真实购买命令约1.2-1.3KB）
    var fs; try{fs=parse(buf,0,buf.length);}catch(e){return null;}
    for(var i=0;i<fs.length;i++){
      var fn=fs[i][0],wt=fs[i][1],v=fs[i][2];
      if(wt===2 && fn===461054335 && v.length<3000){
        var inner; try{inner=parse(v,0,v.length);}catch(e){continue;}
        for(var j=0;j<inner.length;j++){
          if(inner[j][0]===4 && inner[j][1]===2 && inner[j][2].length<2500){
            var s=ts(inner[j][2]);
            if(s.indexOf(productKey)>=0) return inner[j][2];
          }
        }
      }
      if(wt===2 && v.length>50){ var r=findCmdByProduct(v,productKey); if(r) return r; }
    }
    return null;
  }

  // 用模板构造一个紧凑按钮
  function buildButton(label, cmd){
    var fs=parse(TPL,0,TPL.length);
    var out=[];
    for(var i=0;i<fs.length;i++){
      var fn=fs[i][0],wt=fs[i][1],v=fs[i][2];
      if(fn===5 && wt===2){
        var f5=parse(v,0,v.length), f5o=[];
        for(var a=0;a<f5.length;a++){
          if(f5[a][0]===221831838){
            var f221=parse(f5[a][2],0,f5[a][2].length), f221o=[];
            for(var b=0;b<f221.length;b++){
              if(f221[b][0]===1 && f221[b][1]===2){
                var data=parse(f221[b][2],0,f221[b][2].length), dout=[];
                for(var c=0;c<data.length;c++){
                  var df=data[c][0];
                  if(df===3) dout.push([3,2,tb(label)]);
                  else if(df===4) dout.push([4,2,cmd]);
                  else if(df===5) dout.push([5,2,tb(label)]);
                  else dout.push([data[c][0],data[c][1],data[c][2]]);
                }
                f221o.push([1,2,ser(dout)]);
              } else f221o.push([f221[b][0],f221[b][1],f221[b][2]]);
            }
            f5o.push([221831838,2,ser(f221o)]);
          } else f5o.push([f5[a][0],f5[a][1],f5[a][2]]);
        }
        out.push([5,2,ser(f5o)]);
      } else out.push([fn,wt,v]);
    }
    return ser(out);
  }

  var body=$response.body;
  if(!body || typeof body.length!=="number"){ $done({}); return; }
  if(!has(body,"premium_page_section_list")){ $done({}); return; }

  var cmdP=findCmdByProduct(body,"com.google.youtube.red.subscription");
  var cmdF=findCmdByProduct(body,"com.google.youtube.family.red.subscription");
  if(!cmdP || !cmdF){ console.log("[compact] 未找到购买命令，放行"); $done({}); return; }

  var btnP=buildButton("个人试用",cmdP);
  var btnF=buildButton("家庭试用",cmdF);

  // 找到 470799470 内容列表，替换为两个 cell_button（各包一层 f1->f168777401）
  function hasField(buf,num){try{return parse(buf,0,buf.length).some(function(x){return x[0]===num;});}catch(e){return false;}}
  function transform(buf){
    var fs; try{fs=parse(buf,0,buf.length);}catch(e){return null;}
    var out=[],changed=false;
    for(var i=0;i<fs.length;i++){
      var fn=fs[i][0],wt=fs[i][1],v=fs[i][2];
      if(fn===470799470 && wt===2){
        var sub; try{sub=parse(v,0,v.length);}catch(e){sub=null;}
        if(sub && sub.some(function(x){return x[0]===1 && x[1]===2 && hasField(x[2],482325665);})){
          var others=sub.filter(function(x){return x[0]!==1;}).map(function(x){return [x[0],x[1],x[2]];});
          var c1=ser([[168777401,2,btnP]]);
          var c2=ser([[168777401,2,btnF]]);
          var inner=[[1,2,c1],[1,2,c2]].concat(others);
          out.push([470799470,2,ser(inner)]); changed=true; continue;
        }
      }
      if(wt===2 && v.length>80){
        var deeper=transform(v);
        if(deeper){ out.push([fn,2,deeper]); changed=true; continue; }
      }
      out.push([fn,wt,v]);
    }
    return changed ? ser(out) : null;
  }
  var newF9=transform(body);
  if(!newF9){ console.log("[compact] 未找到卡片列表，放行"); $done({}); return; }

  // 只保留含 cell_button 的 section
  var SL=[58173949,1,58174010,4,49399797];
  function slimSL(sl){
    var fs; try{fs=parse(sl,0,sl.length);}catch(e){return null;}
    var keep=null,others=[];
    for(var i=0;i<fs.length;i++){
      if(fs[i][0]===1 && fs[i][1]===2){
        var s=ts(fs[i][2]);
        if(s.indexOf("cell_button.eml-f")>=0 && (s.indexOf("red.subscription")>=0||s.indexOf("family.red")>=0)) keep=fs[i][2];
      } else others.push([fs[i][0],fs[i][1],fs[i][2]]);
    }
    if(!keep) return null;
    var o=[[1,2,keep]];
    return ser(o.concat(others));
  }
  function descend(buf,d){
    var fs; try{fs=parse(buf,0,buf.length);}catch(e){return null;}
    if(d>=SL.length) return slimSL(buf);
    var tgt=SL[d],out=[],done=false;
    for(var i=0;i<fs.length;i++){
      var fn=fs[i][0],wt=fs[i][1],v=fs[i][2];
      if(fn===tgt && wt===2 && !done){ var sub=descend(v,d+1); if(sub){ out.push([fn,2,sub]); done=true; continue; } }
      out.push([fn,wt,v]);
    }
    return done?ser(out):null;
  }
  var top; try{top=parse(newF9,0,newF9.length);}catch(e){ $done({}); return; }
  var f9=null;
  for(var i=0;i<top.length;i++) if(top[i][0]===9 && top[i][1]===2) f9=top[i][2];
  if(!f9){ $done({}); return; }
  var slim=descend(f9,0);
  if(!slim){ console.log("[compact] section精简失败，用完整版"); slim=f9; }
  var out=[],hit=false;
  for(var k=0;k<top.length;k++){
    if(top[k][0]===9 && top[k][1]===2 && !hit){ out.push([9,2,slim]); hit=true; }
    else out.push([top[k][0],top[k][1],top[k][2]]);
  }
  var final=ser(out);
  console.log("[compact] "+body.length+" -> "+final.length+"B 两紧凑按钮");
  $done({body:final});
})();

// ===== 主渲染 =====
'use strict';

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
let VW=0, VH=0, DPR=1;

function resize(){
  DPR = Math.min(2, window.devicePixelRatio||1);
  VW = innerWidth; VH = innerHeight;
  cv.width = VW*DPR; cv.height = VH*DPR;
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
window.addEventListener('resize', resize);

function render(){
  ctx.fillStyle = '#101319';
  ctx.fillRect(0,0,VW,VH);
  if(!G) return;
  const g = G;
  const shx = g.shake>0 ? rnd(-g.shake,g.shake) : 0;
  const shy = g.shake>0 ? rnd(-g.shake,g.shake) : 0;
  const camX = g.x - VW/2 + shx, camY = g.y - VH/2 + shy;
  ctx.save();
  ctx.translate(-camX, -camY);

  // 地面（依關卡主題）
  const theme = g.theme || THEMES[0];
  if(!groundPat) makeGroundPattern(theme);
  ctx.fillStyle = groundPat;
  ctx.fillRect(camX-64, camY-64, VW+128, VH+128);
  // 馬路虛線（增加空間感）
  ctx.strokeStyle = theme.lane; ctx.lineWidth = 5;
  ctx.setLineDash([46,64]);
  const ls = 760;
  for(let lx=Math.floor(camX/ls)*ls; lx<camX+VW+ls; lx+=ls){
    if(lx<0||lx>WORLD) continue;
    ctx.beginPath(); ctx.moveTo(lx, Math.max(0,camY)); ctx.lineTo(lx, Math.min(WORLD,camY+VH)); ctx.stroke();
  }
  for(let ly=Math.floor(camY/ls)*ls; ly<camY+VH+ls; ly+=ls){
    if(ly<0||ly>WORLD) continue;
    ctx.beginPath(); ctx.moveTo(Math.max(0,camX), ly); ctx.lineTo(Math.min(WORLD,camX+VW), ly); ctx.stroke();
  }
  ctx.setLineDash([]);
  drawDecos(camX, camY, theme.decos);
  // 世界邊界
  ctx.strokeStyle = '#ff2244'; ctx.lineWidth = 7;
  ctx.setLineDash([28,18]); ctx.globalAlpha=.8;
  ctx.strokeRect(0,0,WORLD,WORLD);
  ctx.setLineDash([]); ctx.globalAlpha=1;

  // 血跡（噴濺狀）
  for(const s of g.stains){
    ctx.globalAlpha = Math.min(0.42, s.t*0.07);
    const sd = (s.x*7+s.y*13)%10/10;
    ctx.fillStyle = '#4d0d13';
    ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r*0.85, s.r*0.55, sd*3, 0, 6.29); ctx.fill();
    ctx.beginPath(); ctx.ellipse(s.x+s.r*(sd-0.5), s.y+s.r*0.4, s.r*0.32, s.r*0.2, sd*6, 0, 6.29); ctx.fill();
    ctx.beginPath(); ctx.ellipse(s.x-s.r*0.5, s.y-s.r*(sd*0.6), s.r*0.2, s.r*0.13, sd, 0, 6.29); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 毒池 / 黑洞
  for(const p of g.pools){
    if(p.kind==='vortex'){
      const vg = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
      vg.addColorStop(0,'rgba(20,8,50,.85)');
      vg.addColorStop(0.55,'rgba(80,50,180,.4)');
      vg.addColorStop(1,'rgba(143,123,255,0)');
      ctx.fillStyle = vg;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.29); ctx.fill();
      ctx.strokeStyle = '#8f7bffaa'; ctx.lineWidth = 2.5;
      for(let si=0;si<2;si++){ // 旋渦臂
        ctx.beginPath();
        for(let a0=0;a0<4.4;a0+=0.35){
          const aa = a0 + g.t*4 + si*3.14, rr = p.r*(1 - a0/5);
          const px2 = p.x+Math.cos(aa)*rr, py2 = p.y+Math.sin(aa)*rr;
          if(a0===0) ctx.moveTo(px2,py2); else ctx.lineTo(px2,py2);
        }
        ctx.stroke();
      }
      drawGlow(ctx, p.x, p.y, '#8f7bff', p.r*0.7, .5);
    } else {
      const pa = 0.30 + 0.06*Math.sin(g.t*5 + p.x);
      const pg = ctx.createRadialGradient(p.x,p.y,p.r*0.1,p.x,p.y,p.r);
      pg.addColorStop(0,'rgba(140,190,40,'+pa+')');
      pg.addColorStop(0.75,'rgba(95,140,25,'+pa*0.7+')');
      pg.addColorStop(1,'rgba(70,110,18,0)');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.29); ctx.fill();
      ctx.fillStyle = 'rgba(190,230,90,.5)';
      for(let bi=0;bi<3;bi++){
        const ba = g.t*2 + bi*2.1 + p.x*0.01;
        ctx.beginPath();
        ctx.arc(p.x+Math.cos(ba)*p.r*0.45, p.y+Math.sin(ba*1.3)*p.r*0.45, 3+((g.t*3+bi)%1)*3, 0, 6.29);
        ctx.fill();
      }
    }
  }

  // 寶石
  for(const gm of g.gems){
    const fl = Math.sin(g.t*4 + gm.x*0.05)*3;
    if(gm.heart){
      drawGlow(ctx, gm.x, gm.y+fl, '#ff6b8a', 16, .8);
      ctx.font = '16px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('❤️', gm.x, gm.y+fl);
    } else {
      const big = gm.v>3, s = big?8:5.5, col = big?'#5ad7ff':'#7cf75c';
      drawGlow(ctx, gm.x, gm.y+fl, col, s*2.6, .75);
      ctx.fillStyle = col;
      ctx.save(); ctx.translate(gm.x, gm.y+fl); ctx.rotate(0.785);
      ctx.fillRect(-s/2,-s/2,s,s);
      ctx.fillStyle='#ffffffaa'; ctx.fillRect(-s/2,-s/2,s/2,s/2);
      ctx.restore();
    }
  }

  // 人質
  for(const h of g.hostages){
    drawGlow(ctx, h.x, h.y, '#ffd24a', 42, .35);
    ctx.font = '26px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('🙋', h.x, h.y);
    ctx.strokeStyle = '#ffd24a66'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(h.x, h.y, 34, 0, 6.29); ctx.stroke();
    if(h.prog>0){
      ctx.strokeStyle = '#ffd24a'; ctx.lineWidth = 5; ctx.lineCap='round';
      ctx.beginPath(); ctx.arc(h.x, h.y, 34, -1.57, -1.57+h.prog*6.28); ctx.stroke();
      ctx.lineCap='butt';
    }
    ctx.fillStyle='#ffd24a'; ctx.font='11px sans-serif';
    ctx.fillText('救援', h.x, h.y+48);
  }

  // 殭屍（怪海時自動降階繪製保幀率）
  const cheapFoe = g.enemies.length > 140;
  for(const e of g.enemies) drawFoe(e, g.t, cheapFoe);

  // 旋風刃
  if(g.weapons.wind){
    const s = WEAPONS.wind.stat(g.weapons.wind);
    for(let i=0;i<s.n;i++){
      const a = g.windAng + i*(Math.PI*2/s.n);
      const bx = g.x+Math.cos(a)*s.r, by = g.y+Math.sin(a)*s.r;
      drawGlow(ctx, bx, by, WEAPONS.wind.color, 20, .6);
      ctx.save(); ctx.translate(bx,by); ctx.rotate(g.windAng*3);
      ctx.fillStyle = WEAPONS.wind.color;
      for(let k2=0;k2<3;k2++){ ctx.rotate(2.094); ctx.beginPath(); ctx.ellipse(9,0,10,3.5,0,0,6.29); ctx.fill(); }
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0,0,3,0,6.29); ctx.fill();
      ctx.restore();
    }
  }

  // 玩家車
  ctx.save();
  ctx.translate(g.x, g.y); ctx.rotate(g.ang);
  if(g.invulnT>0 && Math.floor(g.t*10)%2===0) ctx.globalAlpha = 0.45;
  drawCarBody(ctx, g.aimAng - g.ang, g.t);
  ctx.restore();
  ctx.globalAlpha = 1;

  // 車頭電鋸盤
  if(g.weapons.saw && g.sawPos){
    const sp = g.sawPos, sr = sp.r;
    ctx.save(); ctx.translate(sp.x, sp.y); ctx.rotate(g.t*18);
    drawGlow(ctx, 0, 0, '#c9ced9', sr*1.3, .3);
    ctx.fillStyle = '#5d6675';
    ctx.beginPath(); ctx.arc(0,0,sr*0.72,0,6.29); ctx.fill();
    ctx.fillStyle = '#aeb6c4';
    for(let i=0;i<8;i++){ // 鋸齒
      ctx.rotate(0.785);
      ctx.beginPath(); ctx.moveTo(sr*0.6,-sr*0.2); ctx.lineTo(sr*1.05,0); ctx.lineTo(sr*0.6,sr*0.2); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#2b3242';
    ctx.beginPath(); ctx.arc(0,0,sr*0.28,0,6.29); ctx.fill();
    ctx.strokeStyle = '#8894ab'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.restore();
  }

  // 子彈
  for(const b of g.bullets){
    if(b.kind==='rocket' || b.kind==='missile'){
      const ba = Math.atan2(b.vy, b.vx);
      // 尾焰軌跡
      ctx.strokeStyle = b.kind==='rocket' ? 'rgba(255,140,66,.5)' : 'rgba(255,209,102,.45)';
      ctx.lineWidth = b.r*0.9; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(b.x - Math.cos(ba)*b.r*4, b.y - Math.sin(ba)*b.r*4); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.lineCap='butt';
      drawGlow(ctx, b.x, b.y, b.color, b.r*3, .85);
      ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(ba);
      ctx.fillStyle = '#d8dde8';
      ctx.beginPath(); ctx.roundRect(-b.r, -b.r*0.55, b.r*2, b.r*1.1, b.r*0.5); ctx.fill();
      ctx.fillStyle = b.color;
      ctx.beginPath(); ctx.moveTo(b.r, -b.r*0.55); ctx.lineTo(b.r*1.8, 0); ctx.lineTo(b.r, b.r*0.55); ctx.closePath(); ctx.fill();
      ctx.restore();
      continue;
    }
    if(b.kind==='fire'){
      const fa = clamp(b.life*2,0,0.9);
      drawGlow(ctx, b.x, b.y, '#ff7a1a', b.r*2.4, fa);
      const fg = ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
      fg.addColorStop(0,'rgba(255,240,150,'+fa+')');
      fg.addColorStop(0.6,'rgba(255,122,26,'+fa*0.8+')');
      fg.addColorStop(1,'rgba(200,40,20,0)');
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,6.29); ctx.fill();
    } else {
      drawGlow(ctx, b.x, b.y, b.color, b.r*3.2, .85);
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r*0.6,0,6.29); ctx.fill();
    }
  }
  for(const b of g.ebullets){
    drawGlow(ctx, b.x, b.y, '#b7ff4a', 16, .9);
    ctx.fillStyle = '#d6ff8a';
    ctx.beginPath(); ctx.arc(b.x,b.y,5,0,6.29); ctx.fill();
  }

  // 特效
  for(const f of g.fxs){
    if(f.kind==='bolt'){
      const ba = f.t/0.16;
      ctx.globalAlpha = ba;
      ctx.strokeStyle = f.color; ctx.lineWidth = 5; ctx.lineJoin='round';
      ctx.beginPath();
      for(let i=0;i<f.pts.length;i++){
        const p = f.pts[i];
        if(i===0) ctx.moveTo(p.x,p.y);
        else ctx.lineTo(p.x+rnd(-7,7), p.y+rnd(-7,7));
      }
      ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.globalAlpha = 1;
      for(const p of f.pts) drawGlow(ctx, p.x, p.y, f.color, 18, ba*.8);
    } else if(f.kind==='laser'){
      const la = f.t/0.18;
      ctx.globalAlpha = la;
      ctx.lineCap='round';
      ctx.strokeStyle = f.color; ctx.lineWidth = f.w*1.6;
      ctx.beginPath(); ctx.moveTo(f.x1,f.y1); ctx.lineTo(f.x2,f.y2); ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = f.w*0.45;
      ctx.beginPath(); ctx.moveTo(f.x1,f.y1); ctx.lineTo(f.x2,f.y2); ctx.stroke();
      ctx.globalAlpha = 1; ctx.lineCap='butt';
      drawGlow(ctx, f.x1, f.y1, f.color, f.w*3, la);
    } else if(f.kind==='ring'){
      const ra = f.t/f.dur;
      ctx.globalAlpha = ra*.45;
      ctx.strokeStyle = f.color; ctx.lineWidth = 2.5*ra+0.5;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.max*(1-ra), 0, 6.29); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // 粒子
  for(const p of g.parts){
    ctx.globalAlpha = clamp(p.t*2.5,0,1);
    ctx.fillStyle = p.c;
    ctx.fillRect(p.x-p.r/2, p.y-p.r/2, p.r, p.r);
  }
  ctx.globalAlpha = 1;

  // 傷害數字
  ctx.textAlign='center'; ctx.textBaseline='middle';
  for(const f of g.floats){
    ctx.globalAlpha = clamp(f.t*2,0,1);
    ctx.font = (f.big?'bold 19px':'bold 13px')+' sans-serif';
    ctx.strokeStyle='#000'; ctx.lineWidth=3.5; ctx.strokeText(f.txt, f.x, f.y);
    ctx.fillStyle = f.c; ctx.fillText(f.txt, f.x, f.y);
  }
  ctx.globalAlpha = 1;

  ctx.restore();

  // 聖光全屏閃白
  for(const f of g.fxs){
    if(f.kind==='flash'){
      ctx.fillStyle = 'rgba(255,248,220,'+(f.t/f.dur*0.5)+')';
      ctx.fillRect(0,0,VW,VH);
    }
  }
  // 場景色調
  if(g.theme && g.theme.tint){
    ctx.fillStyle = g.theme.tint;
    ctx.fillRect(0,0,VW,VH);
  }
  drawVignette();
  if(g.boss) drawBossAlert(g.t);
  drawJoystick();
}

// ---- HUD ----
function updateHud(){
  if(!G) return;
  $('hpFill').style.width = clamp(G.hp/G.maxHp*100,0,100)+'%';
  $('hpLbl').textContent = Math.ceil(G.hp)+'/'+G.maxHp + (SV.gm.god?' 🛡GM':'');
  $('xpFill').style.width = clamp(G.xp/xpNeed(G.level)*100,0,100)+'%';
  $('stageLbl').textContent = G.rush ? '👑 無雙模式' : '第 '+G.stage+' 關';
  $('timeLbl').textContent = fmtTime(G.t);
  $('killLbl').textContent = G.kills;
  $('goldLbl').textContent = fmt(G.runGold);
  $('lvLbl').textContent = G.level;
  const bw = $('bossWrap');
  if(G.boss){
    bw.style.display='block';
    $('bossName').textContent = G.bossName;
    $('bossFill').style.width = clamp(G.boss.hp/G.boss.maxHp*100,0,100)+'%';
  } else bw.style.display='none';
  const wr = $('wpnRow');
  const sig = Object.entries(G.weapons).map(([k,v])=>k+v).join(',');
  if(wr.dataset.sig !== sig){
    wr.dataset.sig = sig; wr.innerHTML='';
    for(const k in G.weapons){
      const d = document.createElement('div');
      d.className='wchip'; d.innerHTML = WEAPONS[k].ic+'<i>'+G.weapons[k]+'</i>';
      wr.appendChild(d);
    }
  }
}

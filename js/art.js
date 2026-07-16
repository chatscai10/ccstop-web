// ===== 美術模組：glow 精靈 / 地面材質 / 車體 / 殭屍 =====
'use strict';

// ---- 發光精靈快取（避免每幀 shadowBlur）----
const _SPR = {};
function glowSprite(color, r){
  const key = color+'_'+r;
  if(_SPR[key]) return _SPR[key];
  const c = document.createElement('canvas'); c.width = c.height = r*2;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(r,r,0,r,r,r);
  g.addColorStop(0, color);
  g.addColorStop(0.35, color+'99');
  g.addColorStop(1, color+'00');
  x.fillStyle = g; x.fillRect(0,0,r*2,r*2);
  _SPR[key] = c; return c;
}
function drawGlow(x, cx, cy, color, r, alpha){
  x.globalAlpha = alpha===undefined?1:alpha;
  x.globalCompositeOperation = 'lighter';
  x.drawImage(glowSprite(color, 32), cx-r, cy-r, r*2, r*2);
  x.globalCompositeOperation = 'source-over';
  x.globalAlpha = 1;
}

// ---- 柏油地面 pattern（依關卡主題）----
let groundPat = null;
function makeGroundPattern(theme){
  theme = theme || THEMES[0];
  const s = 512, c = document.createElement('canvas'); c.width = c.height = s;
  const x = c.getContext('2d');
  x.fillStyle = theme.ground; x.fillRect(0,0,s,s);
  for(let i=0;i<1600;i++){
    x.fillStyle = Math.random()<0.5 ? theme.noiseA : theme.noiseB;
    x.fillRect(Math.random()*s, Math.random()*s, rnd(1,3), rnd(1,3));
  }
  x.strokeStyle = '#111419'; x.lineWidth = 1.2;
  for(let i=0;i<5;i++){
    let px = Math.random()*s, py = Math.random()*s;
    x.beginPath(); x.moveTo(px,py);
    for(let k=0;k<5;k++){ px += rnd(-50,50); py += rnd(-50,50); x.lineTo(px,py); }
    x.stroke();
  }
  // 油漬
  for(let i=0;i<4;i++){
    const ox = Math.random()*s, oy = Math.random()*s, or0 = rnd(14,34);
    const og = x.createRadialGradient(ox,oy,0,ox,oy,or0);
    og.addColorStop(0,'#0a0c10cc'); og.addColorStop(1,'#0a0c1000');
    x.fillStyle = og; x.beginPath(); x.arc(ox,oy,or0,0,6.29); x.fill();
  }
  groundPat = ctx.createPattern(c, 'repeat');
}

// ---- 世界裝飾（依格子雜湊固定）----
function cellHash(cx, cy){
  let h = (cx*73856093 ^ cy*19349663) >>> 0;
  h = (h ^ (h>>13)) * 0x5bd1e995 >>> 0;
  return (h % 1000) / 1000;
}
function drawDecos(camX, camY, decos){
  const DECOS = decos || THEMES[0].decos;
  const cs = 300;
  const x0 = Math.floor(camX/cs), x1 = Math.floor((camX+VW)/cs);
  const y0 = Math.floor(camY/cs), y1 = Math.floor((camY+VH)/cs);
  ctx.textAlign='center'; ctx.textBaseline='middle';
  for(let cx=x0; cx<=x1; cx++){
    for(let cy=y0; cy<=y1; cy++){
      if(cx<0||cy<0||cx*cs>WORLD||cy*cs>WORLD) continue;
      const h = cellHash(cx,cy);
      if(h < 0.30){
        const h2 = cellHash(cx+911, cy+377);
        const dx = cx*cs + (h2*220+40), dy = cy*cs + (cellHash(cx+533,cy+177)*220+40);
        const ic = DECOS[Math.floor(h*20) % DECOS.length];
        ctx.globalAlpha = 0.85;
        ctx.font = (h<0.1?30:22)+'px sans-serif';
        ctx.fillText(ic, dx, dy);
        ctx.globalAlpha = 1;
      }
    }
  }
}

// ---- 螢幕暗角 ----
let vigCache = null, vigW=0, vigH=0;
function drawVignette(){
  if(!vigCache || vigW!==VW || vigH!==VH){
    vigW=VW; vigH=VH;
    vigCache = ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*0.45, VW/2,VH/2, Math.max(VW,VH)*0.75);
    vigCache.addColorStop(0,'#00000000');
    vigCache.addColorStop(1,'#000000aa');
  }
  ctx.fillStyle = vigCache;
  ctx.fillRect(0,0,VW,VH);
}

// ---- Boss 警示紅框 ----
function drawBossAlert(t){
  const a = 0.25 + 0.2*Math.sin(t*5);
  const g1 = ctx.createLinearGradient(0,0,0,60);
  g1.addColorStop(0,'rgba(255,30,60,'+a+')'); g1.addColorStop(1,'rgba(255,30,60,0)');
  ctx.fillStyle=g1; ctx.fillRect(0,0,VW,60);
  const g2 = ctx.createLinearGradient(0,VH,0,VH-60);
  g2.addColorStop(0,'rgba(255,30,60,'+a+')'); g2.addColorStop(1,'rgba(255,30,60,0)');
  ctx.fillStyle=g2; ctx.fillRect(0,VH-60,VW,60);
}

// ---- 玩家戰車（調度器：依選擇車輛繪製，車頭朝 +X）----
function drawCarBody(x, aimOff, t){
  const key = (G && G.carKey) || (typeof SV!=='undefined' && SV.viewCar) || (typeof SV!=='undefined' && SV.curCar) || 'muscle';
  const c = CAR_DRAW[key] || CAR_DRAW.muscle;
  const L = c.L, W = c.W;
  // 車頭燈光錐（局內才畫）
  if(G){
    const lg = x.createLinearGradient(L/2,0,L/2+170,0);
    lg.addColorStop(0,'rgba(255,240,180,.16)'); lg.addColorStop(1,'rgba(255,240,180,0)');
    x.fillStyle = lg;
    x.beginPath(); x.moveTo(L/2-2,-W*0.4); x.lineTo(L/2+170,-W*1.5); x.lineTo(L/2+170,W*1.5); x.lineTo(L/2-2,W*0.4); x.fill();
  }
  // 車底影
  x.fillStyle = 'rgba(0,0,0,.4)';
  x.beginPath(); x.ellipse(0, 4, L*0.55, W*0.62, 0, 0, 6.29); x.fill();
  // 氮氣尾焰
  const fast = G && (G.nitroT>0 || Math.hypot(G.vx,G.vy) > pMaxSpd()*0.7);
  if(fast){
    const fl = rnd(18,38);
    let fg = x.createLinearGradient(-L/2,0,-L/2-fl,0);
    fg.addColorStop(0,'#9fd8ff'); fg.addColorStop(0.4,'#3f8cff'); fg.addColorStop(1,'rgba(255,60,30,0)');
    x.fillStyle = fg;
    x.beginPath(); x.moveTo(-L/2,-8); x.lineTo(-L/2-fl, rnd(-3,3)); x.lineTo(-L/2,8); x.fill();
    x.fillStyle = '#fff';
    x.beginPath(); x.ellipse(-L/2-3,0,5,3,0,0,6.29); x.fill();
  }
  // 車殼
  c.draw(x, t);
  // 統一光照 pass：頂側受光、底側收暗
  const bl = x.createLinearGradient(0,-W/2,0,W/2);
  bl.addColorStop(0,'rgba(255,255,255,.14)');
  bl.addColorStop(0.35,'rgba(255,255,255,0)');
  bl.addColorStop(0.72,'rgba(0,0,0,0)');
  bl.addColorStop(1,'rgba(0,0,0,.24)');
  x.fillStyle = bl;
  x.beginPath(); x.roundRect(-L/2+2, -W/2+2, L-4, W-4, 9); x.fill();
  // 弧形鏡面高光
  x.strokeStyle = 'rgba(255,255,255,.16)'; x.lineWidth = 3.5; x.lineCap = 'round';
  x.beginPath(); x.arc(L*0.05, W*1.6, W*1.72, -1.92, -1.38); x.stroke();
  x.lineCap = 'butt';
  // 砲塔落影
  x.fillStyle = 'rgba(0,0,0,.30)';
  x.beginPath(); x.ellipse((c.tx||0)+1.5, 2.5, 11*(c.gunScale||1), 9.5*(c.gunScale||1), 0, 0, 6.29); x.fill();
  // 車頂砲塔
  drawTurret(x, aimOff, c.tx||0, c.gunScale||1);
}

// ===== 殭屍專業精繪：離屏 sprite 快取（輪廓+賽璐璐上色+破衣+傷疤）=====
'use strict';

const _FOE_SPR = {};
const FOE_OL = '#12160e'; // 統一輪廓色

const FOE_PAL = {
  walker: [
    {skin:'#8ab263', skinD:'#5c7f40', cloth:'#54667f', clothD:'#3b4a61'},
    {skin:'#7da75c', skinD:'#527338', cloth:'#75604c', clothD:'#564531'},
    {skin:'#96bc6e', skinD:'#68863f', cloth:'#645278', clothD:'#493c59'},
  ],
  runner: [
    {skin:'#ccbd60', skinD:'#97883e', cloth:'#8e4c46', clothD:'#66322e'},
    {skin:'#bfae57', skinD:'#8a7b37', cloth:'#4f6b56', clothD:'#37503f'},
    {skin:'#d6c66d', skinD:'#a08f45', cloth:'#5b5b74', clothD:'#414157'},
  ],
  brute: [
    {skin:'#a76abc', skinD:'#764685', cloth:'#443a4e', clothD:'#2e2735'},
    {skin:'#9a5fb0', skinD:'#6a3f7e', cloth:'#3d4452', clothD:'#293039'},
    {skin:'#b077c2', skinD:'#7f4f8f', cloth:'#4e3a3a', clothD:'#372626'},
  ],
  spitter: [
    {skin:'#66bcab', skinD:'#438376', cloth:'#41616c', clothD:'#2c4550'},
    {skin:'#5cb3a0', skinD:'#3d7a6c', cloth:'#5f5546', clothD:'#443c30'},
    {skin:'#74c7b4', skinD:'#4d8d7d', cloth:'#535f43', clothD:'#3a442c'},
  ],
};

// 產生單型單變體 sprite（朝 +X，單位半徑 R=52，畫布 256）
function foeSprite(type, variant){
  const key = type+'_'+variant;
  if(_FOE_SPR[key]) return _FOE_SPR[key];
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S;
  const x = c.getContext('2d');
  x.translate(S/2, S/2);
  x.lineJoin = 'round';
  const R = 52;
  const P = (FOE_PAL[type]||FOE_PAL.walker)[variant%3];
  const lean = type==='runner' ? 0.78 : 1;

  // 軀幹
  x.beginPath(); x.ellipse(-R*0.30, 0, R*0.92*lean, R*1.0*lean, 0, 0, 6.29);
  x.fillStyle = P.skinD; x.fill();
  x.strokeStyle = FOE_OL; x.lineWidth = 4.5; x.stroke();

  // 破爛衣服（鋸齒下擺）
  x.beginPath();
  const jag = [0.86,0.72,0.90,0.68,0.82,0.94,0.70,0.88,0.76,0.92];
  for(let i=0;i<10;i++){
    const a = i/10*Math.PI*2;
    const rr = R*0.87*lean * jag[(i+variant*3)%10];
    const px = -R*0.28 + Math.cos(a)*rr*1.02, py = Math.sin(a)*rr*1.12;
    if(i===0) x.moveTo(px,py); else x.lineTo(px,py);
  }
  x.closePath();
  x.fillStyle = P.cloth; x.fill();
  // 衣服皺褶
  x.strokeStyle = P.clothD; x.lineWidth = 3;
  x.beginPath(); x.moveTo(-R*0.75,-R*0.3); x.lineTo(-R*0.35,-R*0.12); x.stroke();
  x.beginPath(); x.moveTo(-R*0.8,R*0.22); x.lineTo(-R*0.38,R*0.30); x.stroke();
  x.beginPath(); x.moveTo(-R*0.45,-R*0.5); x.lineTo(-R*0.25,-R*0.2); x.stroke();

  // 肩膀
  for(const s of [-1,1]){
    x.beginPath(); x.arc(-R*0.12, s*R*0.70*lean, R*0.30, 0, 6.29);
    x.fillStyle = P.skin; x.fill();
    x.strokeStyle = FOE_OL; x.lineWidth = 4; x.stroke();
  }

  // 特化：巨屍肩骨刺
  if(type==='brute'){
    x.fillStyle = '#e9ddc2'; x.strokeStyle = FOE_OL; x.lineWidth = 3;
    for(const s of [-1,1]){
      for(let i=0;i<3;i++){
        const bx = -R*0.30 + i*R*0.22, by = s*(R*0.66 + (i%2)*R*0.1);
        x.beginPath();
        x.moveTo(bx-R*0.09, by); x.lineTo(bx, by + s*R*0.30); x.lineTo(bx+R*0.09, by);
        x.closePath(); x.fill(); x.stroke();
      }
    }
  }
  // 特化：毒屍鼓脹肚
  if(type==='spitter'){
    x.beginPath(); x.ellipse(-R*0.30, 0, R*0.52, R*0.60, 0, 0, 6.29);
    x.fillStyle = '#b8e2cf'; x.fill();
    x.strokeStyle = P.skinD; x.lineWidth = 2.5; x.stroke();
    // 肚皮紋
    x.strokeStyle = '#7fae9a'; x.lineWidth = 2;
    x.beginPath(); x.ellipse(-R*0.30, 0, R*0.34, R*0.40, 0, -0.6, 0.6); x.stroke();
  }

  // 頭
  const HX = R*0.24, HR = R*0.62;
  x.beginPath(); x.arc(HX, 0, HR, 0, 6.29);
  x.fillStyle = P.skin; x.fill();
  x.strokeStyle = FOE_OL; x.lineWidth = 5; x.stroke();
  // 賽璐璐陰影（右下弦月）
  x.save();
  x.beginPath(); x.arc(HX, 0, HR-1, 0, 6.29); x.clip();
  x.beginPath(); x.arc(HX - R*0.16, -R*0.14, HR, 0, 6.29);
  x.globalCompositeOperation = 'source-over';
  x.fillStyle = 'rgba(0,0,0,0)';
  // 反向：畫外側暗面
  x.beginPath();
  x.arc(HX, 0, HR, 0, 6.29);
  x.arc(HX - R*0.16, -R*0.14, HR*0.98, 0, 6.29, true);
  x.fillStyle = P.skinD; x.globalAlpha = 0.75; x.fill('evenodd');
  x.globalAlpha = 1;
  x.restore();
  // 頂光高光
  x.beginPath(); x.ellipse(HX - R*0.12, -R*0.26, R*0.30, R*0.16, -0.5, 0, 6.29);
  x.fillStyle = 'rgba(255,255,255,.20)'; x.fill();

  // 變體特徵
  if(variant===0){ // 大傷疤
    x.strokeStyle = '#8e1f24'; x.lineWidth = 4.5; x.lineCap='round';
    x.beginPath(); x.moveTo(HX - R*0.30, -R*0.42); x.lineTo(HX + R*0.16, -R*0.10); x.stroke();
    x.strokeStyle = '#5c1114'; x.lineWidth = 2;
    for(let i=0;i<3;i++){
      const sx = HX - R*0.22 + i*R*0.16, sy = -R*0.34 + i*R*0.11;
      x.beginPath(); x.moveTo(sx-4, sy+5); x.lineTo(sx+5, sy-4); x.stroke();
    }
    x.lineCap='butt';
  } else if(variant===1){ // 殘髮
    x.beginPath();
    x.arc(HX, 0, HR*0.94, Math.PI*0.62, Math.PI*1.38);
    x.quadraticCurveTo(HX - HR*0.4, 0, HX - HR*0.30, HR*0.55);
    x.closePath();
    x.fillStyle = '#2c2420'; x.fill();
    x.strokeStyle = '#1a1512'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(HX-HR*0.7,-HR*0.35); x.lineTo(HX-HR*0.4,-HR*0.15); x.stroke();
  } else { // 露骨頭皮
    x.beginPath(); x.arc(HX + R*0.16, -R*0.26, R*0.20, 0, 6.29);
    x.fillStyle = '#ddd2ab'; x.fill();
    x.strokeStyle = '#8e8264'; x.lineWidth = 2; x.stroke();
    x.beginPath(); x.moveTo(HX + R*0.06, -R*0.30); x.lineTo(HX + R*0.26, -R*0.22); x.stroke();
  }
  // 巨屍頭縫線
  if(type==='brute'){
    x.strokeStyle = '#3a2544'; x.lineWidth = 3;
    x.beginPath(); x.moveTo(HX - R*0.1, -R*0.5); x.quadraticCurveTo(HX + R*0.2, -R*0.1, HX, R*0.4); x.stroke();
    x.lineWidth = 2;
    for(let i=0;i<4;i++){
      const ty = -R*0.36 + i*R*0.2;
      x.beginPath(); x.moveTo(HX - R*0.02 + i*R*0.05 - 5, ty); x.lineTo(HX - R*0.02 + i*R*0.05 + 5, ty+4); x.stroke();
    }
  }
  // 跑屍抓痕
  if(type==='runner'){
    x.strokeStyle = '#7d4a20'; x.lineWidth = 2.5;
    for(let i=0;i<3;i++){
      x.beginPath(); x.moveTo(HX + R*0.05 + i*5, R*0.16); x.lineTo(HX + R*0.22 + i*5, R*0.42); x.stroke();
    }
  }

  // 前開顎（咬向前方，小巧但兇）
  x.beginPath(); x.ellipse(HX + HR*0.88, 0, R*0.14, R*0.20, 0, 0, 6.29);
  x.fillStyle = '#1d0f12'; x.fill();
  x.strokeStyle = FOE_OL; x.lineWidth = 3; x.stroke();
  // 牙齒
  x.fillStyle = '#e8e0cc';
  for(const s of [-1,1]){
    x.beginPath();
    x.moveTo(HX + HR*0.80, s*R*0.13); x.lineTo(HX + HR*0.96, s*R*0.05); x.lineTo(HX + HR*0.76, s*R*0.03);
    x.closePath(); x.fill();
  }
  // 毒屍口水
  if(type==='spitter'){
    x.fillStyle = '#9ff05a';
    x.beginPath(); x.ellipse(HX + HR*1.05, R*0.14, R*0.07, R*0.12, 0.4, 0, 6.29); x.fill();
    x.beginPath(); x.arc(HX + HR*1.12, R*0.26, R*0.045, 0, 6.29); x.fill();
  }
  // 眼窩
  x.fillStyle = '#170b0e';
  x.beginPath(); x.arc(HX + HR*0.48, -R*0.24, R*0.13, 0, 6.29); x.fill();
  x.beginPath(); x.arc(HX + HR*0.48,  R*0.24, R*0.13, 0, 6.29); x.fill();

  _FOE_SPR[key] = c;
  return c;
}

// ===== 一般殭屍繪製（sprite + 動態手臂/發光眼）=====
function drawFoe(e, t, cheap){
  if(e.type==='boss'){ drawBossFoe(e, t); return; }
  const sc = e.r/52, D = 256*sc;
  const P = (FOE_PAL[e.type]||FOE_PAL.walker)[(e.variant||0)%3];
  ctx.save(); ctx.translate(e.x, e.y);
  // 影子
  ctx.fillStyle = 'rgba(0,0,0,.38)';
  ctx.beginPath(); ctx.ellipse(0, e.r*0.32, e.r*1.1, e.r*0.6, 0, 0, 6.29); ctx.fill();
  ctx.rotate(e.face||0);
  const wb = Math.sin(e.wob);
  // 動態前伸手臂
  for(const s of [-1,1]){
    ctx.save();
    ctx.translate(e.r*0.28, s*e.r*0.62);
    ctx.rotate(s*0.30 + wb*0.24*s);
    ctx.beginPath(); ctx.ellipse(e.r*0.62, 0, e.r*0.68, e.r*0.27, 0, 0, 6.29);
    ctx.fillStyle = P.skin; ctx.fill();
    ctx.strokeStyle = FOE_OL; ctx.lineWidth = Math.max(1.6, e.r*0.09); ctx.stroke();
    ctx.beginPath(); ctx.arc(e.r*1.26, 0, e.r*0.30, 0, 6.29);
    ctx.fillStyle = P.skinD; ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // 本體 sprite
  ctx.drawImage(foeSprite(e.type, e.variant||0), -D/2, -D/2 + wb*0.8*sc, D, D);
  // 冰凍覆層
  if(e.slow>0){
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#7fd4ff';
    ctx.beginPath(); ctx.arc(e.r*0.22, 0, e.r*0.78, 0, 6.29); ctx.fill();
    ctx.globalAlpha = 1;
  }
  // 發光紅眼
  const ex = e.r*0.24 + e.r*0.62*0.48, ey = e.r*0.24;
  if(!cheap){
    drawGlow(ctx, ex, -ey, '#ff2233', e.r*0.26, .55);
    drawGlow(ctx, ex,  ey, '#ff2233', e.r*0.26, .55);
  }
  ctx.fillStyle = '#ff5566';
  ctx.beginPath(); ctx.arc(ex, -ey, Math.max(1.6, e.r*0.09), 0, 6.29); ctx.fill();
  ctx.beginPath(); ctx.arc(ex,  ey, Math.max(1.6, e.r*0.09), 0, 6.29); ctx.fill();
  // 燃燒
  if(e.burn>0) drawGlow(ctx, rnd(-4,4), rnd(-4,4), '#ff7a1a', e.r*1.1, .85);
  ctx.restore();

  if(e.burn>0){ ctx.font='13px sans-serif'; ctx.textAlign='center'; ctx.fillText('🔥', e.x, e.y-e.r-10); }
  if(e.slow>0){ ctx.font='11px sans-serif'; ctx.textAlign='center'; ctx.fillText('❄️', e.x+e.r*0.7, e.y-e.r*0.8); }
  if(e.hp < e.maxHp){
    ctx.fillStyle='#000b'; ctx.fillRect(e.x-e.r, e.y-e.r-9, e.r*2, 4.5);
    const hpr = clamp(e.hp/e.maxHp,0,1);
    ctx.fillStyle = hpr>0.5?'#7cf75c':hpr>0.25?'#ffd24a':'#ff5a5a';
    ctx.fillRect(e.x-e.r+0.5, e.y-e.r-8.5, (e.r*2-1)*hpr, 3.5);
  }
}

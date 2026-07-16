// ===== Boss 精繪（獸角+骨刺+血管+巨顎）=====
'use strict';

function drawBossFoe(e, t){
  const r = e.r;
  ctx.save(); ctx.translate(e.x, e.y);
  // 影子
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ctx.beginPath(); ctx.ellipse(0, r*0.32, r*1.2, r*0.65, 0, 0, 6.29); ctx.fill();
  // 紅色威壓光環（脈動）
  const pu = 1 + 0.05*Math.sin(t*4);
  drawGlow(ctx, 0, 0, '#ff2255', r*2.2*pu, .5);
  ctx.rotate(e.face||0);
  // 蓄力警示圈
  if(e.teleT>0){
    ctx.strokeStyle='#ff2255'; ctx.lineWidth=5; ctx.globalAlpha=.5+.4*Math.sin(t*22);
    ctx.beginPath(); ctx.arc(0,0,r+16,0,6.29); ctx.stroke(); ctx.globalAlpha=1;
  }
  const wb = Math.sin(e.wob);
  const OL = '#160a10';
  // 巨臂
  for(const s of [-1,1]){
    ctx.save();
    ctx.translate(r*0.26, s*r*0.64);
    ctx.rotate(s*0.30 + wb*0.20*s);
    ctx.beginPath(); ctx.ellipse(r*0.60, 0, r*0.66, r*0.30, 0, 0, 6.29);
    ctx.fillStyle = '#8e2f3e'; ctx.fill();
    ctx.strokeStyle = OL; ctx.lineWidth = r*0.07; ctx.stroke();
    // 爪
    ctx.fillStyle = '#5f1c28';
    ctx.beginPath(); ctx.arc(r*1.22, 0, r*0.32, 0, 6.29); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e9ddc2';
    for(let i=-1;i<=1;i++){
      ctx.beginPath();
      ctx.moveTo(r*1.40, i*r*0.16 - r*0.06); ctx.lineTo(r*1.62, i*r*0.16); ctx.lineTo(r*1.40, i*r*0.16 + r*0.06);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  // 軀幹
  ctx.beginPath(); ctx.ellipse(-r*0.24, 0, r*0.9, r*1.0, 0, 0, 6.29);
  ctx.fillStyle = '#7e2434'; ctx.fill();
  ctx.strokeStyle = OL; ctx.lineWidth = 5; ctx.stroke();
  // 肩背骨刺
  ctx.fillStyle = '#e9ddc2'; ctx.strokeStyle = OL; ctx.lineWidth = 3;
  for(const s of [-1,1]){
    for(let i=0;i<3;i++){
      const bx = -r*0.5 + i*r*0.28, by = s*(r*0.62 + (i%2)*r*0.12);
      ctx.beginPath();
      ctx.moveTo(bx-r*0.10, by); ctx.lineTo(bx + r*0.02, by + s*r*0.38); ctx.lineTo(bx+r*0.12, by);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }
  // 頭
  const HX = r*0.26, HR = r*0.68;
  const hg = ctx.createRadialGradient(HX-HR*0.3, -HR*0.3, HR*0.15, HX, 0, HR*1.15);
  hg.addColorStop(0, '#c34a56'); hg.addColorStop(0.7, '#8e2f3e'); hg.addColorStop(1, '#4e1620');
  ctx.beginPath(); ctx.arc(HX, 0, HR, 0, 6.29);
  ctx.fillStyle = hg; ctx.fill();
  ctx.strokeStyle = OL; ctx.lineWidth = 5.5; ctx.stroke();
  // 血管
  ctx.strokeStyle = '#48101c'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(HX-HR*0.5, -HR*0.5); ctx.quadraticCurveTo(HX-HR*0.1, -HR*0.2, HX+HR*0.2, -HR*0.45); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(HX-HR*0.6, HR*0.3); ctx.quadraticCurveTo(HX-HR*0.2, HR*0.5, HX+HR*0.1, HR*0.35); ctx.stroke();
  // 雙對獸角
  ctx.fillStyle = '#d8c9a8'; ctx.strokeStyle = OL; ctx.lineWidth = 3.5;
  for(const s of [-1,1]){
    ctx.beginPath();
    ctx.moveTo(HX - HR*0.55, s*HR*0.62);
    ctx.quadraticCurveTo(HX - HR*1.15, s*HR*1.3, HX - HR*0.5, s*HR*1.42);
    ctx.quadraticCurveTo(HX - HR*0.65, s*HR*1.0, HX - HR*0.18, s*HR*0.86);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(HX + HR*0.25, s*HR*0.75);
    ctx.quadraticCurveTo(HX + HR*0.4, s*HR*1.25, HX + HR*0.8, s*HR*1.05);
    ctx.quadraticCurveTo(HX + HR*0.55, s*HR*0.9, HX + HR*0.52, s*HR*0.55);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  // 巨顎 + 兩排利齒
  ctx.beginPath(); ctx.ellipse(HX + HR*0.85, 0, r*0.30, r*0.42, 0, 0, 6.29);
  ctx.fillStyle = '#1d0f12'; ctx.fill();
  ctx.strokeStyle = OL; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#efe6d2';
  for(const s of [-1,1]){
    for(let i=0;i<3;i++){
      const tx0 = HX + HR*0.62 + i*r*0.14;
      ctx.beginPath();
      ctx.moveTo(tx0, s*r*0.30); ctx.lineTo(tx0 + r*0.07, s*r*0.10); ctx.lineTo(tx0 + r*0.14, s*r*0.28);
      ctx.closePath(); ctx.fill();
    }
  }
  // 發光眼（豎瞳）
  for(const s of [-1,1]){
    drawGlow(ctx, HX + HR*0.5, s*HR*0.42, '#ff3048', r*0.4, .95);
    ctx.fillStyle = '#ffd24a';
    ctx.beginPath(); ctx.ellipse(HX + HR*0.5, s*HR*0.42, r*0.11, r*0.16, 0, 0, 6.29); ctx.fill();
    ctx.fillStyle = '#3a0a10';
    ctx.beginPath(); ctx.ellipse(HX + HR*0.52, s*HR*0.42, r*0.035, r*0.13, 0, 0, 6.29); ctx.fill();
  }
  ctx.restore();
}

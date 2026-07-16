// ===== 輸入（搖桿+鍵盤）與各 UI 畫面 =====
'use strict';

// ---- 輸入 ----
const JOY = {active:false, id:null, bx:0, by:0, sx:0, sy:0};
const KEYS = {};

function getInput(){
  if(JOY.active){
    let dx = JOY.sx-JOY.bx, dy = JOY.sy-JOY.by;
    const d = Math.hypot(dx,dy);
    if(d<6) return {dx:0,dy:0,mag:0};
    const mag = clamp(d/60, 0, 1);
    return {dx:dx/d, dy:dy/d, mag};
  }
  let dx=0, dy=0;
  if(KEYS['a']||KEYS['arrowleft']) dx-=1;
  if(KEYS['d']||KEYS['arrowright']) dx+=1;
  if(KEYS['w']||KEYS['arrowup']) dy-=1;
  if(KEYS['s']||KEYS['arrowdown']) dy+=1;
  const d = Math.hypot(dx,dy);
  return d>0 ? {dx:dx/d, dy:dy/d, mag:1} : {dx:0,dy:0,mag:0};
}

function bindInput(){
  window.addEventListener('keydown', e=>{ KEYS[e.key.toLowerCase()]=true; });
  window.addEventListener('keyup',   e=>{ KEYS[e.key.toLowerCase()]=false; });

  const start = (id,x,y)=>{
    initAudio();
    if(JOY.active) return;
    JOY.active=true; JOY.id=id; JOY.bx=x; JOY.by=y; JOY.sx=x; JOY.sy=y;
  };
  const move = (id,x,y)=>{
    if(!JOY.active || JOY.id!==id) return;
    JOY.sx=x; JOY.sy=y;
    const dx=JOY.sx-JOY.bx, dy=JOY.sy-JOY.by, d=Math.hypot(dx,dy);
    if(d>60){ JOY.bx=JOY.sx-dx/d*60; JOY.by=JOY.sy-dy/d*60; } // 搖桿跟手
  };
  const end = id=>{ if(JOY.active && JOY.id===id){ JOY.active=false; } };

  cv.addEventListener('touchstart', e=>{ e.preventDefault(); const t=e.changedTouches[0]; start(t.identifier,t.clientX,t.clientY); }, {passive:false});
  cv.addEventListener('touchmove',  e=>{ e.preventDefault(); for(const t of e.changedTouches) move(t.identifier,t.clientX,t.clientY); }, {passive:false});
  cv.addEventListener('touchend',   e=>{ for(const t of e.changedTouches) end(t.identifier); });
  cv.addEventListener('touchcancel',e=>{ for(const t of e.changedTouches) end(t.identifier); });
  cv.addEventListener('mousedown', e=>start('m',e.clientX,e.clientY));
  window.addEventListener('mousemove', e=>move('m',e.clientX,e.clientY));
  window.addEventListener('mouseup', ()=>end('m'));
}

function drawJoystick(){
  if(!JOY.active) return;
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(JOY.bx, JOY.by, 52, 0, 6.29); ctx.stroke();
  ctx.fillStyle = '#ffffff55';
  ctx.beginPath(); ctx.arc(JOY.sx, JOY.sy, 24, 0, 6.29); ctx.fill();
  ctx.globalAlpha = 1;
}

// ---- 畫面切換 ----
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('show'));
  if(id) $(id).classList.add('show');
  $('hud').classList.toggle('show', !id || id==='gmPanel');
}

// ---- 升級三選一 ----
function showLevelUp(){
  const box = $('luCards'); box.innerHTML='';
  for(const ch of buildChoices()){
    const b = document.createElement('button');
    b.className = 'luCard';
    b.style.borderColor = ch.c;
    b.innerHTML = `<div class="ic">${ch.ic}</div><div class="tx"><div class="t">${ch.t}</div>
      <div class="d">${ch.d}</div></div><span class="tag" style="color:${ch.c}">${ch.tag}</span>`;
    b.onclick = ()=>{
      applyChoice(ch);
      showScreen(null);
      if(G){ G.state='run'; addXp(G, 0); if(G.state==='levelup') return; }
    };
    box.appendChild(b);
  }
  showScreen('levelup');
}

// ---- 暫停 ----
function bindPause(){
  $('btnPause').onclick = ()=>{
    if(!G || G.state!=='run') return;
    G.state='pause';
    $('btnSound').textContent = SV.sound?'🔊 音效：開':'🔇 音效：關';
    showScreen('pauseMenu');
  };
  $('btnResume').onclick = ()=>{ if(G) G.state='run'; showScreen(null); };
  $('btnSound').onclick = ()=>{
    SV.sound = !SV.sound; save();
    $('btnSound').textContent = SV.sound?'🔊 音效：開':'🔇 音效：關';
  };
  $('btnQuit').onclick = ()=>{ endToGarage(); };
}

// ---- 結算 ----
function showResult(win){
  const g = G;
  const rw = win ? stageReward(g.stage) : {gold:0, gem:0};
  const gold = g.runGold + rw.gold + (win?0:Math.floor(g.runGold*0)); // 敗北只拿場內金幣
  const gem  = g.runGem + rw.gem;
  g._settle = {win, gold, gem};
  $('rsTitle').textContent = win ? '🏆 關卡完成！' : (g.rush ? '👑 無雙結束！殺爆！' : '💀 車輛全毀…');
  $('rsStats').innerHTML =
    `存活時間 <b>${fmtTime(g.t)}</b><br>擊殺殭屍 <b>${g.kills}</b><br>` +
    `達到等級 <b>Lv.${g.level}</b><br>獲得金幣 <b>💰${fmt(gold)}</b><br>獲得鑽石 <b>💎${fmt(gem)}</b>`;
  $('btnRevive').style.display = (!win && !g.reviveUsed) ? 'block':'none';
  $('btnNext').style.display = (win && g.stage < STAGE_MAX) ? 'block':'none';
  showScreen('result');
}
function settle(){
  const g = G; if(!g || !g._settle) return;
  SV.gold += g._settle.gold; SV.gem += g._settle.gem;
  if(g._settle.win && g.stage >= SV.stageUnlocked && SV.stageUnlocked < STAGE_MAX){
    SV.stageUnlocked = g.stage+1;
    toast('🎉 解鎖第 '+SV.stageUnlocked+' 關！');
  }
  save();
  g._settle = null;
}
function endToGarage(){
  if(G && G._settle) settle();
  G = null;
  showScreen('garage'); renderGarage();
}
function bindResult(){
  $('btnRevive').onclick = ()=>{ if(reviveNow()) showScreen(null); };
  $('btnHome').onclick = ()=>endToGarage();
  $('btnRetry').onclick = ()=>{
    const st = G?G.stage:SV.lastStage, wasRush = !!(G&&G.rush);
    settle(); startRun(st, wasRush);
  };
  $('btnNext').onclick = ()=>{
    const st = G?Math.min(STAGE_MAX, G.stage+1):SV.lastStage;
    settle(); SV.lastStage = st; save(); startRun(st);
  };
}

// ---- 開局 ----
function startRun(stage, rush){
  newRun(stage, rush);
  showScreen(null);
  updateHud();
  toast(rush ? '👑 無雙模式：裝備全滿，火力全開，殺爆屍潮！' : '🧟 第 '+stage+' 關開始！輾爆他們！');
}
function startRush(){ initAudio(); startRun(3, true); }

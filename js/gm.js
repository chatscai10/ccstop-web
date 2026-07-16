// ===== GM 控制台 =====
'use strict';

function gmToast(m){ toast('🛠 '+m); }

function buildGmPanel(){
  const b = $('gmBody');
  b.innerHTML = `
  <div class="gmSec">💰 資源</div>
  <div class="gmRow3">
    <button class="gmBtn" id="gmG1">+1萬金幣</button>
    <button class="gmBtn" id="gmG2">+100萬金幣</button>
    <button class="gmBtn" id="gmG3">+1億金幣</button>
  </div>
  <div class="gmRow3">
    <button class="gmBtn" id="gmD1">+1千鑽石</button>
    <button class="gmBtn" id="gmD2">+10萬鑽石</button>
    <button class="gmBtn" id="gmD3">+1億鑽石</button>
  </div>
  <div class="gmInline">
    <input type="number" id="gmCustom" placeholder="自訂數量…">
    <button class="gmBtn" id="gmCG">加金幣</button>
    <button class="gmBtn" id="gmCD">加鑽石</button>
  </div>

  <div class="gmSec">🎖 帳號 / 裝備</div>
  <div class="gmInline">
    <input type="number" id="gmAccLv" placeholder="設定帳號等級 (現在 Lv.?)">
    <button class="gmBtn" id="gmSetLv">設定</button>
  </div>
  <div class="gmRow">
    <button class="gmBtn" id="gmMaxEq">🌈 全裝備神話滿級</button>
    <button class="gmBtn" id="gmMaxGarage">🔧 改裝全滿 (Lv.50)</button>
  </div>
  <div class="gmRow">
    <button class="gmBtn" id="gmUnlockSt">🗺 解鎖全部關卡</button>
    <button class="gmBtn" id="gmAllCars">🚗 解鎖全部車輛</button>
  </div>
  <div class="gmRow">
    <button class="gmBtn warn" id="gmReset">⚠️ 重置存檔</button>
  </div>

  <div class="gmSec">👑 無雙爽快</div>
  <div class="gmRow">
    <button class="gmBtn" id="gmRush" style="border-color:var(--gold);color:var(--gold)">👑 進入無雙關</button>
    <button class="gmBtn" id="gmMaxAll">💪 爽玩全開</button>
  </div>

  <div class="gmSec">⚔️ 局內作弊（戰鬥中生效）</div>
  <div class="gmRow">
    <button class="gmBtn" id="gmGod">🛡 無敵模式</button>
    <button class="gmBtn" id="gmOneHit">☝️ 一擊必殺</button>
  </div>
  <div class="gmRow">
    <button class="gmBtn" id="gmKillAll">💥 秒殺全場</button>
    <button class="gmBtn" id="gmBoss">👹 立刻召喚 Boss</button>
  </div>
  <div class="gmRow">
    <button class="gmBtn" id="gmLv1">⚡ 立即升 1 級</button>
    <button class="gmBtn" id="gmLv10">⚡⚡ 連升 10 級(自動選)</button>
  </div>
  <div class="gmRow">
    <button class="gmBtn" id="gmVac">🧲 全圖吸取</button>
    <button class="gmBtn" id="gmHeal">❤️ 完全回復</button>
  </div>
  <div class="gmRow">
    <button class="gmBtn" id="gmAllWpn">🔫 七武器全滿級</button>
    <button class="gmBtn" id="gmWin">🏁 直接通關</button>
  </div>

  <div class="gmSec">🎚 倍率調整</div>
  <div class="gmSlider">傷害 <input type="range" id="gmDmg" min="1" max="100" step="1"><b id="gmDmgV">x1</b></div>
  <div class="gmSlider">車速 <input type="range" id="gmSpd" min="0.5" max="5" step="0.1"><b id="gmSpdV">x1</b></div>
  <div class="gmSlider">時間 <input type="range" id="gmTime" min="0.2" max="4" step="0.1"><b id="gmTimeV">x1</b></div>
  `;

  const needRun = fn=>()=>{ if(!G||G.state==='over'||G.state==='clear'){ gmToast('要在戰鬥中才能用'); return; } fn(); };
  const addRes = (k,n)=>{ SV[k]+=n; save(); renderGarage(); gmToast((k==='gold'?'金幣':'鑽石')+' +'+fmt(n)); };

  $('gmG1').onclick = ()=>addRes('gold',1e4);
  $('gmG2').onclick = ()=>addRes('gold',1e6);
  $('gmG3').onclick = ()=>addRes('gold',1e8);
  $('gmD1').onclick = ()=>addRes('gem',1e3);
  $('gmD2').onclick = ()=>addRes('gem',1e5);
  $('gmD3').onclick = ()=>addRes('gem',1e8);
  $('gmCG').onclick = ()=>{ const n=+$('gmCustom').value||0; if(n) addRes('gold',n); };
  $('gmCD').onclick = ()=>{ const n=+$('gmCustom').value||0; if(n) addRes('gem',n); };

  $('gmSetLv').onclick = ()=>{
    const n = Math.max(1, Math.floor(+$('gmAccLv').value||0));
    if(!n){ gmToast('輸入等級數字'); return; }
    SV.accLv = n; save(); renderGarage(); gmToast('帳號等級 → Lv.'+n);
  };
  $('gmMaxEq').onclick = ()=>{
    for(const k in SV.eq){ SV.eq[k].rar = 5; SV.eq[k].lv = 99; }
    save(); renderGarage(); gmToast('全部裝備 → 神話 Lv.99');
  };
  $('gmMaxGarage').onclick = ()=>{
    for(const k in SV.garage) SV.garage[k] = 50;
    save(); renderGarage(); gmToast('四項改裝 → Lv.50');
  };
  $('gmUnlockSt').onclick = ()=>{ SV.stageUnlocked = STAGE_MAX; save(); renderGarage(); gmToast('全 '+STAGE_MAX+' 關已解鎖'); };
  $('gmAllCars').onclick = ()=>{
    for(const k in CARS) SV.cars[k] = true;
    save(); renderGarage(); gmToast('8 台車全部解鎖！左右切換選車');
  };
  $('gmReset').onclick = ()=>{
    if(!confirm('確定重置全部存檔？')) return;
    localStorage.removeItem(SAVE_KEY); SV = defaultSave(); save(); renderGarage(); syncGmUI(); gmToast('已重置');
  };

  $('gmRush').onclick = ()=>{
    gmPrevState = null;
    startRush();
  };
  $('gmMaxAll').onclick = ()=>{
    SV.gm.god = true; SV.gm.dmgMul = 50; SV.gm.spdMul = 1.5;
    for(const k in SV.eq){ SV.eq[k].rar = 5; SV.eq[k].lv = 99; }
    for(const k in SV.garage) SV.garage[k] = 50;
    for(const k in CARS) SV.cars[k] = true;
    SV.stageUnlocked = STAGE_MAX;
    SV.gold += 1e8; SV.gem += 1e8;
    save(); syncGmUI(); renderGarage();
    gmToast('爽玩全開：無敵+傷害x50+神裝+全車+全關+資源1億');
  };
  $('gmGod').onclick = ()=>{ SV.gm.god=!SV.gm.god; save(); syncGmUI(); gmToast('無敵模式 '+(SV.gm.god?'開':'關')); };
  $('gmOneHit').onclick = ()=>{ SV.gm.oneHit=!SV.gm.oneHit; save(); syncGmUI(); gmToast('一擊必殺 '+(SV.gm.oneHit?'開':'關')); };
  $('gmKillAll').onclick = needRun(()=>{
    let n=0; for(const e of [...G.enemies]){ if(!e.dead){ killEnemy(e); n++; } }
    G.shake=10; gmToast('清場 '+n+' 隻');
  });
  $('gmBoss').onclick = needRun(()=>{ if(G.boss){ gmToast('Boss 已在場上'); return; } spawnBoss(); });
  $('gmLv1').onclick = needRun(()=>{ closeGm(); addXp(G, xpNeed(G.level)-G.xp); });
  $('gmLv10').onclick = needRun(()=>{
    for(let i=0;i<10;i++){
      const chs = buildChoices();
      applyChoice(pick(chs));
      G.level++;
    }
    G.xp=0; gmToast('連升 10 級完成（隨機強化）'); sfx('lvup');
  });
  $('gmVac').onclick = needRun(()=>{ for(const gm of G.gems) gm.pull=true; gmToast('全圖吸取！'); });
  $('gmHeal').onclick = needRun(()=>{ G.hp=G.maxHp; gmToast('完全回復'); });
  $('gmAllWpn').onclick = needRun(()=>{
    let i=0;
    for(const k in WEAPONS){ if(i<MAX_WPN_SLOT || (k in G.weapons)){ G.weapons[k]=WPN_MAX_LV; i++; } }
    // 超過欄位上限也全給——GM 就是要爽
    for(const k in WEAPONS) G.weapons[k]=WPN_MAX_LV;
    gmToast('七武器全滿級！');
  });
  $('gmWin').onclick = needRun(()=>{
    if(G.boss) killEnemy(G.boss);
    else { G.state='clearing'; G.clearT=0.5; }
    closeGm(); gmToast('直接通關');
  });

  const bindSlider = (id, vid, key, fmt2)=>{
    const el=$(id), lb=$(vid);
    el.value = SV.gm[key];
    lb.textContent = 'x'+SV.gm[key];
    el.oninput = ()=>{ SV.gm[key]=+el.value; lb.textContent='x'+el.value; save(); };
  };
  bindSlider('gmDmg','gmDmgV','dmgMul');
  bindSlider('gmSpd','gmSpdV','spdMul');
  bindSlider('gmTime','gmTimeV','timeMul');
  syncGmUI();
}

function syncGmUI(){
  $('gmGod').classList.toggle('on', SV.gm.god);
  $('gmOneHit').classList.toggle('on', SV.gm.oneHit);
  $('gmDmg').value = SV.gm.dmgMul; $('gmDmgV').textContent='x'+SV.gm.dmgMul;
  $('gmSpd').value = SV.gm.spdMul; $('gmSpdV').textContent='x'+SV.gm.spdMul;
  $('gmTime').value= SV.gm.timeMul;$('gmTimeV').textContent='x'+SV.gm.timeMul;
}

let gmPrevState = null;
function openGm(){
  if(G && G.state==='run'){ gmPrevState='run'; G.state='pause'; }
  else gmPrevState=null;
  syncGmUI();
  showScreen('gmPanel');
}
function closeGm(){
  if(G && gmPrevState==='run' && G.state==='pause') G.state='run';
  gmPrevState=null;
  if(G && (G.state==='run'||G.state==='pause'||G.state==='levelup'||G.state==='clearing')) showScreen(G.state==='levelup'?'levelup':null);
  else { showScreen('garage'); renderGarage(); }
}
function bindGm(){
  buildGmPanel();
  $('gmFab').onclick = openGm;
  $('btnGmGarage').onclick = openGm;
  $('gmClose').onclick = closeGm;
}

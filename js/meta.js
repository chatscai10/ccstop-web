// ===== 存檔 / 帳號屬性 / 車庫 / 音效 =====
'use strict';

const SAVE_KEY = 'ccstop_save_v1';

function defaultSave(){
  const eq = {};
  for(const k in EQ_SLOTS) eq[k] = {rar:0, lv:1};
  return {
    gold: 300, gem: 200, accLv: 1,
    stageUnlocked: 1, lastStage: 1,
    garage: {body:0, gun:0, armor:0, engine:0},
    eq, sound: true,
    cars: {muscle:true}, curCar: 'muscle',
    gm: {god:false, oneHit:false, dmgMul:1, spdMul:1, timeMul:1},
  };
}

let SV = defaultSave();
function loadSave(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(raw){
      const d = JSON.parse(raw);
      SV = Object.assign(defaultSave(), d);
      SV.garage = Object.assign(defaultSave().garage, d.garage||{});
      SV.eq = Object.assign(defaultSave().eq, d.eq||{});
      SV.gm = Object.assign(defaultSave().gm, d.gm||{});
      SV.cars = Object.assign(defaultSave().cars, d.cars||{});
      if(!CARS[SV.curCar] || !SV.cars[SV.curCar]) SV.curCar = 'muscle';
    }
  }catch(e){ console.warn('讀檔失敗，使用新存檔', e); }
}
function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(SV)); }catch(e){} }

// ---- 帳號整體屬性（車庫改裝 + 裝備 + 帳號等級）----
function calcStats(){
  const g = SV.garage, acc = 1 + (SV.accLv-1)*0.02;
  let maxHp = (100 + g.body*30);
  let dmg   = 1 + g.gun*0.12;
  let def   = Math.min(60, g.armor*3);
  let spd   = 250 + g.engine*10;
  let crit  = 5, ram = 30, magnet = 80, atkSpd = 0;
  for(const k in SV.eq){
    const it = SV.eq[k], s = EQ_SLOTS[k];
    const v = s.base * RARITY_MUL[it.rar] * (1 + (it.lv-1)*0.08);
    if(k==='weapon') dmg += v/100;
    else if(k==='hull') maxHp += v;
    else if(k==='plate') def += v;
    else if(k==='turbo') spd += v;
    else if(k==='chip') crit += v;
    else if(k==='tire') ram += v;
    else if(k==='nitro') spd += v;
    else if(k==='shield') def += v;
    else if(k==='ammo') atkSpd += v;
  }
  const car = CARS[SV.curCar] || CARS.muscle;
  maxHp = Math.floor(maxHp * acc * car.hp);
  dmg *= acc * car.dmg;
  spd = Math.floor(spd * car.spd);
  const ramV = ram * car.ram;
  def = Math.min(75, def);
  return {maxHp, dmg, def, spd, crit:Math.min(80,crit), ram:ramV, magnet, atkSpd};
}
function powerScore(){
  const s = calcStats();
  return Math.floor(s.maxHp + s.dmg*200 + s.def*15 + s.spd + s.crit*10 + s.ram*3);
}
function eqCost(it){ return Math.floor(40 * Math.pow(1.35, it.lv-1) * (1+it.rar*0.5)); }

// ---- Toast ----
let toastT = null;
function toast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(()=>el.classList.remove('show'), 1600);
}

// ---- 音效（WebAudio 合成，免資源檔）----
let AC = null;
function initAudio(){ if(!AC){ try{ AC = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(AC&&AC.state==='suspended') AC.resume(); }
function sfx(type){
  if(!SV.sound || !AC) return;
  const t = AC.currentTime, o = AC.createOscillator(), gn = AC.createGain();
  o.connect(gn); gn.connect(AC.destination);
  let dur = 0.08, vol = 0.05;
  if(type==='shoot'){ o.type='square'; o.frequency.setValueAtTime(880,t); o.frequency.exponentialRampToValueAtTime(220,t+0.06); vol=0.018; dur=0.06; }
  else if(type==='hit'){ o.type='sawtooth'; o.frequency.setValueAtTime(160,t); o.frequency.exponentialRampToValueAtTime(60,t+0.1); vol=0.05; dur=0.1; }
  else if(type==='pick'){ o.type='sine'; o.frequency.setValueAtTime(660,t); o.frequency.exponentialRampToValueAtTime(1320,t+0.07); vol=0.04; dur=0.08; }
  else if(type==='lvup'){ o.type='triangle'; o.frequency.setValueAtTime(523,t); o.frequency.setValueAtTime(659,t+0.09); o.frequency.setValueAtTime(784,t+0.18); vol=0.07; dur=0.3; }
  else if(type==='boom'){ o.type='sawtooth'; o.frequency.setValueAtTime(90,t); o.frequency.exponentialRampToValueAtTime(30,t+0.28); vol=0.09; dur=0.3; }
  else if(type==='hurt'){ o.type='square'; o.frequency.setValueAtTime(200,t); o.frequency.exponentialRampToValueAtTime(80,t+0.14); vol=0.06; dur=0.15; }
  gn.gain.setValueAtTime(vol,t); gn.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.start(t); o.stop(t+dur+0.02);
}

// ---- 車庫 UI ----
function $(id){ return document.getElementById(id); }

function renderGarage(){
  $('gGold').textContent = fmt(SV.gold);
  $('gGem').textContent  = fmt(SV.gem);
  $('pLv').textContent   = SV.accLv;
  $('pPower').textContent= fmt(powerScore());
  $('pStage').textContent= SV.stageUnlocked;

  // 改裝
  const ug = $('upGrid'); ug.innerHTML = '';
  for(const k in GARAGE_UP){
    const u = GARAGE_UP[k], lv = SV.garage[k], cost = u.cost(lv);
    const div = document.createElement('div');
    div.className = 'upCard card';
    div.innerHTML = `<div class="t">${u.ic} ${u.name} <span style="color:var(--gold)">Lv.${lv}</span></div>
      <div class="v">${u.d(lv)}</div>`;
    const b = document.createElement('button');
    b.textContent = `升級 💰${fmt(cost)}`;
    if(SV.gold < cost) b.classList.add('dis');
    b.onclick = ()=>{
      if(SV.gold < cost){ toast('金幣不足'); return; }
      SV.gold -= cost; SV.garage[k]++; SV.accLv++; save(); sfx('lvup'); renderGarage();
    };
    div.appendChild(b); ug.appendChild(div);
  }

  // 裝備
  const eg = $('eqGrid'); eg.innerHTML = '';
  for(const k in EQ_SLOTS){
    const s = EQ_SLOTS[k], it = SV.eq[k], cost = eqCost(it);
    const v = s.base * RARITY_MUL[it.rar] * (1 + (it.lv-1)*0.08);
    const div = document.createElement('div');
    div.className = `eqCard bd${it.rar}`;
    div.innerHTML = `<div class="ic">${s.ic}</div><div class="n">${s.name}</div>
      <div class="r r${it.rar}">${RARITY[it.rar]}</div>
      <div class="lv">Lv.${it.lv} · ${s.stat}+${v.toFixed(0)}</div>
      <div class="lv" style="color:var(--gold)">強化 💰${fmt(cost)}</div>`;
    div.onclick = ()=>{
      if(SV.gold < cost){ toast('金幣不足'); return; }
      SV.gold -= cost; it.lv++; save(); sfx('pick'); renderGarage();
    };
    eg.appendChild(div);
  }

  // 關卡
  const sr = $('stageRow'); sr.innerHTML = '';
  for(let i=1;i<=STAGE_MAX;i++){
    const b = document.createElement('button');
    b.className = 'stBtn' + (i>SV.stageUnlocked?' lock':'') + (i===SV.lastStage?' on':'');
    b.innerHTML = `第${i}關<small>${i>SV.stageUnlocked?'🔒 未解鎖':'強度 x'+stageScale(i).toFixed(1)}</small>`;
    b.onclick = ()=>{
      if(i>SV.stageUnlocked){ toast('先通過前面的關卡（或用 GM 解鎖）'); return; }
      SV.lastStage = i; save(); renderGarage();
    };
    sr.appendChild(b);
  }
  renderCarPanel();
}

// 抽裝備
function gachaOnce(){
  const roll = Math.random()*100;
  let rar = roll<45?0 : roll<72?1 : roll<88?2 : roll<96?3 : roll<99.2?4 : 5;
  const k = pick(Object.keys(EQ_SLOTS));
  const it = SV.eq[k];
  let msg;
  if(rar > it.rar){ it.rar = rar; it.lv = Math.max(it.lv,1); msg = `獲得 ${RARITY[rar]}·${EQ_SLOTS[k].name}，已自動裝備！`; }
  else { const g = 20*(rar+1); SV.gold += g; msg = `重複 ${RARITY[rar]}·${EQ_SLOTS[k].name}，分解成 💰${g}`; }
  return {rar, msg};
}
function bindGacha(){
  $('btnGacha').onclick = ()=>{
    if(SV.gem<100){ toast('鑽石不足（GM 面板可以加）'); return; }
    SV.gem-=100; const r=gachaOnce(); save(); sfx(r.rar>=3?'lvup':'pick'); toast(r.msg); renderGarage();
  };
  $('btnGacha10').onclick = ()=>{
    if(SV.gem<900){ toast('鑽石不足（GM 面板可以加）'); return; }
    SV.gem-=900; let best=0, bestMsg='';
    for(let i=0;i<10;i++){ const r=gachaOnce(); if(r.rar>=best){best=r.rar; bestMsg=r.msg;} }
    save(); sfx('lvup'); toast('十連完成！最佳：'+bestMsg); renderGarage();
  };
}

// ---- 車庫展示車 + 車輛切換 ----
let viewCar = null;
function carKeys(){ return Object.keys(CARS); }

function drawGarageCar(){
  const c = $('carCanvas'), x = c.getContext('2d');
  x.clearRect(0,0,c.width,c.height);
  SV.viewCar = viewCar || SV.curCar;
  x.save(); x.translate(c.width/2, c.height/2);
  const key = SV.viewCar, cd = CAR_DRAW[key]||CAR_DRAW.muscle;
  const sc = Math.min(2.1, 190/cd.L); // 長車自動縮
  x.scale(sc,sc); x.rotate(-Math.PI/2);
  drawCarBody(x, 0, performance.now()/1000);
  x.restore();
}

function renderCarPanel(){
  if(!viewCar) viewCar = SV.curCar;
  const key = viewCar, car = CARS[key];
  const owned = !!SV.cars[key], active = SV.curCar===key;
  $('carName').innerHTML = `${car.ic} <b>${car.name}</b>`;
  $('carDesc').textContent = car.d;
  $('carStats').innerHTML =
    `<span>❤️ 生命 x${car.hp}</span><span>💨 速度 x${car.spd}</span>` +
    `<span>💥 衝撞 x${car.ram}</span><span>⚔️ 傷害 x${car.dmg}</span>`;
  const btn = $('carAction');
  if(active){ btn.textContent = '✅ 出戰中'; btn.className = 'btnSub dis'; }
  else if(owned){ btn.textContent = '🔧 選用這台'; btn.className = 'btnSub'; }
  else { btn.textContent = `💰 ${fmt(car.price)} 購買`; btn.className = 'btnSub'; }
  btn.onclick = ()=>{
    if(active) return;
    if(owned){ SV.curCar = key; save(); sfx('pick'); toast(car.name+' 出戰！'); renderGarage(); return; }
    if(SV.gold < car.price){ toast('金幣不足（GM 面板可以加）'); return; }
    SV.gold -= car.price; SV.cars[key] = true; SV.curCar = key;
    save(); sfx('lvup'); toast('🎉 購入 '+car.name+'！'); renderGarage();
  };
  drawGarageCar();
}
function bindCarNav(){
  const shift = dir=>{
    const ks = carKeys();
    let i = ks.indexOf(viewCar||SV.curCar);
    i = (i + dir + ks.length) % ks.length;
    viewCar = ks[i]; sfx('pick'); renderCarPanel();
  };
  $('carPrev').onclick = ()=>shift(-1);
  $('carNext').onclick = ()=>shift(1);
}

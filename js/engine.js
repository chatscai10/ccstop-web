// ===== 局內引擎：狀態 / 生怪 / 碰撞 / 升級 / 人質 / Boss =====
'use strict';

let G = null; // 當前對局

// 無雙模式：滿配屬性（不動存檔，保留車輛特性）
function rushStats(){
  const car = CARS[SV.curCar] || CARS.muscle;
  return {maxHp:Math.floor(99999*car.hp), dmg:40*car.dmg, def:85, spd:Math.floor(430*car.spd),
          crit:50, ram:600*car.ram, magnet:340, atkSpd:50};
}

function newRun(stage, rush){
  const st = rush ? rushStats() : calcStats();
  const car = CARS[SV.curCar] || CARS.muscle;
  groundPat = null; // 依關卡主題重生成地面
  G = {
    stage, t:0, state:'run', rush:!!rush,
    theme: stageTheme(stage),
    carKey: SV.curCar, carR: car.cr,
    maxEnemy: rush ? 400 : MAX_ENEMY,
    nextBossT: rush ? 30 : BOSS_AT,
    stats: st,
    x: WORLD/2, y: WORLD/2, vx:0, vy:0, ang:-Math.PI/2,
    hp: st.maxHp, maxHp: st.maxHp,
    level:1, xp:0, kills:0, runGold:0, runGem:0,
    weapons:{gun:1}, passives:{},
    buffDmg:0, invulnT:0, reviveUsed:false, nitroT:0,
    enemies:[], bullets:[], ebullets:[], gems:[], pools:[], blades:[],
    fxs:[], parts:[], stains:[], floats:[], hostages:[],
    boss:null, bossName:pick(BOSS_NAMES), bossSpawned:false,
    spawnAcc:0, hostageT:8, shake:0, aimAng:-Math.PI/2,
    wcd:{}, windAng:0, clearT:0,
  };
  for(const k in WEAPONS) G.wcd[k]=0;
  if(rush){
    for(const k in WEAPONS) G.weapons[k] = WPN_MAX_LV;
    for(const k in PASSIVES) G.passives[k] = PASSIVES[k].max;
    G.maxHp = Math.floor(st.maxHp * (1 + G.passives.body*0.2));
    G.hp = G.maxHp;
  }
  return G;
}

// ---- 玩家實際屬性（含被動與 GM 倍率）----
function pMaxSpd(){ return G.stats.spd * (1 + (G.passives.engine||0)*0.08) * SV.gm.spdMul * (G.nitroT>0?1.6:1); }
function pDef(){ return Math.min(85, G.stats.def + (G.passives.armor||0)*8); }
function pDmgMul(){ return G.stats.dmg * (1 + (G.passives.power||0)*0.10 + G.buffDmg) * SV.gm.dmgMul; }
function pMagnet(){ return G.stats.magnet * (1 + (G.passives.magnet||0)*0.4); }
function pRam(){ return G.stats.ram * (1 + (G.passives.ram||0)*0.25); }
function pCrit(){ return Math.min(95, G.stats.crit + (G.passives.crit||0)*8); }
function cdMul(){ return Math.max(0.3, (1 - 0.07*(G.passives.cool||0)) / (1 + (G.stats.atkSpd||0)/100)); }

// ---- 經驗 ----
function addXp(g, n){
  g.xp += n;
  if(g.state!=='run') return; // 升級面板開啟中先攢經驗，關閉後由選卡流程再結算
  if(g.rush){ // 無雙模式全滿級，升級直接換獎勵不彈窗
    while(g.xp >= xpNeed(g.level)){
      g.xp -= xpNeed(g.level); g.level++;
      g.runGold += 20; g.hp = Math.min(g.maxHp, g.hp + g.maxHp*0.03);
    }
    return;
  }
  if(g.xp >= xpNeed(g.level)){
    g.xp -= xpNeed(g.level); g.level++;
    g.state='levelup'; showLevelUp(); sfx('lvup');
  }
}

// ---- 生怪 ----
function foeTypeByTime(t){
  const r = Math.random();
  if(G.rush){
    if(r<0.14) return 'brute';
    if(r<0.30) return 'spitter';
    if(r<0.60) return 'runner';
    return 'walker';
  }
  if(t>45 && r<0.12) return 'brute';
  if(t>30 && r<0.27) return 'spitter';
  if(t>18 && r<0.55) return 'runner';
  return 'walker';
}
function spawnEnemy(type, px, py){
  if(G.enemies.length >= G.maxEnemy) return null;
  const d = FOES[type], sc = stageScale(G.stage) * (1 + G.t/240);
  let x=px, y=py;
  if(x===undefined){
    const a = rnd(0, Math.PI*2), r = Math.max(innerWidth, innerHeight)*0.62 + rnd(0,120);
    x = clamp(G.x + Math.cos(a)*r, 40, WORLD-40);
    y = clamp(G.y + Math.sin(a)*r, 40, WORLD-40);
  }
  const e = {type, x, y, r:d.r, variant:irnd(0,2), hp:d.hp*sc, maxHp:d.hp*sc, spd:d.spd*rnd(0.9,1.15),
    dmg:d.dmg*sc, xp:d.xp, gold:d.gold, c1:d.c1, c2:d.c2,
    atkCd:0, ramCd:0, windCd:0, slow:0, burn:0, burnDps:0,
    wob:rnd(0,6.28), jit:rnd(-0.5,0.5), spitCd:rnd(1,2.5),
    chargeT:0, chargeCd:5, teleT:0, dead:false};
  G.enemies.push(e);
  return e;
}
function spawnBoss(){
  const e = spawnEnemy('boss');
  if(!e){ G.enemies.length = Math.floor(G.maxEnemy*0.5); return spawnBoss(); }
  G.boss = e; G.bossSpawned = true;
  toast('⚠️ '+G.bossName+' 出現了！'); sfx('boom');
  return e;
}

// ---- 傷害 ----
function dealDamage(e, base, opt){
  if(!G || e.dead) return;
  opt = opt||{};
  let dmg = base * pDmgMul();
  let crit = false;
  if(Math.random()*100 < pCrit()){ dmg*=2; crit=true; }
  if(SV.gm.oneHit) dmg = e.hp + 1;
  e.hp -= dmg;
  if(!opt.quiet) addFloat(e.x+rnd(-8,8), e.y-e.r-6, fmt(dmg), crit?'#ffae00':'#fff', crit);
  if(opt.slow) e.slow = Math.max(e.slow, opt.slow);
  if(opt.burn){ e.burn = 2.5; e.burnDps = opt.burn; }
  if(opt.kx){ e.x+=opt.kx; e.y+=opt.ky; }
  if(e.hp<=0) killEnemy(e);
}
function killEnemy(e){
  if(e.dead) return;
  e.dead = true; G.kills++;
  G.runGold += e.gold;
  if(G.passives.steal) G.hp = Math.min(G.maxHp, G.hp + G.maxHp*0.004*G.passives.steal);
  addStain(e.x, e.y, e.r*1.5);
  addBurst(e.x, e.y, e.c1, e.type==='boss'?40:8);
  if(G.gems.length > 340){ const g0 = pick(G.gems); g0.v += e.xp; }
  else G.gems.push({x:e.x+rnd(-6,6), y:e.y+rnd(-6,6), v:e.xp, pull:false, heart:false});
  if(Math.random()<0.02) G.gems.push({x:e.x, y:e.y, v:0, pull:false, heart:true});
  G.fxs.push({kind:'ring', x:e.x, y:e.y, max:e.r*2.6, t:0.35, dur:0.35, color:e.type==='boss'?'#ff2255':'#ffae66'});
  if(e.type==='boss'){
    G.boss = null; sfx('boom'); G.shake = 14;
    if(G.rush){
      G.bossSpawned = false; G.nextBossT = G.t + 25;
      G.runGold += 200; G.runGem += 20;
      toast('👑 擊殺 Boss！金幣+200 鑽石+20，25 秒後下一隻');
    } else {
      G.state='clearing'; G.clearT = 1.2;
    }
  } else sfx('hit');
}
function playerHurt(dmg){
  if(SV.gm.god || G.invulnT>0) return;
  const real = dmg * (1 - pDef()/100);
  G.hp -= real; G.shake = Math.max(G.shake, 5); sfx('hurt');
  addFloat(G.x, G.y-40, '-'+fmt(real), '#ff5a5a', false);
  if(G.hp<=0){ G.hp=0; G.state='over'; showResult(false); }
}

// ---- 主更新 ----
function updateRun(dt){
  const g = G;
  g.t += dt;
  if(g.invulnT>0) g.invulnT-=dt;
  if(g.nitroT>0) g.nitroT-=dt;

  // 玩家移動
  const inp = getInput();
  const max = pMaxSpd();
  const dvx = inp.dx*max*inp.mag, dvy = inp.dy*max*inp.mag;
  const k = Math.min(1, dt*4.2);
  g.vx += (dvx-g.vx)*k; g.vy += (dvy-g.vy)*k;
  g.x = clamp(g.x + g.vx*dt, 30, WORLD-30);
  g.y = clamp(g.y + g.vy*dt, 30, WORLD-30);
  const spd = Math.hypot(g.vx, g.vy);
  if(spd>25){
    const ta = Math.atan2(g.vy, g.vx);
    let da = ta - g.ang;
    while(da>Math.PI) da-=Math.PI*2; while(da<-Math.PI) da+=Math.PI*2;
    g.ang += da*Math.min(1, dt*8);
  }
  // 維修機器人
  if(g.passives.repair) g.hp = Math.min(g.maxHp, g.hp + g.maxHp*0.01*g.passives.repair*dt);

  // 生怪
  const rate = g.rush ? (26 + g.t*0.3) : (1.0 + g.t*0.032 + g.stage*0.3);
  g.spawnAcc += rate * dt;
  while(g.spawnAcc>=1){ g.spawnAcc-=1; spawnEnemy(foeTypeByTime(g.t)); }
  if(!g.bossSpawned && g.t>=g.nextBossT) spawnBoss();

  updateEnemies(dt, spd, max);
  updateWeapons(dt);
  updateBullets(dt);
  updateGems(dt);
  updateHostages(dt);
  updateFx(dt);

  if(g.state==='clearing'){
    g.clearT -= dt;
    if(g.clearT<=0){ g.state='clear'; showResult(true); }
  }
}

// 範圍爆炸（火箭/導彈）
function explode(x, y, r, dmg){
  const g = G;
  for(const e of g.enemies){
    if(e.dead) continue;
    if(dist2(e.x,e.y,x,y) < (r+e.r)*(r+e.r)) dealDamage(e, dmg);
  }
  g.fxs.push({kind:'ring', x, y, max:r, t:0.3, dur:0.3, color:'#ffb066'});
  addBurst(x, y, '#ff8c42', 10);
  g.shake = Math.max(g.shake, 4);
  sfx('boom');
}

function updateEnemies(dt, carSpd, carMax){
  const g = G, carR = g.carR || 30;
  for(let i=g.enemies.length-1; i>=0; i--){
    const e = g.enemies[i];
    if(e.dead){ g.enemies.splice(i,1); continue; }
    if(e.atkCd>0) e.atkCd-=dt;
    if(e.ramCd>0) e.ramCd-=dt;
    if(e.windCd>0) e.windCd-=dt;
    if(e.sawCd>0) e.sawCd-=dt;
    if(e.slow>0) e.slow-=dt;
    if(e.burn>0){ e.burn-=dt; e.hp-=e.burnDps*pDmgMul()*dt; if(e.hp<=0){ killEnemy(e); continue; } }
    e.wob += dt*6;

    const dx = g.x-e.x, dy = g.y-e.y, d = Math.hypot(dx,dy)||1;
    e.face = Math.atan2(dy,dx); // 永遠面向玩家（伸手抓人）
    let mv = e.spd * (e.slow>0?0.45:1);

    if(e.type==='boss'){
      e.chargeCd -= dt;
      if(e.teleT>0){ e.teleT-=dt; mv=0; if(e.teleT<=0){ e.chargeT=0.9; e.cAng=Math.atan2(dy,dx); } }
      else if(e.chargeT>0){
        e.chargeT-=dt;
        e.x += Math.cos(e.cAng)*e.spd*4.2*dt; e.y += Math.sin(e.cAng)*e.spd*4.2*dt;
        mv = 0;
      }
      else if(e.chargeCd<=0){ e.teleT=0.8; e.chargeCd=6; }
      if(Math.random()<dt*0.5) spawnEnemy('walker', e.x+rnd(-60,60), e.y+rnd(-60,60));
    }
    else if(e.type==='spitter' && d<300){
      mv = 0;
      e.spitCd -= dt;
      if(e.spitCd<=0){
        e.spitCd = 2.4;
        const a = Math.atan2(dy,dx);
        g.ebullets.push({x:e.x, y:e.y, vx:Math.cos(a)*240, vy:Math.sin(a)*240, dmg:e.dmg, life:2.2});
      }
    }
    if(mv>0){
      const ja = Math.atan2(dy,dx) + e.jit*0.35*Math.sin(e.wob*0.5);
      e.x += Math.cos(ja)*mv*dt; e.y += Math.sin(ja)*mv*dt;
    }
    e.x = clamp(e.x, 20, WORLD-20); e.y = clamp(e.y, 20, WORLD-20);

    // 車體碰撞
    const rr = carR + e.r;
    if(d < rr){
      if(carSpd > 110 && e.ramCd<=0){
        e.ramCd = 0.35;
        const kb = 40 + carSpd*0.25;
        dealDamage(e, pRam()*(0.5+carSpd/carMax), {kx:-dx/d*kb, ky:-dy/d*kb});
        g.vx*=0.92; g.vy*=0.92; g.shake=Math.max(g.shake,3);
        addBurst(e.x, e.y, '#ff5a3c', 4);
      } else if(e.atkCd<=0){
        e.atkCd = 0.9;
        playerHurt(e.dmg);
      }
      // 推開避免重疊
      e.x -= dx/d*(rr-d)*0.5; e.y -= dy/d*(rr-d)*0.5;
    }
  }
  // 敵方子彈
  for(let i=g.ebullets.length-1;i>=0;i--){
    const b = g.ebullets[i];
    b.x+=b.vx*dt; b.y+=b.vy*dt; b.life-=dt;
    if(b.life<=0){ g.ebullets.splice(i,1); continue; }
    if(dist2(b.x,b.y,g.x,g.y) < 30*30){ playerHurt(b.dmg); g.ebullets.splice(i,1); }
  }
}

function updateGems(dt){
  const g = G, mr = pMagnet();
  for(let i=g.gems.length-1;i>=0;i--){
    const gm = g.gems[i];
    const d2 = dist2(gm.x,gm.y,g.x,g.y);
    if(gm.pull || d2 < mr*mr){
      gm.pull = true;
      const d = Math.sqrt(d2)||1;
      const sp = 420 + (mr - d)*2;
      gm.x += (g.x-gm.x)/d*sp*dt; gm.y += (g.y-gm.y)/d*sp*dt;
      if(d < 28){
        g.gems.splice(i,1);
        if(gm.heart){ g.hp=Math.min(g.maxHp, g.hp+g.maxHp*0.15); addFloat(g.x,g.y-40,'+HP','#7cf75c',false); }
        else addXp(g, gm.v);
        sfx('pick');
      }
    }
  }
}

function updateHostages(dt){
  const g = G;
  g.hostageT -= dt;
  if(g.hostageT<=0 && g.hostages.length<2){
    g.hostageT = 22;
    const a = rnd(0,6.28), r = rnd(450,850);
    g.hostages.push({x:clamp(g.x+Math.cos(a)*r,60,WORLD-60), y:clamp(g.y+Math.sin(a)*r,60,WORLD-60), prog:0});
  }
  for(let i=g.hostages.length-1;i>=0;i--){
    const h = g.hostages[i];
    if(dist2(h.x,h.y,g.x,g.y) < 75*75){
      h.prog += dt/1.5;
      if(h.prog>=1){
        g.hostages.splice(i,1);
        const buff = pick(RESCUE_BUFFS);
        buff.apply(g);
        toast(buff.ic+' 救援成功！'+buff.msg);
        addBurst(h.x, h.y, '#ffd24a', 16); sfx('lvup');
      }
    } else h.prog = Math.max(0, h.prog - dt*0.6);
  }
}

// ---- 特效 ----
function addFloat(x,y,txt,c,big){
  const g=G; if(!g) return;
  if(g.floats.length>60) g.floats.shift();
  g.floats.push({x,y,txt,c,big,t:0.8});
}
function addStain(x,y,r){
  const g=G; if(g.stains.length>140) g.stains.shift();
  g.stains.push({x,y,r,t:14});
}
function addBurst(x,y,c,n){
  const g=G; if(g.parts.length>250) g.parts.splice(0, n);
  for(let i=0;i<n;i++){
    const a=rnd(0,6.28), s=rnd(40,220);
    g.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,c,t:rnd(0.25,0.6),r:rnd(2,5)});
  }
}
function updateFx(dt){
  const g=G;
  for(let i=g.floats.length-1;i>=0;i--){ const f=g.floats[i]; f.t-=dt; f.y-=45*dt; if(f.t<=0) g.floats.splice(i,1); }
  for(let i=g.parts.length-1;i>=0;i--){ const p=g.parts[i]; p.t-=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=0.92; p.vy*=0.92; if(p.t<=0) g.parts.splice(i,1); }
  for(let i=g.stains.length-1;i>=0;i--){ const s=g.stains[i]; s.t-=dt; if(s.t<=0) g.stains.splice(i,1); }
  for(let i=g.fxs.length-1;i>=0;i--){ const f=g.fxs[i]; f.t-=dt; if(f.t<=0) g.fxs.splice(i,1); }
  for(let i=g.pools.length-1;i>=0;i--){
    const p=g.pools[i]; p.t-=dt;
    if(p.t<=0){ g.pools.splice(i,1); continue; }
    for(const e of g.enemies){
      if(e.dead) continue;
      const d2 = dist2(e.x,e.y,p.x,p.y);
      if(d2 < p.r*p.r){
        e.hp -= p.dps*pDmgMul()*dt*(SV.gm.oneHit?999:1);
        if(p.pull && e.type!=='boss'){ // 黑洞吸力
          const d = Math.sqrt(d2)||1;
          e.x += (p.x-e.x)/d*p.pull*dt; e.y += (p.y-e.y)/d*p.pull*dt;
        }
        if(e.hp<=0) killEnemy(e);
      }
    }
  }
  if(g.shake>0) g.shake = Math.max(0, g.shake - dt*30);
}

// ---- 復活 ----
function reviveNow(){
  if(!G || G.reviveUsed) return false;
  G.reviveUsed = true;
  G.hp = G.maxHp; G.invulnT = 3; G.state = 'run';
  for(const e of G.enemies){ if(e!==G.boss && dist2(e.x,e.y,G.x,G.y)<400*400) killEnemy(e); }
  toast('🔧 緊急維修完成，無敵 3 秒！');
  return true;
}

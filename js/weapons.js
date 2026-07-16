// ===== 武器系統：七屬性 + 升級選項池 =====
'use strict';

function nearestFoe(x, y, maxR){
  let best=null, bd=(maxR||800)*(maxR||800);
  for(const e of G.enemies){
    if(e.dead) continue;
    const d2 = dist2(e.x,e.y,x,y);
    if(d2<bd){ bd=d2; best=e; }
  }
  return best;
}

function updateWeapons(dt){
  const g = G;
  for(const key in g.weapons){
    const lv = g.weapons[key];
    if(lv<=0) continue;
    const W = WEAPONS[key], s = W.stat(lv);
    g.wcd[key] -= dt;

    if(key==='wind'){
      g.windAng += s.rot*dt;
      for(let i=0;i<s.n;i++){
        const a = g.windAng + i*(Math.PI*2/s.n);
        const bx = g.x + Math.cos(a)*s.r, by = g.y + Math.sin(a)*s.r;
        for(const e of g.enemies){
          if(!e.dead && e.windCd<=0 && dist2(e.x,e.y,bx,by) < (16+e.r)*(16+e.r)){
            e.windCd = 0.4;
            dealDamage(e, s.dmg);
          }
        }
      }
      continue;
    }
    if(key==='saw'){
      // 車頭鋸盤：前方持續絞碎
      const cd = CAR_DRAW[g.carKey]||CAR_DRAW.muscle;
      const bx = g.x + Math.cos(g.ang)*(cd.L/2+14), by = g.y + Math.sin(g.ang)*(cd.L/2+14);
      g.sawPos = {x:bx, y:by, r:s.range*0.33};
      for(const e of g.enemies){
        if(!e.dead && (e.sawCd||0)<=0 && dist2(e.x,e.y,bx,by) < (s.range*0.33+e.r)*(s.range*0.33+e.r)){
          e.sawCd = 0.25;
          dealDamage(e, s.dmg, {kx:Math.cos(g.ang)*8, ky:Math.sin(g.ang)*8});
        }
      }
      continue;
    }
    if(g.wcd[key]>0) continue;

    if(key==='gun'){
      const t = nearestFoe(g.x,g.y,700);
      if(!t) continue;
      g.wcd[key] = s.rate * cdMul();
      const a = Math.atan2(t.y-g.y, t.x-g.x);
      g.aimAng = a;
      for(let i=0;i<s.n;i++){
        const off = (i-(s.n-1)/2)*0.09;
        g.bullets.push({x:g.x+Math.cos(a)*30, y:g.y+Math.sin(a)*30,
          vx:Math.cos(a+off)*s.spd, vy:Math.sin(a+off)*s.spd,
          dmg:s.dmg, pierce:1, life:1.1, color:W.color, r:4, kind:'gun'});
      }
      sfx('shoot');
    }
    else if(key==='fire'){
      const t = nearestFoe(g.x,g.y,s.range+40);
      if(!t) continue;
      g.wcd[key] = s.rate * cdMul();
      const a = Math.atan2(t.y-g.y, t.x-g.x) + rnd(-0.22,0.22);
      const sp = rnd(300,420);
      g.bullets.push({x:g.x+Math.cos(a)*32, y:g.y+Math.sin(a)*32,
        vx:Math.cos(a)*sp, vy:Math.sin(a)*sp,
        dmg:s.dmg, pierce:3, life:s.range/sp, color:W.color, r:rnd(6,11), kind:'fire', burn:s.burn});
    }
    else if(key==='ice'){
      const t = nearestFoe(g.x,g.y,650);
      if(!t) continue;
      g.wcd[key] = s.rate * cdMul();
      const a = Math.atan2(t.y-g.y, t.x-g.x);
      g.bullets.push({x:g.x, y:g.y, vx:Math.cos(a)*s.spd, vy:Math.sin(a)*s.spd,
        dmg:s.dmg, pierce:s.pierce, life:1.3, color:W.color, r:6, kind:'ice', slow:s.slow});
    }
    else if(key==='poison'){
      const t = nearestFoe(g.x,g.y,520);
      if(!t) continue;
      g.wcd[key] = s.rate * cdMul();
      g.pools.push({x:t.x+rnd(-20,20), y:t.y+rnd(-20,20), r:s.r, dps:s.dmg, t:s.dur, kind:'poison'});
    }
    else if(key==='rocket'){
      const t = nearestFoe(g.x,g.y,720);
      if(!t) continue;
      g.wcd[key] = s.rate * cdMul();
      const a = Math.atan2(t.y-g.y, t.x-g.x);
      g.bullets.push({x:g.x, y:g.y, vx:Math.cos(a)*s.spd, vy:Math.sin(a)*s.spd,
        dmg:s.dmg, pierce:1, life:1.9, color:WEAPONS.rocket.color, r:7, kind:'rocket', aoe:s.r});
      sfx('shoot');
    }
    else if(key==='missile'){
      const t = nearestFoe(g.x,g.y,700);
      if(!t) continue;
      g.wcd[key] = s.rate * cdMul();
      for(let i=0;i<s.n;i++){
        const a = g.ang + rnd(-1.6,1.6);
        g.bullets.push({x:g.x, y:g.y, vx:Math.cos(a)*s.spd*0.6, vy:Math.sin(a)*s.spd*0.6,
          dmg:s.dmg, pierce:1, life:2.6, color:WEAPONS.missile.color, r:5, kind:'missile',
          aoe:s.r, spd:s.spd, tgt:t});
      }
      sfx('shoot');
    }
    else if(key==='vortex'){
      const t = nearestFoe(g.x,g.y,600);
      if(!t) continue;
      g.wcd[key] = s.rate * cdMul();
      g.pools.push({x:t.x, y:t.y, r:s.r, dps:s.dmg, t:s.dur, kind:'vortex', pull:s.pull});
      sfx('boom');
    }
    else if(key==='holy'){
      if(!nearestFoe(g.x,g.y,s.r)) continue;
      g.wcd[key] = s.rate * cdMul();
      for(const e of g.enemies){
        if(!e.dead && dist2(e.x,e.y,g.x,g.y) < s.r*s.r) dealDamage(e, s.dmg);
      }
      g.fxs.push({kind:'flash', t:0.3, dur:0.3});
      g.fxs.push({kind:'ring', x:g.x, y:g.y, max:s.r, t:0.4, dur:0.4, color:'#fff3b0'});
      g.shake = Math.max(g.shake, 6);
      sfx('boom');
    }
    else if(key==='thunder'){
      const t = nearestFoe(g.x,g.y,600);
      if(!t) continue;
      g.wcd[key] = s.rate * cdMul();
      let cur = t, pts = [{x:g.x,y:g.y}], hitSet = new Set();
      for(let c=0; c<=s.chain && cur; c++){
        pts.push({x:cur.x, y:cur.y});
        hitSet.add(cur);
        dealDamage(cur, s.dmg);
        let nxt=null, bd=280*280;
        for(const e of G.enemies){
          if(e.dead||hitSet.has(e)) continue;
          const d2 = dist2(e.x,e.y,cur.x,cur.y);
          if(d2<bd){ bd=d2; nxt=e; }
        }
        cur = nxt;
      }
      G.fxs.push({kind:'bolt', pts, t:0.16, color:WEAPONS.thunder.color});
      sfx('hit');
    }
    else if(key==='laser'){
      const t = nearestFoe(g.x,g.y,750);
      if(!t) continue;
      g.wcd[key] = s.rate * cdMul();
      const a = Math.atan2(t.y-g.y, t.x-g.x);
      const ex = g.x+Math.cos(a)*800, ey = g.y+Math.sin(a)*800;
      for(const e of G.enemies){
        if(e.dead) continue;
        // 點到線段距離
        const t1 = clamp(((e.x-g.x)*(ex-g.x)+(e.y-g.y)*(ey-g.y))/(800*800), 0, 1);
        const px = g.x+(ex-g.x)*t1, py = g.y+(ey-g.y)*t1;
        if(dist2(e.x,e.y,px,py) < (s.w+e.r)*(s.w+e.r)) dealDamage(e, s.dmg);
      }
      G.fxs.push({kind:'laser', x1:g.x, y1:g.y, x2:ex, y2:ey, w:s.w, t:0.18, color:WEAPONS.laser.color});
      sfx('shoot');
    }
  }
}

function updateBullets(dt){
  const g = G;
  for(let i=g.bullets.length-1; i>=0; i--){
    const b = g.bullets[i];
    if(b.kind==='missile'){ // 追蹤轉向
      if(!b.tgt || b.tgt.dead) b.tgt = nearestFoe(b.x, b.y, 520);
      if(b.tgt){
        const ta = Math.atan2(b.tgt.y-b.y, b.tgt.x-b.x);
        let ca = Math.atan2(b.vy, b.vx);
        let da = ta-ca;
        while(da>Math.PI) da-=6.283; while(da<-Math.PI) da+=6.283;
        ca += clamp(da, -6*dt, 6*dt);
        const sp = Math.min(b.spd, Math.hypot(b.vx,b.vy) + 600*dt);
        b.vx = Math.cos(ca)*sp; b.vy = Math.sin(ca)*sp;
      }
    }
    b.x+=b.vx*dt; b.y+=b.vy*dt; b.life-=dt;
    if(b.life<=0 || b.x<0||b.x>WORLD||b.y<0||b.y>WORLD){
      if(b.kind==='rocket') explode(b.x, b.y, b.aoe, b.dmg);
      g.bullets.splice(i,1); continue;
    }
    for(const e of g.enemies){
      if(e.dead) continue;
      if(dist2(e.x,e.y,b.x,b.y) < (e.r+b.r)*(e.r+b.r)){
        if(b.kind==='rocket' || b.kind==='missile'){
          explode(b.x, b.y, b.aoe, b.dmg);
          g.bullets.splice(i,1);
          break;
        }
        const opt = {};
        if(b.slow) opt.slow = b.slow;
        if(b.burn) opt.burn = b.burn;
        dealDamage(e, b.dmg, opt);
        b.pierce--;
        if(b.pierce<=0){ g.bullets.splice(i,1); }
        break;
      }
    }
  }
}

// ---- 升級三選一 ----
function buildChoices(){
  const g = G, out = [];
  for(const key in g.weapons){
    if(g.weapons[key] < WPN_MAX_LV){
      const W = WEAPONS[key];
      out.push({kind:'wpn', key, ic:W.ic, t:W.name+' Lv.'+(g.weapons[key]+1), d:W.d, tag:W.elem, c:W.color});
    }
  }
  if(Object.keys(g.weapons).length < MAX_WPN_SLOT){
    for(const key in WEAPONS){
      if(!(key in g.weapons)){
        const W = WEAPONS[key];
        out.push({kind:'wpn', key, ic:W.ic, t:'新武器：'+W.name, d:W.d, tag:W.elem, c:W.color});
      }
    }
  }
  for(const key in PASSIVES){
    const P = PASSIVES[key], cur = g.passives[key]||0;
    if(cur < P.max) out.push({kind:'pas', key, ic:P.ic, t:P.name+' Lv.'+(cur+1), d:P.d, tag:'被動', c:'#93a0bd'});
  }
  // 洗牌取3
  for(let i=out.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [out[i],out[j]]=[out[j],out[i]]; }
  const picks = out.slice(0,3);
  if(picks.length===0) picks.push({kind:'gold', ic:'💰', t:'物資補給', d:'金幣 +50，生命回復 30%', tag:'補給', c:'#ffd24a'});
  return picks;
}
function applyChoice(ch){
  const g = G;
  if(ch.kind==='wpn') g.weapons[ch.key] = (g.weapons[ch.key]||0)+1;
  else if(ch.kind==='pas'){
    g.passives[ch.key] = (g.passives[ch.key]||0)+1;
    if(ch.key==='body'){ g.maxHp = Math.floor(g.stats.maxHp*(1+g.passives.body*0.2)); g.hp = Math.min(g.maxHp, g.hp+g.maxHp*0.3); }
  }
  else if(ch.kind==='gold'){ g.runGold+=50; g.hp=Math.min(g.maxHp, g.hp+g.maxHp*0.3); }
}

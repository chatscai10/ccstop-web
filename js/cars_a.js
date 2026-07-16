// ===== 車輛繪製 A：共用元件 + 肌肉車/皮卡/警車/超跑 =====
'use strict';

const CAR_DRAW = {};

// 共用：輪胎組
function drawWheels(x, pts, ww, wh, t, rim){
  for(const [wx,wy] of pts){
    x.save(); x.translate(wx,wy);
    x.fillStyle = '#07090c';
    x.beginPath(); x.roundRect(-ww/2,-wh/2,ww,wh,3); x.fill();
    x.strokeStyle = rim||'#2c3646'; x.lineWidth = 1.5;
    x.beginPath(); x.roundRect(-ww/2,-wh/2,ww,wh,3); x.stroke();
    const ph = Math.sin((t*14)%6.28)*(ww*0.22);
    x.beginPath(); x.moveTo(ph,-wh/2+1); x.lineTo(ph,wh/2-1); x.stroke();
    x.restore();
  }
}
// 共用：車頂砲塔
function drawTurret(x, aimOff, tx, sc){
  sc = sc||1;
  x.save(); x.translate(tx||0, 0); x.rotate(aimOff||0); x.scale(sc,sc);
  x.fillStyle = '#141a27';
  x.beginPath(); x.arc(0,0,8.6,0,6.29); x.fill();
  x.strokeStyle='#5a6884'; x.lineWidth=1.8; x.stroke();
  x.fillStyle = '#2a3244';
  x.beginPath(); x.arc(0,0,4.4,0,6.29); x.fill();
  const gg = x.createLinearGradient(0,-4,0,4);
  gg.addColorStop(0,'#8894ab'); gg.addColorStop(0.5,'#4a5570'); gg.addColorStop(1,'#252c40');
  x.fillStyle = gg;
  x.fillRect(4,-4.2,22,3.2); x.fillRect(4,1,22,3.2);
  x.fillStyle = '#0c0f16'; x.fillRect(24,-4.4,4,3.6); x.fillRect(24,0.8,4,3.6);
  x.fillStyle = '#ffd88a'; x.fillRect(28,-4,1.4,2.8); x.fillRect(28,1.2,1.4,2.8);
  x.restore();
}
// 共用：玻璃
function glassFill(x, gx, gy, gw, gh, r){
  const wg = x.createLinearGradient(0,gy,0,gy+gh);
  wg.addColorStop(0,'#4d80b4'); wg.addColorStop(0.5,'#1c3450'); wg.addColorStop(1,'#0f2136');
  x.fillStyle = wg;
  x.beginPath(); x.roundRect(gx,gy,gw,gh,r); x.fill();
  x.strokeStyle = '#0a1522'; x.lineWidth = 1.5;
  x.beginPath(); x.roundRect(gx,gy,gw,gh,r); x.stroke();
  x.strokeStyle = '#ffffff30'; x.lineWidth = 2;
  x.beginPath(); x.moveTo(gx+gw*0.2, gy+gh*0.15); x.lineTo(gx+gw*0.55, gy+gh*0.85); x.stroke();
}
// 共用：車頭大燈
function headLights(x, L, W){
  x.fillStyle = '#fff7c4';
  x.fillRect(L/2-4, -W/2+4, 5, 7); x.fillRect(L/2-4, W/2-11, 5, 7);
  drawGlow(x, L/2+6, -W/2+7, '#ffe89a', 12, .7);
  drawGlow(x, L/2+6,  W/2-7, '#ffe89a', 12, .7);
}

// ===== 1. 狂野肌肉車 =====
CAR_DRAW.muscle = {L:68, W:42, tx:-8, draw(x,t){
  const L=68, W=42;
  drawWheels(x, [[-L*0.32,-W*0.56],[-L*0.32,W*0.56],[L*0.3,-W*0.56],[L*0.3,W*0.56]], 18, 10, t);
  // 側裙
  x.fillStyle = '#3a1e08';
  x.beginPath(); x.roundRect(-L/2-1, -W/2-2, L+2, W+4, 10); x.fill();
  // 車身
  const bodyG = x.createLinearGradient(0,-W/2,0,W/2);
  bodyG.addColorStop(0,'#ffab4a'); bodyG.addColorStop(0.25,'#ff8a2a');
  bodyG.addColorStop(0.55,'#e05f10'); bodyG.addColorStop(1,'#7d3305');
  x.fillStyle = bodyG;
  x.beginPath(); x.roundRect(-L/2, -W/2, L, W, 9); x.fill();
  x.strokeStyle = '#4a2404'; x.lineWidth = 2; x.stroke();
  // 引擎蓋雙白條
  x.fillStyle = '#f2ead8';
  x.beginPath(); x.roundRect(L*0.08, -W*0.17, L*0.36, W*0.11, 2); x.fill();
  x.beginPath(); x.roundRect(L*0.08,  W*0.06, L*0.36, W*0.11, 2); x.fill();
  // 進氣口
  x.fillStyle = '#1a1008';
  x.beginPath(); x.roundRect(L*0.18, -W*0.055, L*0.16, W*0.11, 3); x.fill();
  x.strokeStyle = '#00000066'; x.lineWidth = 1;
  for(let i=1;i<3;i++){ x.beginPath(); x.moveTo(L*0.18+i*L*0.053, -W*0.05); x.lineTo(L*0.18+i*L*0.053, W*0.05); x.stroke(); }
  // 高光
  x.fillStyle = '#ffffff22';
  x.beginPath(); x.roundRect(-L/2+4, -W/2+3, L-8, 5, 3); x.fill();
  // 前撞角
  const rg = x.createLinearGradient(L/2-4,0,L/2+9,0);
  rg.addColorStop(0,'#8f99ad'); rg.addColorStop(1,'#e3e9f5');
  x.fillStyle = rg;
  x.beginPath(); x.moveTo(L/2+9,0); x.lineTo(L/2-5,-W/2-4); x.lineTo(L/2-5,W/2+4); x.closePath(); x.fill();
  x.strokeStyle='#39404f'; x.lineWidth=1.5; x.stroke();
  // 駕駛艙
  glassFill(x, -L*0.34, -W*0.33, L*0.30, W*0.66, 6);
  // 後視鏡
  x.fillStyle = '#7d3305';
  x.fillRect(-L*0.06, -W/2-4, 5, 4); x.fillRect(-L*0.06, W/2, 5, 4);
  // 尾翼 + 雙排氣管
  x.fillStyle = '#57250a';
  x.beginPath(); x.roundRect(-L/2+1, -W/2-3, 7, W+6, 3); x.fill();
  x.fillStyle = '#9aa4b5';
  x.beginPath(); x.arc(-L/2-2, -W*0.28, 3, 0, 6.29); x.arc(-L/2-2, W*0.28, 3, 0, 6.29); x.fill();
  headLights(x, L, W);
}};

// ===== 2. 末日皮卡 =====
CAR_DRAW.pickup = {L:76, W:44, tx:8, gunScale:0.95, draw(x,t){
  const L=76, W=44;
  drawWheels(x, [[-L*0.36,-W*0.58],[-L*0.36,W*0.58],[-L*0.12,-W*0.58],[-L*0.12,W*0.58],[L*0.32,-W*0.58],[L*0.32,W*0.58]], 19, 11, t);
  // 底盤
  x.fillStyle = '#33381f';
  x.beginPath(); x.roundRect(-L/2-1, -W/2-2, L+2, W+4, 8); x.fill();
  // 車身軍綠
  const bodyG = x.createLinearGradient(0,-W/2,0,W/2);
  bodyG.addColorStop(0,'#93a05e'); bodyG.addColorStop(0.5,'#6f7c44'); bodyG.addColorStop(1,'#454e28');
  x.fillStyle = bodyG;
  x.beginPath(); x.roundRect(-L/2, -W/2, L, W, 7); x.fill();
  x.strokeStyle = '#2b301a'; x.lineWidth = 2; x.stroke();
  // 貨斗（後段）
  x.fillStyle = '#262a18';
  x.beginPath(); x.roundRect(-L/2+3, -W/2+4, L*0.44, W-8, 4); x.fill();
  x.strokeStyle = '#454e28'; x.lineWidth = 1.2;
  for(let i=1;i<4;i++){ const bx=-L/2+3+i*L*0.11; x.beginPath(); x.moveTo(bx,-W/2+5); x.lineTo(bx,W/2-5); x.stroke(); }
  // 備胎 + 油桶
  x.fillStyle = '#0c0e08';
  x.beginPath(); x.arc(-L*0.30, -W*0.16, 8, 0, 6.29); x.fill();
  x.strokeStyle = '#3a4222'; x.lineWidth = 2;
  x.beginPath(); x.arc(-L*0.30, -W*0.16, 8, 0, 6.29); x.stroke();
  x.beginPath(); x.arc(-L*0.30, -W*0.16, 3, 0, 6.29); x.stroke();
  x.fillStyle = '#7a3b1e';
  x.beginPath(); x.roundRect(-L*0.42, W*0.05, 11, 13, 2); x.fill();
  x.strokeStyle = '#00000044';
  x.beginPath(); x.moveTo(-L*0.42, W*0.05+6.5); x.lineTo(-L*0.42+11, W*0.05+6.5); x.stroke();
  // 駕駛室 + 前擋玻璃
  glassFill(x, L*0.02, -W*0.33, L*0.22, W*0.66, 5);
  // 車頂探照燈排
  x.fillStyle = '#22271433';
  x.fillStyle = '#191d10';
  x.beginPath(); x.roundRect(L*0.24, -W*0.3, 5, W*0.6, 2); x.fill();
  x.fillStyle = '#fff3b0';
  for(const sy of [-W*0.2, 0, W*0.2]){ x.beginPath(); x.arc(L*0.265, sy, 2.4, 0, 6.29); x.fill(); }
  // 前保險桿撞牛欄
  x.strokeStyle = '#8f99ad'; x.lineWidth = 3;
  x.beginPath(); x.moveTo(L/2+6, -W*0.34); x.lineTo(L/2+6, W*0.34); x.stroke();
  x.lineWidth = 2.4;
  x.beginPath(); x.moveTo(L/2-2, -W*0.3); x.lineTo(L/2+6, -W*0.3); x.moveTo(L/2-2, 0); x.lineTo(L/2+6, 0); x.moveTo(L/2-2, W*0.3); x.lineTo(L/2+6, W*0.3); x.stroke();
  headLights(x, L, W);
}};

// ===== 3. 幽靈攔截者（警車）=====
CAR_DRAW.police = {L:70, W:42, tx:-9, draw(x,t){
  const L=70, W=42;
  drawWheels(x, [[-L*0.32,-W*0.56],[-L*0.32,W*0.56],[L*0.3,-W*0.56],[L*0.3,W*0.56]], 18, 10, t);
  // 底盤
  x.fillStyle = '#14161c';
  x.beginPath(); x.roundRect(-L/2-1, -W/2-2, L+2, W+4, 10); x.fill();
  // 白車身
  const bodyG = x.createLinearGradient(0,-W/2,0,W/2);
  bodyG.addColorStop(0,'#f4f7fd'); bodyG.addColorStop(0.55,'#d5dbe8'); bodyG.addColorStop(1,'#9aa3b5');
  x.fillStyle = bodyG;
  x.beginPath(); x.roundRect(-L/2, -W/2, L, W, 9); x.fill();
  x.strokeStyle = '#3a4150'; x.lineWidth = 2; x.stroke();
  // 黑引擎蓋 + 黑車尾
  x.fillStyle = '#181c24';
  x.beginPath(); x.roundRect(L*0.16, -W/2+3, L*0.30, W-6, 5); x.fill();
  x.beginPath(); x.roundRect(-L/2+3, -W/2+3, L*0.14, W-6, 5); x.fill();
  // 車側黑斜紋
  x.fillStyle = '#1e232e';
  x.beginPath(); x.moveTo(-L*0.05,-W/2); x.lineTo(L*0.06,-W/2); x.lineTo(-L*0.0,-W/2+6); x.lineTo(-L*0.11,-W/2+6); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(-L*0.05,W/2); x.lineTo(L*0.06,W/2); x.lineTo(-L*0.0,W/2-6); x.lineTo(-L*0.11,W/2-6); x.closePath(); x.fill();
  // 引擎蓋金徽
  x.fillStyle = '#ffd24a';
  x.beginPath(); x.arc(L*0.31, 0, 3.5, 0, 6.29); x.fill();
  x.strokeStyle = '#8a6a10'; x.lineWidth = 1; x.stroke();
  // 駕駛艙
  glassFill(x, -L*0.30, -W*0.33, L*0.28, W*0.66, 6);
  // 車頂警燈（紅藍交替閃爍）
  const blink = Math.floor(t*6)%2===0;
  x.fillStyle = '#22262e';
  x.beginPath(); x.roundRect(-L*0.19, -W*0.26, 7, W*0.52, 2); x.fill();
  x.fillStyle = blink ? '#ff3048' : '#5a1017';
  x.beginPath(); x.roundRect(-L*0.185, -W*0.24, 6, W*0.22, 2); x.fill();
  x.fillStyle = blink ? '#12315a' : '#2e7fff';
  x.beginPath(); x.roundRect(-L*0.185, W*0.02, 6, W*0.22, 2); x.fill();
  if(blink) drawGlow(x, -L*0.155, -W*0.13, '#ff3048', 16, .9);
  else      drawGlow(x, -L*0.155,  W*0.13, '#2e7fff', 16, .9);
  // 天線
  x.strokeStyle = '#0c0e12'; x.lineWidth = 1.4;
  x.beginPath(); x.moveTo(-L*0.42, -W*0.3); x.lineTo(-L*0.48, -W*0.44); x.stroke();
  // 前推桿
  x.strokeStyle = '#2b3038'; x.lineWidth = 3.4;
  x.beginPath(); x.moveTo(L/2+5, -W*0.3); x.lineTo(L/2+5, W*0.3); x.stroke();
  x.lineWidth = 2.6;
  x.beginPath(); x.moveTo(L/2-2, -W*0.22); x.lineTo(L/2+5, -W*0.22); x.moveTo(L/2-2, W*0.22); x.lineTo(L/2+5, W*0.22); x.stroke();
  headLights(x, L, W);
}};

// ===== 4. 夜魅超跑 =====
CAR_DRAW.sports = {L:66, W:38, tx:-7, gunScale:0.85, draw(x,t){
  const L=66, W=38;
  // 霓虹底光
  drawGlow(x, 0, 0, '#b26bff', L*0.72, .5);
  drawWheels(x, [[-L*0.30,-W*0.55],[-L*0.30,W*0.55],[L*0.28,-W*0.55],[L*0.28,W*0.55]], 16, 9, t, '#7a4fd0');
  // 楔形車身
  const bodyG = x.createLinearGradient(0,-W/2,0,W/2);
  bodyG.addColorStop(0,'#a86bff'); bodyG.addColorStop(0.4,'#7a2fd0'); bodyG.addColorStop(1,'#3c1470');
  x.fillStyle = bodyG;
  x.beginPath();
  x.moveTo(L/2+4, 0);
  x.lineTo(L*0.18, -W/2);
  x.lineTo(-L/2+8, -W/2);
  x.quadraticCurveTo(-L/2-2, -W/2, -L/2-2, -W*0.28);
  x.lineTo(-L/2-2, W*0.28);
  x.quadraticCurveTo(-L/2-2, W/2, -L/2+8, W/2);
  x.lineTo(L*0.18, W/2);
  x.closePath(); x.fill();
  x.strokeStyle = '#2a0e52'; x.lineWidth = 2; x.stroke();
  // 側進氣口
  x.fillStyle = '#1c0a38';
  x.beginPath(); x.moveTo(L*0.02,-W/2+2); x.lineTo(L*0.14,-W/2+2); x.lineTo(L*0.08,-W*0.26); x.lineTo(-L*0.02,-W*0.26); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(L*0.02,W/2-2); x.lineTo(L*0.14,W/2-2); x.lineTo(L*0.08,W*0.26); x.lineTo(-L*0.02,W*0.26); x.closePath(); x.fill();
  // 座艙罩（水滴型）
  const cg = x.createLinearGradient(0,-W*0.26,0,W*0.26);
  cg.addColorStop(0,'#6b4fd0'); cg.addColorStop(0.5,'#180a30'); cg.addColorStop(1,'#0e0620');
  x.fillStyle = cg;
  x.beginPath(); x.ellipse(-L*0.10, 0, L*0.20, W*0.28, 0, 0, 6.29); x.fill();
  x.strokeStyle = '#c9a6ff55'; x.lineWidth = 1.4; x.stroke();
  // 車頭燈條（LED）
  x.fillStyle = '#e8dbff';
  x.beginPath(); x.moveTo(L*0.42,-W*0.16); x.lineTo(L*0.30,-W*0.30); x.lineTo(L*0.26,-W*0.24); x.lineTo(L*0.38,-W*0.12); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(L*0.42,W*0.16); x.lineTo(L*0.30,W*0.30); x.lineTo(L*0.26,W*0.24); x.lineTo(L*0.38,W*0.12); x.closePath(); x.fill();
  drawGlow(x, L*0.4, -W*0.2, '#d0b8ff', 12, .8);
  drawGlow(x, L*0.4,  W*0.2, '#d0b8ff', 12, .8);
  // 大尾翼
  x.fillStyle = '#2a0e52';
  x.fillRect(-L*0.40, -W*0.30, 5, W*0.60);
  x.fillStyle = '#4a1f8a';
  x.beginPath(); x.roundRect(-L/2-4, -W/2-4, 8, W+8, 3); x.fill();
  x.strokeStyle = '#b26bff88'; x.lineWidth = 1;
  x.beginPath(); x.roundRect(-L/2-4, -W/2-4, 8, W+8, 3); x.stroke();
  // 圓形尾燈
  x.fillStyle = '#ff2255';
  x.beginPath(); x.arc(-L/2-1, -W*0.2, 2.6, 0, 6.29); x.arc(-L/2-1, W*0.2, 2.6, 0, 6.29); x.fill();
  drawGlow(x, -L/2-2, -W*0.2, '#ff2255', 9, .8);
  drawGlow(x, -L/2-2,  W*0.2, '#ff2255', 9, .8);
}};

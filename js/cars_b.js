// ===== 車輛繪製 B：校車/裝甲車/煉獄重卡/黃金戰神 =====
'use strict';

// ===== 5. 校車屠夫 =====
CAR_DRAW.bus = {L:94, W:44, tx:0, gunScale:1.1, draw(x,t){
  const L=94, W=44;
  drawWheels(x, [[-L*0.36,-W*0.56],[-L*0.36,W*0.56],[-L*0.1,-W*0.56],[-L*0.1,W*0.56],[L*0.3,-W*0.56],[L*0.3,W*0.56]], 20, 11, t);
  // 底盤
  x.fillStyle = '#5a4308';
  x.beginPath(); x.roundRect(-L/2-1, -W/2-2, L+2, W+4, 9); x.fill();
  // 黃色車身
  const bodyG = x.createLinearGradient(0,-W/2,0,W/2);
  bodyG.addColorStop(0,'#ffd34e'); bodyG.addColorStop(0.45,'#eab52c'); bodyG.addColorStop(1,'#9a7112');
  x.fillStyle = bodyG;
  x.beginPath(); x.roundRect(-L/2, -W/2, L, W, 8); x.fill();
  x.strokeStyle = '#6b4e0a'; x.lineWidth = 2; x.stroke();
  // 黑色警示側條
  x.fillStyle = '#1c1a12';
  x.fillRect(-L/2+4, -W/2+2.5, L-14, 3);
  x.fillRect(-L/2+4, W/2-5.5, L-14, 3);
  // 車頂中央走道
  x.fillStyle = '#f5c838';
  x.beginPath(); x.roundRect(-L*0.42, -W*0.09, L*0.78, W*0.18, 4); x.fill();
  x.strokeStyle = '#00000022'; x.lineWidth = 1;
  x.beginPath(); x.roundRect(-L*0.42, -W*0.09, L*0.78, W*0.18, 4); x.stroke();
  // 兩側車窗排（各 5 扇）
  for(let i=0;i<5;i++){
    const wx0 = -L*0.40 + i*L*0.15;
    glassFill(x, wx0, -W*0.42, L*0.10, W*0.15, 2);
    glassFill(x, wx0,  W*0.27, L*0.10, W*0.15, 2);
  }
  // 前擋風玻璃
  glassFill(x, L*0.30, -W*0.34, L*0.12, W*0.68, 4);
  // 前鏟（除屍鏟）
  const sg = x.createLinearGradient(L/2,0,L/2+16,0);
  sg.addColorStop(0,'#6b7484'); sg.addColorStop(1,'#c9d2e0');
  x.fillStyle = sg;
  x.beginPath();
  x.moveTo(L/2+16, 0);
  x.lineTo(L/2-2, -W/2-7);
  x.lineTo(L/2-8, -W/2-7);
  x.lineTo(L/2-8, W/2+7);
  x.lineTo(L/2-2, W/2+7);
  x.closePath(); x.fill();
  x.strokeStyle = '#39404f'; x.lineWidth = 2; x.stroke();
  x.strokeStyle = '#39404f88'; x.lineWidth = 1.4;
  for(let i=-2;i<=2;i++){ x.beginPath(); x.moveTo(L/2-8, i*W*0.2); x.lineTo(L/2+12-Math.abs(i)*4, i*W*0.2); x.stroke(); }
  // 車頂警示燈
  x.fillStyle = Math.floor(t*4)%2===0 ? '#ff8c1a' : '#7a3d05';
  x.beginPath(); x.arc(L*0.24, -W*0.30, 3, 0, 6.29); x.fill();
  x.beginPath(); x.arc(L*0.24,  W*0.30, 3, 0, 6.29); x.fill();
  headLights(x, L, W);
}};

// ===== 6. 裝甲運兵車 =====
CAR_DRAW.apc = {L:82, W:48, tx:4, gunScale:1.15, draw(x,t){
  const L=82, W=48;
  // 八輪
  drawWheels(x, [[-L*0.36,-W*0.55],[-L*0.36,W*0.55],[-L*0.13,-W*0.55],[-L*0.13,W*0.55],[L*0.10,-W*0.55],[L*0.10,W*0.55],[L*0.33,-W*0.55],[L*0.33,W*0.55]], 17, 11, t);
  // 裝甲殼（六角切角）
  const bodyG = x.createLinearGradient(0,-W/2,0,W/2);
  bodyG.addColorStop(0,'#7a8472'); bodyG.addColorStop(0.5,'#59634f'); bodyG.addColorStop(1,'#333a2c');
  x.fillStyle = bodyG;
  x.beginPath();
  x.moveTo(L/2+8, -W*0.14);
  x.lineTo(L*0.30, -W/2);
  x.lineTo(-L*0.42, -W/2);
  x.lineTo(-L/2, -W*0.26);
  x.lineTo(-L/2, W*0.26);
  x.lineTo(-L*0.42, W/2);
  x.lineTo(L*0.30, W/2);
  x.lineTo(L/2+8, W*0.14);
  x.closePath(); x.fill();
  x.strokeStyle = '#20251a'; x.lineWidth = 2.2; x.stroke();
  // 裝甲板分割線 + 鉚釘
  x.strokeStyle = '#00000040'; x.lineWidth = 1.4;
  x.beginPath(); x.moveTo(L*0.14,-W/2+3); x.lineTo(L*0.14,W/2-3); x.stroke();
  x.beginPath(); x.moveTo(-L*0.16,-W/2+3); x.lineTo(-L*0.16,W/2-3); x.stroke();
  x.fillStyle = '#2c3323';
  for(const rx of [L*0.10, -L*0.20, L*0.36, -L*0.44]){
    for(const ry of [-W*0.36, W*0.36]){ x.beginPath(); x.arc(rx, ry, 1.6, 0, 6.29); x.fill(); }
  }
  // 觀察窗（防彈細縫）
  x.fillStyle = '#101820';
  x.beginPath(); x.roundRect(L*0.28, -W*0.22, L*0.10, W*0.13, 2); x.fill();
  x.beginPath(); x.roundRect(L*0.28,  W*0.09, L*0.10, W*0.13, 2); x.fill();
  // 頂部艙蓋
  x.fillStyle = '#49523d';
  x.beginPath(); x.arc(-L*0.26, 0, 9, 0, 6.29); x.fill();
  x.strokeStyle = '#20251a'; x.lineWidth = 1.8; x.stroke();
  x.strokeStyle = '#8b957c'; x.lineWidth = 2;
  x.beginPath(); x.arc(-L*0.26, 0, 5, -0.7, 0.7); x.stroke();
  // 車頭牽引鉤 + 側裙裝甲
  x.strokeStyle = '#39404f'; x.lineWidth = 3;
  x.beginPath(); x.moveTo(L/2+8, -W*0.08); x.lineTo(L/2+13, 0); x.lineTo(L/2+8, W*0.08); x.stroke();
  x.fillStyle = '#3f4734';
  x.beginPath(); x.roundRect(-L*0.40, -W/2-3, L*0.72, 4, 2); x.fill();
  x.beginPath(); x.roundRect(-L*0.40, W/2-1, L*0.72, 4, 2); x.fill();
  // 燈（護欄內嵌）
  x.fillStyle = '#fff7c4';
  x.fillRect(L*0.42, -W*0.30, 4, 5); x.fillRect(L*0.42, W*0.30-5, 4, 5);
  drawGlow(x, L*0.48, -W*0.27, '#ffe89a', 10, .6);
  drawGlow(x, L*0.48,  W*0.27, '#ffe89a', 10, .6);
}};

// ===== 7. 煉獄重卡 =====
CAR_DRAW.firetruck = {L:86, W:44, tx:-16, gunScale:1.05, draw(x,t){
  const L=86, W=44;
  drawWheels(x, [[-L*0.34,-W*0.57],[-L*0.34,W*0.57],[-L*0.10,-W*0.57],[-L*0.10,W*0.57],[L*0.30,-W*0.57],[L*0.30,W*0.57]], 19, 11, t);
  // 底盤
  x.fillStyle = '#4a0f12';
  x.beginPath(); x.roundRect(-L/2-1, -W/2-2, L+2, W+4, 8); x.fill();
  // 紅色車體
  const bodyG = x.createLinearGradient(0,-W/2,0,W/2);
  bodyG.addColorStop(0,'#ff5a4a'); bodyG.addColorStop(0.45,'#c3242a'); bodyG.addColorStop(1,'#6e1014');
  x.fillStyle = bodyG;
  x.beginPath(); x.roundRect(-L/2, -W/2, L, W, 8); x.fill();
  x.strokeStyle = '#3f0a0d'; x.lineWidth = 2; x.stroke();
  // 白色側條
  x.fillStyle = '#f2ead8';
  x.fillRect(-L/2+4, -W/2+3, L-10, 3);
  x.fillRect(-L/2+4, W/2-6, L-10, 3);
  // 駕駛室（前段）
  x.fillStyle = '#8a1519';
  x.beginPath(); x.roundRect(L*0.16, -W/2+3, L*0.30, W-6, 5); x.fill();
  glassFill(x, L*0.30, -W*0.32, L*0.12, W*0.64, 4);
  // 銀色前格柵
  const grillG = x.createLinearGradient(L/2-5,0,L/2+3,0);
  grillG.addColorStop(0,'#8f99ad'); grillG.addColorStop(1,'#dfe6f2');
  x.fillStyle = grillG;
  x.beginPath(); x.roundRect(L/2-4, -W*0.36, 7, W*0.72, 2); x.fill();
  x.strokeStyle = '#39404f'; x.lineWidth = 1;
  for(let i=1;i<5;i++){ const gy=-W*0.36+i*W*0.144; x.beginPath(); x.moveTo(L/2-4,gy); x.lineTo(L/2+3,gy); x.stroke(); }
  // 雙排氣煙囪（火星）
  for(const sy of [-W*0.30, W*0.30]){
    x.fillStyle = '#2b2f38';
    x.beginPath(); x.arc(L*0.10, sy, 4.4, 0, 6.29); x.fill();
    x.strokeStyle = '#0f1116'; x.lineWidth = 1.6; x.stroke();
    x.fillStyle = '#ff8c1a';
    x.beginPath(); x.arc(L*0.10, sy, 2, 0, 6.29); x.fill();
    drawGlow(x, L*0.10, sy, '#ff7a1a', 11, .55 + 0.25*Math.sin(t*9 + sy));
  }
  // 車頂雲梯（後段）
  x.fillStyle = '#8f99ad';
  x.beginPath(); x.roundRect(-L*0.44, -W*0.20, L*0.50, 4, 2); x.fill();
  x.beginPath(); x.roundRect(-L*0.44, W*0.16, L*0.50, 4, 2); x.fill();
  x.strokeStyle = '#5d6675'; x.lineWidth = 2;
  for(let i=0;i<6;i++){ const lx=-L*0.42+i*L*0.09; x.beginPath(); x.moveTo(lx,-W*0.16); x.lineTo(lx,W*0.16); x.stroke(); }
  // 警示燈
  x.fillStyle = Math.floor(t*7)%2===0 ? '#ff3048' : '#5a1017';
  x.beginPath(); x.roundRect(L*0.44, -W*0.14, 4, W*0.28, 2); x.fill();
  if(Math.floor(t*7)%2===0) drawGlow(x, L*0.46, 0, '#ff3048', 14, .8);
  headLights(x, L, W);
}};

// ===== 8. 黃金戰神 =====
CAR_DRAW.gold = {L:68, W:40, tx:-7, gunScale:0.9, draw(x,t){
  const L=68, W=40;
  // 金色光環
  drawGlow(x, 0, 0, '#ffd24a', L*0.85, .45 + 0.1*Math.sin(t*3));
  drawWheels(x, [[-L*0.30,-W*0.55],[-L*0.30,W*0.55],[L*0.28,-W*0.55],[L*0.28,W*0.55]], 16, 9, t, '#d4a017');
  // 流線車身
  const bodyG = x.createLinearGradient(0,-W/2,0,W/2);
  bodyG.addColorStop(0,'#fff0b0'); bodyG.addColorStop(0.3,'#ffd95e');
  bodyG.addColorStop(0.6,'#d4a017'); bodyG.addColorStop(1,'#7d5c0a');
  x.fillStyle = bodyG;
  x.beginPath();
  x.moveTo(L/2+6, 0);
  x.lineTo(L*0.22, -W/2);
  x.quadraticCurveTo(-L*0.3, -W/2-2, -L/2+4, -W*0.38);
  x.quadraticCurveTo(-L/2-3, 0, -L/2+4, W*0.38);
  x.quadraticCurveTo(-L*0.3, W/2+2, L*0.22, W/2);
  x.closePath(); x.fill();
  x.strokeStyle = '#5c430a'; x.lineWidth = 2; x.stroke();
  // 鏡面高光斜紋
  x.fillStyle = '#ffffff55';
  x.beginPath(); x.moveTo(L*0.30,-W*0.34); x.lineTo(L*0.38,-W*0.34); x.lineTo(L*0.12,W*0.34); x.lineTo(L*0.04,W*0.34); x.closePath(); x.fill();
  x.fillStyle = '#ffffff33';
  x.beginPath(); x.moveTo(L*0.18,-W*0.34); x.lineTo(L*0.22,-W*0.34); x.lineTo(-L*0.04,W*0.34); x.lineTo(-L*0.08,W*0.34); x.closePath(); x.fill();
  // 黑玻璃座艙
  const cg = x.createLinearGradient(0,-W*0.26,0,W*0.26);
  cg.addColorStop(0,'#3a3320'); cg.addColorStop(0.5,'#0e0c06'); cg.addColorStop(1,'#000');
  x.fillStyle = cg;
  x.beginPath(); x.ellipse(-L*0.10, 0, L*0.19, W*0.27, 0, 0, 6.29); x.fill();
  x.strokeStyle = '#ffd24a66'; x.lineWidth = 1.4; x.stroke();
  // 引擎蓋鑽石徽
  x.save(); x.translate(L*0.26, 0); x.rotate(0.785);
  x.fillStyle = '#fff';
  x.fillRect(-3,-3,6,6);
  x.strokeStyle = '#d4a017'; x.lineWidth = 1.2; x.strokeRect(-3,-3,6,6);
  x.restore();
  drawGlow(x, L*0.26, 0, '#ffffff', 10, .8);
  // 尾翼（金）
  x.fillStyle = '#b8860b';
  x.beginPath(); x.roundRect(-L/2-3, -W/2-3, 7, W+6, 3); x.fill();
  x.strokeStyle = '#ffe9a0'; x.lineWidth = 1;
  x.beginPath(); x.roundRect(-L/2-3, -W/2-3, 7, W+6, 3); x.stroke();
  // LED 燈條
  x.fillStyle = '#fffbe8';
  x.beginPath(); x.moveTo(L*0.44,-W*0.14) ; x.lineTo(L*0.32,-W*0.28); x.lineTo(L*0.28,-W*0.22); x.lineTo(L*0.40,-W*0.10); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(L*0.44,W*0.14) ; x.lineTo(L*0.32,W*0.28); x.lineTo(L*0.28,W*0.22); x.lineTo(L*0.40,W*0.10); x.closePath(); x.fill();
  drawGlow(x, L*0.42, -W*0.18, '#fff3c4', 13, .85);
  drawGlow(x, L*0.42,  W*0.18, '#fff3c4', 13, .85);
}};

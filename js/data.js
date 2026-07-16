// ===== 車車屍搭普 網頁版 — 數據定義 =====
'use strict';

const WORLD = 3600;            // 世界邊長
const MAX_ENEMY = 220;
const BOSS_AT = 75;            // 幾秒後出 Boss
const MAX_WPN_SLOT = 5;
const WPN_MAX_LV = 8;

// 車輛圖鑑（8 台，外觀各自獨立繪製於 cars_*.js）
const CARS = {
  muscle:   {ic:'🚗', name:'狂野肌肉車', d:'均衡型末日經典',   price:0,     hp:1.0,  spd:1.0,  ram:1.0, dmg:1.0,  cr:30},
  pickup:   {ic:'🛻', name:'末日皮卡',   d:'血厚耐撞，載滿物資', price:800,   hp:1.35, spd:0.92, ram:1.3, dmg:0.95, cr:32},
  police:   {ic:'🚓', name:'幽靈攔截者', d:'高速警車，紅藍閃爍', price:1500,  hp:0.9,  spd:1.22, ram:1.05,dmg:1.05, cr:30},
  sports:   {ic:'🏎️', name:'夜魅超跑',   d:'極速刺客，霓虹底光', price:3000,  hp:0.8,  spd:1.4,  ram:0.9, dmg:1.15, cr:28},
  bus:      {ic:'🚌', name:'校車屠夫',   d:'巨體碾壓，前鏟開路', price:5000,  hp:1.7,  spd:0.8,  ram:1.7, dmg:0.9,  cr:40},
  apc:      {ic:'🚙', name:'裝甲運兵車', d:'八輪鋼鐵堡壘',      price:9000,  hp:2.0,  spd:0.85, ram:1.5, dmg:1.0,  cr:38},
  firetruck:{ic:'🚒', name:'煉獄重卡',   d:'火力全開的地獄引擎', price:15000, hp:1.5,  spd:0.9,  ram:1.4, dmg:1.3,  cr:36},
  gold:     {ic:'👑', name:'黃金戰神',   d:'GM 的專屬座駕',     price:99999, hp:2.5,  spd:1.3,  ram:2.0, dmg:1.6,  cr:32},
};

// 七屬性武器（對應原作：槍械/火/冰/毒/雷/風/能量）
const WEAPONS = {
  gun:    {ic:'🔫', name:'雙管機槍', elem:'槍械', color:'#ffd166',
           d:'對最近敵人連射子彈', stat:l=>({dmg:10+4*l, rate:0.34-0.022*l, n:l>=5?3:2, spd:760})},
  fire:   {ic:'🔥', name:'火焰噴射', elem:'火系', color:'#ff5a3c',
           d:'向前方噴出烈焰並附加燃燒', stat:l=>({dmg:5+2.4*l, rate:0.062, range:190+14*l, burn:5+2.5*l})},
  ice:    {ic:'❄️', name:'寒冰射線', elem:'冰系', color:'#59d7ff',
           d:'穿透冰錐，命中減速', stat:l=>({dmg:14+6*l, rate:0.95-0.055*l, pierce:2+l, spd:600, slow:1.4+0.15*l})},
  poison: {ic:'☠️', name:'劇毒噴灑', elem:'毒系', color:'#9acd32',
           d:'投擲毒罐生成持續傷害毒池', stat:l=>({dmg:7+3*l, rate:2.1-0.12*l, r:70+9*l, dur:3.6})},
  thunder:{ic:'⚡', name:'雷電線圈', elem:'雷系', color:'#8f7bff',
           d:'鏈狀閃電跳躍多個敵人', stat:l=>({dmg:20+9*l, rate:1.5-0.09*l, chain:2+l})},
  wind:   {ic:'🌀', name:'旋風飛刃', elem:'風系', color:'#7ff0d8',
           d:'環繞車身的旋轉刀刃', stat:l=>({dmg:9+4*l, n:1+Math.ceil(l/2), r:82+6*l, rot:2.6+0.22*l})},
  laser:  {ic:'🔆', name:'能量雷射', elem:'能量', color:'#ff4fd8',
           d:'貫穿直線上所有敵人', stat:l=>({dmg:26+11*l, rate:1.7-0.1*l, w:10+2*l})},
  rocket: {ic:'🚀', name:'火箭飛彈', elem:'爆破', color:'#ff8c42',
           d:'轟出大範圍爆炸', stat:l=>({dmg:34+15*l, rate:2.3-0.13*l, r:88+9*l, spd:430})},
  saw:    {ic:'🪚', name:'電鋸刀盤', elem:'物理', color:'#c9ced9',
           d:'車頭旋轉鋸盤絞碎前方敵人', stat:l=>({dmg:9+4*l, range:64+7*l})},
  missile:{ic:'🎯', name:'追蹤導彈', elem:'制導', color:'#ffd166',
           d:'自動鎖定拐彎的智能導彈', stat:l=>({dmg:24+9*l, rate:1.9-0.11*l, n:1+Math.ceil(l/3), r:60, spd:380})},
  vortex: {ic:'🌑', name:'黑洞裝置', elem:'引力', color:'#8f7bff',
           d:'吸入敵人的重力陷阱', stat:l=>({dmg:7+3*l, rate:5.5-0.28*l, r:115+11*l, dur:3.2, pull:130+18*l})},
  holy:   {ic:'✨', name:'聖光審判', elem:'神聖', color:'#fff3b0',
           d:'全場天罰閃光', stat:l=>({dmg:42+18*l, rate:6.8-0.35*l, r:430+30*l})},
};

// 局內被動升級
const PASSIVES = {
  engine: {ic:'🏎️', name:'引擎強化', d:'移動速度 +8%',        max:5},
  armor:  {ic:'🛡️', name:'附加裝甲', d:'受到傷害 -8%',        max:5},
  body:   {ic:'❤️', name:'車體加固', d:'生命上限 +20%，並回復30%', max:5},
  magnet: {ic:'🧲', name:'超強磁鐵', d:'拾取範圍 +40%',        max:5},
  ram:    {ic:'💥', name:'撞擊護槓', d:'衝撞傷害 +25%',        max:5},
  repair: {ic:'🔧', name:'維修機器人', d:'每秒回復 1% 生命',    max:5},
  power:  {ic:'📈', name:'火力全開', d:'所有武器傷害 +10%',    max:5},
  crit:   {ic:'🎲', name:'精準校算', d:'暴擊率 +8%',           max:5},
  steal:  {ic:'🩸', name:'汲血裝置', d:'擊殺回復 0.4% 生命',    max:5},
  cool:   {ic:'⏱️', name:'超頻冷卻', d:'武器冷卻 -7%',         max:5},
};

// 敵人種類
const FOES = {
  walker:{hp:32, spd:56,  dmg:8,  r:16, xp:1, gold:1, c1:'#7c9a5c', c2:'#42522f'},
  runner:{hp:18, spd:118, dmg:6,  r:13, xp:1, gold:1, c1:'#a8a851', c2:'#565627'},
  brute: {hp:170,spd:38,  dmg:20, r:26, xp:4, gold:4, c1:'#6d4a7e', c2:'#39254a'},
  spitter:{hp:45,spd:48,  dmg:10, r:15, xp:2, gold:2, c1:'#579d92', c2:'#28524c'},
  boss:  {hp:3200,spd:66, dmg:30, r:52, xp:60,gold:120,c1:'#b03a48', c2:'#4e1620'},
};
const BOSS_NAMES = ['屍潮暴君','腐爛巨獸','午夜屠夫','哀嚎母體','末日領主'];

// 車庫改裝（永久）
const GARAGE_UP = {
  body:  {ic:'🚗', name:'車體',  d:lv=>`生命上限 ${100+lv*30}`,          cost:lv=>Math.floor(80*Math.pow(1.5,lv))},
  gun:   {ic:'🔫', name:'機槍',  d:lv=>`基礎傷害 +${lv*12}%`,            cost:lv=>Math.floor(80*Math.pow(1.5,lv))},
  armor: {ic:'🛡️', name:'裝甲',  d:lv=>`減傷 ${Math.min(60,lv*3)}%`,     cost:lv=>Math.floor(70*Math.pow(1.5,lv))},
  engine:{ic:'⚙️', name:'引擎',  d:lv=>`車速 ${250+lv*10}`,              cost:lv=>Math.floor(70*Math.pow(1.5,lv))},
};

// 裝備欄位
const EQ_SLOTS = {
  weapon:{ic:'🔫', name:'武器系統', stat:'傷害',   base:10},
  hull:  {ic:'🚙', name:'強化車殼', stat:'生命',   base:40},
  plate: {ic:'🛡️', name:'複合裝甲', stat:'減傷',   base:2},
  turbo: {ic:'💨', name:'渦輪引擎', stat:'車速',   base:8},
  chip:  {ic:'💾', name:'戰術晶片', stat:'暴擊率', base:2},
  tire:  {ic:'🛞', name:'越野胎',   stat:'衝撞',   base:8},
  nitro: {ic:'🧪', name:'氮氣系統', stat:'車速',   base:6},
  shield:{ic:'🔰', name:'護盾發生器', stat:'減傷', base:1.5},
  ammo:  {ic:'📦', name:'高速彈匣', stat:'攻速',   base:3},
};
const RARITY = ['普通','優良','稀有','史詩','傳說','神話'];
const RARITY_MUL = [1, 1.6, 2.4, 3.5, 5, 7.5];

// 人質救援獎勵
const RESCUE_BUFFS = [
  {ic:'❤️', t:'緊急補給', apply:g=>{g.hp=Math.min(g.maxHp,g.hp+g.maxHp*0.35);}, msg:'回復 35% 生命'},
  {ic:'💰', t:'物資報酬', apply:g=>{g.runGold+=30;}, msg:'金幣 +30'},
  {ic:'⚡', t:'戰場經驗', apply:g=>{addXp(g, xpNeed(g.level));}, msg:'直接升 1 級'},
  {ic:'🔥', t:'火力支援', apply:g=>{g.buffDmg+=0.15;}, msg:'本局傷害 +15%'},
  {ic:'🛡️', t:'能量護盾', apply:g=>{g.invulnT=Math.max(g.invulnT,6);}, msg:'無敵 6 秒'},
];

// 關卡設定：30 關、三大場景主題
const STAGE_MAX = 30;
function stageScale(n){ return Math.pow(1.33, n-1); }
function stageReward(n){ return {gold: 150*n, gem: 15+10*n}; }

const THEMES = [
  {name:'廢棄城區', ground:'#181c25', noiseA:'#20252f', noiseB:'#12151c', lane:'rgba(190,165,60,.28)',
   decos:['🚧','🛢️','💀','🌿','🪨','🛞'], tint:null, foeHue:0},
  {name:'血月荒漠', ground:'#241a18', noiseA:'#2e211d', noiseB:'#1a1210', lane:'rgba(200,120,60,.22)',
   decos:['🌵','🦴','💀','🪨','🏜️','⛺'], tint:'rgba(120,30,20,.10)', foeHue:30},
  {name:'毒霧沼澤', ground:'#161f18', noiseA:'#1d2a20', noiseB:'#0f1712', lane:'rgba(110,180,90,.20)',
   decos:['🌲','🍄','☠️','🪵','🌫️','🐊'], tint:'rgba(40,120,60,.10)', foeHue:-25},
];
function stageTheme(n){ return THEMES[Math.min(2, Math.floor((n-1)/10))]; }

// 工具
const rnd = (a,b)=>a+Math.random()*(b-a);
const irnd = (a,b)=>Math.floor(rnd(a,b+1));
const clamp = (v,a,b)=>v<a?a:(v>b?b:v);
const pick = arr=>arr[Math.floor(Math.random()*arr.length)];
const dist2 = (ax,ay,bx,by)=>{const dx=ax-bx,dy=ay-by;return dx*dx+dy*dy;};
function xpNeed(lv){ return 5+Math.floor(lv*2.6); }
function fmt(n){ n=Math.floor(n); return n>=1e8?(n/1e8).toFixed(1)+'億':n>=1e4?(n/1e4).toFixed(1)+'萬':''+n; }
function fmtTime(s){ s=Math.floor(s); return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); }

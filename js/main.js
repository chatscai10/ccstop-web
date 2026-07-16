// ===== 主循環 / 初始化 =====
'use strict';

let lastT = performance.now();
function frame(now){
  requestAnimationFrame(frame);
  let dt = Math.min(0.05, (now-lastT)/1000);
  lastT = now;
  if(G){
    if(G.state==='run' || G.state==='clearing') updateRun(dt * SV.gm.timeMul);
    render();
    updateHud();
  }
}

function init(){
  loadSave();
  resize();
  bindInput();
  bindPause();
  bindResult();
  bindGacha();
  bindCarNav();
  bindGm();
  $('btnGo').onclick = ()=>{ initAudio(); startRun(SV.lastStage); };
  $('btnRush').onclick = ()=>startRush();
  showScreen('garage');
  renderGarage();
  document.addEventListener('gesturestart', e=>e.preventDefault());
  document.addEventListener('dblclick', e=>e.preventDefault());
  requestAnimationFrame(frame);
}
window.addEventListener('load', init);

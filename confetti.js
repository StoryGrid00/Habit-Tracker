
/* TinyConfetti - zero-dependency confetti burst */
const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export function playConfetti(opts = {}) {
  if (prefersReduced) return Promise.resolve();
  const {
    particleCount = 140, spread = 70, startVelocity = 16, gravity = 0.5, drag = 0.008,
    ticks = 220, scalar = 1, zIndex = 9999,
    colors = ['#A5F247','#FFD166','#06D6A0','#118AB2','#EF476F'],
    container = document.body, origin = null
  } = opts;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:${zIndex}`;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d'); let width, height;
  function resize(){ width = canvas.width = Math.floor(innerWidth*dpr); height = canvas.height = Math.floor(innerHeight*dpr); }
  resize(); const onResize=()=>resize(); window.addEventListener('resize', onResize);
  const center = origin ? {x:origin.x*width, y:origin.y*height} : {x: width/2, y: height*0.28};
  const rand=(min,max)=>Math.random()*(max-min)+min, rad=(deg)=>(deg*Math.PI)/180, angle=-90;
  const particles=[]; const shapes=['square','circle','triangle'];
  for (let i=0;i<particleCount;i++) {
    const spreadAngle = angle + rand(-spread/2, spread/2);
    const velocity = rand(startVelocity*0.8, startVelocity*1.4);
    const vx = Math.cos(rad(spreadAngle))*velocity; const vy = Math.sin(rad(spreadAngle))*velocity;
    particles.push({ x:center.x, y:center.y, vx, vy, life:0, ticks:Math.floor(rand(ticks*0.7,ticks*1.2)),
      size:rand(2,5)*scalar*dpr, rotation:rand(0,Math.PI*2), spin:rand(-0.2,0.2),
      color:colors[Math.floor(rand(0,colors.length))], shape:shapes[Math.floor(rand(0,shapes.length))], opacity:1 });
  }
  let frame;
  const promise=new Promise((resolve)=>{
    function step(){
      ctx.clearRect(0,0,width,height);
      let alive=0;
      for (let p of particles){
        p.life++; if (p.life>p.ticks) continue; alive++;
        p.vy += gravity*dpr*0.25; p.vx *= (1- drag); p.vy *= (1- drag);
        p.x += p.vx*dpr; p.y += p.vy*dpr; p.rotation += p.spin; p.opacity = 1 - p.life/p.ticks;
        ctx.globalAlpha = Math.max(0, p.opacity); ctx.fillStyle = p.color; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotation);
        switch(p.shape){
          case 'circle': ctx.beginPath(); ctx.arc(0,0,p.size,0,Math.PI*2); ctx.fill(); break;
          case 'triangle': ctx.beginPath(); const s=p.size*1.4; ctx.moveTo(0,-s); ctx.lineTo(s,s); ctx.lineTo(-s,s); ctx.closePath(); ctx.fill(); break;
          default: ctx.fillRect(-p.size,-p.size,p.size*2,p.size*2);
        }
        ctx.restore();
      }
      if (alive>0){ frame=requestAnimationFrame(step); } else { cleanup(); resolve(); }
    }
    function cleanup(){
      cancelAnimationFrame(frame); window.removeEventListener('resize', onResize);
      canvas.style.transition='opacity 200ms ease-out'; canvas.style.opacity='0';
      setTimeout(()=>{ if(canvas&&canvas.parentNode) canvas.parentNode.removeChild(canvas); }, 220);
    }
    frame=requestAnimationFrame(step);
  });
  return promise;
}
export function attachConfettiToButton(buttonId, options={}){
  const btn=document.getElementById(buttonId); if(!btn) return;
  let cooling=false; const coolMs=600;
  const handler=async()=>{ if(cooling) return; cooling=true; await playConfetti(options); setTimeout(()=>cooling=false, coolMs); };
  btn.addEventListener('click', handler, {passive:true});
  btn.addEventListener('touchend', handler, {passive:true});
}

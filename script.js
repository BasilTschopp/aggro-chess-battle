(()=>{
const { Chess } = window.ChessLib; // chess.js, loaded by index.html before this file

const INK='#141414', POP='#FFD23F', RED='#E63946';
const FILL={w:'#EFE5D2',b:'#4A4A4A'}, DETAIL={w:'#141414',b:'#A8A8A8'};
const SQL='#E1D0AE', SQD='#B79C7D';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SPEED = reduce ? 0.6 : 1;
const NAMES={p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen',k:'king'};
const COLOR={w:'WHITE',b:'BLACK'};

/* ================= rules: chess.js (github.com/jhlywa/chess.js, BSD-2-Clause) ================= */
// All chess rules (legal moves, check, castling, en passant, promotion, mate, draws)
// come from chess.js. This section only translates between chess.js and the board drawing.
const R=s=>s>>3, F=s=>s&7, on=(r,f)=>r>=0&&r<8&&f>=0&&f<8;
const opp=c=>c==='w'?'b':'w';
const sqIdx=n=>(8-Number(n[1]))*8+(n.charCodeAt(0)-97);
const sqName=i=>'abcdefgh'[F(i)]+(8-R(i));
let game=new Chess();
function snapshot(){
  const b=[];
  for(const row of game.board()) for(const p of row) b.push(p?{t:p.type,c:p.color}:null);
  return {b,turn:game.turn()};
}
function movesFrom(sq){
  return game.moves({square:sqName(sq),verbose:true}).map(m=>{
    const from=sqIdx(m.from), to=sqIdx(m.to), f=m.flags;
    return {from,to,
      cap:f.includes('e')?R(from)*8+F(to):(m.captured?to:-1),
      ep:f.includes('e'),
      castle:f.includes('k')?'K':f.includes('q')?'Q':null,
      promo:f.includes('p')?true:null};
  });
}
const kingSq=(b,c)=>b.findIndex(p=>p&&p.t==='k'&&p.c===c);

/* ================= drawing pieces ================= */
const EYES={n:[[37,33]]};
const SHADE={w:'#D6C8AF',b:'#363636'}, HI={w:'#FBF6EC',b:'#6E6E6E'};
function drawPieceUnits(g,t,c,scared){ drawPieceBody(g,t,c,scared); }
function drawPieceBody(g,t,c,scared){
  g.lineJoin='round'; g.lineCap='round'; g.lineWidth=5; g.strokeStyle=INK;
  const T=Math.PI*2;
  const body={f:FILL[c],s:SHADE[c],h:HI[c]}, gold={f:'#FFD447',s:'#D9981C',h:'#FFF2B0'}, bronze={f:'#C9963B',s:'#9A6E24',h:'#EAC57A'}, silver={f:'#D9DEE6',s:'#A3ACB9',h:'#FFFFFF'};
  const cel=(fn,pal)=>{g.save(); g.beginPath(); fn(); g.clip(); g.fillStyle=pal.s; g.fillRect(57,-10,60,120); g.fillStyle=pal.h; g.fillRect(37,-10,5,120); g.restore();};
  const rr=(x,y,w,h,r)=>{ if(g.roundRect) g.roundRect(x,y,w,h,r); else g.rect(x,y,w,h); };
  const shape=(fn,pal=body)=>{g.fillStyle=pal.f; g.beginPath(); fn(); g.fill(); cel(fn,pal); g.beginPath(); fn(); g.stroke();};
  const union=(fns,pal=body)=>{for(const fn of fns){g.beginPath(); fn(); g.stroke();} g.fillStyle=pal.f; for(const fn of fns){g.beginPath(); fn(); g.fill(); cel(fn,pal);}};
  const flare=(top,hw,pal=body)=>shape(()=>{g.moveTo(50-hw,top); g.bezierCurveTo(50-hw,64,44,72,30,76); g.quadraticCurveTo(28,77.5,30,78); g.lineTo(70,78); g.quadraticCurveTo(72,77.5,70,76); g.bezierCurveTo(56,72,50+hw,64,50+hw,top); g.closePath();},pal);
  switch(t){
    case 'p':
      flare(47,8.5);
      shape(()=>g.ellipse(50,48,15,5,0,0,T));
      shape(()=>g.arc(50,31,14.5,0,T));
      break;
    case 'r':
      flare(42,12);
      // smooth flat top, no battlements
      shape(()=>{g.moveTo(32,42);g.quadraticCurveTo(31,30,30,17);g.quadraticCurveTo(30,14,33,14);g.lineTo(67,14);g.quadraticCurveTo(70,14,70,17);g.quadraticCurveTo(69,30,68,42);g.closePath();});
      shape(()=>rr(30,39,40,8,4),bronze);
      break;
    case 'b':
      flare(54,8.5);
      shape(()=>{g.moveTo(50,17);g.bezierCurveTo(70,28,68,47,58,54);g.quadraticCurveTo(50,56,42,54);g.bezierCurveTo(32,47,30,28,50,17);g.closePath();});
      shape(()=>g.arc(50,13,5.5,0,T),bronze);
      shape(()=>g.ellipse(50,55,15,5,0,0,T));
      g.strokeStyle=DETAIL[c]; g.lineWidth=4; g.beginPath(); g.moveTo(58,28); g.quadraticCurveTo(55,34,50,39); g.stroke(); g.strokeStyle=INK;
      break;
    case 'q':
      flare(40,7.5);
      union([()=>{g.moveTo(35,40);g.quadraticCurveTo(31,28,28,17);g.quadraticCurveTo(36,23,40,27);g.quadraticCurveTo(42,18,45,12);g.quadraticCurveTo(48,21,50,25);g.quadraticCurveTo(52,21,55,12);g.quadraticCurveTo(58,18,60,27);g.quadraticCurveTo(64,23,72,17);g.quadraticCurveTo(69,28,65,40);g.closePath();},
             ()=>g.arc(28,14,4.5,0,T),()=>g.arc(45,10,4.5,0,T),()=>g.arc(55,10,4.5,0,T),()=>g.arc(72,14,4.5,0,T)],bronze);
      shape(()=>rr(33,35.5,34,8,4));
      g.fillStyle=RED; g.lineWidth=3; g.beginPath(); g.arc(50,39.5,2.6,0,T); g.fill(); g.stroke(); g.lineWidth=5;
      shape(()=>g.ellipse(50,56,13.5,4.5,0,0,T));
      break;
    case 'k':
      flare(42,7.5);
      union([()=>rr(46,4.5,8,15,3),()=>rr(40,8,20,7,3)],bronze);
      shape(()=>{g.moveTo(43,43);g.bezierCurveTo(43,33,38,26,33,22);g.lineTo(67,22);g.bezierCurveTo(62,26,57,33,57,43);g.closePath();},bronze);
      shape(()=>rr(30,15.5,40,8,4),bronze);
      g.fillStyle=RED; g.lineWidth=3; g.beginPath(); g.arc(50,31,2.8,0,T); g.fill(); g.stroke(); g.lineWidth=5;
      shape(()=>rr(38,39,24,6.5,3.25),bronze);
      shape(()=>g.ellipse(50,56,14,4.5,0,0,T));
      break;
    case 'n':
      shape(()=>{g.moveTo(33,77);g.quadraticCurveTo(34,66,36,60);g.quadraticCurveTo(29,60,23,57);g.bezierCurveTo(12,53,13,45,20,42);g.quadraticCurveTo(30,31,36,23);g.quadraticCurveTo(37,14,41,10);g.quadraticCurveTo(46,13,49,19);g.bezierCurveTo(68,20,76,34,75,52);g.quadraticCurveTo(75,67,69,77);g.closePath();});
      shape(()=>{g.moveTo(47,19);g.bezierCurveTo(68,20,76,34,75,52);g.quadraticCurveTo(75,67,69,77);g.lineTo(63,77);g.quadraticCurveTo(67,46,51,26);g.closePath();},bronze);
      break;
  }
  shape(()=>rr(26,73,48,9,4.5),(t==='b'||t==='r'||t==='q'||t==='k')?bronze:body);
  shape(()=>rr(20,81,60,11,5.5));
}

/* ================= canvas & state ================= */
const canvas=document.getElementById('board'), ctx=canvas.getContext('2d');
let C=60, dpr=1, sprites={};
let state=snapshot(), sel=-1, targets=[], lastMove=null, busy=false, over=false, checkSq=-1;
let hidden=new Set(), actors=[], props=[], fx=[], bursts=[], shake=0;

function buildSprites(){
  sprites={};
  const P=Math.max(8,Math.ceil(1.0*C*dpr));
  for(const c of 'wb') for(const t of 'pnbrqk') for(const s of [0,1]){
    const cv=document.createElement('canvas'); cv.width=cv.height=P;
    const g=cv.getContext('2d'); g.scale(P/100,P/100); drawPieceUnits(g,t,c,!!s);
    sprites[c+t+s]=cv;
  }
  // red-faced version of the queens for the tantrum
  for(const c of 'wb'){
    const src=sprites[c+'q0'], cv=document.createElement('canvas'); cv.width=cv.height=src.width;
    const g=cv.getContext('2d'); g.drawImage(src,0,0); g.globalCompositeOperation='source-atop';
    g.fillStyle='rgba(230,30,40,.78)'; g.fillRect(0,0,cv.width,cv.height);
    sprites[c+'qred']=cv;
  }
}
function resize(){
  const w=canvas.clientWidth; if(!w) return;
  const ratio=window.devicePixelRatio||1;
  canvas.width=canvas.height=Math.round(w*ratio);
  dpr=canvas.width/w; C=w/8; buildSprites();
}
new ResizeObserver(resize).observe(canvas);

const cx=x=>(x+.5)*C, by=y=>(y+.95)*C;
const NECK=.56; // where the katana cuts, as a fraction of the sprite height above the base
function drawSprite(spr,x,y,o={}){
  const P=1.0*C;
  ctx.save(); ctx.globalAlpha*=o.alpha??1; ctx.translate(x,y); ctx.rotate(o.rot||0);
  ctx.scale((o.sx??1)*(o.flip??1),o.sy??1);
  if(o.clip){ctx.beginPath(); if(o.clip==='L') ctx.rect(-P,-P*1.2,P,P*1.4); else if(o.clip==='R') ctx.rect(0,-P*1.2,P,P*1.4); else if(o.clip==='T') ctx.rect(-P,-P*1.3,2*P,P*(1.3-NECK)); else ctx.rect(-P,-P*NECK,2*P,P*1.4); ctx.clip();}
  ctx.drawImage(spr,-P/2,-.92*P,P,P);
  ctx.restore();
}
function star(x,y,r,fill){
  ctx.beginPath();
  for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2, q=i%2?r*.38:r; ctx.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}
  ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); ctx.lineWidth=Math.max(1.5,C*.022); ctx.strokeStyle=INK; ctx.stroke();
}
function glove(x,y){
  const r=C*.08; ctx.fillStyle='#FFFFFF'; ctx.strokeStyle=INK; ctx.lineWidth=Math.max(1.5,C*.03);
  ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(x-r*.65,y-r*.65,r*.45,0,7); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x-r*.1,y+r*.25); ctx.lineTo(x+r*.45,y+r*.25); ctx.stroke();
}
// knight legs for the buck kick: two front legs planted, two hind legs kicking
function kickHips(p){
  const A=p.A, ax=cx(A.x), ay=by(A.y)-A.z*C, c=Math.cos(A.rot), sn=Math.sin(A.rot), s=p.s;
  return [[-s*.2,-.03],[s*.2,-.05],[-s*.08,-.03],[s*.08,-.05]].map(([lx,ly])=>({x:ax+(lx*c-ly*sn)*C,y:ay+(lx*sn+ly*c)*C}));
}
function leg(x1,y1,x2,y2,bend,col){
  const mx=(x1+x2)/2, my=(y1+y2)/2, dx=x2-x1, dy=y2-y1, d=Math.hypot(dx,dy)||1;
  const kx=mx-dy/d*bend, ky=my+dx/d*bend;
  ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.strokeStyle=INK; ctx.lineWidth=C*.12; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(kx,ky,x2,y2); ctx.stroke();
  ctx.strokeStyle=col; ctx.lineWidth=C*.065; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(kx,ky,x2,y2); ctx.stroke();
  const ang=Math.atan2(y2-ky,x2-kx);
  ctx.save(); ctx.translate(x2,y2); ctx.rotate(ang); ctx.fillStyle=INK; ctx.beginPath();
  if(ctx.roundRect) ctx.roundRect(-C*.02,-C*.06,C*.08,C*.12,C*.02); else ctx.rect(-C*.02,-C*.06,C*.08,C*.12);
  ctx.fill(); ctx.restore();
}
function drawKickLegs(p){
  if(p.show<=0) return;
  const A=p.A, g=by(A.y), col=FILL[A.c], [fh,rh,fh2,rh2]=kickHips(p), s=p.s;
  ctx.save(); ctx.globalAlpha=Math.min(1,p.show*1.5);
  // front legs: straight down to the ground, slightly apart
  leg(fh.x,fh.y,fh.x-s*.04*C,g,-s*.02*C,col);
  leg(fh2.x,fh2.y,fh2.x+s*.02*C,g,-s*.02*C,col);
  // hind legs: tucked under, then shooting out towards the victim
  for(const [h,off] of [[rh,0],[rh2,.18]]){
    const tuck={x:h.x+s*.02*C,y:g}, a=(p.ang??-0)+off*s*-1, r=p.reach??.5*C;
    const out={x:h.x+Math.cos(a)*r,y:h.y+Math.sin(a)*r}, e=p.ext||0;
    leg(h.x,h.y,tuck.x+(out.x-tuck.x)*e,tuck.y+(out.y-tuck.y)*e,s*.05*C*(1-e),col);
  }
  ctx.restore();
}
function drawChoke(p){
  // two rubber hose arms from the bishop's shoulders to the victim's neck
  const A=p.A, V=p.V, e=p.reach;
  const ax=cx(A.x)+(A.dx||0), ay=by(A.y)-A.z*C, vx=cx(V.x)+(V.dx||0), vy=by(V.y)-V.z*C-NECK*C+.06*C;
  for(const side of [-1,1]){
    const sx=ax+side*.12*C, sy=ay-.5*C, hx=vx+side*.13*C, hy=vy;
    const ex=sx+(hx-sx)*e, ey=sy+(hy-sy)*e;
    ctx.save(); ctx.strokeStyle=INK; ctx.lineCap='round'; ctx.lineWidth=Math.max(2.5,C*.05);
    ctx.beginPath(); ctx.moveTo(sx,sy); ctx.quadraticCurveTo((sx+ex)/2,(sy+ey)/2+C*.12,ex,ey); ctx.stroke(); ctx.restore();
    glove(ex,ey);
  }
}
function drawWhip(p){
  // short handle in the glove, a long rope that cracks out towards the target
  const hl=C*.24, hx=p.x+Math.cos(p.ang)*hl, hy=p.y+Math.sin(p.ang)*hl;
  const restX=hx-p.s*C*.15, restY=hy+C*.35;
  const ex=restX+(p.tx-restX)*p.ext, ey=restY+(p.ty-restY)*p.ext;
  const mx=(hx+ex)/2, my=(hy+ey)/2, dx=ex-hx, dy=ey-hy, d=Math.hypot(dx,dy)||1;
  const kx=mx-dy/d*p.wave*C*.35, ky=my+dx/d*p.wave*C*.35;
  ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round';
  if(p.sh){ctx.strokeStyle=INK; ctx.lineWidth=Math.max(2.5,C*.05); ctx.beginPath(); ctx.moveTo(p.sh.x,p.sh.y); ctx.quadraticCurveTo((p.sh.x+p.x)/2,(p.sh.y+p.y)/2+C*.14,p.x,p.y); ctx.stroke();}
  ctx.strokeStyle=INK; ctx.lineWidth=C*.065; ctx.beginPath(); ctx.moveTo(hx,hy); ctx.quadraticCurveTo(kx,ky,ex,ey); ctx.stroke();
  ctx.strokeStyle='#D9A35E'; ctx.lineWidth=C*.03; ctx.beginPath(); ctx.moveTo(hx,hy); ctx.quadraticCurveTo(kx,ky,ex,ey); ctx.stroke();
  ctx.strokeStyle=INK; ctx.lineWidth=C*.09; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(hx,hy); ctx.stroke();
  ctx.strokeStyle='#5B3A1E'; ctx.lineWidth=C*.05; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(hx,hy); ctx.stroke();
  ctx.restore();
  glove(p.x,p.y);
}
function drawProp(p){
  if(p.kind==='choke'){drawChoke(p); return;}
  if(p.kind==='whip'){drawWhip(p); return;}
  if(p.kind==='kick'||p.L<1) return;
  const u=C/100, L=p.L;
  if(p.sh){ // rubber hose arm
    ctx.save(); ctx.strokeStyle=INK; ctx.lineCap='round'; ctx.lineWidth=Math.max(2.5,C*.05);
    const mx=(p.sh.x+p.x)/2, my=(p.sh.y+p.y)/2+C*.14;
    ctx.beginPath(); ctx.moveTo(p.sh.x,p.sh.y); ctx.quadraticCurveTo(mx,my,p.x,p.y); ctx.stroke(); ctx.restore();
  }
  ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.ang); if(p.flipY) ctx.scale(1,p.flipY);
  ctx.lineJoin='round'; ctx.lineCap='round'; ctx.strokeStyle=INK; ctx.lineWidth=Math.max(2,3.2*u);
  const fs=(f)=>{ctx.fillStyle=f; ctx.fill(); ctx.stroke();};
  switch(p.kind){
    case 'club':
      ctx.beginPath(); ctx.moveTo(-6*u,-3.5*u); ctx.lineTo(L-12*u,-9*u); ctx.lineTo(L-12*u,9*u); ctx.lineTo(-6*u,3.5*u); ctx.closePath(); fs('#B5702E');
      ctx.beginPath(); ctx.arc(L-12*u,0,12*u,0,Math.PI*2); fs('#B5702E');
      ctx.fillStyle='#7A4618'; for(const [a,b] of [[-16,-4],[-8,5],[-4,-6]]){ctx.beginPath(); ctx.arc(L+a*u,b*u,2*u,0,7); ctx.fill();}
      break;
    case 'fork': {
      const h=L-24*u;
      ctx.beginPath(); ctx.rect(-8*u,-3.5*u,h+8*u,7*u); fs('#B5702E');
      ctx.lineCap='round';
      for(const y of [-10,0,10]){
        ctx.strokeStyle=INK; ctx.lineWidth=7*u; ctx.beginPath(); ctx.moveTo(h+2*u,y*u); ctx.lineTo(L,y*u); ctx.stroke();
        ctx.strokeStyle='#C3CBD5'; ctx.lineWidth=3.2*u; ctx.beginPath(); ctx.moveTo(h+2*u,y*u); ctx.lineTo(L,y*u); ctx.stroke();
      }
      ctx.strokeStyle=INK; ctx.lineWidth=Math.max(2,3.2*u); ctx.lineCap='butt';
      ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(h-3*u,-13*u,7*u,26*u,3*u); else ctx.rect(h-3*u,-13*u,7*u,26*u); fs('#C3CBD5');
      break; }
    case 'gun': {
      // stock, receiver, barrel, magazine, grip
      ctx.beginPath(); ctx.moveTo(-22*u,-6*u); ctx.lineTo(-2*u,-6*u); ctx.lineTo(-2*u,6*u); ctx.lineTo(-22*u,9*u); ctx.closePath(); fs('#7A4A22');
      ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(-4*u,-8*u,L*.55,15*u,3*u); else ctx.rect(-4*u,-8*u,L*.55,15*u); fs('#3A3F47');
      ctx.beginPath(); ctx.rect(L*.5,-4*u,L*.5,7*u); fs('#2B2F35');
      ctx.beginPath(); ctx.rect(L*.62,-6*u,L*.3,11*u); fs('#4E555F');
      ctx.beginPath(); ctx.moveTo(L*.2,6*u); ctx.lineTo(L*.32,6*u); ctx.lineTo(L*.36,24*u); ctx.lineTo(L*.24,24*u); ctx.closePath(); fs('#2B2F35');
      ctx.beginPath(); ctx.moveTo(4*u,6*u); ctx.lineTo(12*u,6*u); ctx.lineTo(10*u,17*u); ctx.lineTo(3*u,17*u); ctx.closePath(); fs('#3A3F47');
      break; }
    case 'katana': {
      // black wrapped handle, gold guard, long slightly curved blade
      ctx.beginPath(); ctx.rect(-8*u,-3.5*u,26*u,7*u); fs(INK);
      ctx.strokeStyle='#E8E2D5'; ctx.lineWidth=1.6*u; ctx.beginPath();
      for(let i=-6;i<16;i+=5){ctx.moveTo(i*u,-3.5*u); ctx.lineTo((i+3)*u,3.5*u);} ctx.stroke();
      ctx.strokeStyle=INK; ctx.lineWidth=Math.max(2,3*u);
      ctx.beginPath(); ctx.ellipse(19*u,0,3*u,8*u,0,0,7); fs('#D9A93A');
      ctx.beginPath(); ctx.moveTo(22*u,-3.5*u); ctx.quadraticCurveTo(L*.6,-7*u,L,-6*u); ctx.lineTo(L-6*u,-1*u); ctx.quadraticCurveTo(L*.6,2*u,22*u,3*u); ctx.closePath(); fs('#E3E9EF');
      ctx.strokeStyle='#FFFFFF'; ctx.lineWidth=1.6*u; ctx.beginPath(); ctx.moveTo(26*u,-1.5*u); ctx.quadraticCurveTo(L*.6,-4*u,L-10*u,-4*u); ctx.stroke();
      break; }
    case 'lance': {
      // long wooden shaft, gold hand guard, steel point
      ctx.beginPath(); ctx.moveTo(-26*u,-3*u); ctx.lineTo(L-16*u,-4.5*u); ctx.lineTo(L-16*u,4.5*u); ctx.lineTo(-26*u,3*u); ctx.closePath(); fs('#B5702E');
      ctx.strokeStyle='#8A5220'; ctx.lineWidth=1.6*u; ctx.beginPath();
      for(let i=10;i<L/u-24;i+=14){ctx.moveTo(i*u,-4*u); ctx.lineTo((i+6)*u,4*u);} ctx.stroke();
      ctx.strokeStyle=INK; ctx.lineWidth=Math.max(2,3.2*u);
      ctx.beginPath(); ctx.moveTo(L-18*u,-7*u); ctx.lineTo(L,0); ctx.lineTo(L-18*u,7*u); ctx.closePath(); fs('#C3CBD5');
      ctx.beginPath(); ctx.moveTo(4*u,-5*u); ctx.lineTo(22*u,-13*u); ctx.lineTo(22*u,13*u); ctx.lineTo(4*u,5*u); ctx.closePath(); fs('#C9963B');
      break; }
    case 'knife':
      ctx.beginPath(); ctx.rect(-6*u,-5*u,24*u,10*u); fs('#5B3A1E');
      ctx.beginPath(); ctx.rect(17*u,-9*u,5*u,18*u); fs('#6B7480');
      ctx.beginPath(); ctx.moveTo(22*u,-6*u); ctx.lineTo(L-12*u,-6*u); ctx.quadraticCurveTo(L,-5*u,L,0); ctx.lineTo(22*u,5*u); ctx.closePath(); fs('#DCE6EE');
      ctx.strokeStyle='#FFFFFF'; ctx.lineWidth=2*u; ctx.beginPath(); ctx.moveTo(27*u,-2.5*u); ctx.lineTo(L-16*u,-2.5*u); ctx.stroke();
      break;
    case 'axe':
      ctx.beginPath(); ctx.rect(-6*u,-3.5*u,L+6*u,7*u); fs('#B5702E');
      ctx.beginPath(); ctx.rect(L-26*u,-11*u,16*u,9*u); fs('#8D99A6');
      ctx.beginPath(); ctx.moveTo(L-27*u,3*u); ctx.lineTo(L-36*u,30*u); ctx.quadraticCurveTo(L-18*u,41*u,L,30*u); ctx.lineTo(L-9*u,3*u); ctx.closePath(); fs('#C9D3DC');
      ctx.strokeStyle='#FFFFFF'; ctx.lineWidth=2.5*u; ctx.beginPath(); ctx.moveTo(L-30*u,29*u); ctx.quadraticCurveTo(L-18*u,35*u,L-6*u,29*u); ctx.stroke();
      break;
    case 'wand':
      ctx.beginPath(); ctx.rect(-4*u,-3*u,L+4*u,6*u); fs(INK);
      ctx.beginPath(); ctx.rect(L-11*u,-3*u,11*u,6*u); fs('#FFFFFF');
      ctx.restore(); ctx.save();
      { const tx=p.x+Math.cos(p.ang)*(L+8*u), ty=p.y+Math.sin(p.ang)*(L+8*u); star(tx,ty,11*u*(1+.15*Math.sin(performance.now()/60)),POP); }
      break;
    case 'leg':
      ctx.strokeStyle=INK; ctx.lineWidth=17*u; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(L,0); ctx.stroke();
      ctx.strokeStyle=FILL[p.c]; ctx.lineWidth=10*u; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(L,0); ctx.stroke();
      ctx.lineWidth=Math.max(2,3*u); ctx.strokeStyle=INK; ctx.beginPath(); ctx.rect(L-4*u,-10*u,10*u,20*u); fs(INK);
      break;
  }
  ctx.restore();
  if(p.sh) glove(p.x,p.y);
}
function drawBurst(b){
  const t=b.age/b.life, s=t<.18?ease.back(t/.18):1+(t-.18)*.1, a=t>.75?1-(t-.75)/.25:1;
  ctx.save(); ctx.globalAlpha=Math.max(0,a); ctx.translate(b.x,b.y); ctx.rotate(b.rot); ctx.scale(s,s);
  const n=14, R1=C*.8, R2=C*.55;
  ctx.beginPath();
  for(let i=0;i<n*2;i++){const ang=i*Math.PI/n, q=i%2?R2:R1*(i%4===0?1:.88); ctx.lineTo(Math.cos(ang)*q*1.25,Math.sin(ang)*q*.85);}
  ctx.closePath(); ctx.fillStyle=POP; ctx.fill(); ctx.lineWidth=C*.045; ctx.strokeStyle=INK; ctx.lineJoin='round'; ctx.stroke();
  let fsz=C*.5; ctx.font=`${fsz}px Bangers, Impact, sans-serif`;
  const w=ctx.measureText(b.text).width; if(w>C*1.5){fsz*=C*1.5/w; ctx.font=`${fsz}px Bangers, Impact, sans-serif`;}
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.lineWidth=C*.08; ctx.strokeStyle=INK; ctx.strokeText(b.text,0,C*.03);
  ctx.fillStyle=RED; ctx.fillText(b.text,0,C*.03);
  ctx.restore();
}
function render(now){
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,8*C,8*C);
  if(shake>0) ctx.translate((Math.random()-.5)*shake*C*.14,(Math.random()-.5)*shake*C*.14);
  for(let r=0;r<8;r++) for(let f=0;f<8;f++){
    ctx.fillStyle=(r+f)%2?SQD:SQL; ctx.fillRect(f*C-1,r*C-1,C+2,C+2);
  }
  // very faint grey outline around every square
  ctx.strokeStyle='rgba(60,60,60,.16)'; ctx.lineWidth=1; ctx.beginPath();
  for(let i=1;i<8;i++){ctx.moveTo(i*C,0); ctx.lineTo(i*C,8*C); ctx.moveTo(0,i*C); ctx.lineTo(8*C,i*C);}
  ctx.stroke();
  if(lastMove){ // subtle grey dot where the last moved piece came from
    ctx.fillStyle='rgba(60,60,60,.22)'; ctx.beginPath(); ctx.arc(cx(F(lastMove.from)),(R(lastMove.from)+.5)*C,C*.12,0,7); ctx.fill();
  }
  if(checkSq>=0&&!busy){
    const x=cx(F(checkSq)), y=(R(checkSq)+.5)*C, g=ctx.createRadialGradient(x,y,C*.05,x,y,C*.7);
    g.addColorStop(0,'rgba(230,57,70,.95)'); g.addColorStop(1,'rgba(230,57,70,0)');
    ctx.fillStyle=g; ctx.fillRect(F(checkSq)*C,R(checkSq)*C,C,C);
  }
  if(sel>=0){ctx.fillStyle=POP; ctx.fillRect(F(sel)*C,R(sel)*C,C,C); ctx.lineWidth=C*.05; ctx.strokeStyle=INK; ctx.strokeRect(F(sel)*C+C*.025,R(sel)*C+C*.025,C*.95,C*.95);}
  // coordinates
  ctx.font=`700 ${Math.max(9,C*.16)}px "Comic Neue", "Comic Sans MS", sans-serif`;
  for(let f=0;f<8;f++){ctx.fillStyle=(7+f)%2?SQL:SQD; ctx.textAlign='right'; ctx.textBaseline='bottom'; ctx.fillText('abcdefgh'[f],(f+1)*C-C*.06,8*C-C*.03);}
  for(let r=0;r<8;r++){ctx.fillStyle=r%2?SQL:SQD; ctx.textAlign='left'; ctx.textBaseline='top'; ctx.fillText(String(8-r),C*.06,r*C+C*.04);}
  // move targets
  for(const m of targets){
    const x=cx(F(m.to)), y=(R(m.to)+.5)*C;
    if(m.cap>=0&&!m.ep){ // capturable piece: small triangles in the four corners of its square
      const x0=F(m.to)*C, y0=R(m.to)*C, t=C*.22; ctx.fillStyle='rgba(20,20,20,.35)';
      for(const [cx0,cy0,dx,dy] of [[x0,y0,1,1],[x0+C,y0,-1,1],[x0,y0+C,1,-1],[x0+C,y0+C,-1,-1]]){
        ctx.beginPath(); ctx.moveTo(cx0,cy0); ctx.lineTo(cx0+dx*t,cy0); ctx.lineTo(cx0,cy0+dy*t); ctx.closePath(); ctx.fill();}
    }
    else {ctx.fillStyle='rgba(20,20,20,.35)'; ctx.beginPath(); ctx.arc(x,y,C*.14,0,7); ctx.fill();}
  }
  // static pieces
  for(let s=0;s<64;s++){const p=state.b[s]; if(!p||hidden.has(s)) continue; drawSprite(sprites[p.c+p.t+'0'],cx(F(s)),by(R(s)));}
  for(const p of fx) if(p.layer==='ground') p.draw(p.age/p.life);
  for(const p of props) if(p.kind==='kick') drawKickLegs(p);
  for(const a of actors) if(a.legs) drawRunLegs(a,now);
  const list=actors.slice().sort((a,b)=>(a.y-b.y)||((a.top?1:0)-(b.top?1:0)));
  for(const a of list){
    const x=cx(a.x)+(a.dx||0)+(a.shiver?Math.sin(now*.07)*C*.025:0), g=by(a.y), y=g-a.z*C+(a.dy||0);
    drawSprite(sprites[a.c+a.t+(a.scared?1:0)],x,y,a);
    if(a.red>0&&sprites[a.c+a.t+'red']) drawSprite(sprites[a.c+a.t+'red'],x,y,{...a,alpha:(a.alpha??1)*a.red});
  }
  for(const p of props) drawProp(p);
  for(const p of fx) if(p.layer!=='ground') p.draw(p.age/p.life);
}
let lastTs=performance.now();
function frame(ts){
  const dt=Math.min(.05,(ts-lastTs)/1000)/SPEED; lastTs=ts;
  for(const p of fx){
    p.age+=dt; p.vy=(p.vy||0)+(p.g||0)*dt; p.x+=(p.vx||0)*dt; p.y+=p.vy*dt; if(p.vr) p.rot+=p.vr*dt;
    if(p.floor!=null&&p.y>p.floor){p.y=p.floor; p.vy=0; p.vx*=.8;}
  }
  fx=fx.filter(p=>p.age<p.life);
  for(const b of bursts) b.age+=dt;
  bursts=bursts.filter(b=>b.age<b.life);
  shake=Math.max(0,shake-dt*3.5);
  if(C>0&&sprites.wp0) render(ts);
  requestAnimationFrame(frame);
}

/* ================= animation helpers ================= */
const ease={io:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,out:t=>1-Math.pow(1-t,3),in:t=>t*t*t,lin:t=>t,
  back:t=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);}};
function tween(ms,fn,e=ease.io){
  ms*=SPEED;
  return new Promise(res=>{
    const t0=performance.now();
    const step=now=>{const t=Math.min(1,(now-t0)/ms); fn(e(t),t); if(t<1) requestAnimationFrame(step); else res();};
    requestAnimationFrame(step);
  });
}
const wait=ms=>new Promise(r=>setTimeout(r,ms*SPEED));
const rnd=(a,b)=>a+Math.random()*(b-a);
const mk=(p,x,y,o={})=>({t:p.t,c:p.c,x,y,z:0,sx:1,sy:1,rot:0,flip:1,alpha:1,...o});
const drop=a=>{actors=actors.filter(x=>x!==a);};

function burst(text,V){
  bursts.push({text,x:Math.min(Math.max(cx(V.x),C*1.05),C*6.95),y:Math.min(Math.max(by(V.y)-C*1.05,C*.75),C*7.2),age:0,life:1,rot:rnd(-.2,.2)});
}
function sparkle(x,y,vx,vy,life=.7,size=.12){
  fx.push({layer:'top',x,y,vx,vy,g:0,age:0,life,draw(k){ctx.save(); ctx.globalAlpha=1-k; star(this.x,this.y,C*size*(1-k*.5),POP); ctx.restore();}});
}
function puff(x,y,n=8){
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2+rnd(-.3,.3), sp=rnd(1.2,2.4)*C;
    fx.push({layer:'top',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.7,g:0,age:0,life:.6,
      draw(k){ctx.save(); ctx.globalAlpha=1-k; ctx.fillStyle='#FFFFFF'; ctx.strokeStyle=INK; ctx.lineWidth=Math.max(1.5,C*.025);
        ctx.beginPath(); ctx.arc(this.x,this.y,C*(.1+.14*k),0,7); ctx.fill(); ctx.stroke(); ctx.restore();}});}
}
function dust(x,y){
  for(let i=0;i<12;i++){const s=i%2?1:-1;
    fx.push({layer:'top',x:x+s*C*.2,y,vx:s*rnd(1,3.2)*C,vy:-rnd(.2,1.2)*C,g:C*2,age:0,life:.65,
      draw(k){ctx.save(); ctx.globalAlpha=1-k; ctx.fillStyle='#E4DCCB'; ctx.strokeStyle=INK; ctx.lineWidth=Math.max(1,C*.02);
        ctx.beginPath(); ctx.arc(this.x,this.y,C*(.06+.07*k),0,7); ctx.fill(); ctx.stroke(); ctx.restore();}});}
}
function bloodPool(x,y){
  // comic red puddle under the stomped piece: splashes out, lingers, fades away
  const n=14, pts=[], drops=[];
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2; pts.push([Math.cos(a)*(.42+rnd(-.06,.12)),Math.sin(a)*(.14+rnd(-.02,.05))]);}
  for(let i=0;i<6;i++){const a=rnd(0,Math.PI*2); drops.push([Math.cos(a)*rnd(.5,.7),Math.sin(a)*rnd(.18,.26),rnd(.03,.06)]);}
  fx.push({layer:'ground',x,y,age:0,life:1.2,
    draw(k){
      const grow=Math.min(1,k/.08), sc=.35+.65*(1-Math.pow(1-grow,3));
      ctx.save(); ctx.globalAlpha=k<.6?1:1-(k-.6)/.4; ctx.translate(this.x,this.y); ctx.scale(sc,sc);
      ctx.fillStyle='#C8102E'; ctx.strokeStyle=INK; ctx.lineWidth=Math.max(1.5,C*.03); ctx.lineJoin='round';
      ctx.beginPath();
      pts.forEach((q,i)=>{const nx=pts[(i+1)%n], mx=(q[0]+nx[0])/2*C, my=(q[1]+nx[1])/2*C; i?ctx.quadraticCurveTo(q[0]*C,q[1]*C,mx,my):ctx.moveTo(mx,my);});
      ctx.quadraticCurveTo(pts[0][0]*C,pts[0][1]*C,(pts[0][0]+pts[1][0])/2*C,(pts[0][1]+pts[1][1])/2*C);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#F0566B'; ctx.beginPath(); ctx.ellipse(-C*.14,-C*.04,C*.09,C*.025,-.1,0,7); ctx.fill();
      ctx.fillStyle='#C8102E';
      for(const [dx,dy,r] of drops){ctx.beginPath(); ctx.arc(dx*C,dy*C,r*C,0,7); ctx.fill(); ctx.stroke();}
      ctx.restore();
    }});
}
function fartCloud(x,y,s){
  // white puff blown out of the knight's rear towards the victim
  fx.push({layer:'top',x:x+rnd(-.03,.03)*C,y:y+rnd(-.05,.05)*C,vx:s*C*rnd(1.4,2.8),vy:-C*rnd(.1,.7),g:0,age:0,life:rnd(.9,1.3),r0:rnd(.06,.1),r1:rnd(.2,.3),
    draw(k){const r=C*(this.r0+(this.r1-this.r0)*(1-Math.pow(1-k,2)));
      this.vx*=.97;
      ctx.save(); ctx.globalAlpha=.6*(k<.55?1:1-(k-.55)/.45); ctx.fillStyle='#FFFFFF'; ctx.strokeStyle=INK; ctx.lineWidth=Math.max(1.5,C*.025);
      ctx.beginPath(); ctx.arc(this.x,this.y,r,0,7); ctx.arc(this.x+r*.7,this.y-r*.25,r*.65,0,7); ctx.arc(this.x-r*.6,this.y-r*.2,r*.55,0,7);
      ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(this.x,this.y,r,0,7); ctx.arc(this.x+r*.7,this.y-r*.25,r*.65,0,7); ctx.arc(this.x-r*.6,this.y-r*.2,r*.55,0,7); ctx.fill(); ctx.restore();}});
}
function drawRunLegs(a,now){
  const x=cx(a.x)+(a.dx||0), g=by(a.y), y=g-a.z*C, col=FILL[a.c], t=now/1000;
  for(const i of [0,1]){
    const ph=Math.sin(t*22+i*Math.PI), hx=x+(i?.08:-.08)*C;
    leg(hx,y-.02*C,hx+ph*.14*C,g-Math.max(0,Math.cos(t*22+i*Math.PI))*.06*C,.03*C,col);
  }
}
function muzzle(x,y){
  fx.push({layer:'top',x,y,age:0,life:.06,draw(k){star(this.x,this.y,C*.16,'#FFE45C');}});
}
function shatterBits(V){
  // cut the piece into a grid of small chunks that scatter in all directions
  const spr=sprites[V.c+V.t+'1'], P=1.0*C, bx=cx(V.x), gy=by(V.y), n=8, cs=P/n;
  let data=null; try{data=spr.getContext('2d').getImageData(0,0,spr.width,spr.height).data;}catch(e){}
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){
    if(data){const sx=Math.floor((i+.5)/n*spr.width), sy=Math.floor((j+.5)/n*spr.height); if(data[(sy*spr.width+sx)*4+3]<40) continue;}
    const lx=-P/2+i*cs, ly=-.92*P+j*cs, cx0=lx+cs/2, cy0=ly+cs/2;
    const ang=Math.atan2(cy0+.45*P,cx0)+rnd(-.5,.5), sp=rnd(2,6)*C;
    fx.push({layer:'top',x:bx+cx0,y:gy+cy0,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-C*3,g:C*15,rot:0,vr:rnd(-18,18),age:0,life:rnd(.8,1.2),
      draw(k){ctx.save(); ctx.globalAlpha=k>.6?1-(k-.6)/.4:1; ctx.translate(this.x,this.y); ctx.rotate(this.rot); ctx.translate(-cx0,-cy0);
        ctx.beginPath(); ctx.rect(lx,ly,cs,cs); ctx.clip(); ctx.drawImage(spr,-P/2,-.92*P,P,P); ctx.restore();}});
  }
  puff(bx,gy-.4*C,7);
}
function moveTo(A,x,y,hop=false,ms){
  const x0=A.x,y0=A.y,d=Math.hypot(x-x0,y-y0);
  if(d<.01) return Promise.resolve();
  ms=ms??Math.min(650,170+d*95);
  const steps=Math.max(2,Math.round(d*2.5));
  return tween(ms,e=>{A.x=x0+(x-x0)*e; A.y=y0+(y-y0)*e; A.z=hop?Math.sin(Math.PI*e)*.55:Math.abs(Math.sin(Math.PI*steps*e))*.07;});
}
function approach(A,V,gap,hop=false){
  const dx=V.x-A.x, dy=V.y-A.y, d=Math.hypot(dx,dy);
  if(d<=gap) return Promise.resolve();
  return moveTo(A,V.x-dx/d*gap,V.y-dy/d*gap,hop);
}
function aim(A,V,up){
  const ax=cx(A.x), ay=by(A.y), vx=cx(V.x), vy=by(V.y);
  let ux=vx-ax, uy=vy-ay; const d=Math.hypot(ux,uy)||1; ux/=d; uy/=d;
  const hx=ax+ux*.3*C, hy=ay-.6*C, tx=vx, ty=vy-up*C;
  return {hx,hy,tx,ty,ux,uy,ang:Math.atan2(ty-hy,tx-hx),D:Math.hypot(tx-hx,ty-hy)};
}
const shoulder=(A,hx)=>({x:cx(A.x)+(Math.sign(hx-cx(A.x))||1)*.1*C,y:by(A.y)-.5*C});
const swingSign=(ang,amt)=>Math.sin(ang-amt)<Math.sin(ang+amt)?1:-1;

/* ================= captures ================= */
function shatter(V){
  const spr=sprites[V.c+V.t+'1'], P=1.0*C, bx=cx(V.x), gy=by(V.y), cyL=-.45*P, n=9, off=rnd(0,7), pts=[];
  for(let i=0;i<n;i++){const a=off+i/n*Math.PI*2+rnd(-.17,.17); pts.push([Math.cos(a)*.8*P,cyL+Math.sin(a)*.8*P]);}
  const ctr=[rnd(-.05,.05)*P,cyL+rnd(-.05,.05)*P];
  for(let i=0;i<n;i++){
    const tri=[ctr,pts[i],pts[(i+1)%n]];
    const cen=[(tri[0][0]+tri[1][0]+tri[2][0])/3,(tri[0][1]+tri[1][1]+tri[2][1])/3];
    let dx=cen[0]-ctr[0], dy=cen[1]-ctr[1]; const d=Math.hypot(dx,dy)||1; dx/=d; dy/=d;
    const sp=rnd(2.5,5)*C;
    fx.push({layer:'top',x:bx+cen[0],y:gy+cen[1],vx:dx*sp,vy:dy*sp-C*3,g:C*15,rot:0,vr:rnd(-14,14),age:0,life:1.05,
      draw(k){ctx.save(); ctx.globalAlpha=k>.6?1-(k-.6)/.4:1; ctx.translate(this.x,this.y); ctx.rotate(this.rot); ctx.translate(-cen[0],-cen[1]);
        ctx.beginPath(); tri.forEach((q,j)=>j?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.closePath(); ctx.clip();
        ctx.drawImage(spr,-P/2,-.92*P,P,P); ctx.restore();}});
  }
}
async function melt(V){
  const bx=cx(V.x), gy=by(V.y); let last=0;
  await tween(900,(e,t)=>{
    V.sy=1-.86*e; V.sx=1+.6*e+Math.sin(t*28)*.05*(1-e);
    if(t-last>.07){last=t;
      fx.push({layer:'top',x:bx+rnd(-.22,.22)*C*V.sx,y:gy-rnd(.1,.7)*C*V.sy,vx:rnd(-.4,.4)*C,vy:-C*.4,g:C*9,floor:gy-C*.02,r:C*rnd(.03,.06),age:0,life:.9,
        draw(k){ctx.save(); ctx.globalAlpha=1-k*k; ctx.fillStyle=FILL[V.c]; ctx.strokeStyle=INK; ctx.lineWidth=Math.max(1.2,C*.02);
          ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,7); ctx.fill(); ctx.stroke(); ctx.restore();}});}
  },ease.in);
  drop(V);
  fx.push({layer:'ground',x:bx,y:gy-C*.04,age:0,life:1.4,
    draw(k){ctx.save(); ctx.globalAlpha=k<.45?1:1-(k-.45)/.55; ctx.fillStyle=FILL[V.c]; ctx.strokeStyle=INK; ctx.lineWidth=Math.max(1.5,C*.035);
      ctx.beginPath(); ctx.ellipse(this.x,this.y,C*.42*(1+.08*k),C*.11,0,0,7); ctx.fill(); ctx.stroke();
      for(const s of [-1,1]){ctx.fillStyle='#FFFFFF'; ctx.lineWidth=Math.max(1,C*.018); ctx.beginPath(); ctx.arc(this.x+s*C*.08,this.y-C*.01,C*.035,0,7); ctx.fill(); ctx.stroke();
        ctx.fillStyle=INK; ctx.beginPath(); ctx.arc(this.x+s*C*.08,this.y-C*.01,C*.014,0,7); ctx.fill();}
      ctx.restore();}});
}
function hit(text,V,power=1){shake=power; burst(text,V);}

const FX={
  async p(A,V){ // no special move: walks onto the square and bumps the victim off the board
    const x0=A.x, y0=A.y, tx=V.x, ty=V.y, d=Math.hypot(tx-x0,ty-y0)||1, ux=(tx-x0)/d, uy=(ty-y0)/d;
    let hitDone=false;
    await tween(Math.min(650,170+d*95),e=>{
      A.x=x0+(tx-x0)*e; A.y=y0+(ty-y0)*e; A.z=Math.abs(Math.sin(Math.PI*2*e))*.07;
      if(!hitDone&&e>=1-.55/d){
        hitDone=true; shake=.4; drop(V);
        const spr=sprites[V.c+V.t+'1'];
        fx.push({layer:'top',x:cx(V.x),y:by(V.y),vx:ux*C*5,vy:uy*C*5-C*5,g:C*14,rot:0,vr:(Math.sign(ux)||1)*11,age:0,life:1,
          draw(k){drawSprite(spr,this.x,this.y,{rot:this.rot,sx:1-k*.35,sy:1-k*.35,alpha:k>.75?1-(k-.75)/.25:1});}});
      }
    });
    A.z=0;
  },
  async b(A,V){ // lance: couches the lance, charges and skewers the victim off the board
    await approach(A,V,1.6);
    const s=Math.sign(cx(V.x)-cx(A.x))||1, L=1.0*C;
    const a=aim(A,V,.45);
    const lance={kind:'lance',x:a.hx,y:a.hy,ang:-Math.PI/2+s*.25,L,sh:shoulder(A,a.hx)}; props.push(lance);
    // lower the lance until it points at the victim
    await tween(320,e=>{lance.ang=(-Math.PI/2+s*.25)+(a.ang-(-Math.PI/2+s*.25))*e;},ease.out);
    await wait(160);
    // charge: run at the victim until the tip strikes
    const x0=A.x, y0=A.y, d=Math.hypot(V.x-x0,V.y-y0)||1, ux=(V.x-x0)/d, uy=(V.y-y0)/d;
    const tipReach=(L+Math.hypot(a.hx-cx(A.x),a.hy-by(A.y)))/C, stop=Math.max(0,d-tipReach*.78);
    const hx0=a.hx-cx(x0), hy0=a.hy-by(y0);
    await tween(Math.max(160,stop*130),e=>{
      A.x=x0+ux*stop*e; A.y=y0+uy*stop*e; A.z=Math.abs(Math.sin(Math.PI*3*e))*.06;
      lance.x=cx(A.x)+hx0; lance.y=by(A.y)+hy0; lance.sh=shoulder(A,lance.x);
    },ease.in);
    A.z=0;
    hit('THWACK!',V,1); 
    const tx=lance.x+Math.cos(lance.ang)*L, ty=lance.y+Math.sin(lance.ang)*L;
    for(let i=0;i<6;i++) sparkle(tx,ty,rnd(-2,2)*C,rnd(-2,.5)*C,.4,.09);
    drop(V);
    const spr=sprites[V.c+V.t+'1'];
    fx.push({layer:'top',x:cx(V.x),y:by(V.y),vx:Math.cos(a.ang)*C*8,vy:Math.sin(a.ang)*C*6-C*6,g:C*15,rot:0,vr:s*14,age:0,life:1.1,
      draw(k){drawSprite(spr,this.x,this.y,{rot:this.rot,sx:1-k*.35,sy:1-k*.35,alpha:k>.75?1-(k-.75)/.25:1});}});
    await wait(200);
    await tween(260,e=>{lance.ang=a.ang+(-Math.PI/2+s*.25-a.ang)*e;},ease.io);
    props=[];
    await wait(80);
  },
  async r(A,V){ // stomp
    await approach(A,V,1);
    const x0=A.x,y0=A.y;
    await tween(150,e=>{A.sy=1-.22*e; A.sx=1+.14*e});
    await tween(380,e=>{A.x=x0+(V.x-x0)*e; A.y=y0+(V.y-y0)*e; A.z=1.45*Math.sin(e*Math.PI/2); A.sy=.78+.37*Math.min(1,e*2)-.15*e; A.sx=1.14-.14*Math.min(1,e*2);},ease.out);
    A.sx=1; A.sy=1;
    await wait(90);
    await tween(150,e=>{A.z=1.45*(1-e); V.sy=Math.max(.12,Math.min(1,A.z/.8)); V.sx=1+(1-V.sy)*.75;},ease.in);
    A.z=0; V.sy=.12; V.sx=1.66; V.shiver=false;
    hit('STOMP!',V,1.4); dust(cx(V.x),by(V.y)-C*.05);
    A.sy=.78; A.sx=1.16;
    await tween(260,e=>{A.sy=.78+.22*e; A.sx=1.16-.16*e},ease.back);
    await tween(420,e=>V.alpha=1-e);
    drop(V);
  },
  async n(A,V){ // turn around and buck: front legs planted, both hind legs kick the victim off the board
    const s=Math.sign(V.x-A.x)||1;
    A.flip=s>0?-1:1; // head towards the victim
    await moveTo(A,V.x-s*.9,V.y,true); // line up beside the victim, same row
    await wait(110);
    const f0=A.flip;
    await tween(280,e=>A.flip=f0*Math.cos(Math.PI*e)); // turn the back on the victim
    await wait(60);
    // buck without legs: rear tips up, then the whole body snaps backwards into the victim
    const tx=cx(V.x), ty=by(V.y)-.38*C;
    await tween(200,e=>{A.rot=-s*.38*e; A.dx=-s*C*.08*e;},ease.out);
    await wait(70);
    await tween(80,e=>{A.dx=-s*C*.08+s*C*.3*e; A.rot=-s*(.38+.12*e);},ease.in);
    hit('WHAM!',V,1.2);
    for(let i=0;i<6;i++) sparkle(tx,ty,rnd(-2,2)*C,rnd(-2,1)*C,.5,.1);
    drop(V);
    const spr=sprites[V.c+V.t+'1'];
    fx.push({layer:'top',x:cx(V.x),y:by(V.y),vx:s*C*8,vy:-C*7.5,g:C*16,rot:0,vr:s*13,age:0,life:1.1,
      draw(k){drawSprite(spr,this.x,this.y,{rot:this.rot,sx:1-k*.35,sy:1-k*.35,alpha:k>.75?1-(k-.75)/.25:1});}});
    await wait(120);
    await tween(260,e=>{A.dx=s*C*.22*(1-e); A.rot=-s*.5*(1-e);});
    A.dx=0;
    await wait(100);
  },
  async q(A,V){ // tantrum: stays put, turns red, the victim flees while she marches onto the square
    V.shiver=false; V.scared=false; // calm until she blows up
    await wait(120);
    let lastSteam=0;
    await tween(900,(e,t)=>{
      A.red=e; A.dx=Math.sin(t*90)*C*.03*e; A.sy=1+.05*e*Math.abs(Math.sin(t*25)); A.sx=1+.04*e;
      if(e>.35&&t-lastSteam>.07){lastSteam=t;
        for(const side of [-1,1]) fx.push({layer:'top',x:cx(A.x)+side*.14*C,y:by(A.y)-.92*C,vx:side*C*rnd(.4,1),vy:-C*rnd(1.2,2),g:0,age:0,life:.55,
          draw(k){ctx.save(); ctx.globalAlpha=1-k; ctx.fillStyle='#FFFFFF'; ctx.strokeStyle=INK; ctx.lineWidth=Math.max(1,C*.02);
            ctx.beginPath(); ctx.arc(this.x,this.y,C*(.04+.07*k),0,7); ctx.fill(); ctx.stroke(); ctx.restore();}});}
    },ease.in);
    shake=.6;
    // now the victim starts to tremble while she keeps fuming
    V.shiver=true; V.scared=true;
    await tween(650,(e,t)=>{A.dx=Math.sin(t*90)*C*.03; V.dx=Math.sin(t*140)*C*.035;});
    V.dx=0;
    // the victim bolts away from the queen
    let ux=V.x-A.x, uy=V.y-A.y; const d=Math.hypot(ux,uy)||1; ux/=d; uy/=d;
    V.shiver=false;
    await tween(150,e=>{V.z=.3*Math.sin(Math.PI*e); A.dx=Math.sin(e*40)*C*.03;});
    V.legs=true;
    const x0=V.x, y0=V.y; let run=0;
    while(true){const x=x0+ux*run, y=y0+uy*run; if(x<-1.6||x>8.6||y<-1.6||y>8.6) break; run+=.25;}
    let lastDust=0;
    const flee=tween(Math.max(500,run*125),(e,t)=>{
      V.x=x0+ux*run*e; V.y=y0+uy*run*e; V.z=.1+Math.abs(Math.sin(t*run*9))*.07; V.rot=(Math.sign(ux)||1)*.12;
      if(t-lastDust>.08){lastDust=t; fx.push({layer:'top',x:cx(V.x)-ux*.2*C,y:by(V.y),vx:-ux*C*.8,vy:-C*.4,g:0,age:0,life:.45,
        draw(k){ctx.save(); ctx.globalAlpha=1-k; ctx.fillStyle='#FFFFFF'; ctx.strokeStyle=INK; ctx.lineWidth=Math.max(1,C*.02);
          ctx.beginPath(); ctx.arc(this.x,this.y,C*(.04+.06*k),0,7); ctx.fill(); ctx.stroke(); ctx.restore();}});}
    },ease.in).then(()=>drop(V));
    // she stomps after it, still fuming, and cools down on arrival
    await wait(220);
    const ax0=A.x, ay0=A.y;
    const gx=x0, gy=y0, dist=Math.hypot(gx-ax0,gy-ay0), steps=Math.max(2,Math.round(dist*2.5));
    await tween(Math.max(420,dist*170),e=>{
      A.x=ax0+(gx-ax0)*e; A.y=ay0+(gy-ay0)*e; A.z=Math.abs(Math.sin(Math.PI*steps*e))*.08; A.dx=0;
    },ease.io);
    A.z=0;
    await tween(300,e=>{A.red=1-e; A.sx=1+.04*(1-e); A.sy=1;});
    await flee;
  },
  async k(A,V){ // shrinks the victim to half its size, then stomps it flat
    V.shiver=false;
    await wait(150);
    // shrink with a little wobble
    await tween(450,(e,t)=>{const k=1-.5*e; V.sx=k*(1+.08*Math.sin(t*40)*(1-e)); V.sy=k;},ease.out);
    V.sx=V.sy=.5; V.shiver=true;
    await wait(250);
    // jump up and come down on it
    const x0=A.x,y0=A.y;
    await tween(140,e=>{A.sy=1-.18*e; A.sx=1+.1*e});
    A.sx=1; A.sy=1;
    await tween(360,e=>{A.x=x0+(V.x-x0)*e; A.y=y0+(V.y-y0)*e; A.z=1.2*Math.sin(e*Math.PI/2);},ease.out);
    await wait(80);
    await tween(140,e=>{A.z=1.2*(1-e); const h=A.z; V.sy=.5*Math.max(.15,Math.min(1,h/.4)); V.sx=.5*(1+(1-V.sy/.5)*.8);},ease.in);
    A.z=0; V.sy=.07; V.sx=.9; V.shiver=false;
    hit('STOMP!',V,1.3); dust(cx(V.x),by(V.y)-C*.05);
    A.sy=.8; A.sx=1.14;
    await tween(260,e=>{A.sy=.8+.2*e; A.sx=1.14-.14*e},ease.back);
    await tween(380,e=>V.alpha=1-e);
    drop(V);
  }
};

async function animateMove(m){
  const p=state.b[m.from], fr=R(m.from), ff=F(m.from), tr=R(m.to), tf=F(m.to);
  const A=mk(p,ff,fr,{top:true});
  hidden=new Set([m.from]); actors=[A];
  if(m.castle){
    const rf=m.castle==='K'?7:0, rt=m.castle==='K'?5:3, RA=mk(state.b[fr*8+rf],rf,fr);
    hidden.add(fr*8+rf); actors.push(RA);
    await tween(480,e=>{A.x=ff+(tf-ff)*e; RA.x=rf+(rt-rf)*e; RA.z=Math.sin(Math.PI*e)*.6;});
    return;
  }
  if(m.cap<0){ await moveTo(A,tf,tr,p.t==='n'); return; }
  const V=mk(state.b[m.cap],F(m.cap),R(m.cap),{scared:true,shiver:true});
  hidden.add(m.cap); actors.push(V);
  await FX[p.t](A,V,m);
  const fl=A.flip, x0=A.x, y0=A.y, d=Math.hypot(tf-x0,tr-y0);
  if(d>.01||fl!==1) await tween(Math.min(500,180+d*110),e=>{A.x=x0+(tf-x0)*e; A.y=y0+(tr-y0)*e; A.flip=fl+(1-fl)*e; if(p.t==='n') A.z=Math.sin(Math.PI*e)*.35;});
}

/* ================= status & input ================= */
const turnText=document.getElementById('turnText'), swatch=document.getElementById('swatch'), checkEl=document.getElementById('check');
function updateStatus(){
  const chk=game.inCheck(), c=state.turn;
  checkSq=chk?kingSq(state.b,c):-1;
  checkEl.hidden=!chk||game.isCheckmate();
  swatch.className='swatch'+(c==='b'?' b':'');
  turnText.textContent='TURN: '+COLOR[c];
  over=game.isGameOver();
  if(game.isCheckmate()){ swatch.className='swatch'+(c==='w'?' b':''); turnText.textContent='CHECKMATE! '+COLOR[opp(c)]+' WINS'; }
  else if(game.isStalemate()) turnText.textContent='STALEMATE! DRAW';
  else if(over) turnText.textContent='DRAW!';
}
async function makeMove(m){
  busy=true; sel=-1; targets=[];
  try{ await animateMove(m); }catch(e){ console.error(e); }
  game.move({from:sqName(m.from),to:sqName(m.to),promotion:typeof m.promo==='string'?m.promo:undefined});
  state=snapshot(); lastMove={from:m.from,to:m.to};
  actors=[]; hidden=new Set(); props=[];
  busy=false; updateStatus();
  if(computerTurn()) setTimeout(askEngine,250);
}
const promoEl=document.getElementById('promo'), optsEl=document.getElementById('opts');
function pickPromotion(c){
  return new Promise(res=>{
    optsEl.innerHTML='';
    for(const t of 'qrbn'){
      const b=document.createElement('button'); b.type='button'; b.setAttribute('aria-label','Promote to '+NAMES[t]);
      const cv=document.createElement('canvas'), ratio=window.devicePixelRatio||1; cv.width=cv.height=Math.round(54*ratio);
      const g=cv.getContext('2d'); g.scale(cv.width/100,cv.width/100); drawPieceUnits(g,t,c,false);
      b.append(cv); b.onclick=()=>{promoEl.hidden=true; res(t);};
      optsEl.append(b);
    }
    promoEl.hidden=false; optsEl.firstChild.focus();
  });
}
async function tap(sq){
  if(busy||over) return;
  if(mode===1&&state.turn===CPU) return; // computer's turn
  const p=state.b[sq];
  if(sel>=0){
    const ms=targets.filter(m=>m.to===sq);
    if(ms.length){
      let m=ms[0];
      if(m.promo){ busy=true; const t=await pickPromotion(state.turn); busy=false; m={...m,promo:t}; }
      makeMove(m); return;
    }
  }
  if(p&&p.c===state.turn&&sq!==sel){ sel=sq; targets=movesFrom(sq); }
  else { sel=-1; targets=[]; }
}
canvas.addEventListener('pointerdown',e=>{
  const rc=canvas.getBoundingClientRect();
  const x=e.clientX-rc.left-canvas.clientLeft, y=e.clientY-rc.top-canvas.clientTop;
  const f=Math.floor(x/C), r=Math.floor(y/C);
  if(on(r,f)) tap(r*8+f);
});

function newGame(){
  game=new Chess(); state=snapshot(); sel=-1; targets=[]; lastMove=null; busy=false; over=false;
  hidden=new Set(); actors=[]; props=[]; fx=[]; bursts=[];
  updateStatus();
}
const newBtn=document.getElementById('newBtn'); let sureTimer=null;
newBtn.addEventListener('click',()=>{
  if(busy) return;
  const fresh=!lastMove;
  if(fresh||over||newBtn.classList.contains('sure')){ clearTimeout(sureTimer); newBtn.classList.remove('sure'); newBtn.textContent='NEW GAME'; newGame(); return; }
  newBtn.classList.add('sure'); newBtn.textContent='SURE? TAP AGAIN';
  sureTimer=setTimeout(()=>{newBtn.classList.remove('sure'); newBtn.textContent='NEW GAME';},2500);
});

/* ================= computer opponent: Stockfish (GPL-3.0) ================= */
// Runs Stockfish 17.1 lite (single-threaded WebAssembly build of stockfish.js) in a Web Worker.
// Browsers only allow workers from http(s), so 1 PLAYER needs a web server (e.g. GitHub Pages).
const ENGINE_URL='engine/stockfish.js', CPU='b';
// playing strength: Stockfish "Skill Level" (0 to 20) and thinking time per move
const LEVELS=[{name:'EASY',skill:1,ms:300},{name:'MEDIUM',skill:6,ms:800},{name:'HARD',skill:12,ms:1200},{name:'MASTER',skill:20,ms:1500}];
let level=1;
let mode=2, engine=null, engineFailed=false;
const modeSel=document.getElementById('modeSel'), levelSel=document.getElementById('levelSel');
const computerTurn=()=>mode===1&&state.turn===CPU&&!over;
function startEngine(){
  if(engine) return true;
  if(engineFailed) return false;
  try{ engine=new Worker(ENGINE_URL); }
  catch(e){ engineFailed=true; return false; }
  engine.onerror=()=>{ engineFailed=true; engine=null; busy=false; setMode(2); flashStatus('COMPUTER NEEDS A WEB SERVER'); };
  engine.onmessage=e=>{ const line=String(e.data); if(line.startsWith('bestmove')) onBestMove(line.split(' ')[1]); };
  engine.postMessage('uci');
  engine.postMessage('setoption name Skill Level value '+LEVELS[level].skill);
  engine.postMessage('isready');
  return true;
}
function askEngine(){
  if(!computerTurn()||busy) return;
  if(!startEngine()){ setMode(2); flashStatus('COMPUTER NEEDS A WEB SERVER'); return; }
  busy=true;
  engine.postMessage('position fen '+game.fen());
  engine.postMessage('go movetime '+LEVELS[level].ms);
}
function onBestMove(uci){
  busy=false;
  if(!computerTurn()||!uci||uci==='(none)') return;
  const from=sqIdx(uci.slice(0,2)), to=sqIdx(uci.slice(2,4));
  let m=movesFrom(from).find(x=>x.to===to);
  if(!m) return;
  if(m.promo) m={...m,promo:uci[4]||'q'};
  makeMove(m);
}
function setMode(n){
  mode=n;
  modeSel.value=String(n);
  levelSel.disabled=n!==1; // stays in place so the layout never jumps
  if(computerTurn()) setTimeout(askEngine,250);
}
let flashTimer=null;
function flashStatus(msg){
  turnText.textContent=msg; clearTimeout(flashTimer);
  flashTimer=setTimeout(()=>{ if(!busy) updateStatus(); },2600);
}
levelSel.addEventListener('change',()=>{
  level=Number(levelSel.value);
  if(engine) engine.postMessage('setoption name Skill Level value '+LEVELS[level].skill);
});
modeSel.addEventListener('change',()=>{
  if(modeSel.value==='1'){ if(!startEngine()){ setMode(2); flashStatus('COMPUTER NEEDS A WEB SERVER'); return; } setMode(1); }
  else setMode(2);
});

function start(){
  newGame();
  resize();
  if(document.fonts&&document.fonts.load) document.fonts.load('40px Bangers').catch(()=>{});
  requestAnimationFrame(t=>{lastTs=t; frame(t);});
}
start();
})();

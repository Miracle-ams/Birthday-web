(()=>{
const $=id=>document.getElementById(id),svg=$('cake-svg');if(!svg)return;
const stage=$('cake-stage'),hint=$('cake-instruction'),card=$('wish-message'),actions=$('ck-actions');
const H=(el,on)=>el.classList.toggle('ck-hide',!on);
let n=3,lit=[],wished=false,done=false,cutDone=false,topping='🍓';
const drips=(x0,x1,y,s,r)=>{let o='',k=0;for(let x=x0;x<=x1;x+=s,k++)o+=`<ellipse cx="${x}" cy="${y+(k%3)*3}" rx="${r}" ry="${6+(k%3)*3}"/>`;return o};
let pearls='';for(let x=52;x<=248;x+=14)pearls+=`<circle cx="${x}" cy="254" r="3"/>`;
svg.innerHTML=`<defs><radialGradient id="ck-glow"><stop offset="0" stop-color="#FFE8C4" stop-opacity=".95"/><stop offset="1" stop-color="#FFE8C4" stop-opacity="0"/></radialGradient><clipPath id="ck-slc"><rect x="206" y="194" width="60" height="72"/></clipPath></defs>
<ellipse cx="150" cy="284" rx="120" ry="6" fill="rgba(122,46,65,.16)"/>
<ellipse cx="150" cy="268" rx="140" ry="14" fill="#FFF4DE" stroke="#E9D3B8"/><ellipse cx="150" cy="268" rx="120" ry="9" fill="#FFE8C4" opacity=".6"/>
<g id="ck-body">
<rect x="40" y="198" width="220" height="64" rx="12" fill="#FFE8C4"/><rect x="70" y="146" width="160" height="48" rx="10" fill="#FFE8C4"/><rect x="100" y="104" width="100" height="40" rx="8" fill="#FFE8C4"/>
<rect x="40" y="236" width="220" height="8" fill="#C85A72" opacity=".85"/><rect x="70" y="174" width="160" height="6" fill="#D69E49" opacity=".7"/>
<g fill="#FFF4DE" stroke="#D69E49">${pearls}</g>
<g class="frost"><rect x="38" y="194" width="224" height="16" rx="8"/>${drips(50,250,208,16,7)}<rect x="68" y="142" width="164" height="14" rx="7"/>${drips(78,222,154,16,7)}<rect x="98" y="100" width="104" height="14" rx="7"/>${drips(108,192,112,14,6)}</g>
<text x="150" y="134" text-anchor="middle" font-size="16" fill="#C85A72">♥</text></g>
<g id="ck-cutg"><g id="ck-hole"><rect x="206" y="194" width="56" height="68" rx="6" fill="#F3CF9A"/><rect x="206" y="222" width="56" height="6" class="frost"/></g><g id="ck-slice" clip-path="url(#ck-slc)"><use href="#ck-body"/></g></g>
<g id="ck-top"></g><g id="ck-candles"></g>`;
const cg=svg.querySelector('#ck-candles'),tg=svg.querySelector('#ck-top');
function candles(){
  lit=Array(n).fill(false);const span=Math.min(64,(n-1)*14),r=n===1?16:Math.min(16,Math.max(5,span/(n-1)/2));
  cg.innerHTML=Array.from({length:n},(_,i)=>{const x=n===1?150:150-span/2+i*span/(n-1);
    return `<g class="cdl" data-i="${i}" transform="translate(${x} 0)"><g class="csm"><circle cx="0" cy="54" r="3" fill="#FFF4DE"/><circle cx="-2" cy="46" r="4" fill="#FFDDDD"/></g><g class="cfl" transform="translate(0 60)"><ellipse cx="0" cy="-9" rx="16" ry="18" fill="url(#ck-glow)"/><path d="M0 -22C6 -14 8 -7 0 0C-8 -7 -6 -14 0 -22Z" fill="#F2A65A"/><path d="M0 -14C3 -9 4 -4 0 0C-4 -4 -3 -9 0 -14Z" fill="#FFF4DE"/></g><rect x="-3.5" y="66" width="7" height="34" rx="3" fill="#FFF4DE" stroke="#C85A72"/><path d="M-3.5 76l7 4M-3.5 86l7 4" stroke="#C85A72" stroke-width="2"/><line x1="0" y1="66" x2="0" y2="60" stroke="#4A2C34" stroke-width="1.6" stroke-linecap="round"/><circle cx="0" cy="58" r="${r}" fill="transparent"/></g>`}).join('');
  $('ck-n').textContent=n;sync();
}
function sync(){
  const cs=cg.querySelectorAll('.cdl');cs.forEach((c,i)=>c.classList.toggle('on',lit[i]));
  const on=lit.filter(Boolean).length;if(on===n)wished=true;
  stage.classList.toggle('dim',on===n&&!done);
  H($('ck-light'),on<n&&!done);H($('ck-blow'),on>0&&!done);H($('ck-mic'),on>0&&!done);
  if(!done)hint.textContent=on===n?'Pejamkan mata, ucapkan harapanmu, lalu tiup lilinnya.':on===0?(wished?'Semua lilin padam…':'Ketuk lilin untuk menyalakannya.'):wished?'Tiup semua lilinnya.':`${on} dari ${n} lilin menyala.`;
  if(wished&&on===0&&!done)celebrate();
}
const out=i=>{lit[i]=false;const c=cg.querySelectorAll('.cdl')[i];c.classList.remove('puff');void c.getBoundingClientRect();c.classList.add('puff')};
const lightAll=()=>lit.forEach((_,i)=>setTimeout(()=>{if(!done){lit[i]=true;cg.querySelectorAll('.cdl')[i].classList.remove('puff');sync()}},i*220));
const blowAll=()=>lit.forEach((v,i)=>v&&setTimeout(()=>{out(i);sync()},i*90));
window.blowCandle=blowAll;window.relightCandle=()=>$('ck-again').click();
const fire=()=>{if(!window.confetti)return;const o={colors:['#FFCED8','#C85A72','#D69E49','#FFE8C4']};confetti({...o,particleCount:90,spread:80,origin:{y:.6}});const end=Date.now()+1800;(function f(){confetti({...o,particleCount:5,angle:60,spread:55,origin:{x:0}});confetti({...o,particleCount:5,angle:120,spread:55,origin:{x:1}});if(Date.now()<end)requestAnimationFrame(f)})()};
function balloons(){
  const cols=['#FFCED8','#FFDDDD','#FFE8C4','#C85A72','#D69E49'];
  for(let i=0;i<9;i++){const b=document.createElement('div'),w=36+Math.random()*18;b.className='bln';
    b.style.cssText=`left:${5+Math.random()*88}vw;width:${w}px;height:${w*1.2}px;background:${cols[i%5]};--d:${5+Math.random()*3}s;--sw:${(Math.random()-.5)*80}px;animation-delay:${Math.random()*1.2}s`;
    document.body.appendChild(b);setTimeout(()=>b.remove(),9500)}
}
function celebrate(){
  done=true;stage.classList.remove('dim');H(actions,false);H(card,true);
  hint.textContent='Harapanmu sudah terucap. Lanjutkan untuk mengirim doa dan mencoba filter.';
  H($('ck-light'),false);H($('ck-blow'),false);H($('ck-mic'),false);fire();balloons();
}
$('ck-confetti').onclick=fire;
$('ck-light').onclick=lightAll;$('ck-blow').onclick=blowAll;
$('ck-cut').onclick=e=>{if(cutDone)return;cutDone=true;svg.classList.add('showcut');setTimeout(()=>svg.classList.add('cut'),40);e.target.textContent='Sepotong untukmu ✓';e.target.disabled=true};
$('ck-again').onclick=()=>{
  done=wished=cutDone=false;svg.classList.remove('showcut','cut');
  const c=$('ck-cut');c.textContent='Potong kue';c.disabled=false;
  H(card,false);H(actions,true);candles();
};
async function mic(){
  const b=$('ck-mic');
  try{
    const s=await navigator.mediaDevices.getUserMedia({audio:true}),ac=new AudioContext(),an=ac.createAnalyser();
    an.fftSize=512;ac.createMediaStreamSource(s).connect(an);
    const buf=new Uint8Array(an.fftSize);let hits=0,fin=false;
    const stop=()=>{if(fin)return;fin=true;s.getTracks().forEach(t=>t.stop());ac.close();b.textContent='Atau tiup lewat mikrofon'};
    b.textContent='Tiup ke mikrofon…';setTimeout(stop,15000);
    (function loop(){
      if(fin||done){stop();return}
      an.getByteTimeDomainData(buf);let sum=0;for(const v of buf){const x=(v-128)/128;sum+=x*x}
      hits=Math.sqrt(sum/buf.length)>.25?hits+1:Math.max(0,hits-1);
      if(hits>8){stop();blowAll();return}
      requestAnimationFrame(loop);
    })();
  }catch(e){b.textContent='Mikrofon tidak diizinkan'}
}
$('ck-mic').onclick=mic;
/* hias kue */
$('ck-tog').onclick=()=>$('ck-tools').classList.toggle('open');
$('ck-minus').onclick=()=>{if(done||n<=1)return;n--;candles()};
$('ck-plus').onclick=()=>{if(done||n>=9)return;n++;candles()};
document.querySelectorAll('[data-c]').forEach(d=>d.onclick=()=>{svg.style.setProperty('--frost',d.dataset.c);document.querySelectorAll('[data-c]').forEach(x=>x.classList.toggle('sel',x===d))});
document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{topping=b.dataset.t;document.querySelectorAll('[data-t]').forEach(x=>x.classList.toggle('sel',x===b))});
$('ck-clear').onclick=()=>tg.innerHTML='';
const onCake=(x,y)=>y<104||y>260?false:y<144?x>102&&x<198:y<194?x>72&&x<228:x>42&&x<258&&!(cutDone&&x>204);
svg.addEventListener('click',e=>{
  const c=e.target.closest('.cdl');
  if(c){if(done)return;const i=+c.dataset.i;if(lit[i])out(i);else{lit[i]=true;c.classList.remove('puff')}sync();return}
  const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const p=pt.matrixTransform(svg.getScreenCTM().inverse());
  if(!onCake(p.x,p.y))return;
  tg.insertAdjacentHTML('beforeend',`<g transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})"><text class="drop" text-anchor="middle" dominant-baseline="central" font-size="15">${topping}</text></g>`);
  if(tg.children.length>40)tg.firstChild.remove();
});
candles();
})();

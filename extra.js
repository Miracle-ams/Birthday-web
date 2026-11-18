(()=>{
const $=id=>document.getElementById(id);
const wrap=(n,fn)=>{const o=window[n];window[n]=function(...a){const r=o.apply(this,a);fn.apply(this,a);return r}};
const captions=["Awal cerita kita","Hari-hari yang kusyukuri","Tempatku selalu pulang"]; // ubah sesuai foto

function typeText(el){const t=el.dataset.full||el.textContent.trim();el.dataset.full=t;el.textContent='';let i=0;const id=setInterval(()=>{el.textContent=t.slice(0,++i);if(i>=t.length)clearInterval(id)},32)}

window.openInteractiveLetter=function(){
  const env=$('envelope-closed'); if(env.classList.contains('open'))return;
  if(!isPlaying)toggleMusic();
  env.classList.add('open');
  setTimeout(()=>{
    env.classList.add('hidden');
    $('envelope-hint').textContent="Ketuk kartu sekali lagi untuk melanjutkan";
    $('letter-opened').classList.remove('hidden');
    typeText($('letter-body-content'));
    confetti({particleCount:50,spread:70,origin:{y:.65},colors:['#FFCED8','#C85A72','#D69E49','#FFE8C4']});
  },1200);
};
wrap('saveSettings',()=>{delete $('letter-body-content').dataset.full});

wrap('renderBirthdayCalendar',d=>{
  const [y,m,dd]=d.split('-').map(Number),n=new Date();n.setHours(0,0,0,0);
  const diff=Math.round((new Date(y,m-1,dd)-n)/864e5);
  let el=$('bday-countdown');
  if(!el){el=document.createElement('p');el.id='bday-countdown';$('calendar-month-year').parentElement.before(el)}
  el.textContent=diff>1?`${diff} hari lagi`:diff===1?'Your Special Day!':diff===0?'Hari ini harimu':'Semoga harimu menyenangkan';
});



wrap('sendWishToSky',()=>{
  const t=$('user-wish-input').value.trim();if(!t)return;
  const e=document.createElement('div');e.className='wish-fly';e.textContent='✨ '+t;
  document.body.appendChild(e);setTimeout(()=>e.remove(),4200);
});


let sx=null;
document.addEventListener('touchstart',e=>{sx=e.target.closest('#step-1,#step-5,#photo-book,#lightbox,#settings-modal')?null:e.touches[0].clientX},{passive:true});
document.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>70)dx<0?nextStep():prevStep();sx=null});
document.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA/.test(e.target.tagName)||currentStep===1||document.querySelector('#lightbox.show'))return;if(e.key==='ArrowRight')nextStep();if(e.key==='ArrowLeft')prevStep()});

/* musik latar + daftar lagu (default: About You - The 1975) */
const TRACKS=[
  {t:'About You',a:'The 1975',s:'assets/audio1.mp3'},
  {t:'Swim',a:'Chase Atlantic',s:'assets/musik/swim.mp3'},
  {t:'Paradise',a:'Chase Atlantic',s:'assets/musik/paradise.mp3'},
  {t:'Moonlight',a:'Chase Atlantic',s:'assets/musik/moonlight.mp3'},
  {t:'Falling',a:'Chase Atlantic',s:'assets/musik/falling.mp3'},
  {t:'Into It',a:'Chase Atlantic',s:'assets/musik/into-it.mp3'},
  {t:'Consume (feat. Goon Des Garcons)',a:'Chase Atlantic',s:'assets/musik/consume.mp3'},
  {t:'Friends',a:'Chase Atlantic',s:'assets/musik/friends.mp3'},
  {t:'Slow Down',a:'Chase Atlantic',s:'assets/musik/slow-down.mp3'},
  {t:'HEAVEN AND BACK',a:'Chase Atlantic',s:'assets/musik/heaven-and-back.mp3'},
  {t:'The Walls',a:'Chase Atlantic',s:'assets/musik/the-walls.mp3'}
];
let ti=0,seq=false;
const bgm=new Audio(TRACKS[0].s);bgm.loop=true;bgm.preload='auto';bgm.volume=.7;
const musicUI=on=>{
  const label=$('music-label'),eq=$('eq-container'),ic=$('calendar-play-icon'),vn=$('calendar-vinyl-disc');
  label.textContent=on?'Aktif':'Musik';eq.classList.toggle('playing',on);
  if(ic)ic.className=on?'fa-solid fa-pause':'fa-solid fa-play ml-0.5';
  vn?.classList.toggle('vinyl-spinning',on);
  document.querySelectorAll('.pl-item').forEach((b,i)=>b.classList.toggle('playing',on&&i===ti));
};
window.toggleMusic=async function(){
  try{
    if(!isPlaying){await bgm.play();isPlaying=true;musicUI(true)}
    else{bgm.pause();isPlaying=false;musicUI(false)}
  }catch(err){console.warn('Musik menunggu interaksi pengguna',err)}
};
const sheet=document.createElement('div');sheet.id='pl-sheet';
sheet.innerHTML='<div class="pl-grab"></div><div class="pl-head"><b>Daftar Lagu</b><button id="pl-mode" class="pl-mode">⟲ Ulangi lagu</button></div><div id="pl-list"></div><p id="pl-note"></p>';
const dim=document.createElement('div');dim.id='pl-dim';
document.body.append(dim,sheet);
const list=$('pl-list');
list.innerHTML=TRACKS.map((k,i)=>`<button class="pl-item${i===0?' sel':''}" data-i="${i}"><span class="pl-n">${i+1}</span><span class="pl-t"><b>${k.t}</b><small>${k.a}${i===0?' · Default':''}</small></span><span class="pl-eq"><i></i><i></i><i></i></span></button>`).join('');
const title=()=>{const p=$('cal-track-title');if(p)p.textContent=`${TRACKS[ti].t} - ${TRACKS[ti].a} ✨`};
async function pick(i){
  ti=i;bgm.src=TRACKS[i].s;bgm.loop=!seq;$('pl-note').textContent='';title();
  list.querySelectorAll('.pl-item').forEach((b,k)=>b.classList.toggle('sel',k===i));
  try{await bgm.play();isPlaying=true;musicUI(true)}catch(err){isPlaying=false;musicUI(false)}
}
list.addEventListener('click',e=>{const b=e.target.closest('.pl-item');if(b)pick(+b.dataset.i)});
bgm.addEventListener('ended',()=>{if(seq)pick((ti+1)%TRACKS.length)});
bgm.addEventListener('error',()=>{isPlaying=false;musicUI(false);$('pl-note').textContent='File lagu tidak ditemukan. Pastikan folder assets/musik ikut terunggah.'});
$('pl-mode').addEventListener('click',e=>{seq=!seq;bgm.loop=!seq;e.currentTarget.textContent=seq?'⇥ Putar berurutan':'⟲ Ulangi lagu'});
const plBtn=document.createElement('button');plBtn.id='playlist-btn';plBtn.className='btn btn-soft pl-btn';plBtn.setAttribute('aria-label','Daftar lagu');plBtn.textContent='♫';
$('music-toggle-btn').before(plBtn);
const plOpen=on=>{sheet.classList.toggle('open',on);dim.classList.toggle('open',on)};
plBtn.addEventListener('click',()=>plOpen(!sheet.classList.contains('open')));
dim.addEventListener('click',()=>plOpen(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape')plOpen(false)});
/* hati kecil saat layar diketuk */
document.addEventListener('pointerdown',e=>{
  if(e.target.closest('button,a,input,textarea,label,#photo-book,#lightbox,#cake-svg,#settings-modal'))return;
  const h=document.createElement('i');h.className='hfx';h.textContent='♥';
  h.style.cssText=`left:${e.clientX}px;top:${e.clientY}px;--dx:${(Math.random()-.5)*50}px;--dy:-70px;font-size:${12+Math.random()*8}px`;
  document.body.appendChild(h);setTimeout(()=>h.remove(),1300);
});
/* riak & getar halus pada tombol */
const RS='.btn,.bk-chip,.bk-nav button,.ck-btn,.ck-chip,.ck-link,#btn-prev,#btn-next,#music-toggle-btn,#settings-btn,.filter-option,.controls button,.lb-bar button,.lb-dl,.seg';
document.addEventListener('pointerdown',e=>{
  const b=e.target.closest(RS);if(!b||b.disabled)return;
  const r=b.getBoundingClientRect(),i=document.createElement('i');i.className='rpl';
  i.style.left=e.clientX-r.left+'px';i.style.top=e.clientY-r.top+'px';b.appendChild(i);
  setTimeout(()=>i.remove(),650);if(navigator.vibrate)navigator.vibrate(8);
});
})();

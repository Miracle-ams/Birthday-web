(()=>{
/* Foto & video galeri: tambah/ubah di sini. Tiap item: {src:'foto.jpg'} atau {video:'video.mp4', src:'poster.jpg'} */
const ITEMS=[
 {src:'assets/galeri/foto-1.jpg'},{src:'assets/galeri/foto-2.jpg'},{src:'assets/galeri/foto-3.jpg'},{src:'assets/galeri/foto-4.jpg'},
 {src:'assets/galeri/foto-5.jpg'},{src:'assets/galeri/foto-6.jpg'},{src:'assets/galeri/foto-7.jpg'},
 {video:'assets/galeri/video-1.mp4',src:'assets/galeri/poster-1.jpg'},{video:'assets/galeri/video-2.mp4',src:'assets/galeri/poster-2.jpg'}
];
const CAPTIONS=[
  "main character energy ♡",
  "pretty in every way",
  "you just have that something",
  "lowkey my favorite view",
  "camera loves you fr",
  "random things, favorite person",
  "this look tho??",
  "core memory unlocked",
  "one more about u <3"
];
const $=id=>document.getElementById(id),book=$('photo-book');if(!book)return;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let likes=store.get('book_likes',{}),caps=store.get('book_caps',{});
const ph=n=>'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFCED8"/><stop offset="1" stop-color="#FFE8C4"/></linearGradient></defs><rect width="300" height="400" fill="url(#g)"/><text x="150" y="195" text-anchor="middle" font-size="56" fill="#C85A72">♡</text><text x="150" y="240" text-anchor="middle" font-family="Georgia" font-size="16" fill="#7A2E41">Foto ${n}</text></svg>`);
let photos=ITEMS.length?ITEMS.map(x=>({...x})):[1,2,3,4,5,6].map(n=>({src:ph(n)}));
let N=0,cur=0,busy=false,ang=[],leaves=[],snd=true,ac;
const cap=j=>caps[j]??(CAPTIONS[j]||'Kenangan');
const page=j=>{const it=photos[j];return it?`<figure><img src="${it.src}" data-j="${j}" alt="" draggable="false">${it.video?'<i class="play">▶</i>':''}<figcaption data-cap="${j}">${esc(cap(j))}</figcaption></figure><span class="lk" data-lk="${j}">${likes[j]?'♥ '+likes[j]:''}</span><span class="pn">${j+1}</span>`:'<div class="blank">To be continued<br>♡</div>'};
const cover='<div class="face front cover"><div class="gem">♡</div><div class="ttl">Galeri<br>Foto</div><div class="sub">ketuk untuk membuka</div></div><div class="face back ded"><p>A<br>little book<br>full of you.</p></div>';
const count=()=>{const c=$('book-count');if(c)c.textContent=cur===0?'Sampul':`${cur} / ${N}`};
const z=i=>leaves[i].style.zIndex=ang[i]>90?i+1:N-i;
const apply=i=>{const L=leaves[i];L.style.transform=`rotateY(${-ang[i]}deg)`;L.style.setProperty('--sh',(Math.sin(ang[i]*Math.PI/180)*.8).toFixed(2));L.classList.toggle('f',ang[i]>90)};
book.addEventListener('error',e=>{const t=e.target;if(t.tagName==='IMG'&&!t.dataset.fb&&t.dataset.j){t.dataset.fb=1;t.src=ph(+t.dataset.j+1)}},true);
function build(){
  N=1+Math.ceil(photos.length/2);ang=Array(N).fill(0);cur=0;
  book.innerHTML='<div class="book-base"><div class="bk-left"><div class="blank">♡</div></div><div class="bk-right"><div class="blank">Always, with u<br>♡</div></div></div>'+
    `<div class="leaf">${cover}</div>`+
    Array.from({length:N-1},(_,k)=>`<div class="leaf"><div class="face front">${page(2*k)}</div><div class="face back">${page(2*k+1)}</div></div>`).join('');
  leaves=[...book.querySelectorAll('.leaf')];leaves.forEach((_,i)=>{z(i);apply(i)});
  book.classList.add('closed');count();
}
function anim(i,to,ms,done){
  const from=ang[i],t0=performance.now();leaves[i].style.zIndex=200;
  requestAnimationFrame(function f(t){
    const p=clamp((t-t0)/ms,0,1),e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
    ang[i]=from+(to-from)*e;apply(i);
    if(p<1)requestAnimationFrame(f);else{z(i);done&&done()}
  });
}
function setCur(t){ang=ang.map((_,i)=>i<t?180:0);leaves.forEach((_,i)=>{apply(i);z(i)});cur=t;book.classList.toggle('closed',t===0);count()}
const swish=()=>{if(!snd)return;try{ac=ac||new AudioContext();const n=ac.sampleRate*.35,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/n);const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;f.type='bandpass';f.frequency.value=1800;g.gain.value=.12;s.connect(f);f.connect(g);g.connect(ac.destination);s.start()}catch(e){}};
function go(d){
  const t=cur+d;if(busy||t<0||t>N)return;
  const i=d>0?cur:t;busy=true;swish();cur=t;book.classList.toggle('closed',t===0);count();
  anim(i,d>0?180:0,800,()=>busy=false);
}
window.bookFlip=go;
/* hati, suka, caption */
const burst=(x,y)=>{for(let i=0;i<7;i++){const h=document.createElement('i');h.className='hfx';h.textContent='♥';h.style.cssText=`left:${x}px;top:${y}px;--dx:${(Math.random()-.5)*120}px;--dy:${-60-Math.random()*90}px;animation-delay:${i*40}ms;font-size:${14+Math.random()*14}px`;document.body.appendChild(h);setTimeout(()=>h.remove(),1500)}};
function like(j){likes[j]=(likes[j]||0)+1;store.set('book_likes',likes);document.querySelectorAll(`[data-lk="${j}"]`).forEach(x=>x.textContent='♥ '+likes[j]);if(lb.classList.contains('show')&&idx===j)lbUpdate()}
function editCap(el){
  const j=+el.dataset.cap,inp=document.createElement('input');inp.value=cap(j);inp.maxLength=40;inp.className='capin';
  el.textContent='';el.appendChild(inp);inp.focus();inp.select();
  const save=()=>{caps[j]=inp.value.trim()||CAPTIONS[j]||'Kenangan';store.set('book_caps',caps);document.querySelectorAll(`[data-cap="${j}"]`).forEach(x=>x.textContent=caps[j])};
  inp.onblur=save;inp.onkeydown=e=>{if(e.key==='Enter')inp.blur()};
}
/* lightbox: foto/video timbul dari posisi di buku */
const lb=document.createElement('div');lb.id='lightbox';
lb.innerHTML='<button class="lb-x" aria-label="Tutup">✕</button><div class="lb-stage"><img alt=""><video playsinline controls></video><i class="lb-play">▶</i></div><p></p><div class="lb-bar"><button data-n="-1">‹</button><span></span><button data-n="1">›</button><button class="lb-like">♥ <b>0</b></button><a class="lb-dl" download>Simpan</a></div><em>Ketuk foto untuk zoom · geser untuk berganti</em>';
document.body.appendChild(lb);
const lbi=lb.querySelector('img'),lbv=lb.querySelector('video'),lbp=lb.querySelector('.lb-play'),st=lb.querySelector('.lb-stage');
let idx=0,swiped=false,sx=null,mp=false;
const music=()=>typeof isPlaying!=='undefined'&&typeof toggleMusic==='function';
lbv.addEventListener('play',()=>{if(music()&&isPlaying){mp=true;toggleMusic()}});
const resume=()=>{if(mp){mp=false;if(music()&&!isPlaying)toggleMusic()}};
lbv.addEventListener('pause',resume);lbv.addEventListener('ended',resume);
const j2cur=j=>j%2===0?j/2+1:(j-1)/2+2;
function lbUpdate(){
  const it=photos[idx];lbv.pause();lbv.removeAttribute('src');lbv.style.display='none';
  lbi.style.display='block';lbi.classList.remove('zoom');lbi.src=it.src;lbp.style.display=it.video?'grid':'none';
  lb.querySelector('p').textContent=cap(idx);lb.querySelector('.lb-bar span').textContent=`${idx+1} / ${photos.length}`;
  lb.querySelector('b').textContent=likes[idx]||0;lb.querySelector('.lb-dl').href=it.video||it.src;
}
function playVid(){lbp.style.display='none';lbi.style.display='none';lbv.style.display='block';lbv.src=photos[idx].video;lbv.play().catch(()=>{})}
function openLB(j,from){
  idx=j;st.style.transition='none';st.style.transform='';lbUpdate();lb.classList.add('show');
  const fly=()=>{
    if(!from)return;const a=from.getBoundingClientRect(),b=st.getBoundingClientRect();if(!b.width)return;
    st.style.transform=`translate(${a.left+a.width/2-(b.left+b.width/2)}px,${a.top+a.height/2-(b.top+b.height/2)}px) scale(${a.width/b.width})`;
    st.getBoundingClientRect();st.style.transition='transform .55s cubic-bezier(.22,1,.36,1)';st.style.transform='';
  };
  if(lbi.complete&&lbi.naturalWidth)fly();else lbi.onload=()=>{lbi.onload=null;fly()};
}
const closeLB=()=>{lbv.pause();lb.classList.remove('show');const t=j2cur(idx);if(t!==cur&&t<=N)setCur(t)};
const nav=d=>{idx=(idx+d+photos.length)%photos.length;st.style.transition='none';st.style.transform='';lbUpdate()};
lb.addEventListener('click',e=>{
  if(swiped){swiped=false;return}
  const n=e.target.closest('[data-n]');if(n)return nav(+n.dataset.n);
  if(e.target.closest('.lb-like')){like(idx);burst(e.clientX,e.clientY);return}
  if(e.target.closest('.lb-dl')||e.target===lbv)return;
  if(e.target===lbi){
    if(photos[idx].video){playVid();return}
    lbi.style.transformOrigin=`${e.offsetX/lbi.offsetWidth*100}% ${e.offsetY/lbi.offsetHeight*100}%`;lbi.classList.toggle('zoom');return;
  }
  closeLB();
});
lb.addEventListener('pointerdown',e=>{sx=e.clientX});
lb.addEventListener('pointerup',e=>{if(sx===null)return;const dx=e.clientX-sx;sx=null;if(Math.abs(dx)>60&&e.target!==lbv&&!lbi.classList.contains('zoom')){swiped=true;nav(dx<0?1:-1)}});
document.addEventListener('keydown',e=>{if(!lb.classList.contains('show'))return;if(e.key==='Escape')closeLB();if(e.key==='ArrowRight')nav(1);if(e.key==='ArrowLeft')nav(-1)});
/* tarik & ketuk halaman */
let drag=null;
book.addEventListener('pointerdown',e=>{
  if(busy||e.target.tagName==='INPUT')return;
  const r=book.getBoundingClientRect(),side=(cur===0||e.clientX>r.left+r.width/2)?1:-1,i=side>0?cur:cur-1,ok=i>=0&&i<N;
  drag={x:e.clientX,side,i:ok?i:-1,a0:ok?ang[i]:0,moved:false,t:e.target};
  book.setPointerCapture?.(e.pointerId);
});
book.addEventListener('pointermove',e=>{
  if(!drag||drag.i<0)return;const dx=e.clientX-drag.x;
  if(!drag.moved&&Math.abs(dx)<8)return;
  drag.moved=true;const i=drag.i;
  ang[i]=clamp(drag.a0-dx*180/(book.offsetWidth*.8),0,180);apply(i);leaves[i].style.zIndex=200;
  if(cur===0&&i===0)book.classList.remove('closed');
});
function up(e){
  if(!drag)return;const d=drag;drag=null;
  if(!d.moved){tap(d);return}
  const a=ang[d.i],to=d.side>0?(a>45?180:0):(a<135?0:180),nc=to===180?d.i+1:d.i;
  busy=true;if(nc!==cur)swish();cur=nc;book.classList.toggle('closed',cur===0);count();
  anim(d.i,to,450,()=>busy=false);
}
book.addEventListener('pointerup',up);book.addEventListener('pointercancel',up);
function tap(d){
  const t=d.t;
  if(t.tagName==='IMG'&&t.dataset.j){openLB(+t.dataset.j,t);return}
  if(t.tagName==='FIGCAPTION'){editCap(t);return}
  if(d.i>=0)go(d.side);
}
/* kontrol */
let auto=null;const ab=$('book-auto');
ab?.addEventListener('click',()=>{
  if(auto){clearInterval(auto);auto=null;ab.textContent='▶ Putar otomatis';return}
  ab.textContent='❚❚ Berhenti';
  const tick=()=>{const sl=book.closest('.step-slide');if(sl&&!sl.classList.contains('active')){ab.click();return}if(busy)return;cur<N?go(1):setCur(0)};
  auto=setInterval(tick,2600);tick();
});
$('book-snd')?.addEventListener('click',e=>{snd=!snd;e.target.textContent=snd?'♪ Suara: nyala':'♪ Suara: mati'});
$('book-upload')?.addEventListener('change',async e=>{
  const fs=[...e.target.files];if(!fs.length)return;
  const urls=await Promise.all(fs.map(f=>new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f)})));
  photos.push(...urls.map(src=>({src})));build();
});
build();
})();

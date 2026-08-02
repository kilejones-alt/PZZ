(() => {
  const root=document.documentElement, body=document.body;
  const cursor=document.querySelector('.cursor');
  let mx=innerWidth/2,my=innerHeight/2,px=0,py=0;
  addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;px=(mx/innerWidth-.5)*2;py=(my/innerHeight-.5)*2;root.style.setProperty('--mx',mx+'px');root.style.setProperty('--my',my+'px');root.style.setProperty('--px',px.toFixed(3));root.style.setProperty('--py',py.toFixed(3));if(cursor){cursor.style.left=mx+'px';cursor.style.top=my+'px'}});
  requestAnimationFrame(()=>body.classList.add('page-ready'));setTimeout(()=>body.classList.add('transition-complete'),1100);
  document.querySelectorAll('a,button,.theme-node,.plane').forEach(el=>{el.addEventListener('pointerenter',()=>cursor?.classList.add('hot'));el.addEventListener('pointerleave',()=>cursor?.classList.remove('hot'))});

  const menu=document.querySelector('.menu'),nav=document.querySelector('.nav');
  menu?.addEventListener('click',()=>{const open=!nav.classList.contains('open');nav.classList.toggle('open',open);body.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',open)});
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');body.classList.remove('menu-open')}));

  // architectural page transitions
  document.querySelectorAll('a[href]').forEach(a=>a.addEventListener('click',e=>{const href=a.getAttribute('href');if(!href||href.startsWith('#')||href.startsWith('mailto:')||a.target==='_blank'||/^https?:/.test(href))return;e.preventDefault();body.classList.add('is-leaving');setTimeout(()=>location.href=href,640)}));

  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // magnetic links
  document.querySelectorAll('[data-magnetic],.nav a').forEach(el=>{el.addEventListener('pointermove',e=>{if(matchMedia('(pointer:coarse)').matches)return;const r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform=`translate(${x*.14}px,${y*.2-3}px)`});el.addEventListener('pointerleave',()=>el.style.transform='')});

  // draggable colored planes
  document.querySelectorAll('.plane').forEach(el=>{let sx=0,sy=0,ox=0,oy=0,drag=false;el.addEventListener('pointerdown',e=>{drag=true;el.setPointerCapture(e.pointerId);sx=e.clientX;sy=e.clientY;const m=new DOMMatrix(getComputedStyle(el).transform);ox=m.m41;oy=m.m42});el.addEventListener('pointermove',e=>{if(!drag)return;el.style.transform=`translate(${ox+e.clientX-sx}px,${oy+e.clientY-sy}px)`});el.addEventListener('pointerup',()=>drag=false)});

  // horizontal shelf drag + wheel
  document.querySelectorAll('.book-shelf').forEach(shelf=>{let down=false,startX,scroll; shelf.addEventListener('pointerdown',e=>{down=true;startX=e.clientX;scroll=shelf.scrollLeft;shelf.classList.add('dragging');shelf.setPointerCapture(e.pointerId)});shelf.addEventListener('pointermove',e=>{if(down)shelf.scrollLeft=scroll-(e.clientX-startX)*1.4});shelf.addEventListener('pointerup',()=>{down=false;shelf.classList.remove('dragging')});shelf.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){e.preventDefault();shelf.scrollLeft+=e.deltaY}},{passive:false})});

  // 3D book cover tracking
  document.querySelectorAll('[data-tilt]').forEach(el=>{el.addEventListener('pointermove',e=>{if(matchMedia('(pointer:coarse)').matches)return;const r=el.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`rotateY(${x*15}deg) rotateX(${-y*12}deg) translateY(-12px)`});el.addEventListener('pointerleave',()=>el.style.transform='')});

  // research interactive readout
  const copy={
    secularism:['Secularism','How societies reorganize belief, institutions, and civic life as religion changes.'],
    nonreligion:['Nonreligion','The lives, identities, cultures, and communities of people outside organized religion.'],
    morality:['Morality','How ethical life is formed, practiced, and sustained without religious authority.'],
    democracy:['Democracy','The relationship between secular values, pluralism, freedom, and democratic society.'],
    social:['Social change','How cultural and institutional transformations alter belief, belonging, and public life.'],
    humanism:['Humanism','Human flourishing, reason, compassion, and meaning in this life.']
  };
  const readout=document.querySelector('.theme-readout');document.querySelectorAll('.theme-node').forEach(n=>n.addEventListener('click',()=>{document.querySelectorAll('.theme-node').forEach(x=>x.classList.remove('active'));n.classList.add('active');const d=copy[n.dataset.theme];if(readout){readout.querySelector('h2').textContent=d[0];readout.querySelector('p').textContent=d[1];readout.animate([{transform:'translate(-50%,-50%) scale(.88) rotate(-2deg)'},{transform:'translate(-50%,-50%) scale(1) rotate(0)'}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'})}}));
})();
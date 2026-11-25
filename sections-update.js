/* Header, career, beyond-work collage and CV. Original CV facts stay in for-agents.html. */
(() => {
  const header = document.querySelector('.site-header');
  const achievements = document.querySelector('.portfolio-achievements ul');
  const toast = document.querySelector('.achievement-toast');
  if (achievements && toast) {
    const icon = path => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="${path}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const locked = icon('M8.5 8a3.5 3.5 0 1 1 5.5 2.9c-1.4 1-2 1.7-2 3.1m0 4h.01');
    const download = icon('M4 7 7 4h10l3 3v10l-3 3H7l-3-3V7Zm8 0v8m-3-3 3 3 3-3');
    const definitions = {
      first: ['Первый кейс', 'M5 4h14v16H5zM8 8h8m-8 4h8'],
      all: ['Все кейсы', 'M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 3 2 2 4-5'],
      cv: ['CV в коллекции'],
      contact: ['Начал разговор', 'M4 4h16v12H9l-5 4zM8 9h8'],
      agent: ['Ты бот?', 'M5 7h14v12H5zm7-4v4m-3 5h.01m6 0h.01'],
      generations: ['Коллекционер', 'M3 7h7l2 2h9v11H3zM6 4h11'],
      ai: ['Нейродвиж', 'M12 2v20M2 12h20M5 5l14 14M19 5 5 19'],
      photo: ['Вне работы', 'M3 6h18v13H3zM3 16l5-5 5 5 3-3 5 5m-5-9h.01'],
      food: ['На кухне', 'M4 4v5a3 3 0 0 0 6 0V4M7 4v16m11 0V4l-4 7h4'],
      end: ['До самого конца', 'M12 3v14m-5-5 5 5 5-5M5 21h14']
    };
    const badges = new Map();
    const colors = ['#67f5d0', '#77c8ff', '#ffac6c', '#ff89b7', '#b39aff', '#f7d478', '#8c9cff', '#7ee08c', '#ff896e', '#df9aff'];
    for (const [index, [key, [name, path]]] of Object.entries(definitions).entries()) {
      const item = document.createElement('li');
      const badge = document.createElement('span');
      badge.className = 'achievement-icon';
      badge.style.setProperty('--badge-accent', colors[index]);
      badge.innerHTML = locked;
      const hint = document.createElement('span');
      hint.id = `achievement-${key}`;
      hint.className = 'achievement-hint';
      hint.hidden = true;
      hint.setAttribute('role', 'tooltip');
      hint.textContent = 'Ты еще не нашел';
      badge.setAttribute('aria-describedby', hint.id);
      item.append(badge, hint);
      achievements.append(item);
      badges.set(key, { badge, hint, name, color: colors[index], art: path ? icon(path) : download });
    }

    const reward = document.querySelector('.achievement-reward');
    const queue = [];
    const storageKey = 'portfolio-achievements-v1';
    const unlocked = new Set();
    const seenCases = new Set();
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (Array.isArray(saved?.unlocked)) {
        saved.unlocked.filter(key => badges.has(key)).forEach(key => unlocked.add(key));
      }
      if (Array.isArray(saved?.seenCases)) {
        saved.seenCases.filter(Number.isInteger).forEach(key => seenCases.add(key));
      }
    } catch {
      // Achievements still work in memory when storage is unavailable.
    }

    function saveProgress() {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          unlocked: [...unlocked],
          seenCases: [...seenCases]
        }));
      } catch {
        // Storage may be disabled or full.
      }
    }

    function revealBadge(key) {
      const entry = badges.get(key);
      entry.badge.classList.add('is-unlocked');
      entry.badge.innerHTML = entry.art;
      entry.hint.textContent = entry.name;
      return entry;
    }
    unlocked.forEach(revealBadge);
    const confetti = '<svg class="achievement-confetti" viewBox="0 0 48 48" aria-hidden="true"><path stroke="#ffae65" d="M9 15l5 2m20 15 4 4M21 5l1 5"/><path stroke="#67f5d0" d="M35 9l-3 5M8 31l-4 3m20 4v5"/><path stroke="#ae9bff" d="M42 21l-5 1M14 39l2-4"/></svg>';
    function showReward() {
      const next = queue.shift();
      if (!next) return;
      reward.innerHTML = `<span class="achievement-icon is-unlocked">${next.art}${confetti}</span><span>Ачивка открыта<br><strong>${next.name}</strong></span>`;
      reward.style.setProperty('--badge-accent', next.color);
      reward.showPopover?.();
      reward.classList.add('is-visible');
      setTimeout(() => {
        reward.classList.remove('is-visible');
        reward.hidePopover?.();
        showReward();
      }, 2700);
    }
    function unlock(key) {
      if (unlocked.has(key)) return;
      unlocked.add(key);
      queue.push(revealBadge(key));
      saveProgress();
      if (!reward.classList.contains('is-visible')) showReward();
    }

    document.addEventListener('portfolio:case', event => {
      if (seenCases.has(event.detail)) return;
      seenCases.add(event.detail);
      saveProgress();
      unlock('first');
      const total = new Set(Array.from(document.querySelectorAll('#projectGallery [data-case]'), el => Number(el.dataset.case))).size;
      if (total && seenCases.size >= total) unlock('all');
    });
    document.addEventListener('portfolio:ai', () => unlock('ai'));
    document.addEventListener('portfolio:collection', () => unlock('generations'));
    document.addEventListener('portfolio:hobby-photo', () => unlock('photo'));
    let hideToast;
    document.addEventListener('click', event => {
      if (event.defaultPrevented) return;
      if (event.target.closest('.contact-link')) unlock('contact');
      if (event.target.closest('.agents-link')) unlock('agent');
      if (event.target.closest('#hobbies .beyond-link')) unlock('food');
      if (!event.target.closest('a.nav-cv[download], a.cv-download[download]')) return;
      unlock('cv');
      toast.innerHTML = `<span class="achievement-icon is-unlocked">${download}</span><span>CV отправлено в загрузку</span>`;
      toast.classList.add('is-visible');
      clearTimeout(hideToast);
      hideToast = setTimeout(() => toast.classList.remove('is-visible'), 3200);
    });
    addEventListener('scroll', () => {
      if (scrollY > 0 && scrollY + innerHeight >= document.documentElement.scrollHeight - 8) unlock('end');
    }, { passive: true });

  }
  if (header) {
    header.classList.add('header-refined');
    const nav = header.querySelector('nav');
    if (nav && !nav.querySelector('[href="for-agents.html"]')) {
      const link = document.createElement('a');
      link.href = 'for-agents.html'; link.textContent = 'For Agents'; link.className = 'agents-link';
      nav.insertBefore(link, nav.querySelector('.nav-cv, .contact-link'));
    }
    const menu = document.querySelector('#mobileNavigation');
    const toggle = header.querySelector('.mobile-nav-toggle');
    if (menu && toggle && nav) {
      const menuLinks = menu.querySelector('nav');
      for (const link of nav.querySelectorAll('a:not(.nav-logo)')) {
        menuLinks.append(link.cloneNode(true));
      }
      toggle.addEventListener('click', () => {
        menu.showModal();
        toggle.setAttribute('aria-expanded', 'true');
      });
      menu.addEventListener('close', () => toggle.setAttribute('aria-expanded', 'false'));
      menu.addEventListener('click', event => {
        if (event.target.closest('button, a')) menu.close();
      });
      matchMedia('(max-width: 800px)').addEventListener('change', event => {
        if (!event.matches && menu.open) menu.close();
      });
    }
  }
  const career = document.querySelector('#careers');
  if (career) {
    const list = career.querySelector('.careers-list');
    if (list) list.hidden = true;
    career.classList.add('career-refined');
    const companies = [
      ['Ozon Банк','https://finance.ozon.ru/','ozon',2026,'images/redesign/career-ozon.svg'],
      ['1С','https://1c.ru/','one-c',2025,'images/redesign/career-1c.svg'],
      ['ToYou','https://toyou.io/','toyou',2023,'images/redesign/career-toyou.svg'],
      ['Growth.pet','https://growth.pet/','growth',2022,''],
      ['Salebot','https://salebot.pro/','salebot',2021,'images/redesign/career-salebot.svg'],
      ['Московская область','https://mosreg.ru/','mosreg',2020,'images/redesign/career-mosreg.svg']
    ];
    const track = document.createElement('div'); track.className = 'career-logo-track';
    track.setAttribute('aria-label','Карьера: от последнего места работы к первому');
    track.innerHTML = companies.map(([name,url,cls,year,img]) => `<a class="career-logo ${cls}" href="${url}" target="_blank" rel="noopener noreferrer">${img?`<img src="${img}" alt="${name}">`:`<strong>${name}</strong>`}<span class="career-logo-year">${year}</span></a>`).join('');
    const reel = document.createElement('div');
    reel.className = 'career-logo-reel';
    const group = document.createElement('div');
    group.className = 'career-logo-group';
    group.append(...track.children);
    const copy = group.cloneNode(true);
    copy.classList.add('career-logo-copy');
    copy.inert = true;
    copy.setAttribute('aria-hidden', 'true');
    reel.append(group, copy);
    track.append(reel);
    career.append(track);
  }
  const hobbies = document.querySelector('#hobbies');
  if (hobbies) {
    const photos = [...hobbies.querySelectorAll('.hobby-photo')];
    hobbies.classList.add('beyond-work');
    const center = document.createElement('div'); center.className = 'beyond-copy';
    center.innerHTML = '<h2>Помимо<br>работы</h2><p>Шастаю по горам.<br>Поднимаю тяжёлое и готовлю вкусное.<br>КМС по становой тяге и жиму.</p><a class="beyond-link" href="https://t.me/belazyandcook" target="_blank" rel="noopener noreferrer">TG-канал с едой</a>';
    const collage = document.createElement('div'); collage.className = 'beyond-photos';
    photos.forEach((photo,i) => { photo.classList.add('beyond-photo',`beyond-photo-${i+1}`);collage.append(photo); });
    hobbies.replaceChildren(center,collage);
  }
  const cv = document.querySelector('#contact .cv-download');
  if (cv) {
    cv.classList.add('cv-refined');
    cv.innerHTML = '<span class="cv-copy"><span class="cv-title">Скачать CV</span></span>';
  }
})();
/* Scroll-driven stack reveal, followed by a continuous photo orbit. */
(() => {
 const box=document.querySelector('#hobbies');if(!box)return;
 const cards=[...box.querySelectorAll('.beyond-photo')];if(!cards.length)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let angle=0,last=0,visible=false,progress=0,dirty=true,dragging=false,start=0;
 let width=0,height=0,centerY=0,stackY=0;
 box.style.touchAction='pan-y';
 function measure(){
  const rect=box.getBoundingClientRect(),copy=box.querySelector('.beyond-copy').getBoundingClientRect();
  width=rect.width;height=rect.height;centerY=width<650?height*.65:height*.5;
  const cardHeight=width<650?140:Math.min(240,width*.22);
  stackY=Math.min(height-cardHeight*.5-12,copy.bottom-rect.top+cardHeight*.5+24)-centerY;
  // Fully open once the viewport has traversed two thirds of this section.
  progress=reduced.matches?1:Math.max(0,Math.min(1,(innerHeight-rect.top)/(height*2/3)));
  dirty=true;
 }
 addEventListener('scroll',measure,{passive:true});addEventListener('resize',measure);
 new ResizeObserver(measure).observe(box);
 new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)measure();}).observe(box);
 box.addEventListener('pointerdown',e=>{if(progress<1||e.target.closest('a,button'))return;dragging=true;start=e.clientX;});
 addEventListener('pointermove',e=>{if(dragging){angle+=(e.clientX-start)/Math.max(160,width*.45);start=e.clientX;dirty=true;}});
 addEventListener('pointerup',()=>dragging=false);
 function draw(t){
  requestAnimationFrame(draw);const dt=Math.min(.05,(t-last)/1000||0);last=t;
  if(!visible||document.hidden)return;
  const spinning=progress===1&&!reduced.matches;
  if(spinning&&!dragging){angle+=dt*.16;dirty=true;}
  if(!dirty)return;dirty=false;
  const mobile=width<650,h=mobile?420:height;
  const spread=Math.min(1,progress*1.3);
  cards.forEach((card,i)=>{
   const a=angle+i*Math.PI*2/cards.length,depth=(Math.sin(a)+1)/2;
   const x=Math.cos(a)*width*.39*spread;
   const y=stackY*(1-spread)+Math.sin(a)*h*.36*spread;
   const rotation=(i-(cards.length-1)/2)*2.5*(1-spread);
   card.style.cssText=`position:absolute;left:50%;top:${centerY}px;bottom:auto;right:auto;width:${mobile?110:Math.min(216,width*.19)}px;height:${mobile?140:Math.min(240,width*.22)}px;margin:0;transform:translate(calc(-50% + ${x}px),calc(-50% + ${y}px)) rotate(${rotation}deg) scale(${1-spread*(1-depth)*.2});z-index:${spread<.15?i+1:Math.round(depth*63)+1};filter:none;opacity:1`;
  });
 }
 measure();requestAnimationFrame(draw);
})();

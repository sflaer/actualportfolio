(() => {
  'use strict';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const gallery = document.querySelector('#projectGallery');
  const dialog = document.querySelector('#caseDialog');
  const dialogScroll = dialog.querySelector('.dialog-scroll');
  const dialogContent = document.querySelector('#dialogContent');
  const dialogTitle = document.querySelector('#dialogTitle');
  const dialogBack = document.querySelector('#dialogBack');
  const imageDialog = document.querySelector('#imageDialog');
  const stampDialog = document.querySelector('#stampDialog');
  const stampStage = stampDialog.querySelector('.stamp-stage');
  const stampFace = stampStage.querySelector('.stamp-face');
  const stampImage = stampFace.querySelector('img');
  const stampTitle = stampDialog.querySelector('#stampTitle');
  const stampDescription = stampDialog.querySelector('#stampDescription');
  stampDialog.querySelector('button').addEventListener('click', () => stampDialog.close());
  stampDialog.addEventListener('click', event => {
    if (event.target === stampDialog) stampDialog.close();
  });
  function resetStampTilt() {
    for (const property of ['--tilt-x', '--tilt-y', '--shine-x', '--shine-y', '--shine-opacity']) {
      stampFace.style.removeProperty(property);
    }
  }
  stampStage.addEventListener('pointerleave', resetStampTilt);
  stampDialog.addEventListener('close', resetStampTilt);
  stampStage.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = stampStage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    stampFace.style.setProperty('--tilt-x', `${(0.5 - y) * 22}deg`);
    stampFace.style.setProperty('--tilt-y', `${(x - 0.5) * 22}deg`);
    stampFace.style.setProperty('--shine-x', `${x * 100}%`);
    stampFace.style.setProperty('--shine-y', `${y * 100}%`);
    stampFace.style.setProperty('--shine-opacity', '1');
  });
  const largeImage = document.querySelector('#largeImage');
  const projects = window.CASES;
  const order = [1, 3, 2, 5, 0, 4, 6];
  let activeCase = -1;
  let lastFocus = null;
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const presentation = {
    0: {description:'Брендинг, документация и отношение дизайнеров к дизайн-системе банка.'},
    1: {description:'Как сделать сложный конструктор чат-ботов понятнее для новых пользователей.'},
    2: {description:'Исследование работы поддержки и перепроектирование сценариев обработки обращений.'},
    3: {description:'Чаты, владельцы и питомцы в одном рабочем пространстве администратора.'},
    4: {description:'Как помочь водителям видеть интерфейс под ярким солнцем.'},
    5: {description:'Две дизайн-системы в продукте с 30-летним легаси.'},
    6: {description:'Ограничения записи питомцев с учётом возможностей грумера.'}
  };
  const chart = `<aside class="metric-card" aria-label="Нажатий без изменений стало меньше на 41 процент"><p class="metric-label">Нажатий без изменений</p><p class="metric-value">−41%</p><svg class="metric-chart" preserveAspectRatio="none" viewBox="0 0 240 150" role="img" aria-label="Иллюстрация снижения показателя"><defs><linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#67f5d0" stop-opacity=".15"/><stop offset="1" stop-color="#67f5d0" stop-opacity="0"/></linearGradient></defs><g class="chart-series"><path class="chart-area" d="M0 32 C21 31 25 43 45 37 S78 32 96 39 S113 38 120 38 C131 38 131 93 146 95 S174 91 191 96 S218 94 235 97 L235 150 L0 150Z"/><path class="chart-line" d="M0 32 C21 31 25 43 45 37 S78 32 96 39 S113 38 120 38 C131 38 131 93 146 95 S174 91 191 96 S218 94 235 97"/><circle class="chart-dot" cx="235" cy="97" r="4"/></g><g class="chart-series"><line x1="120" x2="120" y1="19" y2="38" class="release-marker" stroke="#67f5d0" stroke-dasharray="2 4"/></g><text x="120" y="13" text-anchor="middle" fill="#67f5d0" font-size="10">Релиз</text></svg></aside>`;
  gallery.innerHTML = order.map((index, position) => {
    const item = projects[index];
    const title = item.titleParts
      ? item.titleParts.map((part, i) => '<span class="' + (i === 0 ? 'project-company' : 'project-topic') + '">' + escapeHTML(part) + '</span>').join(' ')
      : escapeHTML(item.title);
    const cover = index === 5 ? '5-green' : index;
    const visual = `<a class="project-visual-link" href="#case-${index}" data-case="${index}" aria-label="Открыть кейс ${escapeHTML(item.title)}"><div class="project-art case-cover"><img src="images/redesign/covers/${cover}.png?v=large" alt="${escapeHTML(item.imageAlt)}" loading="${position ? 'lazy' : 'eager'}" decoding="async"></div></a>`;
    return `<article class="project-card ${position === 0 ? 'featured' : ''}">${position === 0 ? `<div class="feature-composition">${visual}${chart}</div>` : visual}<div class="project-caption"><div><h3><a href="#case-${index}" data-case="${index}">${title}</a></h3></div></div></article>`;
  }).join('');

  const metricCard = gallery.querySelector('.metric-card');
  const metricChart = metricCard.querySelector('.metric-chart');
  function positionMetricSeries() {
    if (!metricChart.clientHeight) return;
    const offset = metricCard.clientHeight * 0.15 * 150 / metricChart.clientHeight;
    metricChart.querySelectorAll('.chart-series').forEach(group => {
      group.setAttribute('transform', 'translate(0 ' + offset + ')');
    });
    metricChart.querySelector('.release-marker').setAttribute('y1', 19 - offset);
  }
  new ResizeObserver(positionMetricSeries).observe(metricCard);
  positionMetricSeries();

  // Reuse the original case bodies, while keeping missing images out of the new page.
  function caseBody(index) {
    const template = document.createElement('template');
    template.innerHTML = window.CASES_FULL_HTML[index] || '';
    template.content.querySelectorAll('img').forEach(img => {
      if (img.getAttribute('src') === 'images/case2board.png') {
        img.closest('.case-popup-inline-image')?.remove();
      } else {
        img.loading = 'lazy';
        img.decoding = 'async';
        if (!img.alt) img.alt = `Деталь проекта ${projects[index].titleParts[0]}`;
        // Very large originals remain available through the same image viewer.
      }
    });
    return template.innerHTML;
  }
  function showCase(index, updateAddress = true) {
    if (!projects[index]) return;
    activeCase = index;
    const item = projects[index];
    dialogBack.hidden = true;
    dialogTitle.textContent = item.title;
    dialogContent.innerHTML = `<article class="dialog-body"><p class="case-summary">${escapeHTML(presentation[index].description)}</p><div class="case-text">${caseBody(index)}</div></article>`;
    document.querySelector('.dialog-nav').hidden = false;
    const position = order.indexOf(index);
    document.querySelector('#prevCase').disabled = position === 0;
    document.querySelector('#nextCase').disabled = position === order.length - 1;
    if (!dialog.open) { lastFocus = document.activeElement; dialog.showModal(); }
    dialogScroll.scrollTop = 0;
    if (updateAddress) history.pushState({case:index}, '', `#case-${index}`);
    document.dispatchEvent(new CustomEvent('portfolio:case', { detail: index }));
  }
  function closeCase() {
    dialogBack.onclick = null;
    dialog.close();
    if (/^#(?:case|ai)-/.test(location.hash)) history.replaceState(null, '', '#work');
    lastFocus?.focus({preventScroll:true});
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-case]');
    if (link && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      showCase(Number(link.dataset.case));
    }
    const aiProject = event.target.closest('[data-ai]');
    if (aiProject) showAI(Number(aiProject.dataset.ai));
    const img = event.target.closest('.case-text img, .hobby-photo img, .visual-tile img');
    if (img) { event.preventDefault(); const original = img.closest('a.visual-tile'); openImage(original ? original.href : (img.currentSrc || img.src), img.alt); }
  });
  dialog.querySelector('.dialog-top > .dialog-close').addEventListener('click', closeCase);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeCase(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeCase(); } });
  document.querySelector('#prevCase').addEventListener('click', () => showCase(order[order.indexOf(activeCase)-1]));
  document.querySelector('#nextCase').addEventListener('click', () => showCase(order[order.indexOf(activeCase)+1]));
  function route() {
    const match = location.hash.match(/^#case-(\d+)$/);
    if (match) showCase(Number(match[1]), false);
    else if (dialog.open) dialog.close();
  }
  addEventListener('popstate', route);
  document.addEventListener('DOMContentLoaded', route, { once: true });
  function openImage(src, alt) {
    largeImage.src = src;
    largeImage.alt = alt || 'Деталь интерфейса';
    imageDialog.showModal();
  }
  imageDialog.querySelector('button').addEventListener('click', () => imageDialog.close());
  imageDialog.addEventListener('click', event => { if (event.target === imageDialog) imageDialog.close(); });
  document.querySelectorAll('.hobby-photo img').forEach(img => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'image-button';
    button.setAttribute('aria-label',`Увеличить: ${img.alt}`);
    img.parentElement.insertBefore(button,img);
    button.append(img);
    button.addEventListener('click', () => {
      openImage(img.src, img.alt);
      document.dispatchEvent(new Event('portfolio:hobby-photo'));
    });
  });
  document.querySelectorAll('.recommendation-card').forEach(card => {
    const text = card.querySelector('.recommendation-text');
    const button = document.createElement('button');
    button.className = 'recommendation-toggle';
    button.type = 'button';
    button.textContent = 'Читать полностью';
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      const expanded = text.classList.toggle('expanded');
      button.setAttribute('aria-expanded', String(expanded));
      button.textContent = expanded ? 'Свернуть' : 'Читать полностью';
    });
    card.append(button);
  });

  // The complete source carousel: thirteen unique images, repeated for a seamless loop.
  const carouselImages = [1,2,3,4,5,6,7,9,10,11,12,13,14];
  const track = document.querySelector('#visualTrack');
  const visualDimensions = {"1": [1500, 3248], "2": [1500, 2757], "3": [393, 821], "4": [1920, 1080], "5": [1500, 6638], "6": [1300, 6578], "7": [1500, 5887], "9": [1061, 1950], "10": [1061, 1950], "11": [1061, 1951], "12": [1061, 1951], "13": [1500, 7244], "14": [4244, 7801]};
  for (let duplicate = 0; duplicate < 2; duplicate++) {
    carouselImages.forEach(number => {
      const link = document.createElement('a');
      link.href = `images/bento/${number}.png`;
      link.className = 'visual-tile ' + ([9,10,11,12].includes(number) ? 'visual-mobile' : 'visual-web');
      link.style.setProperty('--source-ratio', visualDimensions[number][0] / visualDimensions[number][1]);
      if (duplicate) { link.setAttribute('aria-hidden','true'); link.tabIndex = -1; }
      const img = document.createElement('img');
      img.src = `images/redesign/carousel/${number}.webp?v=complete4`;
      img.alt = `Интерфейс из портфолио — ${number}`;
      img.loading = 'lazy';
      img.decoding = 'async';
      if ([9,10,11,12].includes(number)) {
        link.style.setProperty('--preview-ratio', '0.544');
      }
      link.append(img);
      link.addEventListener('click',event => { event.preventDefault(); if (event.target === link) openImage(link.href,img.alt); });
      track.append(link);
    });
  }
  const badgeCanvas = document.querySelector('#badgePattern');
  const badgeContext = badgeCanvas?.getContext('2d');
  const filings = { x: 350, y: 470, pull: 0, drift: 0 };
  const magnet = { ...filings };
  let filingsFrame = 0;

  function drawBadgeFilings() {
    if (!badgeContext) return;
    const { width, height } = badgeCanvas;
    badgeContext.clearRect(0, 0, width, height);
    badgeContext.fillStyle = '#88ded0';

    // Extra rows and columns move into view when the field pulls edge dots inward.
    const overscan = 72;
    for (let y = 6 - overscan; y < height + overscan; y += 12) {
      for (let x = 6 - overscan; x < width + overscan; x += 12) {
        const dx = filings.x - x;
        const dy = filings.y - y;
        const distance = Math.hypot(dx, dy);
        const field = Math.max(0, 1 - distance / 700) ** 2 * filings.pull;
        const reach = Math.min(distance * .04, 4) * field;
        const angle = Math.atan2(dy, dx);
        const px = x + filings.drift + Math.cos(angle) * reach;
        const py = y + Math.sin(angle) * reach;
        badgeContext.globalAlpha = .19 + field * .68;
        badgeContext.beginPath();
        badgeContext.ellipse(px, py, 1.35 + 3.6 * field, 1.35, angle, 0, Math.PI * 2);
        badgeContext.fill();
      }
    }
    badgeContext.globalAlpha = 1;
  }

  function animateBadgeFilings() {
    filingsFrame = 0;
    let moving = false;
    for (const key of ['x', 'y', 'pull', 'drift']) {
      const delta = magnet[key] - filings[key];
      const threshold = key === 'pull' ? .002 : .1;
      if (Math.abs(delta) <= threshold) filings[key] = magnet[key];
      else {
        filings[key] += delta * .24;
        moving = true;
      }
    }
    drawBadgeFilings();
    if (moving) filingsFrame = requestAnimationFrame(animateBadgeFilings);
  }

  function scheduleBadgeFilings() {
    if (badgeContext && !filingsFrame) filingsFrame = requestAnimationFrame(animateBadgeFilings);
  }

  if (badgeContext) {
    drawBadgeFilings();
    badgeCanvas.closest('.id-badge').classList.add('has-filings');
  }

  const orbit = document.querySelector('#toolOrbit');
  const aiCases = [
    {title:'DSH-плагин',body:'<p>Когда агенту в DeepSeek Harness нужен ответ, работа может остановиться до возвращения к компьютеру. Плагин передаёт такой вопрос в Telegram вместе с вариантами ответа. Достаточно выбрать вариант прямо в чате, и агент продолжит задачу.</p><p>Так же приходят запросы на разрешение действий. В Telegram можно одобрить действие или отклонить его. Если Harness открыт под рукой, ответить можно и там.</p><p>Когда агент заканчивает работу над запросом, в чат приходит итог. В одной переписке остаются и решения, которые потребовали внимания, и результат работы.</p><p><a class="github-button" href="https://github.com/sflaer/dsh-telegram-relay" target="_blank" rel="noopener noreferrer">Посмотреть на GitHub ↗</a></p>'},
    {title:'Инструменты для платёжки из Европы',nda:true,body:'<p>Помощник берёт брендбук клиента, извлекает фирменную палитру и применяет её ко всей платёжной форме. На одной библиотеке компонентов собраны формы для 20 клиентов. У каждой свой стиль, а для компоновки есть пять шаблонов.</p><p>До передачи макетов можно открыть форму в HTML Previewer и посмотреть, как палитра работает целиком. Если акцент теряется на фоне или какой-то оттенок выглядит слишком ярко, цвета можно подкрутить прямо в предпросмотре.</p><p>Когда оформление готово, Figma-плагин применяет выбранные настройки к макетам. Так дизайнер может оценить цвета на рабочей форме и перенести тот же вариант в Figma.</p>'},
    {title:'Генерации',body:'<div id="generationGallery" class="generation-gallery generation-collections"></div>'},
  ];
  aiCases.push({title:'Свои скиллы',body:'<p>Пишу собственные скиллы для AI-агентов: собираю повторяющиеся задачи, рабочие приёмы и требования к результату в инструкции, которые можно использовать снова. Периодически дополняю их по ходу работы.</p>'});
  [...orbit.querySelectorAll('.tool-tile')].forEach((tile,index,tiles) => tile.style.setProperty('--az', `${-90+index*360/tiles.length}deg`));
  function showAI(index) {
    const item = aiCases[index];
    if (!item) return;
    activeCase = -1;
    lastFocus = document.activeElement;
    dialogBack.hidden = true;
    dialogTitle.textContent = item.title;
    document.querySelector('.dialog-nav').hidden = true;
    const nda = item.nda ? '<p class="case-nda">NDA</p>' : '';
    dialogContent.innerHTML = `<article class="dialog-body"><div class="case-text">${item.body}${nda}</div></article>`;
    dialog.showModal();
    dialogScroll.scrollTop = 0;
    const gallery = dialogContent.querySelector('#generationGallery');
    if (index < 2) document.dispatchEvent(new Event('portfolio:ai'));
    if (!gallery) return;
    fetch('ai-generations.json?v=achievement-copy')
      .then(response => response.json())
      .then(items => {
        if (!gallery.isConnected || !Array.isArray(items)) return;
        const stamps = items.filter(stamp => typeof stamp?.src === 'string' && stamp.src.startsWith('images/ai-generations/') && !stamp.src.includes('..'));
        function createStamp({ src, left, right, width, title, description }, index) {
          const img = document.createElement('img');
          img.src = src;
          img.style.width = `${100 * width / (right - left)}%`;
          img.style.translate = `${-100 * left / width}% 0`;
          img.alt = title || `Коллекционная марка №${index + 1}`;
          img.loading = 'lazy';
          img.decoding = 'async';
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'generation-stamp';
          button.append(img);
          button.addEventListener('click', event => {
            event.stopPropagation();
            const name = src.split('/').pop().replace(/\.png$/i, '')
              .replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('-', ' ');
            stampTitle.textContent = title || name.charAt(0).toUpperCase() + name.slice(1);
            stampDescription.textContent = description || 'Коллекционная марка из серии ачивок Dota Draft.';
            stampImage.src = src;
            stampFace.style.setProperty('--stamp-mask', `url(${JSON.stringify(src)})`);
            stampDialog.showModal();
          });
          return button;
        }
        function addCollection(collectionTitle, entries, createTile, roundPreviews = false) {
          if (!entries.length) return;
          const showAll = document.createElement('button');
          showAll.type = 'button';
          showAll.className = 'generation-collection';
          const folder = document.createElement('span');
          folder.className = 'generation-folder';
          folder.setAttribute('aria-hidden', 'true');
          for (const { src } of entries.slice(0, 3)) {
            const preview = document.createElement('img');
            preview.src = src;
            preview.alt = '';
            if (roundPreviews) preview.classList.add('generation-character-image');
            folder.append(preview);
          }
          const front = document.createElement('span');
          front.className = 'folder-front';
          folder.append(front);
          showAll.append(folder, collectionTitle);
          showAll.addEventListener('click', () => {
            const overview = gallery.closest('.dialog-body');
            const collection = document.createElement('article');
            collection.className = 'dialog-body';
            const fullGallery = document.createElement('div');
            fullGallery.className = 'generation-gallery';
            fullGallery.append(...entries.map(createTile));
            collection.append(fullGallery);
            const previousHeight = dialog.offsetHeight;
            dialogContent.replaceChildren(collection);
            dialogTitle.textContent = collectionTitle;
            dialogBack.hidden = false;
            dialogScroll.scrollTop = 0;
            dialogBack.focus({ preventScroll: true });
            const collectionReveal = reduceMotion.matches ? null : dialog.animate(
              [
                { clipPath: `inset(${Math.max(0, (dialog.offsetHeight - previousHeight) / 2)}px 0 round 22px)` },
                { clipPath: 'inset(0 round 22px)' }
              ],
              { duration: 280, easing: 'cubic-bezier(.16, 1, .3, 1)' }
            );
            if (collectionReveal) {
              fullGallery.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
            }
            document.dispatchEvent(new Event('portfolio:collection'));
            dialogBack.onclick = () => {
              collectionReveal?.cancel();
              dialogContent.replaceChildren(overview);
              dialogTitle.textContent = item.title;
              dialogBack.hidden = true;
              dialogBack.onclick = null;
              dialogScroll.scrollTop = 0;
              showAll.focus({ preventScroll: true });
            };
          });
          gallery.append(showAll);
        }

        function addImageCollection(title, folder, extension, images) {
          const entries = images.map(([name, label]) => ({
            src: `images/ai-generations/${folder}/${name}.${extension}`,
            label
          }));
          addCollection(title, entries, ({ src, label }) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'generation-stamp';
            const image = document.createElement('img');
            image.src = src;
            image.alt = label;
            image.className = 'generation-character-image';
            image.loading = 'lazy';
            image.style.width = '100%';
            button.append(image);
            button.addEventListener('click', () => openImage(src, label));
            return button;
          }, true);
        }

        addCollection('Ачивки в виде коллекционных марок', stamps, createStamp);
        addImageCollection('Персонажи для бренда одежды', 'zabey', 'webp', [
          ['blonde-1', 'Блонда, первый образ'], ['blonde-2', 'Блонда, второй образ'],
          ['brunette', 'Брюнет'], ['light-brown', 'Русый']
        ]);
        addImageCollection('Мульт-контент для бренда умных домов', 'symbios', 'png', [
          ['dima', 'Дима'], ['grisha', 'Гриша'], ['katya', 'Катя'], ['yulia', 'Юля'],
          ['burglar-short', 'Невысокий грабитель'], ['burglar-tall', 'Высокий грабитель']
        ]);
      })
      .catch(() => { gallery.textContent = 'Не удалось загрузить коллекцию.'; });
  }
  const orbitHeading = document.querySelector('#aiTitle');
  function syncOrbit() {
    const start = orbitHeading.getBoundingClientRect().top;
    const end = orbit.getBoundingClientRect().bottom;
    const progress = Math.max(0, Math.min(1, (innerHeight - start) / Math.max(1, end - start)));
    orbit.style.setProperty('--reveal', reduceMotion.matches ? 1 : progress);
    orbit.classList.toggle('is-spinning', progress === 1 && orbit.getBoundingClientRect().bottom > 0);
  }
  addEventListener('scroll', syncOrbit, { passive: true });
  addEventListener('resize', syncOrbit);
  addEventListener('load', syncOrbit);
  reduceMotion.addEventListener('change', syncOrbit);
  syncOrbit();
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  }),{threshold:.35});
  document.querySelectorAll('.metric-card').forEach(el=>revealObserver.observe(el));

  const hero = document.querySelector('.hero');
  const badge = hero.querySelector('.badge-swing');
  const badgeFace = badge?.querySelector('.id-badge');
  let pointerFrame = 0;
  hero.addEventListener('pointermove',event=>{
    if(reduceMotion.matches || !finePointer.matches || event.pointerType === 'touch') return;
    const rect=hero.getBoundingClientRect();
    const x=(event.clientX-rect.left)/rect.width-.5, y=(event.clientY-rect.top)/rect.height-.5;
    cancelAnimationFrame(pointerFrame);
    pointerFrame=requestAnimationFrame(()=>{
      if (badgeFace && badgeContext) {
        const bounds = badgeFace.getBoundingClientRect();
        magnet.x = (event.clientX - bounds.left) / bounds.width * badgeCanvas.width;
        magnet.y = (event.clientY - bounds.top) / bounds.height * badgeCanvas.height;
        magnet.pull = 1;
        magnet.drift = x * 5;
        scheduleBadgeFilings();
      }
      if (badge) {
        const depth = Number(badge.dataset.depth);
        badge.style.translate = `${x * 48 * depth}px ${y * 40 * depth}px`;
        badge.style.rotate = `${-x * 13}deg`;
      }
    });
  });
  function resetHeroPointer(){
    cancelAnimationFrame(pointerFrame);
    if (badge) {
      badge.style.translate = '0px 0px';
      badge.style.rotate = '0deg';
    }
    magnet.pull = 0;
    magnet.drift = 0;
    if (reduceMotion.matches || !finePointer.matches) {
      cancelAnimationFrame(filingsFrame);
      filingsFrame = 0;
      Object.assign(filings, magnet);
      drawBadgeFilings();
    } else {
      scheduleBadgeFilings();
    }
  }
  hero.addEventListener('pointerleave',resetHeroPointer);
  reduceMotion.addEventListener('change',resetHeroPointer);
  finePointer.addEventListener('change',resetHeroPointer);

})();




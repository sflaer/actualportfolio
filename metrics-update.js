(() => {
  const gallery = document.querySelector('#projectGallery');
  const template = gallery.querySelector('.metric-card');
  gallery.querySelectorAll('.project-card').forEach((card, index) => {
    if (!index) return;
    const link = card.querySelector('.project-visual-link');
    const composition = document.createElement('div');
    composition.className = 'feature-composition';
    link.before(composition);
    composition.append(link);
    const metric = template.cloneNode(true);
    metric.classList.add('is-visible');
    metric.dataset.placeholder = 'true';
    metric.setAttribute('aria-label', 'Черновик метрики, значение будет заменено');
    metric.querySelector('#chartGlow').id = 'chartGlow-' + index;
    metric.querySelector('.chart-area').style.fill = 'url(#chartGlow-' + index + ')';
    const caseId = Number(link.dataset.case);
    const metrics = {
      2: {label:'Неверная обработка тикета', value:'−6,6%'},
      3: {label:'Клиентов от общего числа добавленных за месяц', value:'41%', progress:41},
      6: {label:'Использование фичи за 3 месяца', value:'29%', progress:29},
      4: {label:'Нажатия на вторичные кнопки', value:'+12%', rising:true},
      5: {label:'Компонентов адаптировано', value:'100%', progress:100}
    };
    const content = metrics[caseId];
    if (content) {
      delete metric.dataset.placeholder;
      metric.querySelector('.metric-label').textContent = content.label;
      metric.querySelector('.metric-value').textContent = content.value;
      metric.setAttribute('aria-label', content.label + ': ' + content.value);
      if (content.progress !== undefined) {
        metric.querySelector('.metric-chart').outerHTML = `<svg class="metric-progress" viewBox="0 0 160 160" role="img" aria-label="${content.value}"><circle cx="80" cy="80" r="61" fill="none" stroke="#ffffff12" stroke-width="7"/><circle cx="80" cy="80" r="61" fill="none" stroke="#67f5d0" stroke-width="7" pathLength="100" stroke-dasharray="${content.progress} 100" stroke-linecap="round" transform="rotate(-90 80 80)"/>${content.progress === 100 ? '<path d="M54 80L72 98L108 62" fill="none" stroke="#67f5d0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' : ''}</svg>`;
      } else if (content.rising) {
        const path='M0 92 C21 91 25 101 45 95 S78 90 96 97 S113 96 120 96 C131 96 131 41 146 39 S174 43 191 38 S218 40 235 37';
        metric.querySelector('.chart-line').setAttribute('d',path);
        metric.querySelector('.chart-area').setAttribute('d',path+' L235 150 L0 150Z');
        metric.querySelector('.chart-dot').setAttribute('cy','37');
        metric.querySelector('.release-marker').setAttribute('y2','96');
        metric.querySelector('.metric-chart').setAttribute('aria-label','Иллюстрация роста нажатий на вторичные кнопки');
      }
    }
    composition.append(metric);
    const chart = metric.querySelector('.metric-chart');
    if (!chart) return;
    const align = () => {
      const offset = metric.clientHeight * .15 * 150 / Math.max(1, chart.clientHeight);
      chart.querySelectorAll('.chart-series').forEach(group => group.setAttribute('transform', 'translate(0 ' + offset + ')'));
      chart.querySelector('.release-marker').setAttribute('y1', 19 - offset);
    };
    new ResizeObserver(align).observe(metric);
  });
})();

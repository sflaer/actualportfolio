(() => {
  const gallery = document.querySelector('#projectGallery');
  const template = gallery.querySelector('.metric-card');
  const metrics = {
    0: {label: 'Удовлетворённость дизайнеров', value: '100%', smile: true},
    2: {label: 'Скорость обработки тикетов', value: '-6,6%'},
    3: {label: 'Клиентов от общего числа добавленных за месяц', value: '~4%', progress: 4},
    4: {label: 'Нажатия на вторичные кнопки', value: '+12%', rising: true},
    5: {label: 'Покрытие проектов дизайн-системой', value: '+57%', progress: 57},
    6: {label: 'Использование фичи за 3 месяца', value: '29%', progress: 29}
  };

  gallery.querySelectorAll('.project-card').forEach(card => {
    const link = card.querySelector('.project-visual-link');
    const caseId = Number(link.dataset.case);
    const content = metrics[caseId];
    if (!content) return;
    const composition = document.createElement('div');
    composition.className = 'feature-composition';
    link.before(composition);
    composition.append(link);
    const metric = template.cloneNode(true);
    metric.classList.add('is-visible');
    metric.querySelector('.metric-label').textContent = content.label;
    metric.querySelector('.metric-value').textContent = content.value;
    metric.setAttribute('aria-label', content.label + ': ' + content.value);

    if (content.smile) {
      metric.querySelector('.metric-chart').outerHTML = '<svg class="metric-progress metric-smile" viewBox="0 0 160 160" aria-hidden="true"><circle class="metric-smile-disc" cx="80" cy="80" r="61"/><circle cx="61" cy="68" r="6"/><circle cx="99" cy="68" r="6"/><path d="M56 89 Q80 117 104 89" fill="none" stroke-width="7" stroke-linecap="round"/></svg>';
    } else if (content.progress !== undefined) {
      metric.querySelector('.metric-chart').outerHTML = `<svg class="metric-progress" viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="61" fill="none" stroke="#ffffff12" stroke-width="7"/><circle cx="80" cy="80" r="61" fill="none" stroke="#67f5d0" stroke-width="7" pathLength="100" stroke-dasharray="${content.progress} 100" stroke-linecap="round" transform="rotate(-90 80 80)"/></svg>`;
    } else if (caseId === 2) {
      const path = 'M0 72 C18 58 35 84 54 68 S82 80 101 63 S130 70 148 48 S180 58 198 43 S220 52 235 31';
      metric.querySelector('.chart-line').setAttribute('d', path);
      metric.querySelector('.chart-area').setAttribute('d', path + ' L235 150 L0 150Z');
      metric.querySelector('.chart-dot').setAttribute('cy', '31');
      metric.querySelector('.release-marker').setAttribute('y2', '68');
      metric.querySelector('.metric-chart').setAttribute('aria-label', 'Иллюстрация изменения обработки тикетов');
    } else if (content.rising) {
      const path = 'M0 92 C21 91 25 101 45 95 S78 90 96 97 S113 96 120 96 C131 96 131 41 146 39 S174 43 191 38 S218 40 235 37';
      metric.querySelector('.chart-line').setAttribute('d', path);
      metric.querySelector('.chart-area').setAttribute('d', path + ' L235 150 L0 150Z');
      metric.querySelector('.chart-dot').setAttribute('cy', '37');
      metric.querySelector('.release-marker').setAttribute('y2', '96');
      metric.querySelector('.metric-chart').setAttribute('aria-label', 'Иллюстрация роста нажатий на вторичные кнопки');
    }
    composition.append(metric);
    const chart = metric.querySelector('.metric-chart');
    if (!chart) return;
    chart.querySelector('#chartGlow').id = 'chartGlow-' + caseId;
    chart.querySelector('.chart-area').style.fill = 'url(#chartGlow-' + caseId + ')';
    const align = () => {
      const offset = metric.clientHeight * .15 * 150 / Math.max(1, chart.clientHeight);
      chart.querySelectorAll('.chart-series').forEach(group => group.setAttribute('transform', 'translate(0 ' + offset + ')'));
      chart.querySelector('.release-marker').setAttribute('y1', 19 - offset);
    };
    new ResizeObserver(align).observe(metric);
  });
})();

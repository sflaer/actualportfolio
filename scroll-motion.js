(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let lenis;
  function configure() {
    lenis?.destroy();
    lenis = reduced.matches || !window.Lenis ? null : new Lenis({
      lerp: .1, smoothWheel: true, syncTouch: true, anchors: true, autoRaf: false,
      prevent: node => Boolean(node.closest?.('dialog'))
    });
  }
  configure();
  reduced.addEventListener('change', configure);
  const namespace = 'http://www.w3.org/2000/svg';
  const definitions = document.createElementNS(namespace, 'svg');
  definitions.setAttribute('aria-hidden', 'true');
  definitions.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none';
  document.body.append(definitions);
  const selectors = '.hero, .work-section > .section-heading, .project-card, .visual-section > .section-heading, .ai-intro, .about-sections > section, .contact-section, footer';
  const surfaces = [...document.querySelectorAll(selectors)].map((element, index) => {
    const id = 'page-curl-' + index;
    const filter = document.createElementNS(namespace, 'filter');
    filter.id = id;
    filter.setAttribute('x', '-15%');
    filter.setAttribute('y', '0%');
    filter.setAttribute('width', '130%');
    filter.setAttribute('height', '100%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    filter.innerHTML = '<feImage preserveAspectRatio="none" result="map"/><feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G"/>';
    definitions.append(filter);
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 96;
    return {element, id, canvas, context: canvas.getContext('2d'),
      cached: false, field: filter.querySelector('feImage'), displacement: filter.querySelector('feDisplacementMap')};
  });
  let previousTime = performance.now();
  let previousScroll = scrollY;
  let speed = 0;
  let lastPaint = 0;
  function frame(time) {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    lenis?.raf(time);
    const elapsed = Math.min(.1, Math.max(1 / 240, (time - previousTime) / 1000));
    const target = Math.min(1, Math.abs(scrollY - previousScroll) / elapsed / 800);
    speed += (target - speed) * (1 - Math.exp(-elapsed / (target > speed ? .025 : .05)));
    previousTime = time;
    previousScroll = scrollY;
    const curling = !reduced.matches && speed >= .01;
    document.documentElement.classList.toggle('is-page-curling', curling);
    if (!curling) {
      surfaces.forEach(({element}) => { if (element.style.filter) element.style.filter = ''; });
      return;
    }
    if (time - lastPaint < 30) return;
    lastPaint = time;
    surfaces.forEach(({element, id, canvas, context, field, displacement, ...state}) => {
      const box = element.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) { element.style.filter = ''; return; }
      if (!field.hasAttribute('href')) {
      const pixels = context.createImageData(canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y++) {
        const screenY = innerHeight * y / (canvas.height - 1);
        const normalized = Math.min(1, Math.abs(2 * screenY / innerHeight - 1));
        const profile = 1 - Math.sqrt(1 - normalized * normalized);
        for (let x = 0; x < canvas.width; x++) {
          const screenX = box.left + box.width * (x / (canvas.width - 1) * 1.3 - .15);
          const offset = (y * canvas.width + x) * 4;
          pixels.data[offset] = 255 * (.5 - profile * (screenX - innerWidth / 2) / innerWidth);
          pixels.data[offset + 1] = 128;
          pixels.data[offset + 3] = 255;
        }
      }
      context.putImageData(pixels, 0, 0);
      field.setAttribute('href', canvas.toDataURL());
      }
      displacement.setAttribute('scale', innerWidth * speed * .06);
      element.style.filter = 'url(#' + id + ')';
    });
  }
  requestAnimationFrame(frame);
})();



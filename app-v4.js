(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  // Arrival choreography. Content remains visible when JavaScript is unavailable.
  requestAnimationFrame(() => body.classList.add('has-entered'));

  // Pointer position powers restrained image parallax and the survey cursor.
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let cursorFrame = 0;
  const cursor = document.querySelector('.cursor');

  if (cursor) {
    cursor.innerHTML = '<span class="cursor-ring"></span><span class="cursor-dot"></span><span class="cursor-label"></span>';
  }
  const cursorLabel = cursor?.querySelector('.cursor-label');

  const cursorText = (target) => {
    const explicit = target?.closest('[data-cursor]')?.dataset.cursor;
    if (explicit) return explicit;
    if (target?.closest('.screen-poster,.film-card,.story-link')) return 'PLAY';
    if (target?.closest('.book-shelf')) return 'DRAG';
    if (target?.closest('.gallery-card,.page-hero-art,.contact-photo,.field-landscape,.cover,.book-object')) return 'VIEW';
    return 'OPEN';
  };

  const hotSelector = 'a,button,[data-tilt],.book-shelf,.theme-node,.page-hero-art,.contact-photo,.field-landscape';

  const drawCursor = () => {
    const ease = cursor?.classList.contains('is-hot') ? 0.28 : 0.42;
    cursorX += (mouseX - cursorX) * ease;
    cursorY += (mouseY - cursorY) * ease;
    if (cursor) cursor.style.transform = `translate3d(${cursorX}px,${cursorY}px,0)`;
    cursorFrame = requestAnimationFrame(drawCursor);
  };

  const handlePointerMove = (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    const px = (mouseX / Math.max(window.innerWidth, 1) - 0.5) * 2;
    const py = (mouseY / Math.max(window.innerHeight, 1) - 0.5) * 2;
    root.style.setProperty('--mx', `${mouseX}px`);
    root.style.setProperty('--my', `${mouseY}px`);
    root.style.setProperty('--px', px.toFixed(3));
    root.style.setProperty('--py', py.toFixed(3));

    if (!cursor || !finePointer.matches || reduceMotion.matches) return;
    const hot = event.target.closest?.(hotSelector);
    cursor.classList.toggle('is-hot', Boolean(hot));
    if (cursorLabel) cursorLabel.textContent = hot ? cursorText(event.target) : '';
  };

  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  if (cursor && finePointer.matches && !reduceMotion.matches) cursorFrame = requestAnimationFrame(drawCursor);

  const stopCursor = () => {
    cancelAnimationFrame(cursorFrame);
    cursor?.classList.remove('is-hot');
  };
  finePointer.addEventListener?.('change', (event) => {
    if (!event.matches) stopCursor();
    else if (!reduceMotion.matches) cursorFrame = requestAnimationFrame(drawCursor);
  });
  reduceMotion.addEventListener?.('change', (event) => {
    if (event.matches) stopCursor();
    else if (finePointer.matches) cursorFrame = requestAnimationFrame(drawCursor);
  });

  // Mobile navigation.
  const menu = document.querySelector('.menu');
  const nav = document.querySelector('.nav');
  const closeMenu = () => {
    nav?.classList.remove('open');
    body.classList.remove('menu-open');
    menu?.setAttribute('aria-expanded', 'false');
  };
  menu?.addEventListener('click', () => {
    const open = !nav?.classList.contains('open');
    nav?.classList.toggle('open', open);
    body.classList.toggle('menu-open', open);
    menu.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  // Local-page transitions. Modified clicks, downloads, targets, external links, and hashes remain native.
  document.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const raw = link.getAttribute('href');
      if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:') || link.hasAttribute('download') || link.target === '_blank') return;
      const url = new URL(raw, document.baseURI);
      if (url.origin !== window.location.origin || !/\.html(?:$|[?#])/.test(url.href)) return;
      event.preventDefault();
      closeMenu();
      body.classList.add('is-leaving');
      window.setTimeout(() => { window.location.href = url.href; }, reduceMotion.matches ? 20 : 470);
    });
  });

  // Reveal below-the-fold content without hiding it when IntersectionObserver is absent.
  const revealItems = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('in'));
  }

  // Add staggered arrival to shared page components.
  const autoArrival = document.querySelectorAll('.page-hero-copy,.page-hero-art,.contact-core,.contact-photo,.shelf-head,.book-shelf,.research-lab,.section-inner,.film-grid,.route,.book-cover-stage,.book-info,.quote-card');
  autoArrival.forEach((element, index) => {
    if (!element.classList.contains('arrival-piece')) element.classList.add('arrival-piece');
    if (!element.style.getPropertyValue('--arrival')) element.style.setProperty('--arrival', String(Math.min(index + 1, 10)));
  });

  // Title letters retain the supplied text for accessibility.
  document.querySelectorAll('.letter-word').forEach((word) => {
    if (word.dataset.lettersReady) return;
    const text = word.textContent.trim();
    word.setAttribute('aria-label', text);
    word.textContent = '';
    [...text].forEach((character, index) => {
      const span = document.createElement('span');
      span.className = 'kinetic-letter';
      span.textContent = character;
      span.style.setProperty('--i', String(index));
      span.setAttribute('aria-hidden', 'true');
      word.append(span);
    });
    word.dataset.lettersReady = 'true';
  });

  // Word-level motion is restricted to navigation and display headings.
  const splitWords = (element) => {
    if (element.dataset.wordsReady || element.querySelector('img,iframe,br')) return;
    const text = element.textContent.trim();
    if (!text) return;
    element.setAttribute('aria-label', text);
    element.textContent = '';
    text.split(/\s+/).forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'kinetic-word';
      span.textContent = word;
      span.style.setProperty('--i', String(index));
      span.setAttribute('aria-hidden', 'true');
      element.append(span);
    });
    element.dataset.wordsReady = 'true';
  };
  document.querySelectorAll('.nav a,.gallery-copy h2,.page-hero-copy h1,.bio-block h2,.work-row h2,.film-card h2,.route-event h2,.book-object h3,.book-info h1').forEach(splitWords);
  document.querySelectorAll('.kinetic-word,.kinetic-letter').forEach((item) => {
    item.addEventListener('pointerleave', () => {
      if (reduceMotion.matches) return;
      item.classList.remove('settling');
      void item.offsetWidth;
      item.classList.add('settling');
      window.setTimeout(() => item.classList.remove('settling'), 760);
    });
  });

  // Restrained magnetic movement in the desktop header.
  document.querySelectorAll('.nav a').forEach((link) => {
    link.addEventListener('pointermove', (event) => {
      if (!finePointer.matches || reduceMotion.matches) return;
      const rect = link.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      link.style.transform = `translate3d(${x * 0.08}px,${y * 0.1 - 3}px,0)`;
    });
    link.addEventListener('pointerleave', () => { link.style.transform = ''; });
  });

  // Horizontal book shelf: drag on fine pointers; native horizontal scroll/swipe on touch.
  document.querySelectorAll('.book-shelf').forEach((shelf) => {
    if (!finePointer.matches) return;
    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    shelf.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      dragging = true;
      startX = event.clientX;
      startScroll = shelf.scrollLeft;
      shelf.classList.add('dragging');
      shelf.setPointerCapture(event.pointerId);
    });
    shelf.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      shelf.scrollLeft = startScroll - (event.clientX - startX) * 1.25;
    });
    const endDrag = () => {
      dragging = false;
      shelf.classList.remove('dragging');
    };
    shelf.addEventListener('pointerup', endDrag);
    shelf.addEventListener('pointercancel', endDrag);
    shelf.addEventListener('wheel', (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      shelf.scrollLeft += event.deltaY;
    }, { passive: false });
  });

  // Book-cover tilt on capable devices only.
  document.querySelectorAll('[data-tilt]').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      if (!finePointer.matches || reduceMotion.matches) return;
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      element.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 10}deg) translateY(-14px) scale(1.045)`;
    });
    element.addEventListener('pointerleave', () => { element.style.transform = ''; });
  });

  // Research field.
  const researchCopy = {
    secularism: ['Secularism', 'How societies reorganize belief, institutions, and civic life as religion changes.'],
    nonreligion: ['Nonreligion', 'The lives, identities, cultures, and communities of people outside organized religion.'],
    morality: ['Morality', 'How ethical life is formed, practiced, and sustained without religious authority.'],
    democracy: ['Democracy', 'The relationship between secular values, pluralism, freedom, and democratic society.'],
    social: ['Social change', 'How cultural and institutional transformations alter belief, belonging, and public life.'],
    humanism: ['Humanism', 'Human flourishing, reason, compassion, and meaning in this life.']
  };
  const readout = document.querySelector('.theme-readout');
  document.querySelectorAll('.theme-node').forEach((node) => {
    node.addEventListener('click', () => {
      document.querySelectorAll('.theme-node').forEach((item) => item.classList.remove('active'));
      node.classList.add('active');
      const copy = researchCopy[node.dataset.theme];
      if (!copy || !readout) return;
      readout.querySelector('h2').textContent = copy[0];
      readout.querySelector('p:last-child').textContent = copy[1];
      if (!reduceMotion.matches) {
        readout.animate([
          { transform: 'translate(-50%,-50%) scale(.96)' },
          { transform: 'translate(-50%,-50%) scale(1.018)' },
          { transform: 'translate(-50%,-50%) scale(1)' }
        ], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
    });
  });

  // Outdoor screening: no autoplay until the visitor explicitly presses Play.
  const frame = document.querySelector('#projection-video');
  const screen = document.querySelector('.screen-frame');
  const playButton = document.querySelector('.screen-poster');
  const titleElement = document.querySelector('#projection-title');
  const directLink = document.querySelector('#projection-direct');
  const status = document.querySelector('#projection-status');

  if (frame && screen && playButton) {
    const params = new URLSearchParams(window.location.search);
    const videoId = (params.get('v') || 'y8NxAFnNphI').replace(/[^A-Za-z0-9_-]/g, '');
    const start = Math.max(0, Number.parseInt(params.get('start') || '170', 10) || 0);
    const title = params.get('title') || 'The God Debate';
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}${start ? `&t=${start}s` : ''}`;

    if (titleElement) titleElement.textContent = title;
    document.title = `${title} — Phil Zuckerman`;
    if (directLink) directLink.href = youtubeUrl;

    playButton.addEventListener('click', () => {
      if (screen.classList.contains('is-playing')) return;
      if (status) status.textContent = 'Loading the YouTube player. Playback and audio remain under your control.';
      frame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1${start ? `&start=${start}` : ''}`;
      screen.classList.add('is-playing');
      frame.focus({ preventScroll: true });
    });

    frame.addEventListener('load', () => {
      if (status && screen.classList.contains('is-playing')) {
        status.textContent = 'Player frame loaded. If playback is blocked, use the direct YouTube link.';
      }
    });
  }
})();

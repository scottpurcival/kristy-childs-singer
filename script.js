/* ============================================================
   Kristy Childs – Official Website  |  script.js
   ============================================================ */

/* ── Track List ─────────────────────────────────────────────── */
const TRACKS = [
  { title: 'All Or Nothing',       src: 'media/audio/All%20Or%20Nothing.mp3' },
  { title: 'Easy On Me',           src: 'media/audio/Easy%20on%20me.mp3' },
  { title: 'Jar Of Hearts',        src: 'media/audio/Jar%20Of%20Hearts.mp3' },
  { title: 'Left Outside Alone',   src: 'media/audio/Left%20Outside%20Alone.mp3' },
  { title: 'Mamma Mia',            src: 'media/audio/Mamma%20Mia.mp3' },
  { title: 'Material Girl',        src: 'media/audio/Material%20Girl.mp3' },
  { title: 'My Immortal',          src: 'media/audio/My%20Immortal.mp3' },
  { title: 'Sick and Tired',       src: 'media/audio/Sick%20and%20Tired.mp3' },
  { title: 'Teenage Dirtbag',      src: 'media/audio/Teenage%20Dirtbag.mp3' },
  { title: 'Whenever, Wherever',   src: 'media/audio/Whenever%2C%20Wherever.mp3' },
  { title: 'Your Girl',            src: 'media/audio/Your%20Girl.mp3' },
];

/* ── State ──────────────────────────────────────────────────── */
let current   = 0;
let playing   = false;
let shuffle   = false;
let repeat    = false;
let seeking   = false;

/* ── DOM refs ───────────────────────────────────────────────── */
const audio       = document.getElementById('audioEl');
const wrapper     = document.querySelector('.player-wrapper');
const playIcon    = document.getElementById('playIcon');
const trackName   = document.getElementById('trackName');
const timeCur     = document.getElementById('timeCurrent');
const timeTot     = document.getElementById('timeTotal');
const progFill    = document.getElementById('progressFill');
const progTrack   = document.getElementById('progressTrack');
const volSlider   = document.getElementById('volSlider');
const volIcon     = document.getElementById('volIcon');
const playList    = document.getElementById('playlistList');
const trackCount  = document.getElementById('trackCount');

const btnPlay     = document.getElementById('btnPlay');
const btnPrev     = document.getElementById('btnPrev');
const btnNext     = document.getElementById('btnNext');
const btnShuffle  = document.getElementById('btnShuffle');
const btnRepeat   = document.getElementById('btnRepeat');
const btnMute     = document.getElementById('btnMute');

/* ── Helpers ────────────────────────────────────────────────── */
function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function setVolIcon() {
  const v = audio.volume;
  if (audio.muted || v === 0) volIcon.className = 'fas fa-fw fa-volume-xmark';
  else if (v < 0.45) volIcon.className = 'fas fa-fw fa-volume-low';
  else volIcon.className = 'fas fa-fw fa-volume-high';
}

function setPlayBtn(isPlaying) {
  playIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
  btnPlay.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
}

/* ── Playlist ───────────────────────────────────────────────── */
function buildPlaylist() {
  playList.innerHTML = '';
  trackCount.textContent = `${TRACKS.length} songs`;

  TRACKS.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = 'pl-item' + (i === current ? ' active' : '');
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', `Play ${t.title}`);
    li.dataset.index = i;
    li.innerHTML = `
      <span class="pl-num">${i + 1}</span>
      <span class="pl-mini-eq" aria-hidden="true">
        <span></span><span></span><span></span>
      </span>
      <span class="pl-title">${t.title}</span>`;

    li.addEventListener('click', () => loadTrack(i, true));
    li.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadTrack(i, true); }
    });
    playList.appendChild(li);
  });
}

function highlightTrack(idx, scroll = true) {
  playList.querySelectorAll('.pl-item').forEach((li, i) => {
    li.classList.toggle('active', i === idx);
  });
  if (scroll) {
    const active = playList.querySelector('.active');
    if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

/* ── Load / Play / Pause ────────────────────────────────────── */
function loadTrack(idx, autoPlay = false, scrollPlaylist = true) {
  current = idx;
  const t = TRACKS[idx];

  audio.src = t.src;
  trackName.textContent = t.title;
  progFill.style.width = '0%';
  progTrack.setAttribute('aria-valuenow', 0);
  timeCur.textContent = '0:00';
  timeTot.textContent = '0:00';

  highlightTrack(idx, scrollPlaylist);

  if (autoPlay) {
    audio.load();
    audio.play().then(() => {
      playing = true;
      setPlayBtn(true);
      wrapper.classList.add('playing');
    }).catch(() => {});
  } else {
    setPlayBtn(false);
    wrapper.classList.remove('playing');
  }
}

function togglePlay() {
  if (!audio.src || audio.readyState === 0) {
    loadTrack(current, true);
    return;
  }
  if (playing) {
    audio.pause();
    playing = false;
    setPlayBtn(false);
    wrapper.classList.remove('playing');
  } else {
    audio.play().then(() => {
      playing = true;
      setPlayBtn(true);
      wrapper.classList.add('playing');
    }).catch(() => {});
  }
}

function prevTrack() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  let idx = (current - 1 + TRACKS.length) % TRACKS.length;
  loadTrack(idx, playing);
}

function nextTrack() {
  let idx;
  if (shuffle) {
    do { idx = Math.floor(Math.random() * TRACKS.length); }
    while (idx === current && TRACKS.length > 1);
  } else {
    idx = (current + 1) % TRACKS.length;
  }
  loadTrack(idx, playing);
}

/* ── Audio events ───────────────────────────────────────────── */
audio.addEventListener('loadedmetadata', () => {
  timeTot.textContent = fmt(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  if (seeking || !audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progFill.style.width = pct + '%';
  progTrack.setAttribute('aria-valuenow', Math.round(pct));
  timeCur.textContent = fmt(audio.currentTime);
});

audio.addEventListener('ended', () => {
  if (repeat) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } else {
    nextTrack();
  }
});

audio.addEventListener('play',  () => { playing = true;  setPlayBtn(true);  wrapper.classList.add('playing'); });
audio.addEventListener('pause', () => { playing = false; setPlayBtn(false); wrapper.classList.remove('playing'); });

/* ── Progress seek ──────────────────────────────────────────── */
function seekTo(e) {
  if (!audio.duration) return;
  const rect = progTrack.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audio.currentTime = pct * audio.duration;
  progFill.style.width = (pct * 100) + '%';
}

progTrack.addEventListener('mousedown', e => { seeking = true; seekTo(e); });
document.addEventListener('mousemove', e => { if (seeking) seekTo(e); });
document.addEventListener('mouseup', () => { seeking = false; });

// Touch
progTrack.addEventListener('touchstart', e => { seeking = true; seekTo(e.touches[0]); }, { passive: true });
document.addEventListener('touchmove', e => { if (seeking) seekTo(e.touches[0]); }, { passive: true });
document.addEventListener('touchend', () => { seeking = false; });

/* ── Volume ─────────────────────────────────────────────────── */
audio.volume = 0.8;

volSlider.addEventListener('input', () => {
  audio.volume = volSlider.value / 100;
  if (audio.muted && audio.volume > 0) audio.muted = false;
  setVolIcon();
});

btnMute.addEventListener('click', () => {
  audio.muted = !audio.muted;
  setVolIcon();
});

/* ── Controls ───────────────────────────────────────────────── */
btnPlay.addEventListener('click', togglePlay);
btnPrev.addEventListener('click', prevTrack);
btnNext.addEventListener('click', nextTrack);

btnShuffle.addEventListener('click', () => {
  shuffle = !shuffle;
  btnShuffle.classList.toggle('active', shuffle);
  btnShuffle.setAttribute('aria-pressed', shuffle);
});

btnRepeat.addEventListener('click', () => {
  repeat = !repeat;
  btnRepeat.classList.toggle('active', repeat);
  btnRepeat.setAttribute('aria-pressed', repeat);
});

/* ── Keyboard shortcuts (outside form fields) ───────────────── */
document.addEventListener('keydown', e => {
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (lightbox.getAttribute('hidden') === null) return; // lightbox open
  switch (e.key) {
    case ' ': e.preventDefault(); togglePlay(); break;
    case 'ArrowRight': e.preventDefault(); nextTrack(); break;
    case 'ArrowLeft':  e.preventDefault(); prevTrack(); break;
  }
});

/* ── Init player ────────────────────────────────────────────── */
buildPlaylist();
loadTrack(0, false, false);
setVolIcon();


/* ============================================================
   PARTICLES
   ============================================================ */
const canvas = document.getElementById('particles-canvas');
const ctx    = canvas.getContext('2d');
let particles = [];
const SYMBOLS = ['♪','♫','♬','♩','✦','★'];
const COLORS  = ['#a78bfa','#60a5fa','#c084fc','#818cf8'];

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function mkParticle() {
  return {
    x:   Math.random() * canvas.width,
    y:   canvas.height + 20,
    sym: SYMBOLS[Math.random() * SYMBOLS.length | 0],
    sz:  Math.random() * 13 + 7,
    vy:  Math.random() * 0.7 + 0.25,
    vx:  (Math.random() - .5) * 0.4,
    a:   Math.random() * 0.35 + 0.07,
    da:  0.0007 + Math.random() * 0.0005,
    rot: Math.random() * 360,
    dr:  (Math.random() - .5) * 1.2,
    col: COLORS[Math.random() * COLORS.length | 0],
  };
}

let lastSpawn = 0;
function tick(ts) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (ts - lastSpawn > 320 && particles.length < 28) {
    particles.push(mkParticle());
    lastSpawn = ts;
  }

  particles = particles.filter(p => p.a > 0.005 && p.y > -30);

  for (const p of particles) {
    p.y   -= p.vy;
    p.x   += p.vx;
    p.a   -= p.da;
    p.rot += p.dr;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot * Math.PI / 180);
    ctx.globalAlpha = Math.max(0, p.a);
    ctx.font = `${p.sz}px serif`;
    ctx.fillStyle = p.col;
    ctx.textAlign = 'center';
    ctx.fillText(p.sym, 0, 0);
    ctx.restore();
  }
  requestAnimationFrame(tick);
}

resize();
window.addEventListener('resize', resize);
requestAnimationFrame(tick);

/* ============================================================
   NAVIGATION
   ============================================================ */
const navbar    = document.getElementById('navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

window.addEventListener('scroll', onScroll, { passive: true });

function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  updateActiveLink();
  const nearBottom = (window.scrollY + window.innerHeight) >= (document.body.scrollHeight - 160);
  bttEl.classList.toggle('show', window.scrollY > 500 && !nearBottom);
}

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

function updateActiveLink() {
  const offset = window.scrollY + 120;
  ['home','music','about','gallery','contact'].forEach(id => {
    const sec  = document.getElementById(id);
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (!sec || !link) return;
    const inView = offset >= sec.offsetTop && offset < sec.offsetTop + sec.offsetHeight;
    link.classList.toggle('active', inView);
  });
}

/* ── Back to top ────────────────────────────────────────────── */
const bttEl = document.getElementById('backToTop');
bttEl.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ============================================================
   GALLERY & LIGHTBOX
   ============================================================ */
const lightbox  = document.getElementById('lightbox');
const lbContent = document.getElementById('lbContent');
const lbClose   = document.getElementById('lbClose');
const lbPrev    = document.getElementById('lbPrev');
const lbNext    = document.getElementById('lbNext');
let lbItems = [];
let lbIndex = 0;

function getVisible() {
  return Array.from(document.querySelectorAll('.g-item:not(.hidden)'));
}

function openLightbox(idx) {
  lbItems = getVisible();
  lbIndex = idx;
  renderLb();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function closeLightbox() {
  stopLbMedia();
  lbContent.innerHTML = '';
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function stopLbMedia() {
  const v = lbContent.querySelector('video');
  if (v) v.pause();
}

function renderLb() {
  stopLbMedia();
  lbContent.innerHTML = '';
  const item = lbItems[lbIndex];
  if (!item) return;

  if (item.dataset.type === 'photo') {
    const img = new Image();
    img.src = item.dataset.src;
    img.alt = 'Kristy Childs';
    lbContent.appendChild(img);
  } else {
    const vid = document.createElement('video');
    vid.src = item.dataset.src;
    vid.controls = true;
    vid.autoplay = true;
    vid.playsInline = true;
    vid.disablePictureInPicture = true;
    lbContent.appendChild(vid);
  }
}

// Click gallery items
document.querySelectorAll('.g-item').forEach(item => {
  item.addEventListener('click', () => {
    const visible = getVisible();
    const idx = visible.indexOf(item);
    if (idx >= 0) openLightbox(idx);
  });
});

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

lbPrev.addEventListener('click', () => {
  lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length;
  renderLb();
});
lbNext.addEventListener('click', () => {
  lbIndex = (lbIndex + 1) % lbItems.length;
  renderLb();
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  lbPrev.click();
  if (e.key === 'ArrowRight') lbNext.click();
});

/* ── Gallery filter ─────────────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const f = btn.dataset.filter;
    document.querySelectorAll('.g-item').forEach(item => {
      const show = f === 'all' || item.dataset.type === f;
      item.classList.toggle('hidden', !show);
    });
  });
});

/* ── Contact obfuscation ────────────────────────────────────── */
document.querySelectorAll('.obf-email').forEach(a => {
  const addr = a.dataset.u + '@' + a.dataset.d;
  a.href = 'mailto:' + addr;
  a.querySelector('p').textContent = addr;
});
document.querySelectorAll('.obf-phone').forEach(a => {
  const num = a.dataset.a + a.dataset.b;
  a.href = 'tel:' + num;
  a.querySelector('p').textContent = num.replace(/(\+\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
});

/* ── Footer year ────────────────────────────────────────────── */
document.getElementById('footerYear').textContent = new Date().getFullYear();

/* ── Initial scroll state ───────────────────────────────────── */
onScroll();

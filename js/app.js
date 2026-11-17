import { BIRTHDAY_CONTENT } from './content.js';
import { buildComplimentCollection } from './compliments.js';

(() => {
  const pages = [...document.querySelectorAll('.page')];
  const dots = [...document.querySelectorAll('.nav-dot')];
  let current = 0;
  function go(index) {
    current = Math.max(0, Math.min(pages.length - 1, Number(index)));
    pages.forEach((page, i) => page.classList.toggle('active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => go(button.dataset.next)));
  dots.forEach(button => button.addEventListener('click', () => go(button.dataset.go)));
  document.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' && current < pages.length - 1) go(current + 1);
    if (event.key === 'ArrowLeft' && current > 0) go(current - 1);
  });

  // Asia/Kolkata calendar date is used explicitly, independent of visitor timezone.
  const istFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  });
  function istParts(date = new Date()) {
    return Object.fromEntries(istFormatter.formatToParts(date).filter(p => p.type !== 'literal').map(p => [p.type, Number(p.value)]));
  }
  function updateCountdown() {
    const now = new Date();
    const p = istParts(now);
    const isBirthday = p.month === 11 && p.day === 20;
    const countdown = document.getElementById('countdown');
    if (isBirthday) {
      countdown.textContent = 'IT IS YOUR DAY ♡';
      document.body.classList.add('is-birthday');
      return;
    }
    document.body.classList.remove('is-birthday');
    const year = p.year + (p.month > 11 || (p.month === 11 && p.day > 20) ? 1 : 0);
    const target = new Date(`${year}-11-20T00:00:00+05:30`);
    const diff = Math.max(0, target.getTime() - now.getTime());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    countdown.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s until your day`;
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Complimentr-based generator: a shuffled deck prevents repeats until exhausted.
  const complimentPool = buildComplimentCollection(1200);
  let complimentDeck = [];
  let discovered = 0;
  function refillCompliments() {
    complimentDeck = complimentPool.map((_, index) => index);
    for (let i = complimentDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [complimentDeck[i], complimentDeck[j]] = [complimentDeck[j], complimentDeck[i]];
    }
  }
  function showCompliment() {
    if (!complimentPool.length) return;
    if (!complimentDeck.length) refillCompliments();
    const item = complimentPool[complimentDeck.pop()];
    discovered++;
    document.getElementById('reasonCategory').textContent = item.category;
    document.getElementById('reasonText').textContent = item.text;
    document.getElementById('reasonIndex').textContent = `NO. ${String(discovered).padStart(4, '0')}`;
    document.getElementById('reasonCount').textContent = `${String(Math.min(discovered, complimentPool.length)).padStart(4, '0')} / ${String(complimentPool.length).padStart(4, '0')}`;
    document.getElementById('generatorStatus').textContent = discovered > complimentPool.length ? 'The collection has been reshuffled.' : 'Complimentr engine ready.';
    document.querySelector('.reason-window').animate(
      [{ opacity: .25, transform: 'translateY(9px) rotate(-.4deg)' }, { opacity: 1, transform: 'translateY(0) rotate(0)' }],
      { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' }
    );
  }
  refillCompliments();
  showCompliment();
  document.getElementById('nextReason').addEventListener('click', showCompliment);
  document.getElementById('randomReason').addEventListener('click', showCompliment);

  // Personal letter text is editable in content.js and inserted as text, never HTML.
  const letter = document.getElementById('letterContent');
  for (const paragraph of (BIRTHDAY_CONTENT.letter || [])) {
    const p = document.createElement('p');
    p.textContent = paragraph;
    letter.appendChild(p);
  }

  // Decoration placement: all decorations remain inside the same room as the cake.
  const decorLayer = document.getElementById('decorLayer');
  document.querySelectorAll('[data-decor]').forEach(button => button.addEventListener('click', () => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'placed-decor';
    item.textContent = button.dataset.decor;
    item.setAttribute('aria-label', `Remove ${button.getAttribute('aria-label') || 'decoration'}`);
    item.style.left = `${7 + Math.random() * 82}%`;
    item.style.top = `${8 + Math.random() * 47}%`;
    item.style.setProperty('--tilt', `${Math.round(Math.random() * 30 - 15)}deg`);
    item.addEventListener('click', () => item.remove());
    decorLayer.appendChild(item);
  }));
  document.getElementById('clearDecor').addEventListener('click', () => decorLayer.replaceChildren());

  // Audio manager: music playback position keeps advancing while volume is ducked.
  const audio = {
    music: new Audio(), hissing: new Audio('assets/audio/hissing.mp3'), explosion: new Audio('assets/audio/cake-explosion.mp3'),
    currentTrack: null, baseVolume: 0.34, fadeFrame: null
  };
  audio.music.loop = true;
  audio.music.volume = audio.baseVolume;
  audio.hissing.preload = 'auto';
  audio.explosion.preload = 'auto';
  audio.hissing.volume = 0.8;
  audio.explosion.volume = 0.9;
  const musicStatus = document.getElementById('musicStatus');
  const musicIndicator = document.getElementById('musicIndicator');
  function setMusicUI(track, label) {
    document.querySelectorAll('.music-choice').forEach(button => {
      const active = button.dataset.track === String(track);
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    musicStatus.textContent = label;
    musicIndicator.textContent = track === 'none' ? '♫ no music' : `♫ ${label}`;
  }
  function stopFade() { if (audio.fadeFrame) cancelAnimationFrame(audio.fadeFrame); audio.fadeFrame = null; }
  function fadeMusic(target, duration) {
    if (audio.music.paused || !audio.currentTrack) return Promise.resolve();
    stopFade();
    const start = audio.music.volume;
    const began = performance.now();
    return new Promise(resolve => {
      const step = now => {
        const progress = Math.min(1, (now - began) / duration);
        audio.music.volume = start + (target - start) * progress;
        if (progress < 1) audio.fadeFrame = requestAnimationFrame(step);
        else { audio.fadeFrame = null; resolve(); }
      };
      audio.fadeFrame = requestAnimationFrame(step);
    });
  }
  async function chooseTrack(track) {
    if (track === 'none') {
      stopFade();
      audio.music.pause();
      audio.music.removeAttribute('src');
      audio.music.load();
      audio.currentTrack = null;
      setMusicUI('none', 'No music selected.');
      return;
    }
    const src = `assets/audio/song-${track}.mp3`;
    stopFade();
    audio.music.pause();
    audio.music.src = src;
    audio.music.currentTime = 0;
    audio.music.volume = audio.baseVolume;
    audio.currentTrack = track;
    try {
      await audio.music.play();
      setMusicUI(track, `Song ${track} is playing.`);
    } catch {
      audio.currentTrack = null;
      setMusicUI('none', `Song ${track} could not be played. Check that ${src} exists.`);
    }
  }
  document.querySelectorAll('.music-choice').forEach(button => button.addEventListener('click', () => chooseTrack(button.dataset.track)));
  audio.music.addEventListener('error', () => {
    if (audio.currentTrack) {
      const missing = audio.currentTrack;
      audio.currentTrack = null;
      musicStatus.textContent = `Song ${missing} is missing or unsupported. Add assets/audio/song-${missing}.mp3.`;
      musicIndicator.textContent = '♫ unavailable';
    }
  });
  function playEffect(element) {
    try { element.pause(); element.currentTime = 0; const promise = element.play(); if (promise?.catch) promise.catch(() => {}); } catch { /* visual sequence never depends on audio */ }
  }

  // Cake challenge: 16 actual candle buttons and a strict five-second deadline.
  const candles = document.getElementById('candles');
  const startCake = document.getElementById('startCake');
  const timer = document.getElementById('cakeTimer');
  const result = document.getElementById('cakeResult');
  const instructions = document.getElementById('cakeInstructions');
  const cake = document.getElementById('cake');
  const cakeWrap = document.getElementById('cakeWrap');
  const explosionLayer = document.getElementById('explosionLayer');
  let gameRunning = false, remaining = 16, gameTimer = null, deadline = 0, explosionTimers = [];
  for (let i = 0; i < 16; i++) {
    const candle = document.createElement('button');
    candle.type = 'button'; candle.className = 'candle';
    candle.setAttribute('aria-label', `Blow out candle ${i + 1}`);
    candle.addEventListener('click', () => {
      if (!gameRunning || candle.classList.contains('off')) return;
      candle.classList.add('off');
      remaining--;
      if (remaining === 0 && Date.now() <= deadline) winGame();
    });
    candles.appendChild(candle);
  }
  function resetCandles() {
    [...candles.children].forEach(candle => candle.classList.remove('off'));
    remaining = 16;
    cake.classList.remove('cake-aftermath', 'cake-wobble');
    explosionLayer.replaceChildren();
    cakeWrap.classList.remove('exploding', 'smoky');
  }
  function clearExplosionTimers() { explosionTimers.forEach(clearTimeout); explosionTimers = []; }
  function startGame() {
    clearInterval(gameTimer); clearExplosionTimers(); resetCandles();
    gameRunning = true; result.textContent = ''; timer.textContent = '05.0';
    instructions.textContent = 'GO GO GO — tap all sixteen!';
    startCake.disabled = true;
    deadline = Date.now() + 5000;
    gameTimer = setInterval(() => {
      const left = Math.max(0, deadline - Date.now());
      timer.textContent = (left / 1000).toFixed(1);
      if (left <= 0) loseGame();
    }, 30);
  }
  function winGame() {
    if (!gameRunning) return;
    gameRunning = false; clearInterval(gameTimer); startCake.disabled = false;
    timer.textContent = '00.0'; instructions.textContent = 'ALL SIXTEEN. ABSOLUTELY LEGENDARY.';
    result.textContent = 'HAPPY BIRTHDAYYYYY, PALAK!';
    cake.classList.add('cake-win');
    celebrate();
    setTimeout(() => cake.classList.remove('cake-win'), 1800);
  }
  function createExplosionFragments() {
    const pieces = ['🍰', '✦', '✧', '·', '▪', '♡', '🧁', '✿'];
    for (let i = 0; i < 42; i++) {
      const fragment = document.createElement('i');
      fragment.className = 'cake-fragment';
      fragment.textContent = pieces[i % pieces.length];
      fragment.style.setProperty('--dx', `${Math.round(Math.cos(i * 2.399) * (70 + Math.random() * 150))}px`);
      fragment.style.setProperty('--dy', `${Math.round(Math.sin(i * 2.399) * (55 + Math.random() * 135) - 45)}px`);
      fragment.style.setProperty('--spin', `${Math.round(Math.random() * 900 - 450)}deg`);
      fragment.style.setProperty('--delay', `${Math.random() * 120}ms`);
      explosionLayer.appendChild(fragment);
    }
    for (let i = 0; i < 22; i++) {
      const crumb = document.createElement('i');
      crumb.className = 'crumb';
      crumb.style.setProperty('--dx', `${Math.round(Math.random() * 260 - 130)}px`);
      crumb.style.setProperty('--dy', `${Math.round(Math.random() * 130 - 30)}px`);
      crumb.style.setProperty('--delay', `${Math.random() * 180}ms`);
      explosionLayer.appendChild(crumb);
    }
  }
  async function loseGame() {
    if (!gameRunning) return;
    gameRunning = false; clearInterval(gameTimer); startCake.disabled = false;
    timer.textContent = '00.0'; instructions.textContent = 'THE CAKE HAS DECLINED TO REMAIN IN ONE PIECE.';
    result.textContent = 'oh. that was not meant to happen.';
    cake.classList.add('cake-wobble');
    // Suspense starts immediately; the hissing file is optional.
    playEffect(audio.hissing);
    await fadeMusic(0.045, 1050);
    explosionTimers.push(setTimeout(() => {
      cake.classList.remove('cake-wobble');
      cake.classList.add('cake-aftermath');
      cakeWrap.classList.add('exploding', 'smoky');
      createExplosionFragments();
      playEffect(audio.explosion);
      document.body.classList.add('screen-shake');
      setTimeout(() => document.body.classList.remove('screen-shake'), 520);
    }, 1350));
    explosionTimers.push(setTimeout(() => cakeWrap.classList.remove('exploding'), 2350));
    explosionTimers.push(setTimeout(() => cakeWrap.classList.remove('smoky'), 3900));
    explosionTimers.push(setTimeout(() => {
      if (audio.currentTrack && !audio.music.paused) fadeMusic(audio.baseVolume, 1150);
    }, 3900));
  }
  function celebrate() {
    const room = document.getElementById('roomScene');
    room.classList.add('celebrating');
    for (let i = 0; i < 90; i++) {
      const bit = document.createElement('i');
      bit.className = 'confetti-bit';
      bit.style.left = `${Math.random() * 100}%`;
      bit.style.setProperty('--fall', `${2 + Math.random() * 2.2}s`);
      bit.style.setProperty('--delay', `${Math.random() * .8}s`);
      bit.style.setProperty('--rotation', `${Math.random() * 720}deg`);
      room.appendChild(bit);
      setTimeout(() => bit.remove(), 5200);
    }
    setTimeout(() => room.classList.remove('celebrating'), 3200);
  }
  startCake.addEventListener('click', startGame);

  // Birthday overlay is shown on the actual IST birthday only, once per page load.
  const birthdayOverlay = document.getElementById('birthdayOverlay');
  const birthdayParts = istParts();
  document.getElementById('birthdayMessage').textContent = BIRTHDAY_CONTENT.birthdayMessage || '';
  if (birthdayParts.month === 11 && birthdayParts.day === 20) birthdayOverlay.hidden = false;
  document.getElementById('closeBirthdayOverlay').addEventListener('click', () => { birthdayOverlay.hidden = true; });
})();

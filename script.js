/* ===== Show real photos when they exist ===== */
document.querySelectorAll('.card img').forEach(img => {
  function check() {
    if (img.naturalWidth > 0) {
      img.style.display = 'block';
      img.parentElement.classList.remove('photo-missing');
    } else {
      img.parentElement.classList.add('photo-missing');
    }
  }
  if (img.complete) check(); else { img.onload = check; img.onerror = check; }
});

/* ===== Confetti ===== */
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
let pieces = [];
const colors = ['#ff6b9d','#fbbf24','#a855f7','#34d399','#60a5fa','#f472b6'];

function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
resize(); addEventListener('resize', resize);

function spawn(n) {
  for (let i = 0; i < n; i++) {
    pieces.push({
      x: Math.random()*canvas.width, y: -20,
      w: 6+Math.random()*8, h: 4+Math.random()*6,
      color: colors[(Math.random()*colors.length)|0],
      vy: 1.5+Math.random()*3, vx: -1+Math.random()*2,
      rot: Math.random()*Math.PI, vr: -0.1+Math.random()*0.2
    });
  }
}
spawn(80); setInterval(() => spawn(5), 3000);

(function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  pieces.forEach((p,i) => {
    p.y += p.vy; p.x += p.vx; p.rot += p.vr;
    if (p.y > canvas.height+20) { pieces.splice(i,1); return; }
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
    ctx.fillStyle = p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
    ctx.restore();
  });
  requestAnimationFrame(draw);
})();

/* ===== FLOW =====
   1. Tap cake → candle blows + confetti
   2. Gift box pops up
   3. Tap gift box → photos burst & immediately arrange on left side
   4. Within 3 sec → letter pops from box
   5. Tap letter → letter opens with message
*/

const flame = document.getElementById('flame');
const cakeBox = document.getElementById('cakeBox');
const cakeMsg = document.getElementById('cakeMsg');
const giftOverlay = document.getElementById('giftOverlay');
const giftBox = document.getElementById('giftBox');
const floatPhotos = document.getElementById('floatPhotos');
const letterIcon = document.getElementById('letterIcon');
const letterOverlay = document.getElementById('letterOverlay');
const closeLetter = document.getElementById('closeLetter');

let step = 0; // 0=not started, 1=gift shown, 2=photos shown, 3=letter shown

// STEP 1: tap cake
cakeBox.addEventListener('click', () => {
  if (step > 0) return;
  step = 1;
  flame.classList.add('out');
  cakeMsg.textContent = 'Woohoo! Surprise!! 🎉';
  spawn(250);

  // gift box pops
  setTimeout(() => giftOverlay.classList.add('open'), 500);
});

// STEP 2: tap gift box
giftBox.addEventListener('click', () => {
  if (step > 1) return;
  step = 2;
  giftBox.classList.add('opening');
  spawn(200);

  // hide gift overlay
  setTimeout(() => giftOverlay.classList.remove('open'), 500);

  // photos burst immediately
  floatPhotos.classList.add('active');

  // immediately arrange photos to left side (after burst animation ~1s)
  setTimeout(() => {
    floatPhotos.classList.add('docked');
  }, 1100);

  // STEP 3: letter pops within 3 sec
  setTimeout(() => {
    letterIcon.classList.add('show');
  }, 3000);
});

// STEP 4: tap letter → open
letterIcon.addEventListener('click', () => {
  document.body.classList.add('letter-open');
  letterOverlay.classList.add('open');
});

function hideLetter() {
  letterOverlay.classList.remove('open');
  document.body.classList.remove('letter-open');
}
closeLetter.addEventListener('click', hideLetter);
letterOverlay.addEventListener('click', e => { if (e.target === letterOverlay) hideLetter(); });

// tap any docked photo → lightbox
floatPhotos.addEventListener('click', e => {
  if (!e.target.matches('img')) return;
  lbImg.src = e.target.src;
  lightbox.classList.add('open');
});

/* ===== Lightbox ===== */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
let current = 0;

function openLb(i) {
  const photos = [...document.querySelectorAll('.card img')].filter(img => img.naturalWidth > 0);
  if (!photos.length) return;
  current = (i + photos.length) % photos.length;
  lbImg.src = photos[current].src;
  lightbox.classList.add('open');
}

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    const img = card.querySelector('img');
    const list = [...document.querySelectorAll('.card img')];
    if (img && img.naturalWidth) openLb(list.indexOf(img));
  });
});

document.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); openLb(current - 1); });
document.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); openLb(current + 1); });
document.querySelector('.lb-close').addEventListener('click', () => lightbox.classList.remove('open'));
lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('open'); });

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') { lightbox.classList.remove('open'); hideLetter(); }
  if (e.key === 'ArrowRight') openLb(current + 1);
  if (e.key === 'ArrowLeft') openLb(current - 1);
});

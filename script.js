// script.js

const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const dodgeCountEl = document.getElementById("dodgeCount");
const overlay = document.getElementById("overlay");
const closeOverlay = document.getElementById("closeOverlay");

const backgroundMusic = document.getElementById("backgroundMusic");
const bouquetMusic = document.getElementById("bouquetMusic");
const logo = document.querySelector(".floatingLogo");
const windowCard = document.getElementById("window");
const startHint = document.getElementById("startHint");

let dodges = 0;
let canShowBouquet = false;
let bgStarted = false;

// YES starts tiny
let yesScale = 0.4;
yesBtn.style.transform = `scale(${yesScale})`;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/* ===============================
   🔓 Mobile Audio Unlock (Fix)
   - iOS/Android often require a trusted click/tap before any audio can play
================================= */

let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;

  // Prime both audios with a user gesture, then pause immediately
  const p1 = backgroundMusic.play();
  if (p1 && typeof p1.then === "function") {
    p1.then(() => {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
      backgroundMusic.muted = false;
      audioUnlocked = true;
    }).catch(() => {});
  }

  const p2 = bouquetMusic.play();
  if (p2 && typeof p2.then === "function") {
    p2.then(() => {
      bouquetMusic.pause();
      bouquetMusic.currentTime = 0;
      bouquetMusic.muted = false;
    }).catch(() => {});
  }
}

// Unlock on first interaction anywhere (most reliable on mobile)
document.addEventListener("click", unlockAudio, { once: true });
document.addEventListener("touchend", unlockAudio, { once: true, passive: true });

/* ===============================
   🌹 Petals (ONLY on logo start)
================================= */

function burstPetals(x, y, count = 18) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "petalParticle";

    const x0 = (Math.random() * 140 - 70) + "px";
    const y0 = (Math.random() * 40 - 10) + "px";
    const x1 = (Math.random() * 260 - 130) + "px";
    const y1 = (Math.random() * 420 + 260) + "px";
    const r0 = (Math.random() * 180 - 90) + "deg";
    const r1 = (Math.random() * 540 - 270) + "deg";
    const dur = (1.6 + Math.random() * 1.6).toFixed(2) + "s";

    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.setProperty("--x0", x0);
    p.style.setProperty("--y0", y0);
    p.style.setProperty("--x1", x1);
    p.style.setProperty("--y1", y1);
    p.style.setProperty("--r0", r0);
    p.style.setProperty("--r1", r1);
    p.style.setProperty("--dur", dur);

    document.body.appendChild(p);
    setTimeout(() => p.remove(), 4000);
  }
}

/* ===============================
   No Button Dodge Logic
================================= */

let noBtnMovedToBody = false;

function moveNoButtonAnywhere() {
  if (!noBtnMovedToBody) {
    document.body.appendChild(noBtn);
    noBtnMovedToBody = true;
  }

  noBtn.style.position = "fixed";
  noBtn.style.zIndex = "9999";
  noBtn.style.transform = "none";

  const margin = 12;
  const rect = noBtn.getBoundingClientRect();

  const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
  const maxY = Math.max(margin, window.innerHeight - rect.height - margin);

  const x = Math.floor(Math.random() * maxX) + margin;
  const y = Math.floor(Math.random() * maxY) + margin;

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

let lastDodgeAt = 0;

function registerDodge(e) {
  if (e) e.preventDefault();

  const now = Date.now();
  if (now - lastDodgeAt < 180) return;
  lastDodgeAt = now;

  dodges++;
  dodgeCountEl.textContent = String(dodges);

  yesScale += 0.08;
  yesScale = clamp(yesScale, 0.4, 2.4);
  yesBtn.style.transform = `scale(${yesScale})`;

  const extraSpace = Math.max(0, (yesScale - 1) * 20);
  document.querySelector(".subtitle").style.marginBottom = `${12 + extraSpace}px`;
  document.querySelector(".actions").style.marginBottom = `${12 + extraSpace}px`;

  if (dodges >= 25) {
    canShowBouquet = true;
    yesBtn.classList.add("glow");
  }

  moveNoButtonAnywhere();
}

function resetValentine() {
  dodges = 0;
  canShowBouquet = false;
  lastDodgeAt = 0;

  dodgeCountEl.textContent = "0";

  yesScale = 0.4;
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.textContent = "Yes 💖";
  yesBtn.classList.remove("glow");

  document.querySelector(".subtitle").style.marginBottom = "";
  document.querySelector(".actions").style.marginBottom = "";

  noBtn.style.display = "";
  noBtn.style.position = "relative";
  noBtn.style.left = "auto";
  noBtn.style.top = "auto";
  noBtn.style.transform = "none";
  noBtn.style.zIndex = "";

  const actions = document.querySelector(".actions");
  if (actions && !actions.contains(noBtn)) {
    actions.appendChild(noBtn);
  }

  noBtnMovedToBody = false;
}

/* NO interactions */
noBtn.addEventListener("mouseenter", registerDodge);
noBtn.addEventListener("touchstart", registerDodge, { passive: false });
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  registerDodge(e);
});

/* YES logic (NO PETALS HERE) */
yesBtn.addEventListener("click", () => {
  if (!bgStarted) return;

  if (!canShowBouquet) {
    const original = "Yes 💖";
    yesBtn.textContent = "Try ‘No’ first 😇";
    setTimeout(() => (yesBtn.textContent = original), 900);
    return;
  }

  noBtn.style.display = "none";

  overlay.style.display = "flex";
  overlay.setAttribute("aria-hidden", "false");

  overlay.classList.remove("show");
  void overlay.offsetWidth;
  overlay.classList.add("show");

  fadeOut(backgroundMusic, 900, true, true);

  bouquetMusic.pause();
  bouquetMusic.currentTime = 0;
  bouquetMusic.volume = 0;
  bouquetMusic.play().catch(() => {});
  fadeIn(bouquetMusic, 0.8, 1100);
});

/* Close overlay → Fresh start */
closeOverlay.addEventListener("click", () => {
  overlay.classList.remove("show");
  overlay.style.display = "none";
  overlay.setAttribute("aria-hidden", "true");

  fadeOut(bouquetMusic, 500, true, true);
  fadeOut(backgroundMusic, 500, true, true);

  if (windowCard) windowCard.classList.remove("show");
  if (startHint) startHint.classList.remove("hide");

  bgStarted = false;

  resetValentine();
});

/* ===============================
   Logo Click → Start Experience
   (Use click/touchend instead of pointerdown for mobile audio reliability)
================================= */

function startExperience() {
  if (bgStarted) return;

  // Make sure audio is unlocked if the user tapped the logo first
  unlockAudio();

  backgroundMusic.muted = false;
  backgroundMusic.volume = 0;
  backgroundMusic.currentTime = 0;

  const p = backgroundMusic.play();

  const onStarted = () => {
    bgStarted = true;

    if (startHint) startHint.classList.add("hide");

    const rect = logo.getBoundingClientRect();
    burstPetals(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);

    fadeIn(backgroundMusic, 0.6, 1200);

    setTimeout(() => {
      if (windowCard) windowCard.classList.add("show");
    }, 1000);
  };

  if (p && typeof p.then === "function") {
    p.then(onStarted).catch(() => onStarted());
  } else {
    onStarted();
  }
}

// Mobile-safe listeners
logo.addEventListener("click", startExperience, { passive: true });
logo.addEventListener(
  "touchend",
  (e) => {
    e.preventDefault(); // avoid "ghost click" issues on iOS
    startExperience();
  },
  { passive: false }
);

/* ===============================
   Music helpers
================================= */

const _fadeTimers = new Map();

function _clearFade(audio) {
  const t = _fadeTimers.get(audio);
  if (t) clearInterval(t);
  _fadeTimers.delete(audio);
}

function fadeTo(audio, targetVolume, duration = 800) {
  if (!audio) return;
  _clearFade(audio);

  const startVolume = audio.volume;
  const delta = targetVolume - startVolume;

  const stepMs = 25;
  const steps = Math.max(1, Math.floor(duration / stepMs));
  let i = 0;

  const timer = setInterval(() => {
    i++;
    audio.volume = startVolume + delta * (i / steps);
    if (i >= steps) {
      audio.volume = targetVolume;
      _clearFade(audio);
    }
  }, stepMs);

  _fadeTimers.set(audio, timer);
}

function fadeIn(audio, targetVolume, duration = 1200) {
  if (!audio) return;
  fadeTo(audio, targetVolume, duration);
}

function fadeOut(audio, duration = 900, shouldPause = true, resetTime = false) {
  if (!audio) return;

  fadeTo(audio, 0, duration);

  setTimeout(() => {
    if (shouldPause) {
      audio.pause();
      if (resetTime) audio.currentTime = 0;
    }
  }, duration + 30);
}
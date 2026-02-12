// ===============================
// ELEMENTS
// ===============================

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

// ===============================
// STATE
// ===============================

let dodges = 0;
let canShowBouquet = false;
let bgStarted = false;

let yesScale = 0.4;
yesBtn.style.transform = `scale(${yesScale})`;

// ===============================
// HELPERS
// ===============================

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// ===============================
// LOGO START (ANDROID SAFE)
// ===============================

function startExperience() {
  if (bgStarted) return;

  backgroundMusic.currentTime = 0;
  backgroundMusic.volume = 0.6;

  // IMPORTANT: play directly inside user gesture
  backgroundMusic.play().then(() => {
    bgStarted = true;

    if (startHint) startHint.classList.add("hide");

    const rect = logo.getBoundingClientRect();
    burstPetals(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      20
    );

    fadeIn(backgroundMusic, 0.6, 1000);

    setTimeout(() => {
      if (windowCard) windowCard.classList.add("show");
    }, 600);
  }).catch(err => {
    console.log("Audio blocked:", err);
  });
}

// Use BOTH for Android reliability
logo.addEventListener("click", startExperience);
logo.addEventListener("touchend", startExperience);

// ===============================
// PETALS
// ===============================

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

// ===============================
// NO BUTTON DODGE
// ===============================

let noBtnMovedToBody = false;
let lastDodgeAt = 0;

function moveNoButtonAnywhere() {
  if (!noBtnMovedToBody) {
    document.body.appendChild(noBtn);
    noBtnMovedToBody = true;
  }

  noBtn.style.position = "fixed";
  noBtn.style.zIndex = "9999";

  const rect = noBtn.getBoundingClientRect();
  const margin = 12;

  const maxX = window.innerWidth - rect.width - margin;
  const maxY = window.innerHeight - rect.height - margin;

  const x = Math.random() * maxX + margin;
  const y = Math.random() * maxY + margin;

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

function registerDodge(e) {
  if (e) e.preventDefault();

  const now = Date.now();
  if (now - lastDodgeAt < 180) return;
  lastDodgeAt = now;

  dodges++;
  dodgeCountEl.textContent = dodges;

  yesScale += 0.08;
  yesScale = clamp(yesScale, 0.4, 2.4);
  yesBtn.style.transform = `scale(${yesScale})`;

  if (dodges >= 25) {
    canShowBouquet = true;
    yesBtn.classList.add("glow");
  }

  moveNoButtonAnywhere();
}

noBtn.addEventListener("mouseenter", registerDodge);
noBtn.addEventListener("touchstart", registerDodge, { passive: false });
noBtn.addEventListener("click", registerDodge);

// ===============================
// YES BUTTON
// ===============================

yesBtn.addEventListener("click", () => {
  if (!bgStarted) return;

  if (!canShowBouquet) {
    yesBtn.textContent = "Try ‘No’ first 😇";
    setTimeout(() => yesBtn.textContent = "Yes 💖", 900);
    return;
  }

  noBtn.style.display = "none";

  overlay.style.display = "flex";
  overlay.classList.add("show");

  fadeOut(backgroundMusic, 800, true);

  bouquetMusic.currentTime = 0;
  bouquetMusic.volume = 0.8;
  bouquetMusic.play();
});

// ===============================
// RESET
// ===============================

closeOverlay.addEventListener("click", () => {
  overlay.classList.remove("show");
  overlay.style.display = "none";

  bouquetMusic.pause();
  backgroundMusic.pause();

  if (windowCard) windowCard.classList.remove("show");
  if (startHint) startHint.classList.remove("hide");

  bgStarted = false;
  dodges = 0;
  canShowBouquet = false;
  dodgeCountEl.textContent = "0";

  yesScale = 0.4;
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.classList.remove("glow");

  noBtn.style.display = "";
  noBtn.style.position = "relative";
  noBtnMovedToBody = false;
});

// ===============================
// FADE HELPERS
// ===============================

function fadeIn(audio, target, duration) {
  audio.volume = 0;
  const step = target / (duration / 30);
  const fade = setInterval(() => {
    if (audio.volume < target) {
      audio.volume = Math.min(audio.volume + step, target);
    } else {
      clearInterval(fade);
    }
  }, 30);
}

function fadeOut(audio, duration, pauseAfter = false) {
  const step = audio.volume / (duration / 30);
  const fade = setInterval(() => {
    if (audio.volume > 0) {
      audio.volume = Math.max(audio.volume - step, 0);
    } else {
      clearInterval(fade);
      if (pauseAfter) audio.pause();
    }
  }, 30);
}
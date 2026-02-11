// script.js

const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const dodgeCountEl = document.getElementById("dodgeCount");
const overlay = document.getElementById("overlay");
const closeOverlay = document.getElementById("closeOverlay");

let dodges = 0;
let canShowBouquet = false;

// YES starts tiny and grows with dodges
let yesScale = 0.4;
yesBtn.style.transform = `scale(${yesScale})`;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/* No button positions */
let noBtnMovedToBody = false;

function moveNoButtonAnywhere() {
  if (!noBtnMovedToBody) {
    document.body.appendChild(noBtn);
    noBtnMovedToBody = true;
  }

  noBtn.style.position = "fixed";
  noBtn.style.zIndex = "9999";
  noBtn.style.right = "auto";
  noBtn.style.bottom = "auto";
  noBtn.style.transform = "none";

  const margin = 12;
  const rect = noBtn.getBoundingClientRect();

  const minX = margin;
  const minY = margin;
  const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
  const maxY = Math.max(margin, window.innerHeight - rect.height - margin);

  const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
  const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

// Throttle so it doesn't teleport too rapidly and feel "gone"
let lastDodgeAt = 0;

function registerDodge(e) {
  if (e) e.preventDefault();

  const now = Date.now();
  if (now - lastDodgeAt < 180) return;
  lastDodgeAt = now;

  dodges++;
  dodgeCountEl.textContent = String(dodges);

  // Grow YES with every dodge
  yesScale += 0.08;
  yesScale = clamp(yesScale, 0.4, 2.4);
  yesBtn.style.transform = `scale(${yesScale})`;

  // Push content away as YES grows (top + bottom)
  const extraSpace = Math.max(0, (yesScale - 1) * 20);
  document.querySelector(".subtitle").style.marginBottom = `${12 + extraSpace}px`;
  document.querySelector(".actions").style.marginBottom = `${12 + extraSpace}px`;

  // Allow bouquet after 10 dodges
  if (dodges >= 15) canShowBouquet = true;

  moveNoButtonAnywhere();
}

/**
 * Reset everything 
 */
function resetValentine() {
  // state
  dodges = 0;
  canShowBouquet = false;
  lastDodgeAt = 0;

  // counter UI
  dodgeCountEl.textContent = "0";

  // YES back to tiny
  yesScale = 0.4;
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.textContent = "Yes 💖";

  // restore margins you changed dynamically (match your original CSS intent)
  document.querySelector(".subtitle").style.marginBottom = "";
  document.querySelector(".actions").style.marginBottom = "";

  // NO back next to YES, not escaped
  noBtn.style.display = "";
  noBtn.style.position = "relative";
  noBtn.style.left = "auto";
  noBtn.style.top = "auto";
  noBtn.style.right = "auto";
  noBtn.style.bottom = "auto";
  noBtn.style.transform = "none";
  noBtn.style.zIndex = "";

  // move NO back into the actions row
  const actions = document.querySelector(".actions");
  if (actions && !actions.contains(noBtn)) {
    actions.appendChild(noBtn);
  }

  // allow the "move to body" trick again on next dodge
  noBtnMovedToBody = false;
}

/* NO button: dodge interactions */
noBtn.addEventListener("mouseenter", registerDodge); // desktop hover
noBtn.addEventListener("touchstart", registerDodge, { passive: false });

// Block clicks and dodge instead
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  registerDodge(e);
});

/* YES button: show bouquet only after 15 dodges */
yesBtn.addEventListener("click", () => {
  if (!canShowBouquet) {
    const original = "Yes 💖";
    yesBtn.textContent = "Try ‘No’ first 😇";
    setTimeout(() => (yesBtn.textContent = original), 900);
    return;
  }

  // Hide runaway NO while overlay is shown
  noBtn.style.display = "none";

  overlay.style.display = "flex";
  overlay.setAttribute("aria-hidden", "false");

  // Restart fade-in animation each time
  overlay.classList.remove("show");
  void overlay.offsetWidth; // force reflow
  overlay.classList.add("show");
});

/* Close overlay + reset */
closeOverlay.addEventListener("click", () => {
  overlay.classList.remove("show");
  overlay.style.display = "none";
  overlay.setAttribute("aria-hidden", "true");

  resetValentine();
});

// If resized while NO is escaped, keep it visible
window.addEventListener("resize", () => {
  if (noBtnMovedToBody && getComputedStyle(noBtn).position === "fixed") {
    moveNoButtonAnywhere();
  }
});

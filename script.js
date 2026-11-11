/* Mobile navigation */
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", function () {
    const isOpen = navLinks.classList.toggle("show");
    menuBtn.setAttribute("aria-expanded", isOpen);
    menuBtn.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
});

navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
        navLinks.classList.remove("show");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
});

/* Date and live clock */
function updateDateTime() {
    const now = new Date();

    document.getElementById("currentDate").textContent =
        now.toLocaleDateString("en-PK", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    document.getElementById("clock").textContent =
        now.toLocaleTimeString("en-PK", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });
}

updateDateTime();
setInterval(updateDateTime, 1000);

/* Visitor count: counts visits in this browser */
try {
    let visits = Number(localStorage.getItem("adanPortfolioVisits") || 0);
    visits += 1;
    localStorage.setItem("adanPortfolioVisits", visits);
    document.getElementById("visitors").textContent = visits.toLocaleString();
} catch (error) {
    document.getElementById("visitors").textContent = "—";
}

// my skills

const skillsTrack = document.getElementById("skillsTrack");
const skillCards = [...document.querySelectorAll(".skill-card")];
const skillDots = [...document.querySelectorAll(".pagination-dot")];
const prevSkill = document.getElementById("prevSkill");
const nextSkill = document.getElementById("nextSkill");

let activeSkill = 0;
let autoSlide;

function showSkill(index) {
  activeSkill = (index + skillCards.length) % skillCards.length;

  skillsTrack.scrollTo({
    left: activeSkill * skillsTrack.clientWidth,
    behavior: "smooth"
  });

  updateDots();
}

function updateDots() {
  skillDots.forEach((dot, index) => {
    dot.classList.toggle("active", index === activeSkill);
  });
}

function startAutoSlide() {
  stopAutoSlide();

  autoSlide = setInterval(() => {
    showSkill(activeSkill + 1);
  }, 4000);
}

function stopAutoSlide() {
  clearInterval(autoSlide);
}

if (skillsTrack && prevSkill && nextSkill) {

prevSkill.addEventListener("click", () => {
  showSkill(activeSkill - 1);
  startAutoSlide();
});

nextSkill.addEventListener("click", () => {
  showSkill(activeSkill + 1);
  startAutoSlide();
});

skillDots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showSkill(index);
    startAutoSlide();
  });
});

// Swipe ya manual scroll karne par active dot update hoga
skillsTrack.addEventListener("scroll", () => {
  const cardWidth = skillsTrack.clientWidth;
  activeSkill = Math.round(skillsTrack.scrollLeft / cardWidth);
  updateDots();
});

// Card par mouse rakhne se auto-slide pause hoga
skillsTrack.addEventListener("mouseenter", stopAutoSlide);
skillsTrack.addEventListener("mouseleave", startAutoSlide);

// Mobile par touch karte waqt auto-slide pause hoga
skillsTrack.addEventListener("touchstart", stopAutoSlide);
skillsTrack.addEventListener("touchend", startAutoSlide);

// Page load hote hi auto-slide shuru
startAutoSlide();

}

// end 

// game
const gameArena = document.getElementById("gameArena");
const startScreen = document.getElementById("gameStartScreen");
const overScreen = document.getElementById("gameOverScreen");
const startButton = document.getElementById("startGame");
const restartButton = document.getElementById("restartGame");

const scoreDisplay = document.getElementById("gameScore");
const bestDisplay = document.getElementById("gameBest");
const livesDisplay = document.getElementById("gameLives");
const finalScore = document.getElementById("finalScore");
const gameMessage = document.getElementById("gameMessage");

if (gameArena && startButton && restartButton) {

  let score = 0;
  let lives = 3;
  let best = Number(localStorage.getItem("adanFoodNinjaBest")) || 0;

  let running = false;
  let animationFrame;
  let spawnTimer;
  let lastSpawn = 0;
  let lastTime = 0;
  let items = [];
  let pointerDown = false;
  let lastPointer = null;
  let gameDuration = 0;

  const fruits = ["🍉", "🍎", "🍊", "🍌", "🍍", "🥝", "🍓", "🍇", "🥥"];
  const bombEmoji = "💣";

  bestDisplay.textContent = best;

  function updateStats() {
    scoreDisplay.textContent = score;
    livesDisplay.textContent = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
  }

  function showMessage(message) {
    gameMessage.textContent = message;
    gameMessage.classList.remove("show");
    void gameMessage.offsetWidth;
    gameMessage.classList.add("show");
  }

  function createItem() {
    if (!running) return;

    const bomb = Math.random() < 0.19;
    const element = document.createElement("div");

    element.className = "game-item" + (bomb ? " bomb" : "");
    element.textContent = bomb ? bombEmoji : fruits[Math.floor(Math.random() * fruits.length)];

    const width = gameArena.clientWidth;
    const height = gameArena.clientHeight;

    const x = Math.random() * (width - 75) + 5;

    const item = {
      element,
      x,
      y: height + 10,
      velocityX: (Math.random() - 0.5) * 2.8,
      velocityY: -(7 + Math.random() * 3 + Math.min(score / 100, 3)),
      gravity: 0.12,
      bomb,
      sliced: false
    };

    element.style.left = x + "px";
    element.style.top = item.y + "px";

    gameArena.appendChild(element);
    items.push(item);
  }

  function removeItem(item) {
    item.element.remove();
    items = items.filter(current => current !== item);
  }

  function sliceItem(item) {
    if (item.sliced || !running) return;

    item.sliced = true;

    if (item.bomb) {
      lives--;
      updateStats();
      showMessage("BOOM! Life lost!");

      const explosion = document.createElement("div");
      explosion.className = "game-slice";
      explosion.textContent = "💥";
      explosion.style.left = item.x + "px";
      explosion.style.top = item.y + "px";
      gameArena.appendChild(explosion);
      setTimeout(() => explosion.remove(), 600);

      if (lives <= 0) {
        removeItem(item);
        endGame();
        return;
      }

    } else {
      score += 10;
      updateStats();
      showMessage("+10 POINTS!");

      const effect = document.createElement("div");
      effect.className = "game-slice";
      effect.textContent = "✨";
      effect.style.left = item.x + "px";
      effect.style.top = item.y + "px";
      gameArena.appendChild(effect);
      setTimeout(() => effect.remove(), 600);
    }

    removeItem(item);
  }

  function checkSlice(x, y) {
    items.forEach(item => {
      if (item.sliced) return;

      const dx = x - (item.x + 30);
      const dy = y - (item.y + 30);

      if (Math.sqrt(dx * dx + dy * dy) < 48) {
        sliceItem(item);
      }
    });
  }

  function gameLoop(timestamp) {
    if (!running) return;

    const delta = lastTime ? Math.min((timestamp - lastTime) / 16.67, 2) : 1;
    lastTime = timestamp;
    gameDuration += delta;

    const spawnDelay = Math.max(470, 1050 - score * 2);

    if (timestamp - lastSpawn > spawnDelay) {
      createItem();
      lastSpawn = timestamp;
    }

    const height = gameArena.clientHeight;

    items.slice().forEach(item => {
      if (!running) return;

      item.x += item.velocityX * delta;
      item.y += item.velocityY * delta;
      item.velocityY += item.gravity * delta;

      item.element.style.left = item.x + "px";
      item.element.style.top = item.y + "px";
      item.element.style.transform = `rotate(${gameDuration * 4}deg)`;

      if (item.y > height + 100 || item.x < -100 || item.x > gameArena.clientWidth + 100) {
        removeItem(item);
      }
    });

    animationFrame = requestAnimationFrame(gameLoop);
  }

  function startGame() {
    cancelAnimationFrame(animationFrame);
    clearInterval(spawnTimer);

    items.forEach(item => item.element.remove());
    items = [];

    score = 0;
    lives = 3;
    lastTime = 0;
    lastSpawn = 0;
    gameDuration = 0;
    running = true;

    updateStats();

    startScreen.style.display = "none";
    overScreen.style.display = "none";

    gameLoop(performance.now());
  }

  function endGame() {
    running = false;
    cancelAnimationFrame(animationFrame);

    items.forEach(item => item.element.remove());
    items = [];

    if (score > best) {
      best = score;
      localStorage.setItem("adanFoodNinjaBest", best);
      bestDisplay.textContent = best;
    }

    finalScore.textContent = score;
    overScreen.style.display = "flex";
  }

  function getPosition(event) {
    const rect = gameArena.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  gameArena.addEventListener("pointerdown", event => {
    if (!running) return;

    pointerDown = true;
    lastPointer = getPosition(event);
    gameArena.setPointerCapture(event.pointerId);

    checkSlice(lastPointer.x, lastPointer.y);
  });

  gameArena.addEventListener("pointermove", event => {
    if (!running || !pointerDown) return;

    const current = getPosition(event);

    if (lastPointer) {
      const distance = Math.hypot(
        current.x - lastPointer.x,
        current.y - lastPointer.y
      );

      const steps = Math.max(1, Math.ceil(distance / 10));

      for (let i = 0; i <= steps; i++) {
        const x = lastPointer.x + (current.x - lastPointer.x) * i / steps;
        const y = lastPointer.y + (current.y - lastPointer.y) * i / steps;
        checkSlice(x, y);
      }
    }

    lastPointer = current;
  });

  gameArena.addEventListener("pointerup", () => {
    pointerDown = false;
    lastPointer = null;
  });

  gameArena.addEventListener("pointercancel", () => {
    pointerDown = false;
    lastPointer = null;
  });

  startButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", startGame);

  updateStats();
}
// end

/* ---------- Contact form: opens the visitor's email app with the message filled in ---------- */
(function () {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const note = document.createElement("p");
  note.className = "form-status";
  note.setAttribute("role", "status");
  form.appendChild(note);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const get = id => document.getElementById(id).value.trim();
    const body =
      "Name: " + get("name") + "\n" +
      "Email: " + get("emailAddress") + "\n" +
      "Interested in: " + get("service") + "\n\n" +
      get("message");
    const url = "mailto:adanahmed504@gmail.com?subject=" +
      encodeURIComponent(get("subject")) + "&body=" + encodeURIComponent(body);
    note.textContent = "Opening your email app… If nothing opens, email adanahmed504@gmail.com directly or use WhatsApp.";
    note.classList.add("show");
    window.location.href = url;
  });
})();

/* ---------- Scroll reveal ---------- */
(function () {
  const targets = document.querySelectorAll(
    ".service-card, .adan-card, .perspective-item, .expertise-line, .timeline-item, .contact-option, .svc-block, .process-step, .faq-item, .skills-heading, .story-content"
  );
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.documentElement.classList.add("js-reveal");
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  targets.forEach(function (el, i) {
    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", (i % 4) * 70 + "ms");
    io.observe(el);
  });
})();

/* ---------- Back to top ---------- */
(function () {
  const btn = document.createElement("button");
  btn.className = "back-to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  document.body.appendChild(btn);
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => btn.classList.toggle("show", window.scrollY > 600), { passive: true });
})();

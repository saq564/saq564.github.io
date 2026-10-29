// All the interactive parts of the site. Each block does one job.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- 1. Light / dark mode button ----------
// Flips the theme and remembers the choice for next visit.
document.getElementById("theme-toggle").addEventListener("click", () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
  try {
    localStorage.setItem("theme", root.dataset.theme);
  } catch (e) {}
});

// ---------- 2. Phone menu (the ☰ button) ----------
const menuButton = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

menuButton.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", isOpen);
  menuButton.textContent = isOpen ? "✕" : "☰";
});
// Close the menu after tapping a link
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuButton.textContent = "☰";
  });
});

// ---------- 3. Things that react to scrolling ----------
// The top bar turns to glass, and the progress bar fills up.
const topbar = document.getElementById("topbar");
const progress = document.getElementById("scroll-progress");

function onScroll() {
  topbar.classList.toggle("scrolled", window.scrollY > 20);
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (window.scrollY / maxScroll) * 100 + "%";
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------- 4. Typing effect in the intro ----------
// Types a phrase, waits, deletes it, then moves to the next one.
const phrases = ["real products", "AI assistants", "web apps", "secure apps", "useful tools"];
const typed = document.getElementById("typed");

if (!reduceMotion) {
  let phraseIndex = 0;
  let letterCount = phrases[0].length;
  let deleting = true;

  setTimeout(function type() {
    const phrase = phrases[phraseIndex];
    letterCount += deleting ? -1 : 1;
    typed.textContent = phrase.slice(0, letterCount);

    let delay = deleting ? 45 : 90;
    if (!deleting && letterCount === phrase.length) {
      deleting = true;
      delay = 1800;  // pause on the full phrase
    } else if (deleting && letterCount === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 300;
    }
    setTimeout(type, delay);
  }, 2000);
}

// ---------- 5. Fade-in on scroll ----------
// Every time you scroll, check which hidden items are now on screen
// and add "visible" to them. The CSS transition slides them into place.
const revealItems = document.querySelectorAll(".reveal");
revealItems.forEach((el, i) => {
  // Items next to each other appear one after another, not all at once
  el.style.transitionDelay = (i % 4) * 0.08 + "s";
});

function revealOnScreen() {
  revealItems.forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
      el.classList.add("visible");
    }
  });
}

// ---------- 6. Numbers that count up (74%, £15,000 and £6,000) ----------
// The real numbers are written in index.html and stay there until the
// stat is on screen. We never reset them to 0, so a slow phone, a
// screenshot or a crashed script always shows the real number.
const counters = document.querySelectorAll(".count");

function countUp(el) {
  const target = Number(el.dataset.target);
  const duration = 1500;
  const start = performance.now();

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);  // starts fast, slows down at the end
    // Count from half the number up to the full number, never from 0
    el.textContent = Math.round(target * (0.5 + 0.5 * eased)).toLocaleString("en-GB");
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function countOnScreen() {
  counters.forEach((el) => {
    if (!el.dataset.counted && el.getBoundingClientRect().top < window.innerHeight * 0.85) {
      el.dataset.counted = "yes";  // only count once
      if (!reduceMotion) countUp(el);
    }
  });
}

function onScreenCheck() {
  revealOnScreen();
  countOnScreen();
}
window.addEventListener("scroll", onScreenCheck, { passive: true });
window.addEventListener("resize", onScreenCheck);
setInterval(onScreenCheck, 1000);  // backup, for in-app browsers that don't send scroll events
onScreenCheck();

// Tells the safety net in index.html that the fade-in is working
window.revealWorking = true;

// ---------- 7. Cards that tilt and light up under the mouse ----------
// Only on devices with a real mouse (phones don't have hover).
if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const box = card.getBoundingClientRect();
      const x = e.clientX - box.left;  // mouse position inside the card
      const y = e.clientY - box.top;
      const rotateY = (x / box.width - 0.5) * 10;   // up to 5 degrees each way
      const rotateX = (0.5 - y / box.height) * 10;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.setProperty("--x", x + "px");  // used by the spotlight in style.css
      card.style.setProperty("--y", y + "px");
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  // The background glows drift gently towards the mouse
  const glow1 = document.querySelector(".glow-1");
  const glow2 = document.querySelector(".glow-2");
  window.addEventListener("mousemove", (e) => {
    const dx = (e.clientX / window.innerWidth - 0.5) * 60;
    const dy = (e.clientY / window.innerHeight - 0.5) * 60;
    glow1.style.transform = `translate(${dx}px, ${dy}px)`;
    glow2.style.transform = `translate(${-dx}px, ${-dy}px)`;
  });
}

// ---------- 8. Highlight the menu link for the section you're reading ----------
// (An IntersectionObserver tells us when something comes on screen.
// Very old browsers don't have one, so we check first.)
const sections = document.querySelectorAll("main section[id]");
const sectionObserver = "IntersectionObserver" in window && new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.querySelectorAll("a").forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
      });
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
if (sectionObserver) sections.forEach((s) => sectionObserver.observe(s));

// ---------- 9. "Copy my email" button ----------
const copyButton = document.getElementById("copy-email");
const copyText = document.getElementById("copy-email-text");

copyButton.addEventListener("click", async () => {
  const email = copyButton.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    copyText.textContent = "Copied ✓";
  } catch (e) {
    window.location.href = "mailto:" + email;  // fallback: open the email app
  }
  setTimeout(() => (copyText.textContent = "Copy my email"), 2000);
});

// ---------- 10. Living AI network in the intro ----------
// Dots drift around. Close dots get joined by a line, like a neural network.
// The mouse connects to nearby dots and gently pushes them aside.
const canvas = document.getElementById("network");
const ctx = canvas.getContext("2d");
const hero = document.querySelector(".hero");
let dots = [];
let mouse = { x: -9999, y: -9999 };
let heroOnScreen = true;
let purple, blue;
const LINK_DISTANCE = 130;   // how close two dots must be to join
const MOUSE_DISTANCE = 180;  // how far the mouse reaches

// Read the theme colours, so the network matches dark and light mode
function readColours() {
  const styles = getComputedStyle(document.documentElement);
  purple = styles.getPropertyValue("--purple").trim();
  blue = styles.getPropertyValue("--blue").trim();
}
readColours();
document.getElementById("theme-toggle").addEventListener("click", readColours);

function sizeCanvas() {
  const ratio = window.devicePixelRatio || 1;  // keeps lines sharp on retina screens
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * ratio;
  canvas.height = h * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  // More screen space = more dots, but never too many (keeps it fast)
  const count = Math.min(90, Math.floor((w * h) / 14000));
  dots = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.6 + 0.8,
  }));
}

function drawNetwork() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);

  for (const d of dots) {
    // Move, and bounce off the edges
    d.x += d.vx;
    d.y += d.vy;
    if (d.x < 0 || d.x > w) d.vx *= -1;
    if (d.y < 0 || d.y > h) d.vy *= -1;

    // Dots very close to the mouse get gently pushed away, so it parts the network
    const mdx = d.x - mouse.x;
    const mdy = d.y - mouse.y;
    const mDist = Math.hypot(mdx, mdy);
    if (mDist < 90) {
      d.x += (mdx / mDist) * 1.5;
      d.y += (mdy / mDist) * 1.5;
    }
  }

  // Lines between close dots. Closer = brighter.
  ctx.lineWidth = 1;
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
      if (dist < LINK_DISTANCE) {
        ctx.globalAlpha = (1 - dist / LINK_DISTANCE) * 0.35;
        ctx.strokeStyle = purple;
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(dots[j].x, dots[j].y);
        ctx.stroke();
      }
    }
    // Lines from dots to the mouse
    const mDist = Math.hypot(mouse.x - dots[i].x, mouse.y - dots[i].y);
    if (mDist < MOUSE_DISTANCE) {
      ctx.globalAlpha = (1 - mDist / MOUSE_DISTANCE) * 0.6;
      ctx.strokeStyle = blue;
      ctx.beginPath();
      ctx.moveTo(dots[i].x, dots[i].y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    }
  }

  // The dots: a faint big circle (the glow) with a bright small one on top
  ctx.fillStyle = blue;
  for (const d of dots) {
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function animateNetwork() {
  if (heroOnScreen) drawNetwork();  // no point drawing when you've scrolled past
  requestAnimationFrame(animateNetwork);
}

// Mouse position relative to the canvas
hero.addEventListener("mousemove", (e) => {
  const box = canvas.getBoundingClientRect();
  mouse.x = e.clientX - box.left;
  mouse.y = e.clientY - box.top;
});
hero.addEventListener("mouseleave", () => {
  mouse.x = -9999;
  mouse.y = -9999;
});

if ("IntersectionObserver" in window) {
  new IntersectionObserver((entries) => {
    heroOnScreen = entries[0].isIntersecting;
  }).observe(hero);
}

window.addEventListener("resize", sizeCanvas);
sizeCanvas();
if (reduceMotion) drawNetwork();  // one still picture, no movement
else animateNetwork();

// ---------- 12. "Ask about Saqib" chat ----------
// A list of questions the assistant knows. Each has keywords to match what
// the visitor types, an answer, and a "source" (the part of the site it came from).
// Later, the RAG engine will replace this list and answer anything.
const knowledge = [
  {
    chip: "What has he built?",
    keywords: ["built", "build", "project", "projects", "made", "vault", "portfolio", "work on"],
    answer: "Saqib has built a Secure File Vault API in Python and FastAPI. It encrypts every file with AES-256 and uses a login system he wrote himself. He's now building a RAG AI assistant from scratch, with his own text chunking, embeddings and vector search.",
    source: "Projects",
  },
  {
    chip: "What are his skills?",
    keywords: ["skill", "skills", "language", "languages", "tech", "stack", "python", "sql", "fastapi", "know", "good at"],
    answer: "His main tools are Python, SQL, FastAPI, SQLAlchemy and Git, plus HTML, CSS and JavaScript (he built this site by hand). He's strongest on the backend, meaning APIs, databases and security, and he's growing into AI.",
    source: "Skills",
  },
  {
    chip: "Any leadership experience?",
    keywords: ["lead", "leader", "leadership", "experience", "mka", "secretary", "charity", "raise", "money", "fundraising", "campaign", "ford", "work experience", "internship", "cyber", "security"],
    answer: "Yes. As MKA Regional General Secretary he makes sure regional reports are on time and accurate, and leads regional meetings. He led a Salvation Army partnership that raised over £6,000, and was part of a campaign that raised over £15,000 in under a month for a water well in Ghana. He's also done a cyber security internship at London Success Academy and work experience as a Parts Advisor at Ford.",
    source: "Experience",
  },
  {
    chip: "Where does he study?",
    keywords: ["study", "university", "uni", "greenwich", "degree", "grades", "student", "education", "first"],
    answer: "He studies Computer Science at the University of Greenwich. He finished his first year with a first-class 74% average, including 83% in Principles of Software Engineering.",
    source: "About",
  },
  {
    chip: "Is he open to work?",
    keywords: ["hire", "hiring", "open", "available", "internship", "placement", "job", "contact", "email", "reach"],
    answer: "Yes! He's looking for internships and placements. The quickest way to reach him is the Contact section at the bottom, where you can copy his email or open his LinkedIn.",
    source: "Contact",
  },
  {
    chip: "How do you work?",
    keywords: ["rag", "how do you", "how does this", "you work", "chatbot", "bot", "who are you", "what are you"],
    answer: "Right now I'm a preview with pre-written answers. Soon I'll run on the RAG engine Saqib is building. It splits his documents into chunks, turns them into embeddings, finds the closest ones with his own vector search, and has an AI write the answer with sources.",
    source: "RAG engine",
  },
];

const chatMessages = document.getElementById("chat-messages");
const chatChips = document.getElementById("chat-chips");
const chatForm = document.getElementById("chat-form");
const chatText = document.getElementById("chat-text");
let chatBusy = false;

function addMessage(text, who) {
  const msg = document.createElement("div");
  msg.className = "msg msg-" + who;
  msg.textContent = text;  // textContent (not innerHTML) so typed text can't break the page
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msg;
}

// Does the question contain this keyword as a whole word (or the start of one)?
// e.g. "raise" matches "raised", but "ai" doesn't match inside "charity".
function hasKeyword(words, keyword) {
  if (keyword.includes(" ")) return (" " + words.join(" ") + " ").includes(" " + keyword + " ");
  return words.some((w) => w === keyword || (keyword.length >= 4 && w.startsWith(keyword)));
}

// Picks the answer whose keywords best match the question
function findAnswer(question) {
  const words = question.toLowerCase().match(/[a-z0-9]+/g) || [];
  let best = null;
  let bestScore = 0;
  for (const item of knowledge) {
    const score = item.keywords.filter((k) => hasKeyword(words, k)).length;
    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }
  return best;
}

function ask(question) {
  if (chatBusy || !question.trim()) return;
  chatBusy = true;
  addMessage(question, "user");

  // Show the "thinking" dots for a moment
  const typing = document.createElement("div");
  typing.className = "msg msg-bot typing";
  typing.innerHTML = "<span></span><span></span><span></span>";
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  const match = findAnswer(question);
  const answer = match
    ? match.answer
    : "Good question! I'm only a preview, so I can't answer that one yet. Try one of the suggestions below, or contact Saqib directly.";

  setTimeout(() => {
    typing.remove();
    const msg = addMessage("", "bot");
    // Type the answer out word by word
    const words = answer.split(" ");
    let i = 0;
    const timer = setInterval(() => {
      msg.textContent = words.slice(0, ++i).join(" ");
      chatMessages.scrollTop = chatMessages.scrollHeight;
      if (i === words.length) {
        clearInterval(timer);
        if (match) {
          const source = document.createElement("span");
          source.className = "msg-source";
          source.textContent = "📄 Source: " + match.source;
          msg.appendChild(document.createElement("br"));
          msg.appendChild(source);
        }
        chatBusy = false;
      }
    }, reduceMotion ? 0 : 35);
  }, 700);
}

// Make a button for each suggested question
knowledge.forEach((item) => {
  const chip = document.createElement("button");
  chip.className = "chip";
  chip.type = "button";
  chip.textContent = item.chip;
  chip.addEventListener("click", () => ask(item.chip));
  chatChips.appendChild(chip);
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();  // stops the page from reloading
  ask(chatText.value);
  chatText.value = "";
});

addMessage("Hi! 👋 I'm Saqib's assistant. Pick a question below or type your own.", "bot");

// ---------- 13. Hidden terminal ----------
// Opens with the ` key. Each command prints some lines.
const terminal = document.getElementById("terminal");
const terminalBody = document.getElementById("terminal-body");
const terminalOutput = document.getElementById("terminal-output");
const terminalForm = document.getElementById("terminal-form");
const terminalInput = document.getElementById("terminal-input");
const history = [];
let historyIndex = 0;

// print() takes pieces like ["text", "colour-class"] and adds one line
function print(...pieces) {
  const line = document.createElement("div");
  for (const [text, cls] of pieces) {
    const span = document.createElement("span");
    span.textContent = text;
    if (cls) span.className = cls;
    line.appendChild(span);
  }
  terminalOutput.appendChild(line);
}

const commands = {
  help() {
    print(["Available commands:", "t-yellow"]);
    [
      ["whoami", "who I am"],
      ["projects", "what I've built"],
      ["skills", "what I work with"],
      ["experience", "work and leadership"],
      ["contact", "how to reach me"],
      ["cv", "download my CV"],
      ["theme", "switch light / dark mode"],
      ["clear", "clear the screen"],
      ["exit", "close the terminal"],
    ].forEach(([cmd, info]) => print(["  " + cmd.padEnd(12), "t-accent"], [info, "t-muted"]));
    print(["  (there might be a secret one too...)", "t-muted"]);
  },
  whoami() {
    print(["Saqib", "t-yellow"], [" · CS student @ University of Greenwich"]);
    print(["First-class first year (74%). Backend + AI. Builds for real people, not just for marks."]);
  },
  projects() {
    print(["secure-file-vault-api/", "t-accent"], ["  Python, FastAPI, SQLAlchemy, AES-256, custom auth"]);
    print(["rag-engine/", "t-yellow"], ["            own chunking, embeddings + vector search ", ""], ["(in progress)", "t-muted"]);
  },
  skills() {
    print(["Python  SQL  FastAPI  SQLAlchemy  Git  HTML  CSS  JavaScript", "t-accent"]);
  },
  experience() {
    print(["MKA Regional General Secretary", "t-yellow"]);
    print(["  reporting + data quality, leads regional meetings"]);
    print(["  £6,000+ Salvation Army partnership · £15,000+ Ghana water well in under a month"]);
    print(["Cyber Security Intern, London Success Academy", "t-yellow"]);
    print(["  threat detection, risk analysis, incident response"]);
    print(["Parts Advisor, Ford (work experience)", "t-yellow"]);
    print(["  parts inventory: matched physical stock to the IT system"]);
  },
  contact() {
    print(["email     ", "t-muted"], [copyButton.dataset.email]);
    print(["github    ", "t-muted"], ["github.com/saq564"]);
    print(["linkedin  ", "t-muted"], ["linkedin.com/in/saqib-ahmed-7564972b5"]);
  },
  cv() {
    print(["Downloading Saqib-CV.pdf...", "t-accent"]);
    const link = document.createElement("a");
    link.href = "assets/Saqib-CV.pdf";
    link.download = "";
    link.click();
  },
  theme() {
    document.getElementById("theme-toggle").click();
    print(["Theme switched to " + document.documentElement.dataset.theme + ".", "t-accent"]);
  },
  clear() {
    terminalOutput.textContent = "";
  },
  exit() {
    closeTerminal();
  },
  ls() {
    print(["about.txt  projects/  skills.txt  experience.txt  contact.txt", "t-accent"]);
  },
  "sudo hire-saqib"() {
    print(["[sudo] checking candidate...", "t-muted"]);
    print(["✓ builds real projects", "t-accent"]);
    print(["✓ first-class grades", "t-accent"]);
    print(["✓ led campaigns that raised £21,000+", "t-accent"]);
    print(["Access granted. Taking you to the contact section...", "t-yellow"]);
    setTimeout(() => {
      closeTerminal();
      document.getElementById("contact").scrollIntoView();
    }, 2200);
  },
};
commands.sudo = () => print(["Nice try. Did you mean ", "t-muted"], ["sudo hire-saqib", "t-accent"], ["?", "t-muted"]);

function openTerminal() {
  terminal.hidden = false;
  if (!terminalOutput.hasChildNodes()) {
    print(["Welcome to Saqib's terminal. You found the secret! 🎉", "t-yellow"]);
    print(["Type ", "t-muted"], ["help", "t-accent"], [" to see what you can do.", "t-muted"]);
  }
  terminalInput.focus();
}

function closeTerminal() {
  terminal.hidden = true;
}

terminalForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = terminalInput.value.trim();
  terminalInput.value = "";
  print(["saqib@portfolio:~$ ", "t-prompt"], [input]);
  if (input) {
    history.push(input);
    historyIndex = history.length;
    const command = commands[input.toLowerCase()];
    if (command) command();
    else print(["command not found: " + input + ". Type ", "t-error"], ["help", "t-accent"]);
  }
  terminalBody.scrollTop = terminalBody.scrollHeight;
});

terminalInput.addEventListener("keydown", (e) => {
  // Up and down arrows go through past commands, like a real terminal
  if (e.key === "ArrowUp" && historyIndex > 0) {
    terminalInput.value = history[--historyIndex];
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    historyIndex = Math.min(historyIndex + 1, history.length);
    terminalInput.value = history[historyIndex] || "";
    e.preventDefault();
  }
});

document.addEventListener("keydown", (e) => {
  const typingSomewhere = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
  if (e.key === "`" && (!typingSomewhere || document.activeElement === terminalInput)) {
    e.preventDefault();
    terminal.hidden ? openTerminal() : closeTerminal();
  } else if (e.key === "Escape" && !terminal.hidden) {
    closeTerminal();
  }
});

document.getElementById("terminal-hint").addEventListener("click", openTerminal);
document.getElementById("terminal-close").addEventListener("click", closeTerminal);
terminalBody.addEventListener("click", () => terminalInput.focus());
// Clicking the dark area outside the terminal closes it
terminal.addEventListener("click", (e) => {
  if (e.target === terminal) closeTerminal();
});

// ---------- 14. Glowing cursor and magnetic buttons ----------
// Only on computers with a real mouse, and not for people who turned off animations.
if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  let mouseX = 0, mouseY = 0;  // where the mouse is
  let ringX = 0, ringY = 0;    // where the ring is (it follows a little behind)

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    document.body.classList.add("has-cursor");
  });
  document.addEventListener("mouseleave", () => document.body.classList.remove("has-cursor"));

  // Each frame, move the ring 15% of the way to the mouse, which makes it trail smoothly
  (function followMouse() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(followMouse);
  })();

  // Grow the ring over anything you can click
  document.addEventListener("mouseover", (e) => {
    const clickable = e.target.closest("a, button, input, .card");
    document.body.classList.toggle("cursor-hover", Boolean(clickable));
  });

  // Magnetic buttons: they lean towards the mouse when it's over them
  document.querySelectorAll(".btn, .icon-btn, .chat-input button").forEach((btn) => {
    btn.classList.add("magnetic");
    btn.addEventListener("mousemove", (e) => {
      const box = btn.getBoundingClientRect();
      const x = e.clientX - (box.left + box.width / 2);
      const y = e.clientY - (box.top + box.height / 2);
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}

// ---------- 15. Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();

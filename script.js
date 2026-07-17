/* ============================================================
   Icons (inline SVG, feather-style — no external icon dependency)
   ============================================================ */
const ICONS = {
  mail: '<svg class="icon" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>',
  phone: '<svg class="icon" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z"/></svg>',
  linkedin: '<svg class="icon" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
  github: '<svg class="icon" viewBox="0 0 24 24"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>',
  arrowUpRight: '<svg class="icon" viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  copy: '<svg class="icon" viewBox="0 0 24 24" style="width:15px;height:15px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
};

const ROLES = [
  "AI Engineer",
  "GenAI & RAG Builder",
  "Agentic Workflow Designer",
  "LLM Application Engineer",
];

let DATA = null;

/* ============================================================
   Boot
   ============================================================ */
init();

async function init() {
  setupTheme();
  setupMobileNav();
  setupScrollSpy();
  setupBackToTop();

  try {
    const res = await fetch("data.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    DATA = await res.json();
  } catch (err) {
    renderFetchError(err);
    return;
  }

  renderHero(DATA);
  renderAbout(DATA);
  renderExperience(DATA);
  renderProjects(DATA);
  renderSkills(DATA);
  renderEducation(DATA);
  renderContact(DATA);
  setupFooter(DATA);
  setupTerminal(DATA);

  setupTypewriter(ROLES);
  setupRevealObserver();
}

function renderFetchError(err) {
  const el = document.getElementById("hero-tagline");
  if (el) {
    el.textContent =
      "Couldn't load data.json (this page needs to be served over http, not opened directly as a file — run a local server, e.g. `python -m http.server`, then open localhost).";
  }
  console.error("Failed to load data.json:", err);
}

/* ============================================================
   Date helpers
   ============================================================ */
const MONTHS = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

function parseDate(str) {
  if (!str) return null;
  if (str.trim().toLowerCase() === "present") return new Date();
  const parts = str.trim().split(/\s+/);
  if (parts.length === 2 && MONTHS[parts[0].toLowerCase()] !== undefined) {
    return new Date(parseInt(parts[1], 10), MONTHS[parts[0].toLowerCase()], 1);
  }
  const year = parseInt(parts[parts.length - 1], 10);
  if (!isNaN(year)) return new Date(year, 0, 1);
  return null;
}

function monthsBetween(a, b) {
  if (!a || !b) return 0;
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}

/* ============================================================
   Hero
   ============================================================ */
function renderHero(data) {
  const pi = data.personal_information;
  document.title = `${pi.name} — AI Engineer`;
  document.getElementById("hero-name").textContent = pi.name;
  document.getElementById("brand-name").textContent = pi.name.split(" ")[0].toLowerCase() + ".dev";
  document.getElementById("footer-text").textContent = `© ${new Date().getFullYear()} ${pi.name}`;

  const tagline = data.professional_summary.split(". ").slice(0, 1).join(". ");
  document.getElementById("hero-tagline").textContent = tagline.endsWith(".") ? tagline : tagline + ".";

  const socials = document.getElementById("hero-socials");
  socials.innerHTML = [
    linkTag(`mailto:${pi.email}`, ICONS.mail, "Email"),
    linkTag(pi.linkedin.url, ICONS.linkedin, "LinkedIn"),
    linkTag(pi.github.url, ICONS.github, "GitHub"),
  ].join("");
}

function linkTag(href, icon, label) {
  const external = href.startsWith("http");
  return `<a href="${href}" aria-label="${label}" ${external ? 'target="_blank" rel="noopener"' : ""}>${icon}</a>`;
}

function setupTypewriter(roles) {
  const el = document.getElementById("typewriter");
  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function tick() {
    const current = roles[roleIdx];
    if (!deleting) {
      charIdx++;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, 1500);
        return;
      }
    } else {
      charIdx--;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
      }
    }
    setTimeout(tick, deleting ? 35 : 65);
  }
  tick();
}

/* ============================================================
   About / stats
   ============================================================ */
function renderAbout(data) {
  document.getElementById("summary-text").textContent = data.professional_summary;

  const totalMonths = data.experience.reduce((sum, exp) => {
    return sum + monthsBetween(parseDate(exp.duration.start), parseDate(exp.duration.end));
  }, 0);
  const years = (totalMonths / 12).toFixed(1).replace(/\.0$/, "");

  const companies = new Set(data.experience.map((e) => e.company)).size;
  const skillDomains = Object.keys(data.skills).length;
  const certs = (data.certifications || []).length;

  const stats = [
    { num: `${years}+`, label: "Years Experience" },
    { num: companies, label: "Companies" },
    { num: skillDomains, label: "Skill Domains" },
    { num: certs || (data.projects || []).length, label: certs ? "Certifications" : "Projects Shipped" },
  ];

  document.getElementById("stat-grid").innerHTML = stats
    .map((s) => `<div class="stat-card"><div class="num">${s.num}</div><div class="label">${s.label}</div></div>`)
    .join("");
}

/* ============================================================
   Experience
   ============================================================ */
function renderExperience(data) {
  const html = data.experience
    .map((exp, i) => {
      const isCurrent = exp.duration.end.trim().toLowerCase() === "present";
      return `
        <div class="timeline-item reveal ${isCurrent ? "current" : ""}" style="transition-delay:${i * 60}ms">
          <div class="timeline-card">
            <div class="timeline-top">
              <h3>${exp.designation}${isCurrent ? '<span class="badge-current">current</span>' : ""}</h3>
              <span class="duration">${exp.duration.start} — ${exp.duration.end}</span>
            </div>
            <div class="timeline-org">
              <span>${exp.company}</span>
              <span>${exp.location}</span>
            </div>
            <ul class="timeline-list">
              ${exp.responsibilities.map((r) => `<li>${r}</li>`).join("")}
            </ul>
          </div>
        </div>`;
    })
    .join("");
  document.getElementById("timeline").innerHTML = html;
}

/* ============================================================
   Projects
   ============================================================ */
function renderProjects(data) {
  const projects = data.projects || [];
  if (!projects.length) {
    document.getElementById("projects").style.display = "none";
    return;
  }

  const html = projects
    .map(
      (p, i) => `
      <div class="project-card reveal" style="transition-delay:${i * 80}ms">
        <div class="project-top">
          <h3>${p.name}</h3>
          ${
            p.github && p.github.url
              ? `<a class="project-link" href="${p.github.url}" target="_blank" rel="noopener" aria-label="View ${p.name} on GitHub">${ICONS.arrowUpRight}</a>`
              : ""
          }
        </div>
        <div class="tech-pills">
          ${(p.technologies || []).map((t) => `<span class="pill">${t}</span>`).join("")}
        </div>
        <div class="project-desc">
          ${p.description.map((d) => `<p>${d}</p>`).join("")}
        </div>
      </div>`
    )
    .join("");
  document.getElementById("project-grid").innerHTML = html;
}

/* ============================================================
   Skills
   ============================================================ */
function renderSkills(data) {
  const html = Object.entries(data.skills)
    .map(
      ([category, items], i) => `
      <div class="skill-group reveal" style="transition-delay:${i * 50}ms">
        <h3>${category}</h3>
        <div class="tech-pills">${items.map((s) => `<span class="pill">${s}</span>`).join("")}</div>
      </div>`
    )
    .join("");
  document.getElementById("skills-grid").innerHTML = html;
}

/* ============================================================
   Education & certifications
   ============================================================ */
function renderEducation(data) {
  const html = data.education
    .map(
      (edu) => `
      <div class="edu-card reveal">
        <div>
          <h3>${edu.institution}</h3>
          <p class="meta">${edu.degree} · CGPA ${edu.cgpa}</p>
        </div>
        <div class="side">
          <div>${edu.location}</div>
          <div>${edu.duration.start} – ${edu.duration.end}</div>
        </div>
      </div>`
    )
    .join("");
  document.getElementById("edu-container").innerHTML = html;

  const certs = data.certifications || [];
  document.getElementById("cert-row").innerHTML = certs
    .map((c) => `<div class="cert-chip reveal"><span class="medal">🎖</span>${c}</div>`)
    .join("");
}

/* ============================================================
   Contact
   ============================================================ */
function renderContact(data) {
  const pi = data.personal_information;
  const methods = [
    { icon: ICONS.mail, label: pi.email, action: () => copyToClipboard(pi.email, "Email copied to clipboard") },
    { icon: ICONS.phone, label: pi.phone, href: `tel:${pi.phone.replace(/[^+\d]/g, "")}` },
    { icon: ICONS.linkedin, label: "LinkedIn", href: pi.linkedin.url, external: true },
    { icon: ICONS.github, label: "GitHub", href: pi.github.url, external: true },
  ];

  const container = document.getElementById("contact-methods");
  container.innerHTML = methods
    .map((m, i) => {
      if (m.href) {
        return `<a class="contact-chip" href="${m.href}" ${m.external ? 'target="_blank" rel="noopener"' : ""} data-idx="${i}">${m.icon}${m.label}</a>`;
      }
      return `<button type="button" class="contact-chip" data-idx="${i}">${m.icon}${m.label}${ICONS.copy}</button>`;
    })
    .join("");

  container.querySelectorAll("[data-idx]").forEach((el) => {
    const idx = Number(el.dataset.idx);
    const m = methods[idx];
    if (m.action) el.addEventListener("click", m.action);
  });
}

function copyToClipboard(text, message) {
  navigator.clipboard?.writeText(text).then(() => showToast(message));
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

function setupFooter(data) {
  document.getElementById("footer-text").textContent = `© ${new Date().getFullYear()} ${data.personal_information.name}`;
}

/* ============================================================
   Theme toggle
   ============================================================ */
function setupTheme() {
  const root = document.documentElement;
  const stored = localStorage.getItem("theme");
  if (stored) root.setAttribute("data-theme", stored);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const current =
      root.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
}

/* ============================================================
   Mobile nav
   ============================================================ */
function setupMobileNav() {
  const burger = document.getElementById("nav-burger");
  const links = document.getElementById("nav-links");
  burger.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );
}

/* ============================================================
   Scroll spy
   ============================================================ */
function setupScrollSpy() {
  const sections = ["about", "experience", "projects", "skills", "education", "terminal", "contact"];
  const links = document.querySelectorAll(".nav-links a");

  const spy = () => {
    let activeId = null;
    for (const id of sections) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= 140 && rect.bottom >= 140) {
        activeId = id;
        break;
      }
    }
    links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${activeId}`));
  };

  window.addEventListener("scroll", spy, { passive: true });
  spy();
}

/* ============================================================
   Back to top
   ============================================================ */
function setupBackToTop() {
  // handled purely via anchor link + CSS smooth scroll; nothing extra needed.
}

/* ============================================================
   Scroll reveal
   ============================================================ */
function setupRevealObserver() {
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => io.observe(el));
}

/* ============================================================
   Terminal easter egg
   ============================================================ */
function setupTerminal(data) {
  const body = document.getElementById("terminal-body");
  const input = document.getElementById("terminal-input");
  const chips = document.querySelectorAll(".terminal-chips button");

  function print(html, cls = "out") {
    const p = document.createElement("p");
    p.className = `line ${cls}`;
    p.innerHTML = html;
    body.appendChild(p);
    body.scrollTop = body.scrollHeight;
  }

  function printPrompt(cmd) {
    const p = document.createElement("p");
    p.className = "line prompt-line";
    p.innerHTML = `<span class="prompt-sym">❯</span><span>${escapeHtml(cmd)}</span>`;
    body.appendChild(p);
    body.scrollTop = body.scrollHeight;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  const pi = data.personal_information;

  const COMMANDS = {
    help: () =>
      print(
        "Available commands: whoami, about, skills, experience, projects, education, contact, sudo hire-me, clear"
      ),
    whoami: () => print(`${pi.name} — AI Engineer. ${data.professional_summary}`),
    about: () => print(data.professional_summary),
    skills: () =>
      Object.entries(data.skills).forEach(([cat, items]) => print(`<b>${cat}:</b> ${items.join(", ")}`)),
    experience: () =>
      data.experience.forEach((e) =>
        print(`${e.designation} @ ${e.company} <span class="hint">(${e.duration.start} – ${e.duration.end})</span>`)
      ),
    projects: () =>
      (data.projects || []).forEach((p) => print(`${p.name} — ${p.technologies.join(", ")}`)),
    education: () =>
      data.education.forEach((e) => print(`${e.degree}, ${e.institution} (CGPA ${e.cgpa})`)),
    contact: () =>
      print(`Email: ${pi.email} &nbsp;|&nbsp; Phone: ${pi.phone} &nbsp;|&nbsp; LinkedIn: ${pi.linkedin.url}`),
    "sudo hire-me": () => {
      print("Permission granted. Opening your email client…", "out");
      setTimeout(() => (window.location.href = `mailto:${pi.email}?subject=Let's talk`), 700);
    },
    clear: () => {
      body.innerHTML = "";
    },
  };

  function run(raw) {
    const cmd = raw.trim();
    if (!cmd) return;
    printPrompt(cmd);
    const key = cmd.toLowerCase();
    if (COMMANDS[key]) {
      COMMANDS[key]();
    } else {
      print(`command not found: ${escapeHtml(cmd)}. Type <b>help</b> for options.`, "hint");
    }
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      run(input.value);
      input.value = "";
    }
  });

  chips.forEach((btn) => btn.addEventListener("click", () => run(btn.dataset.cmd)));
}

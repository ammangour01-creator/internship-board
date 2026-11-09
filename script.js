const searchInput = document.getElementById("search");
const domainSelect = document.getElementById("domain");
const resetBtn = document.getElementById("reset");
const resultsEl = document.getElementById("results");
const statusEl = document.getElementById("status");

let internships = [];

// Reusable card builder
function createCard(item) {
  const li = document.createElement("li");
  li.className = "card";

  const h3 = document.createElement("h3");
  h3.textContent = item.title;

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `${item.domain} · ${item.mode} · ${item.location}`;

  const skills = document.createElement("ul");
  skills.className = "tags";
  skills.setAttribute("aria-label", "Skills");
  item.skills.forEach((skill) => {
    const tag = document.createElement("li");
    tag.className = "tag";
    tag.textContent = skill;
    skills.appendChild(tag);
  });

  const openings = document.createElement("p");
  openings.className = "openings";
  openings.textContent = `${item.openings} opening${item.openings === 1 ? "" : "s"} · ${item.id}`;

  li.append(h3, meta, skills, openings);
  return li;
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function render(list) {
  resultsEl.innerHTML = "";
  if (list.length === 0) {
    setStatus("No internships found. Try another search or domain.");
    return;
  }
  const frag = document.createDocumentFragment();
  list.forEach((item) => frag.appendChild(createCard(item)));
  resultsEl.appendChild(frag);
  setStatus(`${list.length} internship${list.length === 1 ? "" : "s"} found.`);
}

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const domain = domainSelect.value;

  const filtered = internships.filter((i) => {
    const text = [i.title, i.domain, i.location, i.mode, i.id, ...i.skills]
      .join(" ")
      .toLowerCase();
    const matchesText = !q || text.includes(q);
    const matchesDomain = domain === "all" || i.domain === domain;
    return matchesText && matchesDomain;
  });

  render(filtered);
}

function fillDomains() {
  const domains = [...new Set(internships.map((i) => i.domain))].sort();
  domains.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    domainSelect.appendChild(opt);
  });
}

async function init() {
  setStatus("Loading internships...");
  try {
    const res = await fetch("internships.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const raw = Array.isArray(data) ? data : data.internships || [];
    internships = raw.map((i) => ({
      id: i.id || "",
      title: i.title || "Untitled internship",
      domain: i.domain || "Other",
      mode: i.mode || "",
      location: i.location || "",
      skills: Array.isArray(i.skills) ? i.skills : [],
      openings: Number(i.openings) || 0,
    }));
    fillDomains();
    applyFilters();
  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = "";
    setStatus("Could not load internships. Please refresh the page.", true);
  }
}

searchInput.addEventListener("input", applyFilters);
domainSelect.addEventListener("change", applyFilters);
resetBtn.addEventListener("click", () => {
  searchInput.value = "";
  domainSelect.value = "all";
  applyFilters();
  searchInput.focus();
});

init();
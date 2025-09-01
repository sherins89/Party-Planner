// === Config ===
const BASE_URL = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2506-CT-WEB-PT";
const RESOURCE = "/events";
const API = `${BASE_URL}${COHORT}${RESOURCE}`;
console.log(API);

// === State ===
let parties = []; // Array<{ id, name, date, description, location, ... }>
let selectedParty = null; // Full party object or null
let loading = false; // Show loading states if you want
let errorMessage = ""; // Capture & show errors

// === Utilities ===
const app = document.getElementById("app");

// Date formatter //
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  // date -  if invalid //
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString();
}

/** Safely set state + rerender */
function setState(partial) {
  Object.assign({ parties, selectedParty, loading, errorMessage }, partial);
  // Update actual refs (Object.assign above uses copies)
  if ("parties" in partial) parties = partial.parties;
  if ("selectedParty" in partial) selectedParty = partial.selectedParty;
  if ("loading" in partial) loading = partial.loading;
  if ("errorMessage" in partial) errorMessage = partial.errorMessage;
  render();
}

// === Data Fetching (with try/catch for explicit error handling) ===
async function getParties() {
  try {
    setState({ loading: true, errorMessage: "" });
    const res = await fetch(API);
    if (!res.ok) throw new Error(`Failed to fetch parties (${res.status})`);
    const data = await res.json();
    // FSA CRUD shape: { data: [ ... ] }
    if (!data || !Array.isArray(data.data)) {
      throw new Error("Unexpected response format for parties.");
    }
    setState({ parties: data.data, loading: false });
  } catch (err) {
    setState({
      loading: false,
      errorMessage: err.message || "Unknown error loading parties.",
    });
  }
}

async function getParty(id) {
  try {
    setState({ loading: true, errorMessage: "" });
    const res = await fetch(`${API}/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch party (${res.status})`);
    const data = await res.json();
    if (!data || !data.data) {
      throw new Error("Unexpected response format for party.");
    }
    setState({ selectedParty: data.data, loading: false });
  } catch (err) {
    setState({
      loading: false,
      errorMessage: err.message || "Unknown error loading party.",
    });
  }
}

// === html Components === //
function Header() {
  const $h1 = document.createElement("h1");
  $h1.textContent = "Party Planner";
  return $h1;
}

function ErrorBanner() {
  if (!errorMessage) return document.createDocumentFragment();
  const $div = document.createElement("div");
  $div.style.padding = "8px";
  $div.style.margin = "8px 0";
  $div.style.border = "1px solid #cc0000";
  $div.style.background = "#ffecec";
  $div.style.color = "#990000";
  $div.textContent = errorMessage;
  return $div;
}

function Loading() {
  if (!loading) return document.createDocumentFragment();
  const $p = document.createElement("p");
  $p.textContent = "Loading…";
  $p.setAttribute("aria-busy", "true");
  return $p;
}

function PartyListItem(party) {
  const $li = document.createElement("li");
  const $btn = document.createElement("button");
  $btn.type = "button";
  $btn.textContent = party.name || `(Untitled: ${party.id})`;
  $btn.style.cursor = "pointer";
  $btn.style.padding = "6px 10px";
  $btn.style.margin = "2px 0";
  $btn.addEventListener("click", () => {
    getParty(party.id);
  });
  $li.appendChild($btn);
  return $li;
}

function PartyList() {
  const $section = document.createElement("section");
  const $h2 = document.createElement("h2");
  $h2.textContent = "Upcoming Parties";
  const $ul = document.createElement("ul");
  $ul.style.listStyle = "none";
  $ul.style.padding = "0";

  for (const p of parties) {
    $ul.appendChild(PartyListItem(p));
  }

  $section.append($h2, $ul);
  return $section;
}

function SelectPrompt() {
  if (selectedParty) return document.createDocumentFragment();
  const $p = document.createElement("p");
  $p.textContent = "Select a party to see the details.";
  $p.style.fontStyle = "italic";
  return $p;
}

function PartyDetails() {
  const $section = document.createElement("section");
  const $h2 = document.createElement("h2");
  $h2.textContent = "Details";
  $section.appendChild($h2);

  if (!selectedParty) {
    $section.appendChild(SelectPrompt());
    return $section;
  }

  const p = selectedParty;
  const $dl = document.createElement("dl");

  function row(label, value) {
    const $frag = document.createDocumentFragment();
    const $dt = document.createElement("dt");
    $dt.style.fontWeight = "bold";
    $dt.textContent = label;
    const $dd = document.createElement("dd");
    $dd.style.margin = "0 0 8px 0";
    $dd.textContent = value ?? "";
    $frag.append($dt, $dd);
    return $frag;
  }

  $dl.append(
    row("Name", p.name || ""),
    row("ID", String(p.id)),
    row("Date", formatDate(p.date)),
    row("Description", p.description || ""),
    row("Location", p.location || "")
  );

  $section.appendChild($dl);
  return $section;
}

// === Layout (simple 2-column) ===
function MainLayout() {
  const $main = document.createElement("main");
  $main.style.display = "grid";
  $main.style.gridTemplateColumns = "1fr 2fr";
  $main.style.gap = "16px";
  $main.append(PartyList(), PartyDetails());
  return $main;
}

// === Render ===
function render() {
  app.innerHTML = ""; // rerender on every state change

  const $container = document.createElement("div");
  $container.style.maxWidth = "900px";
  $container.style.margin = "24px auto";
  $container.style.fontFamily =
    "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";

  $container.append(Header(), ErrorBanner(), Loading(), MainLayout());
  app.appendChild($container);
}

// === Init ===
render();
getParties();

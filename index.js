const BASE_URL = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2506-CT-WEB-PT";
const RESOURCE = "/events";
const API = `${BASE_URL}${COHORT}${RESOURCE}`;
console.log(API);

// API state //
let parties = []; // Array as per cohort api <{ id, name, date, description, location }>
let selectedParty = null; // Null object //

const app = document.getElementById("app");

// Date formatter // Required for Party planner admin //

// Date formatter //
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString();
}

function setState(partial) {
  if ("parties" in partial) parties = partial.parties;
  if ("selectedParty" in partial) selectedParty = partial.selectedParty;
  render();
}

// Get Data //
async function getParties() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`Failed to fetch parties (${res.status})`);
    const json = await res.json();
    if (!json || !Array.isArray(json.data)) {
      throw new Error("Unexpected response format for parties.");
    }
    setState({ parties: json.data });
  } catch (err) {
    console.error("Error loading parties:", err);
    alert(err?.message || "Error loading parties.");
  }
}

async function getParty(id) {
  try {
    const res = await fetch(`${API}/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch party (${res.status})`);
    const json = await res.json();
    if (!json || !json.data) {
      throw new Error("Unexpected response format for party.");
    }
    setState({ selectedParty: json.data });
  } catch (err) {
    console.error("Error loading party:", err);
    alert(err?.message || "Error loading party.");
  }
}

// HTML Component //
function Header() {
  const $h1 = document.createElement("h1");
  $h1.textContent = "Party Planner";
  return $h1;
}

function PartyListItem(party) {
  const $li = document.createElement("li");
  const $btn = document.createElement("button");
  $btn.type = "button";
  $btn.textContent = party.name || `(Untitled: ${party.id})`;
  $btn.style.cursor = "pointer";
  $btn.style.padding = "6px 10px";
  $btn.style.margin = "2px 0";
  $btn.addEventListener("click", () => getParty(party.id));
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

  if (!parties.length) {
    const $p = document.createElement("p");
    $p.textContent = "No parties found.";
    $section.append($h2, $p);
    return $section;
  }

  for (const p of parties) $ul.appendChild(PartyListItem(p));
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

  const row = (label, value) => {
    const $frag = document.createDocumentFragment();
    const $dt = document.createElement("dt");
    $dt.style.fontWeight = "bold";
    $dt.textContent = label;
    const $dd = document.createElement("dd");
    $dd.style.margin = "0 0 8px 0";
    $dd.textContent = value ?? "";
    $frag.append($dt, $dd);
    return $frag;
  };

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

// Layout - Render //
function MainLayout() {
  const $main = document.createElement("main");
  $main.style.display = "grid";
  $main.style.gridTemplateColumns = "1fr 2fr";
  $main.style.gap = "16px";
  $main.append(PartyList(), PartyDetails());
  return $main;
}

function render() {
  app.innerHTML = "";
  const $container = document.createElement("div");
  $container.style.maxWidth = "900px";
  $container.style.margin = "24px auto";
  $container.style.fontFamily =
    "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";

  $container.append(Header(), MainLayout());
  app.appendChild($container);
}

//  Render //
render();
getParties();

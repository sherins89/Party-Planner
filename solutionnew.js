// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2506-FTB-CT-WEB-PT";
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

// === Data Fetching ===
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error("Error loading parties:", e);
  }
}

async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error("Error loading party:", e);
  }
}

async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error("Error loading RSVPs:", e);
  }
}

async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error("Error loading guests:", e);
  }
}

// === Components ===
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `<a href="#selected">${party.name}</a>`;
  $li.addEventListener("click", () => getParty(party.id));

  return $li;
}

function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $items = parties.map(PartyListItem);
  $ul.replaceChildren(...$items);

  return $ul;
}

function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());

  return $party;
}

function GuestList() {
  const $ul = document.createElement("ul");

  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  const $items = guestsAtParty.map((guest) => {
    const $li = document.createElement("li");
    $li.textContent = guest.name;
    return $li;
  });

  $ul.replaceChildren(...$items);
  return $ul;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
}

// === Init ===
async function init() {
  await Promise.all([getParties(), getRsvps(), getGuests()]);
  render();
}

init();

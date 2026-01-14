let allPokemon = [],
  offset = 0,
  currentPokemonIndex = 0,
  pokemonCache = {};
const typeColors = {
  fire: "#F08030",
  grass: "#78C850",
  water: "#6890F0",
  bug: "#A8B820",
  normal: "#A8A878",
  poison: "#A040A0",
  electric: "#F8D030",
  ground: "#E0C068",
  fairy: "#EE99AC",
};

async function loadMorePokemon() {
  toggleLoading(true);
  const url = `https://pokeapi.co/api/v2/pokemon?limit=24&offset=${offset}`;
  try {
    const response = await fetch(url).then((res) => res.json());
    const newDetails = await Promise.all(
      response.results.map((p) => getPokemonData(p.url))
    );
    allPokemon.push(...newDetails);
    renderList(allPokemon);
    offset += 24;
  } catch (e) {
    console.error(e);
  }
  toggleLoading(false);
}

function toggleLoading(isLoading) {
  const btn = document.getElementById("load-btn");
  const screen = document.getElementById("loading-screen");
  btn.disabled = isLoading;
  if (isLoading) screen.classList.remove("d-none");
  else screen.classList.add("d-none");
}

async function getPokemonData(url) {
  if (pokemonCache[url]) return pokemonCache[url];
  const data = await fetch(url).then((res) => res.json());
  pokemonCache[url] = data;
  return data;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function renderList(list) {
  const container = document.getElementById("pokedex");
  container.innerHTML = list.map((p, i) => createSmallCardHTML(p, i)).join("");
}

function createSmallCardHTML(p, i) {
  const color = typeColors[p.types[0].type.name] || "#777";
  return `
    <div class="pokemon-card-small" style="background:${color}" onclick="openOverlay(${i})">
      <h3>${capitalize(p.name)}</h3>
      <div>${p.types
        .map((t) => `<span class="type">${t.type.name}</span>`)
        .join("")}</div>
      <img src="${p.sprites.other["official-artwork"].front_default}">
    </div>`;
}

async function openOverlay(i) {
  currentPokemonIndex = i;
  const p = allPokemon[i];
  if (!p.species_extra)
    p.species_extra = await fetch(p.species.url).then((r) => r.json());
  document.getElementById("body").classList.add("no-scroll");
  document.getElementById("overlay").classList.remove("d-none");
  updateDetailCard(p);
  showTab("about");
}

function updateDetailCard(p) {
  const color = typeColors[p.types[0].type.name] || "#777";
  document.getElementById("card-header").style.backgroundColor = color;
  document.getElementById("name").innerText = capitalize(p.name);
  document.getElementById("number").innerText = "#" + p.id;
  document.getElementById("detail-img").src =
    p.sprites.other["official-artwork"].front_default;
  document.getElementById("types-badges").innerHTML = p.types
    .map((t) => `<span class="type">${t.type.name}</span>`)
    .join("");
}

function showTab(tab) {
  const p = allPokemon[currentPokemonIndex];
  const content = document.getElementById("tab-content");
  content.innerHTML = tab === "about" ? getAboutHTML(p) : getStatsHTML(p);
}

function getAboutHTML(p) {
  const happiness = p.species_extra ? p.species_extra.base_happiness : "...";
  return `
    <div class="info-row"><span class="label">Height</span><span class="value">${
      p.height * 10
    } cm</span></div>
    <div class="info-row"><span class="label">Weight</span><span class="value">${
      p.weight / 10
    } kg</span></div>
    <div class="info-row"><span class="label">Happiness</span><span class="value">${happiness}</span></div>
    <div class="info-row"><span class="label">Abilities</span><span class="value">${p.abilities
      .map((a) => a.ability.name)
      .join(", ")}</span></div>`;
}

function getStatsHTML(p) {
  const color = typeColors[p.types[0].type.name] || "#777";
  return p.stats
    .map(
      (s) => `
    <div class="info-row">
      <span class="label" style="font-size:12px">${s.stat.name}</span>
      <span class="value">${s.base_stat}</span>
      <div class="bar-bg"><div class="bar-fill" style="width:${
        s.base_stat / 1.5
      }%; background:${color}"></div></div>
    </div>`
    )
    .join("");
}

function closeOverlay() {
  document.getElementById("overlay").classList.add("d-none");
  document.getElementById("body").classList.remove("no-scroll");
}

function navigate(step) {
  const len = allPokemon.length;
  currentPokemonIndex = (currentPokemonIndex + step + len) % len;
  openOverlay(currentPokemonIndex);
}

function searchPokemon() {
  const term = document.getElementById("search").value.toLowerCase();
  const filtered =
    term.length < 3
      ? allPokemon
      : allPokemon.filter((p) => p.name.includes(term));
  renderList(filtered);
}

loadMorePokemon();

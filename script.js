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
  psychic: "#F85888",
  rock: "#B8A038",
  ghost: "#705898",
  ice: "#98D8D8",
  dragon: "#7038F8",
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
  const screen = document.getElementById("loading-screen");
  if (isLoading) screen.classList.remove("d-none");
  else screen.classList.add("d-none");
}

async function getPokemonData(url) {
  if (pokemonCache[url]) return pokemonCache[url];
  const data = await fetch(url).then((res) => res.json());
  pokemonCache[url] = data;
  return data;
}

function renderList(list) {
  const container = document.getElementById("pokedex");
  container.innerHTML = list
    .map(
      (p, i) => `
        <div class="pokemon-card-small" style="background:${
          typeColors[p.types[0].type.name] || "#777"
        }" onclick="openOverlay(${allPokemon.indexOf(p)})">
            <h3>${p.name}</h3>
            <div>${p.types
              .map((t) => `<span class="type">${t.type.name}</span>`)
              .join("")}</div>
            <img src="${p.sprites.other["official-artwork"].front_default}">
        </div>`
    )
    .join("");
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

function closeOverlay() {
  document.getElementById("overlay").classList.add("d-none");
  document.getElementById("body").classList.remove("no-scroll");
}

function updateDetailCard(p) {
  const color = typeColors[p.types[0].type.name] || "#777";
  document.getElementById("card-header").style.backgroundColor = color;
  document.getElementById("name").innerText = p.name.toUpperCase();
  document.getElementById("number").innerText =
    "#" + String(p.id).padStart(3, "0");
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
    <div class="info-row" style="margin-bottom: 12px;"><span class="label" style="width: 100px;">Height</span><span class="value">${
      p.height * 10
    } cm</span></div>
    <div class="info-row" style="margin-bottom: 12px;"><span class="label" style="width: 100px;">Weight</span><span class="value">${
      p.weight / 10
    } kg</span></div>
    <div class="info-row" style="margin-bottom: 12px;"><span class="label" style="width: 100px;">Happiness</span><span class="value">${happiness}</span></div>
    <div class="info-row" style="margin-bottom: 12px;"><span class="label" style="width: 100px;">Abilities</span><span class="value" style="font-size: 13px;">${p.abilities
      .map((a) => a.ability.name)
      .join(", ")}</span></div>`;
}

function getStatsHTML(p) {
  const color = typeColors[p.types[0].type.name] || "#777";
  return p.stats
    .map(
      (s) => `
    <div class="info-row" style="margin-bottom: 10px;">
      <span class="label" style="width: 80px; font-size: 11px; text-transform: uppercase;">${
        s.stat.name
      }</span>
      <span class="value" style="width: 30px; text-align: right; margin-right: 15px; font-size: 13px;">${
        s.base_stat
      }</span>
      <div style="flex: 1; background: #eee; height: 6px; border-radius: 3px;">
        <div style="width: ${Math.min(
          (s.base_stat / 160) * 100,
          100
        )}%; height: 100%; background: ${color}; border-radius: 3px;"></div>
      </div>
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
  updateDetailCard(allPokemon[currentPokemonIndex]);
  showTab("about");
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

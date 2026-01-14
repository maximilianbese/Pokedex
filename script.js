const pokedex = document.getElementById("pokedex");
const modal = document.getElementById("pokemon-modal");
const modalName = document.getElementById("modal-name");
const modalEvolutions = document.getElementById("modal-evolutions");
const modalClose = document.getElementById("modal-close");
const searchInput = document.querySelector("header input");

const typeColors = {
  grass: "#78C850",
  poison: "#A040A0",
  fire: "#F08030",
  water: "#6890F0",
  bug: "#A8B820",
  normal: "#A8A878",
  electric: "#F8D030",
};

modalClose.onclick = () => (modal.style.display = "none");
window.onclick = (e) => e.target === modal && (modal.style.display = "none");

let allPokemon = []; // Alle Pokémon inkl. Farbe und Sprite speichern

// Lade alle Pokémon-Daten und bereite sie vor
async function loadPokemon() {
  const data = await fetch("api.json").then((res) => res.json());
  const promises = data.results.map(async (p) => {
    const poke = await fetch(p.url).then((r) => r.json());
    return {
      name: p.name,
      url: p.url,
      id: poke.id,
      type: poke.types[0].type.name,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${poke.id}.png`,
      stats: poke.stats,
      color: typeColors[poke.types[0].type.name] || "#f2f2f2",
    };
  });
  allPokemon = await Promise.all(promises);
  renderPokemon(allPokemon);
}

// Pokémon rendern (ohne async für stabile Reihenfolge)
function renderPokemon(pokemonList) {
  pokedex.innerHTML = "";
  pokemonList.forEach((p) => {
    const li = document.createElement("li");
    li.style.backgroundColor = p.color; // Farbe direkt aus gespeicherter Eigenschaft
    li.innerHTML = `
      <p>${p.name}</p>
      <img src="${p.sprite}" alt="${p.name}">
    `;
    li.onclick = () => showPokemonWithEvolution(p.url, p.name);
    pokedex.appendChild(li);
  });
}

// Live-Suche
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = allPokemon.filter((p) =>
    p.name.toLowerCase().includes(query)
  );
  renderPokemon(filtered);

  // Flex-Wrap entfernen, wenn etwas eingegeben wird
  if (query.length > 0) {
    pokedex.classList.add("no-wrap");
  } else {
    pokedex.classList.remove("no-wrap");
  }
});

// Modal + Evolutionen anzeigen
async function showPokemonWithEvolution(url, name) {
  modalName.textContent = name;
  modalEvolutions.innerHTML = "";

  const p = await fetch(url).then((r) => r.json());
  const s = await fetch(p.species.url).then((r) => r.json());
  const e = await fetch(s.evolution_chain.url).then((r) => r.json());

  const evolutions = [];
  (function parse(c) {
    evolutions.push(c.species.name);
    c.evolves_to.forEach(parse);
  })(e.chain);

  // Evolutionen anzeigen
  const promises = evolutions.map(async (n) => {
    const ev = await fetch(`https://pokeapi.co/api/v2/pokemon/${n}`).then((r) =>
      r.json()
    );
    return {
      name: n,
      id: ev.id,
      type: ev.types[0].type.name,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${ev.id}.png`,
      stats: ev.stats,
      color: typeColors[ev.types[0].type.name] || "#f2f2f2",
    };
  });

  const evoData = await Promise.all(promises);

  evoData.forEach((ev) => {
    const card = document.createElement("div");
    card.className = "evo-card";
    card.style.backgroundColor = ev.color;
    card.innerHTML = `
      <img src="${ev.sprite}" alt="${ev.name}">
      <p>${ev.name}</p>
      <ul class="evo-stats">
        ${ev.stats
          .map((st) => `<li>${st.stat.name}: ${st.base_stat}</li>`)
          .join("")}
      </ul>
    `;
    modalEvolutions.appendChild(card);
  });

  modal.style.display = "block";
}

// Starten
loadPokemon();

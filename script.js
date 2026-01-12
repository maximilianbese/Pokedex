fetch("api.json")
  .then((res) => res.json())
  .then((data) => {
    const pokedex = document.getElementById("pokedex");

    data.results.forEach((pokemon) => {
      const li = document.createElement("li");
      li.className = "pokemon-card";

      // Name
      const name = document.createElement("p");
      name.textContent = pokemon.name;
      li.appendChild(name);

      // ID aus URL
      const urlParts = pokemon.url.split("/");
      const id = urlParts[urlParts.length - 2];

      // Bild
      const img = document.createElement("img");
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
      img.alt = pokemon.name;
      li.appendChild(img);

      // Klick Event für Modal
      li.addEventListener("click", () =>
        showPokemonStats(pokemon.url, pokemon.name, id)
      );

      pokedex.appendChild(li);
    });
  })
  .catch((err) => console.error("Fehler beim Laden der Pokémon:", err));

// Modal-Funktion
const modal = document.getElementById("pokemon-modal");
const modalName = document.getElementById("modal-name");
const modalImg = document.getElementById("modal-img");
const modalTypes = document.getElementById("modal-types");
const modalStats = document.getElementById("modal-stats");
const modalClose = document.getElementById("modal-close");

modalClose.onclick = () => (modal.style.display = "none");
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

function showPokemonStats(url, name, id) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      // Name & Bild
      modalName.textContent = name;
      modalImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

      // Typen als Icons
      modalTypes.innerHTML = ""; // vorher löschen
      data.types.forEach((t) => {
        const typeImg = document.createElement("img");
        typeImg.src = `https://raw.githubusercontent.com/duiker101/pokemon-type-icons/master/icons/${t.type.name}.png`;
        typeImg.alt = t.type.name;
        typeImg.title = t.type.name; // Tooltip beim Hover
        typeImg.style.width = "40px"; // Größe anpassen
        typeImg.style.height = "40px";
        typeImg.style.margin = "0 5px";
        modalTypes.appendChild(typeImg);
      });

      // Stats
      modalStats.innerHTML = "";
      data.stats.forEach((stat) => {
        const li = document.createElement("li");
        li.textContent = `${stat.stat.name}: ${stat.base_stat}`;
        modalStats.appendChild(li);
      });

      // Modal anzeigen
      modal.style.display = "block";
    });
}

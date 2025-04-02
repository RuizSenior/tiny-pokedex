async function sendHTTPRequest(method, url, data = null) {
    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: data ? JSON.stringify(data) : null, 
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error en la solicitud:", error.message);
        return null;
    }
}

async function fetchPosts(event) {
    event.preventDefault(); 

    try {
        const pokemonName = document.getElementById("pokemon-search").value.toLowerCase();
        let pokemonData;

        if (pokemonName) {
            pokemonData = await sendHTTPRequest("GET", `https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
            if (!pokemonData) return;
            pokemonData = [pokemonData]; 
        } else {
            const response = await sendHTTPRequest("GET", `https://pokeapi.co/api/v2/pokemon?limit=100&offset=0`);
            if (!response) return;

            const pokemonsRandom = response.results.sort(() => Math.random() - 0.5).slice(0, 100);
            const pokemonPromises = pokemonsRandom.map(pokemon => sendHTTPRequest("GET", pokemon.url));
            pokemonData = await Promise.all(pokemonPromises);
        }

        renderPokemonList(pokemonData);
    } catch (error) {
        console.error("Error general:", error);
    }
}

function renderPokemonList(pokemonList) {
    postList.innerHTML = "";

    for (const pokemon of pokemonList) {
        const postContainer = document.createElement("article");
        postContainer.classList.add("post-item");

        const title = document.createElement("h2");
        title.textContent = pokemon.name.toUpperCase();

        const sprite = document.createElement("img");
        sprite.src = pokemon.sprites.front_default;
        sprite.alt = pokemon.name;

        const abilities = document.createElement("p");
        abilities.textContent = `Habilidades: ${pokemon.abilities.map(ability => ability.ability.name).join(", ")}`;

        const button = document.createElement("button");
        button.textContent = "More info";
        button.addEventListener("click", () => {
            const url = `https://www.pokemon.com/us/pokedex/${pokemon.name.toLowerCase()}`;
            window.open(url, "_blank");
        });

        postContainer.append(title, sprite, abilities, button);
        postList.append(postContainer);
    }
}

const postList = document.getElementById("pokemon-card");
const sendButton = document.getElementById("search-button");

sendButton.addEventListener("click", fetchPosts);

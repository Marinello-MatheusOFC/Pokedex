const params = new URLSearchParams(window.location.search);
const numero = params.get("numero");

async function drawPokemon(id) {
  const pokemon = await getPokemon("pokemon/" + id);
  document.title = capitalizeFisrtLetter(pokemon.name);

  const anterior = await getPokemonAnterior(pokemon.id);
  const proximo = await getPokemonProximo(pokemon.id);

  document.getElementById("anterior").innerHTML = `
    <div class="me-5 text-end">
      <h1 class="display-5 text-white fw-bold">${capitalizeFisrtLetter(anterior.name)}</h1>
      <a href="detalhes.html?numero=${anterior.id}" class="btn btn-outline-light">Ver detalhes</a>
    </div>
  `;

  document.getElementById("proximo").innerHTML = `
    ${carousel(pokemon.sprites)}
    <div id="tipos" class="d-flex justify-content-center gap-2 my-2">
      ${buttonTipo(Array.from(pokemon.types))}
    </div>
    <h1 class="display-5 text-white fw-bold">N° ${pokemon.id.toString().padStart(3, "0")}</h1>
    <h2 class="text-white">${capitalizeFisrtLetter(pokemon.name)}</h2>
  `;

  const species = await getPokemonSpecies(pokemon.id);
  const descricao = species.flavor_text_entries.filter(d => d.language.name == "en")[0].flavor_text;
  document.getElementById("descricao").innerText = descricao;

  document.getElementById("imgPoke").innerHTML = carousel(pokemon.sprites);
  document.getElementById("peso").innerText = (pokemon.weight / 10).toFixed(1) + " kg";

  let tiposHTML = "";
  for (let tipo of pokemon.types) {
    tiposHTML += buttonTipo(tipo);
  }
  document.getElementById("tipos").innerHTML = tiposHTML;

  document.getElementById("sons").innerHTML = `
    <audio controls>
      <source src="${pokemon.cries.latest}" type="audio/ogg">
      Seu navegador não suporta áudio.
    </audio>
    <audio controls>
      <source src="${pokemon.cries.legacy}" type="audio/ogg">
      Seu navegador não suporta áudio.
    </audio>
  `;

  const yValues = [];
  pokemon.stats.forEach((value, index) => {
    yValues.push(value.base_stat);
  });

  document.querySelector("#chartReport").innerHTML = `
    <canvas id="myChart"></canvas>
  `;

  const xValues = [
    "HP",
    "Ataque",
    "Defesa",
    "Ataque Especial",
    "Defesa Especial",
    "Velocidade",
  ];

  const barColors = [
    "#FF0000",
    "#EE7F30",
    "#F7D02C",
    "#F78567",
    "#77C7F5",
    "#678FEE",
  ];

  new Chart("myChart", {
    type: "bar",
    data: {
      labels: xValues,
      datasets: [
        {
          backgroundColor: barColors,
          data: yValues,
        },
      ],
    },
    options: {
      legend: { display: false },
      title: {
        display: true,
        text: "Status"
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    }
  });
}

async function getPokemonAnterior(numero) {
  const anterior = await getPokemon("pokemon/" + (numero - 1));
  if (anterior != null) {
    return `<button class="btn btn-outline-danger btn-10" onclick="drawPokemon(${anterior.id})">
      N° ${anterior.id.toString().padStart(3, "0")} - ${capitalizeFisrtLetter(anterior.name)}
    </button>`;
  }
  return `<span></span>`;
}

async function getPokemonProximo(numero) {
  const proximo = await getPokemon("pokemon/" + (numero + 1));
  if (proximo != null) {
    return `<button class="btn btn-outline-danger btn-10" onclick="drawPokemon(${proximo.id})">
      N° ${proximo.id.toString().padStart(3, "0")} - ${capitalizeFisrtLetter(proximo.name)}
    </button>`;
  }
  return `<span></span>`;
}

document.addEventListener("DOMContentLoaded", async () => {
  drawPokemon(numero);
});

document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();
  search();
});

async function search() {
  if (loading) return;
  let search = document.querySelector('input[type="search"]').value;
  if (search == "") {
    drawPokemon(numero);
  } else {
    const pokemon = await searchPokemon();
    drawPokemon(pokemon.id);
  }
}

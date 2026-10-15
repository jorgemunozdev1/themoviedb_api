document.addEventListener("DOMContentLoaded", async function () {
  const todasLasPeliculas = await getPeliculasLocal();
  buscarPeliculas(todasLasPeliculas);
  ordenarPorValoracion(todasLasPeliculas);
  filtrarFavoritos(todasLasPeliculas);
});

async function getPeliculasLocal() {
  const solicitudPeliculas = await fetch("./json/peliculas.json");
  const peliculas = await solicitudPeliculas.json();

  cargarPeliculasEnHTML(peliculas);
  return peliculas;
}

function buscarPeliculas(todasLasPeliculas) {
  const input = document.getElementById("buscador");
  input.addEventListener("input", (event) => {
    let longitud = event.target.value.length;
    let texto = event.target.value.toLowerCase();

    if (longitud >= 3) {
      limpiarPeliculas();

      let peliculasBuscadas = todasLasPeliculas.filter((pelicula) =>
        pelicula.title.toLowerCase().includes(texto),
      );

      cargarPeliculasEnHTML(peliculasBuscadas);
    } else {
      limpiarPeliculas();
      cargarPeliculasEnHTML(todasLasPeliculas);
    }
  });
}

function ordenarPorValoracion(todasLasPeliculas) {
  const botonOrdenar = document.getElementById("ordenarBtn");

  botonOrdenar.addEventListener("click", (event) => {
    let boton = event.target;
    let seleccionado = event.target.classList.contains("seleccionado");
    if (seleccionado) {
      boton.classList.remove("seleccionado");
      limpiarPeliculas();
      cargarPeliculasEnHTML(todasLasPeliculas);
    } else {
      boton.classList.add("seleccionado");
      const peliculasOrdenadas = structuredClone(todasLasPeliculas);
      limpiarPeliculas();
      cargarPeliculasEnHTML(
        peliculasOrdenadas.sort((a, b) => b.vote_average - a.vote_average),
      );
    }
  });
}

function filtrarFavoritos(todasLasPeliculas) {
  const botonFavoritos = document.getElementById("favoritosBtn");

  botonFavoritos.addEventListener("click", (event) => {
    const arrayIdFavoritos = obtenerFavoritos();
    const todasLasPeliculasV2 = structuredClone(todasLasPeliculas);
    const arrayFavoritos = todasLasPeliculasV2.filter((pelicula) =>
      arrayIdFavoritos.includes(pelicula.id),
    );
    let boton = event.target;
    let seleccionado = event.target.classList.contains("seleccionado");
    if (seleccionado) {
      boton.classList.remove("seleccionado");
      limpiarPeliculas();
      cargarPeliculasEnHTML(todasLasPeliculas);
    } else {
      boton.classList.add("seleccionado");
      limpiarPeliculas();
      cargarPeliculasEnHTML(arrayFavoritos);
    }
  });
}

function limpiarPeliculas() {
  const contenedor_peliculas = document.getElementById("cuadricula_peliculas");
  contenedor_peliculas.replaceChildren();
}

function obtenerFavoritos() {
  const favoritos = localStorage.getItem("favoritos");
  if (favoritos === null) {
    localStorage.setItem("favoritos", JSON.stringify([]));
    return [];
  } else {
    return JSON.parse(favoritos);
  }
}

function comprobarFavorito(esFav, iconoFav) {
  esFav
    ? iconoFav.classList.add("fa-solid")
    : iconoFav.classList.add("fa-regular");
}

function setFavorito(boton, icono, idPelicula) {
  boton.addEventListener("click", (event) => {
    const favoritosActuales = obtenerFavoritos();
    const marcado = favoritosActuales.includes(idPelicula);

    if (marcado) {
      icono.classList.add("fa-regular");
      icono.classList.remove("fa-solid");

      const nuevosFavoritos = favoritosActuales.filter(
        (id) => id !== idPelicula,
      );
      localStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos));
    } else {
      icono.classList.add("fa-solid");
      icono.classList.remove("fa-regular");
      favoritosActuales.push(idPelicula);
      localStorage.setItem("favoritos", JSON.stringify(favoritosActuales));
    }
  });
}

function cargarPeliculasEnHTML(arrayPeliculas) {
  const contenedor_peliculas = document.getElementById("cuadricula_peliculas");
  const favoritos = obtenerFavoritos();

  for (const pelicula of arrayPeliculas) {
    const div_pelicula = document.createElement("div");

    const imagen_pelicula = document.createElement("img");
    imagen_pelicula.src = `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`;
    const titulo = document.createElement("h2");
    titulo.textContent = pelicula.title;
    const valoracion = document.createElement("p");
    valoracion.textContent = `Valoración: ${pelicula.vote_average}`;
    const overview = document.createElement("p");
    overview.textContent = pelicula.overview;
    const fecha = document.createElement("p");
    fecha.textContent = `Fecha de estreno: ${pelicula.release_date}`;

    const idPelicula = pelicula.id;
    const favBtn = document.createElement("div");
    favBtn.classList.add("fav-btn");
    const iconoCorazon = document.createElement("i");
    iconoCorazon.classList.add("fa-heart");
    favBtn.appendChild(iconoCorazon);

    const esFav = favoritos.includes(pelicula.id);
    comprobarFavorito(esFav, iconoCorazon);
    setFavorito(favBtn, iconoCorazon, idPelicula);

    div_pelicula.append(
      imagen_pelicula,
      titulo,
      valoracion,
      overview,
      fecha,
      favBtn,
    );
    contenedor_peliculas.appendChild(div_pelicula);
  }
}

async function descargarPeliculasJSON(numeroPaginas = 5) {
  let arrayPeliculas = [];

  for (let i = 1; i <= numeroPaginas; i++) {
    const respuestaPeticion = await fetch(
      `https://api.themoviedb.org/3/discover/movie?page=${i}&language=es-ES&sort_by=popularity.desc&api_key=${IMDB_API_KEY}`,
    );

    const objeto = await respuestaPeticion.json();

    for (const pelicula of objeto.results) {
      arrayPeliculas.push(pelicula);
    }
  }

  const arrayPeliculasJSON = JSON.stringify(arrayPeliculas);
  const elementoDescarga = document.createElement("a");

  const blob = new Blob([arrayPeliculasJSON], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  elementoDescarga.href = url;
  elementoDescarga.download = "peliculas.json";
  elementoDescarga.click();
}

document.addEventListener("DOMContentLoaded", async function () {
  const arrayPeliculas = await pedirPeliculas();
  cargarPeliculas(arrayPeliculas);
});

async function pedirPeliculas() {
  var arrayPeliculas = [];

  for (let i = 1; i <= 5; i++) {
    const respuestaPeticion = await fetch(
      `https://api.themoviedb.org/3/discover/movie?page=${i}&language=es-ES&sort_by=popularity.desc&api_key=${IMDB_API_KEY}`,
    );

    const objeto = await respuestaPeticion.json();

    for (const pelicula of objeto.results) {
      arrayPeliculas.push(pelicula);
    }
  }
  return arrayPeliculas;
}

function cargarPeliculas(arrayPeliculas) {
  const contenedor_peliculas = document.getElementById("cuadricula_peliculas");

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

    div_pelicula.append(imagen_pelicula, titulo, valoracion, overview, fecha);
    contenedor_peliculas.appendChild(div_pelicula);
  }
}

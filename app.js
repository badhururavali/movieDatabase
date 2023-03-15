const express = require("express");
const app = express();

app.use(express.json());

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializerDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Start at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
  }
};

initializerDbAndServer();

const convertResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

const convertObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertObjectDirectObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
// get all movie_names
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT  movie_name FROM movie ;`;
  const movieNames = await db.all(getMoviesQuery);
  response.send(
    movieNames.map((eachMovie) => convertResponseObject(eachMovie))
  );
});

// add movie in movie table
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { movieId, directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor)
     VALUES
    (
        ${directorId},
         '${movieName}',
         '${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

// get movie details
app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movieQuery = await db.get(getMovieQuery);
  response.send(convertObjectToResponseObject(movieQuery));
});

// update movie details

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovie = `
      UPDATE movie SET 
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor ='${leadActor}'
      WHERE movie_id = ${movieId} ;`;
  const dbResponse = await db.run(addMovie);
  response.send("Movie Details Updated");
});

//delete movie details
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId} ;`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// get all directors
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM director;`;
  const directors = await db.all(getDirectorsQuery);
  response.send(
    directors.map((eachDirector) => convertObjectDirectObject(eachDirector))
  );
});

// get all movie names specified by director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesQuery = `
    SELECT  movie_name FROM movie WHERE director_id = ${directorId};`;
  const movies = await db.all(getMoviesQuery);
  response.send(movies.map((eachMovie) => convertResponseObject(eachMovie)));
});
module.exports = app;

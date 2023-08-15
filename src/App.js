import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
	{
		imdbID: "tt1375666",
		Title: "Inception",
		Year: "2010",
		Poster:
			"https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
	},
	{
		imdbID: "tt0133093",
		Title: "The Matrix",
		Year: "1999",
		Poster:
			"https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
	},
	{
		imdbID: "tt6751668",
		Title: "Parasite",
		Year: "2019",
		Poster:
			"https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
	},
];

const tempWatchedData = [
	{
		imdbID: "tt1375666",
		Title: "Inception",
		Year: "2010",
		Poster:
			"https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
		runtime: 148,
		imdbRating: 8.8,
		userRating: 10,
	},
	{
		imdbID: "tt0088763",
		Title: "Back to the Future",
		Year: "1985",
		Poster:
			"https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
		runtime: 116,
		imdbRating: 8.5,
		userRating: 9,
	},
];

const apiKey = "873cb116";

const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [movies, setMovies] = useState(tempMovieData);
	const [query, setQuery] = useState("inception");
	const [selectedID, setSelectedID] = useState(null);
	const [watched, setWatched] = useState([]);

	function handleAddWatched(movie) {
		setWatched((watched) => [...watched, movie]);
	}

	function handleCloseMovie() {
		setSelectedID(null);
	}

	function handleDeleteWatched(id) {
		setWatched((watched) => watched.filter((w) => w.imdbID !== id));
	}

	function handleSelectMovie(id) {
		setSelectedID((selectedID) => (id === selectedID ? null : id));
	}

	useEffect(() => {
		async function fetchMovies() {
			try {
				setIsLoading(true);
				setError("");

				const res = await fetch(
					`https://omdbapi.com/?apikey=${apiKey}&s=${query}`
				);

				if (!res.ok)
					throw new Error("Something went wrong with fetching the movies.");

				const data = await res.json();

				if (data.Response === "False") {
					throw new Error(data.Error);
				}

				setMovies(data.Search);
			} catch (error) {
				setError(error.message);
			} finally {
				setIsLoading(false);
			}
		}

		if (query.length < 3) {
			setError("");
			setMovies([]);
			return;
		}

		fetchMovies();
	}, [query]);

	return (
		<>
			<NavBar>
				<Logo />
				<SearchBar
					query={query}
					setQuery={setQuery}
				/>
				<NumResults movies={movies} />
			</NavBar>
			<Main>
				<Box>
					{isLoading && <Loader />}
					{!isLoading && !error && (
						<MovieList
							movies={movies}
							onSelectMovie={handleSelectMovie}
						/>
					)}
					{error && <ErrorMessage message={error} />}
				</Box>
				<Box>
					{selectedID ? (
						<MovieDetails
							onAddWatched={handleAddWatched}
							onCloseMovie={handleCloseMovie}
							selectedID={selectedID}
							watched={watched}
						/>
					) : (
						<>
							<WatchedSummary watched={watched} />
							<WatchedMovieList
								onDeleteWatched={handleDeleteWatched}
								watched={watched}
							/>
						</>
					)}
				</Box>
			</Main>
		</>
	);
}

function Box({ children }) {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div className="box">
			<button
				className="btn-toggle"
				onClick={() => setIsOpen((open) => !open)}
			>
				{isOpen ? "–" : "+"}
			</button>
			{isOpen && children}
		</div>
	);
}

function ErrorMessage({ message }) {
	return (
		<p className="error">
			<span>⛔</span> {message}
		</p>
	);
}

function Loader() {
	return <p className="loader">Loading...</p>;
}

function Logo() {
	return (
		<div className="logo">
			<span role="img">🍿</span>
			<h1>usePopcorn</h1>
		</div>
	);
}

function Main({ children }) {
	return <main className="main">{children}</main>;
}

function Movie({ movie, onSelectMovie }) {
	return (
		<li onClick={() => onSelectMovie(movie.imdbID)}>
			<img
				src={movie.Poster}
				alt={`${movie.Title} poster`}
			/>
			<h3>{movie.Title}</h3>
			<div>
				<p>
					<span>📅</span>
					<span>{movie.Year}</span>
				</p>
			</div>
		</li>
	);
}

function MovieDetails({ onAddWatched, onCloseMovie, selectedID, watched }) {
	const [isLoading, setIsLoading] = useState(false);
	const [movie, setMovie] = useState({});
	const [userRating, setUserRating] = useState(0);

	const isWatched = watched.map((w) => w.imdbID).includes(selectedID);

	const watchedUserRating = watched.find(
		(w) => w.imdbID === selectedID
	)?.userRating;

	const {
		Actors: actors,
		Director: director,
		Genre: genre,
		imdbRating,
		Plot: plot,
		Poster: poster,
		Released: released,
		Runtime: runtime,
		Title: title,
		Year: year,
	} = movie;

	function handleAdd() {
		const newWatchedMovie = {
			imdbID: selectedID,
			imdbRating: Number(imdbRating),
			poster,
			runtime: runtime.split(" ").at(0),
			title,
			userRating,
			year,
		};

		onAddWatched(newWatchedMovie);
		onCloseMovie();
	}

	useEffect(
		function () {
			async function getMovieDetails() {
				setIsLoading(true);

				const res = await fetch(
					`https://www.omdbapi.com/?apikey=${apiKey}&i=${selectedID}`
				);

				const data = await res.json();

				setIsLoading(false);
				setMovie(data);
			}

			getMovieDetails();
		},
		[selectedID]
	);

	return (
		<div className="details">
			{isLoading ? (
				<Loader />
			) : (
				<>
					<header>
						<button
							className="btn-back"
							onClick={onCloseMovie}
						>
							&larr;
						</button>
						<img
							src={poster}
							alt={`Poster of ${movie}.`}
						/>
						<div className="details-overview">
							<h2>{title}</h2>
							<p>
								{released} &bull; {runtime}
							</p>
							<p>{genre}</p>
							<p>
								<span>⭐</span> {imdbRating} IMDb rating
							</p>
						</div>
					</header>
					<section>
						<div className="rating">
							{!isWatched ? (
								<>
									<StarRating
										maxRating={10}
										onSetRating={setUserRating}
										size={24}
									/>

									{userRating > 0 && (
										<button
											className="btn-add"
											onClick={handleAdd}
										>
											Add to list
										</button>
									)}
								</>
							) : (
								<p>
									You have already rated this movie {watchedUserRating}{" "}
									<span>⭐</span>.
								</p>
							)}
						</div>
						<p>
							<em>{plot}</em>
						</p>
						<p>Starring: {actors}</p>
						<p>Directed by: {director}</p>
					</section>
					{selectedID}
				</>
			)}
		</div>
	);
}

function MovieList({ movies, onSelectMovie }) {
	return (
		<ul className="list list-movies">
			{movies?.map((movie) => (
				<Movie
					key={movie.imdbID}
					movie={movie}
					onSelectMovie={onSelectMovie}
				/>
			))}
		</ul>
	);
}

function NavBar({ children }) {
	return <nav className="nav-bar">{children}</nav>;
}

function NumResults({ movies }) {
	return (
		<p className="num-results">
			Found <strong>{movies.length}</strong> results
		</p>
	);
}

function SearchBar({ query, setQuery }) {
	return (
		<input
			className="search"
			type="text"
			placeholder="Search movies..."
			value={query}
			onChange={(e) => setQuery(e.target.value)}
		/>
	);
}

function WatchedMovie({ movie, onDeleteWatched }) {
	return (
		<li>
			<img
				src={movie.poster}
				alt={`${movie.title} poster`}
			/>
			<h3>{movie.title}</h3>
			<div>
				<p>
					<span>⭐️</span>
					<span>{movie.imdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{movie.userRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{movie.runtime} min</span>
				</p>
				<button
					className="btn-delete"
					onClick={() => onDeleteWatched(movie.imdbID)}
				>
					X
				</button>
			</div>
		</li>
	);
}

function WatchedMovieList({ onDeleteWatched, watched }) {
	return (
		<ul className="list">
			{watched.map((movie) => (
				<WatchedMovie
					key={movie.imdbID}
					movie={movie}
					onDeleteWatched={onDeleteWatched}
				/>
			))}
		</ul>
	);
}

function WatchedSummary({ watched }) {
	const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
	const avgUserRating = average(watched.map((movie) => movie.userRating));
	const avgRuntime = average(watched.map((movie) => movie.runtime));

	return (
		<div className="summary">
			<h2>Movies you watched</h2>
			<div>
				<p>
					<span>#️⃣</span>
					<span>{watched.length} movies</span>
				</p>
				<p>
					<span>⭐️</span>
					<span>{avgImdbRating.toFixed(2)}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{avgUserRating.toFixed(2)}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{avgRuntime} min</span>
				</p>
			</div>
		</div>
	);
}

import { useEffect, useState } from "react";

const apiKey = "873cb116";

export function useMovies(query) {
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [movies, setMovies] = useState([]);

	useEffect(() => {
		const controller = new AbortController();

		async function fetchMovies() {
			try {
				setIsLoading(true);
				setError("");

				const res = await fetch(
					`https://omdbapi.com/?apikey=${apiKey}&s=${query}`,
					{ signal: controller.signal }
				);

				if (!res.ok)
					throw new Error("Something went wrong with fetching the movies.");

				const data = await res.json();

				if (data.Response === "False") {
					throw new Error(data.Error);
				}

				setMovies(data.Search);
				setError("");
			} catch (error) {
				if (error.name !== "AbortError") {
					console.log(error.message);
					setError(error.message);
				}
			} finally {
				setIsLoading(false);
			}
		}

		if (query.length < 3) {
			setError("");
			setMovies([]);
			return;
		}

		// callback();
		fetchMovies();

		return function () {
			controller.abort();
		};
	}, [query]);

	return { error, isLoading, movies };
}

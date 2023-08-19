import { useEffect } from "react";

export function useKey(action, key) {
	useEffect(
		function () {
			function escapeCallback(event) {
				if (event.code.toLowerCase() === key.toLowerCase()) {
					action();
				}
			}

			document.addEventListener("keydown", escapeCallback);

			return function () {
				document.removeEventListener("keydown", escapeCallback);
			};
		},
		[action, key]
	);
}

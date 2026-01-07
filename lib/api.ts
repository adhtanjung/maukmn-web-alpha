import { useAuth } from "@clerk/nextjs";

/**
 * Hook to make authenticated requests to the backend.
 * Automatically adds the Bearer token to the Authorization header.
 */
export const useAuthenticatedFetch = () => {
	const { getToken } = useAuth();

	const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
		const token = await getToken();
		const headers = new Headers(options.headers);
		headers.set("Authorization", `Bearer ${token}`);

		// Ensure Content-Type is set if body is present and it's JSON
		// Note: This is a basic implementation, extend as needed
		if (
			options.body &&
			!headers.has("Content-Type") &&
			typeof options.body === "string"
		) {
			// Simple assumption, reliable handling should check if it's actually JSON
			// headers.set('Content-Type', 'application/json');
		}

		return fetch(url, { ...options, headers });
	};

	return fetchWithAuth;
};

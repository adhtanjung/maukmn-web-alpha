import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";

import { AppUser } from "@/app/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useAppUser() {
	const { getToken, isLoaded, userId } = useAuth();

	const fetcher = async (url: string): Promise<AppUser> => {
		const token = await getToken();
		if (!token) throw new Error("No token");

		const res = await fetch(`${API_URL}${url}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!res.ok) {
			throw new Error("Failed to fetch user data");
		}

		const json = await res.json();
		return json.data;
	};

	const { data, error, isLoading } = useSWR(
		isLoaded && userId ? "/api/me" : null,
		fetcher,
	);

	return {
		appUser: data,
		role: data?.role,
		isAdmin: data?.role === "admin",
		isLoading: isLoading || (!data && !error),
		isError: error,
	};
}

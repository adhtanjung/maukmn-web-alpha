import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProfileView from "./ProfileView";

import { AppUser } from "@/app/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function getAppUser(token: string): Promise<AppUser | null> {
	try {
		const res = await fetch(`${API_URL}/api/me`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			cache: "no-store", // Always fresh for user profile
		});

		if (!res.ok) return null;
		const json = await res.json();
		return json.data;
	} catch (error) {
		console.error("Error fetching app user:", error);
		return null;
	}
}

async function getUserPOIs(token: string) {
	try {
		const res = await fetch(`${API_URL}/api/v1/pois/my`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			next: { revalidate: 0 }, // Ensure fresh list
		});

		if (!res.ok) {
			return { pois: [], total: 0 };
		}
		const json = await res.json();
		if (json.success && json.data) {
			return {
				pois: json.data,
				total: json.meta?.total || json.data.length,
			};
		}
		return { pois: [], total: 0 };
	} catch (error) {
		console.error("Error fetching user POIs:", error);
		return { pois: [], total: 0 };
	}
}

export default async function ProfilePage() {
	const { userId, getToken } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	const token = await getToken();
	if (!token) {
		redirect("/sign-in");
	}

	// Fetch data in parallel
	const [appUser, poiData] = await Promise.all([
		getAppUser(token),
		getUserPOIs(token),
	]);

	return (
		<ProfileView
			initialPOIs={poiData.pois}
			poiTotal={poiData.total}
			isAdmin={appUser?.role === "admin"}
			appUser={appUser}
		/>
	);
}

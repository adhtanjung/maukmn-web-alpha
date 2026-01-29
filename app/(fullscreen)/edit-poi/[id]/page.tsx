import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import EditPOIClient from "./EditPOIClient";
import { mapApiToFormData } from "@/app/lib/utils/poi-mapper";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function getPOI(token: string, poiId: string) {
	try {
		const response = await fetch(`${API_URL}/api/v1/pois/${poiId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			cache: "no-store",
		});

		const data = await response.json();

		if (!response.ok) {
			return { error: data.message || "Failed to fetch POI" };
		}

		if (data.success && data.data) {
			return { data: mapApiToFormData(data.data) };
		}
		return { error: "POI not found" };
	} catch (err) {
		console.error("Error fetching POI:", err);
		return { error: "Failed to fetch POI" };
	}
}

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function EditPOIPage({ params }: PageProps) {
	const resolvedParams = await params;
	const poiId = resolvedParams.id;
	const { userId, getToken } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	const token = await getToken();
	if (!token) {
		redirect("/sign-in");
	}

	const { data, error } = await getPOI(token, poiId);

	return (
		<EditPOIClient initialData={data || null} poiId={poiId} error={error} />
	);
}

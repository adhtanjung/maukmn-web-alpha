"use client";

import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useMemo } from "react";
import { POI } from "./usePOIs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type SavedPOIsResponse = {
	pois: POI[];
};

export function useSavedPOIs() {
	const { getToken, isLoaded, userId } = useAuth();

	const fetcher = useCallback(
		async (url: string) => {
			const token = await getToken();
			if (!token) throw new Error("No URL or token");

			const res = await fetch(url, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to fetch saved POIs");
			}

			return res.json();
		},
		[getToken],
	);

	const key = isLoaded && userId ? `${API_URL}/api/v1/me/saved-pois` : null;

	const { data, error, isLoading, mutate } = useSWR<SavedPOIsResponse>(
		key,
		fetcher,
		{
			revalidateOnFocus: false, // Don't aggressive revalidate on window focus
		},
	);

	// Derived state for fast lookup
	const savedPoiIds = useMemo(() => {
		if (!data?.pois) return new Set<string>();
		return new Set(data.pois.map((p) => p.poi_id));
	}, [data]);

	const isSaved = useCallback(
		(poiId: string) => {
			return savedPoiIds.has(poiId);
		},
		[savedPoiIds],
	);

	return {
		savedPOIs: data?.pois || [],
		savedPoiIds,
		isSaved,
		isLoading,
		error,
		mutate,
	};
}

export function useSaveToggle() {
	const { getToken } = useAuth();
	const { savedPoiIds, mutate } = useSavedPOIs();

	const toggleSave = useCallback(
		async (poiId: string) => {
			const token = await getToken();
			if (!token) return;

			const isCurrentlySaved = savedPoiIds.has(poiId);

			// 1. Optimistic Update
			// We can't easily predict the full POI object if adding,
			// but for the ID set, we can update immediately.
			// Ideally, we'd add the POI to the list, but we might not have the full POI data here.
			// However, checking `isSaved` relies on the derived Set from the data.
			// So we need to update the `data` structure SWR holds.

			await mutate(
				(currentData) => {
					if (!currentData) return { pois: [] };

					if (isCurrentlySaved) {
						// Remove from list
						return {
							...currentData,
							pois: currentData.pois.filter((p) => p.poi_id !== poiId),
						};
					} else {
						// Add to list? We don't have the POI data here!
						// This is a limitation.
						// For the feed, we just need the ID to show the heart.
						// But if the user goes to "My Saved", they expect the card.

						// Strategy:
						// If UNSAVING: Remove immediately (easy).
						// If SAVING: We can't optimistically add the full card unless passed.
						// BUT `isSaved` relies on `savedPoiIds` which relies on `data.pois`.
						// For now, we will NOT optimistically add the CARD to the list,
						// but we should find a way to update the 'isSaved' status visually.
						// The 'isSaved' helper relies on the list.

						// Workaround: We can optimistically inject a "fake" POI with just the ID
						// if we only care about the ID check, but that might break types.
						// Better: Rely on local component state for immediate feedback provided by the button,
						// and revalidate in background.
						return currentData;
					}
				},
				{ revalidate: false },
			);

			try {
				const res = await fetch(`${API_URL}/api/v1/pois/${poiId}/save`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!res.ok) throw new Error("Failed to toggle save");

				// Revalidate to get the fresh list (and correct added items)
				mutate();
			} catch (error) {
				console.error("Error toggling save:", error);
				// Rollback
				mutate();
			}
		},
		[getToken, savedPoiIds, mutate],
	);

	return { toggleSave };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { POI } from "./usePOIs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface UsePOIDetailResult {
	poi: POI | null;
	loading: boolean;
	error: string | null;
	refetch: () => void;
}

export function usePOIDetail(poiId: string | null): UsePOIDetailResult {
	const { getToken } = useAuth();
	const [poi, setPoi] = useState<POI | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchPOI = useCallback(async () => {
		if (!poiId) {
			setLoading(false);
			setError("No POI ID provided");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const token = await getToken();
			const response = await fetch(`${API_URL}/api/v1/pois/${poiId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to fetch POI");
			}

			// Handle standardized response format
			if (data.success && data.data) {
				setPoi(data.data);
			} else if (data.poi_id) {
				// Direct POI object
				setPoi(data);
			} else {
				throw new Error("Invalid response format");
			}
		} catch (err) {
			console.error("Error fetching POI:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch POI");
			setPoi(null);
		} finally {
			setLoading(false);
		}
	}, [getToken, poiId]);

	useEffect(() => {
		fetchPOI();
	}, [fetchPOI]);

	return { poi, loading, error, refetch: fetchPOI };
}

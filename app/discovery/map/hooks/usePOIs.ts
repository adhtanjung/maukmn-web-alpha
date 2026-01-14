"use client";

import { useState, useCallback, useRef } from "react";
import { POI } from "@/app/types/map";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function usePOIs() {
	const [pois, setPois] = useState<POI[]>([]);
	const [loading, setLoading] = useState(true);
	const abortControllerRef = useRef<AbortController | null>(null);

	const fetchPOIs = useCallback(
		async (
			lat?: number,
			lng?: number,
			radius: number = 5000,
			queryString?: string
		) => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}

			const abortController = new AbortController();
			abortControllerRef.current = abortController;

			setLoading(true);
			try {
				let url = `${API_URL}/api/v1/pois?status=approved&limit=100`;

				// If we have a robust query string (active filters), favor that endpoint
				// Note: Map view usually needs location context.
				// If queryString provided, we append it.
				if (queryString) {
					// Use the Search endpoint with filters
					// We still want to prioritize "nearby" if strictly just looking around,
					// but our backend Search endpoint supports lat/lng for sorting if "sort_by=nearest" is in queryString
					url = `${API_URL}/api/v1/pois?${queryString}&limit=100`;

					// If we are strictly filtering but NOT sorting by nearest, we might get global results.
					// This is expected for "Filter Mode".
				} else if (lat && lng) {
					// Default "Just Looking" mode - use efficient Geohash/PostGIS nearby
					url = `${API_URL}/api/v1/pois/nearby?lat=${lat}&lng=${lng}&radius=${Math.round(
						radius
					)}&limit=100`;
				}

				const response = await fetch(url, { signal: abortController.signal });
				const data = await response.json();

				if (data.success && data.data) {
					// Handle nearby response structure
					if (data.data.data) {
						setPois(data.data.data);
					} else if (Array.isArray(data.data)) {
						setPois(data.data);
					}
				} else if (Array.isArray(data.data)) {
					setPois(data.data);
				}
			} catch (error) {
				// Ignore abort errors
				if (error instanceof Error && error.name === "AbortError") {
					return;
				}
				console.error("Failed to fetch POIs:", error);
			} finally {
				// Only set loading false if this request wasn't aborted
				if (!abortController.signal.aborted) {
					setLoading(false);
				}
			}
		},
		[]
	);

	return { pois, loading, fetchPOIs };
}

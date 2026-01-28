"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface POI {
	poi_id: string;
	name: string;
	brand?: string;
	description?: string;
	category_id?: string;
	category_names?: string[];
	cover_image_url?: string;
	gallery_image_urls?: string[];
	has_wifi: boolean;
	outdoor_seating: boolean;
	has_ac?: boolean;
	kids_friendly: boolean;
	pet_friendly?: string[];
	smoker_friendly: boolean;
	price_range?: number;
	status: string;
	created_at: string;
	updated_at: string;
	// Extended fields for UX enhancements
	wifi_quality?: "none" | "slow" | "moderate" | "fast" | "excellent";
	power_outlets?: "none" | "limited" | "moderate" | "plenty";
	noise_level?: "silent" | "quiet" | "moderate" | "lively" | "loud";
	open_hours?: Record<string, { open: string; close: string }>;
	vibes?: string[];
	cuisine?: string;
	happy_hour_info?: string;
	phone?: string;
	website?: string;
	latitude?: number;
	longitude?: number;
	reservation_required?: boolean;
	reservation_platform?: string;
	is_wheelchair_accessible?: boolean;
	parking_options?: string[];
	// Metrics (Optional for now)
	rating?: number;
	reviews_count?: number;
	distance?: number;
	founding_user_username?: string;
}

interface UsePOIsResult {
	pois: POI[];
	loading: boolean;
	error: string | null;
	refetch: () => void;
}

export function usePOIs(status: string = "approved"): UsePOIsResult {
	const { getToken } = useAuth();
	const [pois, setPois] = useState<POI[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchPOIs = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const token = await getToken();
			const response = await fetch(
				`${API_URL}/api/v1/pois?status=${status}&limit=50`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to fetch POIs");
			}

			// Handle standardized response format
			if (data.success && data.data) {
				setPois(data.data);
			} else if (Array.isArray(data.data)) {
				setPois(data.data);
			} else if (Array.isArray(data)) {
				setPois(data);
			} else {
				setPois([]);
			}
		} catch (err) {
			console.error("Error fetching POIs:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch POIs");
			setPois([]);
		} finally {
			setLoading(false);
		}
	}, [getToken, status]);

	useEffect(() => {
		fetchPOIs();
	}, [fetchPOIs]);

	return { pois, loading, error, refetch: fetchPOIs };
}

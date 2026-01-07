"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface UserPOI {
	poi_id: string;
	name: string;
	description?: string;
	status: string;
	cover_image_url?: string;
	has_wifi: boolean;
	outdoor_seating: boolean;
	price_range?: number;
	created_at: string;
	updated_at: string;
}

interface UseUserPOIsResult {
	pois: UserPOI[];
	loading: boolean;
	error: string | null;
	total: number;
	refetch: () => void;
}

export function useUserPOIs(): UseUserPOIsResult {
	const { getToken } = useAuth();
	const [pois, setPois] = useState<UserPOI[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [total, setTotal] = useState(0);

	const fetchPOIs = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const token = await getToken();
			const response = await fetch(`${API_URL}/api/v1/pois/my`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to fetch your POIs");
			}

			if (data.success && data.data) {
				setPois(data.data);
				setTotal(data.meta?.total || data.data.length);
			} else {
				setPois([]);
				setTotal(0);
			}
		} catch (err) {
			console.error("Error fetching user POIs:", err);
			setError(
				err instanceof Error ? err.message : "Failed to fetch your POIs"
			);
			setPois([]);
		} finally {
			setLoading(false);
		}
	}, [getToken]);

	useEffect(() => {
		fetchPOIs();
	}, [fetchPOIs]);

	return { pois, loading, error, total, refetch: fetchPOIs };
}

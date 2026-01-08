"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { POI } from "./usePOIs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Filter state interface matching the FilterDrawer UI
export interface FilterState {
	sortBy: "recommended" | "nearest" | "top_rated";
	priceRange: number | null;
	wifiQuality: string | null;
	noiseLevel: string | null;
	powerOutlets: string | null;
	vibes: string[];
	crowdType: string[];
	dietaryOptions: string[];
	seatingOptions: string[];
	parkingOptions: string[];
	hasAC: boolean | null;
	cuisine: string | null;
	// Location for "nearest" sorting
	lat?: number;
	lng?: number;
}

// Default filter state
export const DEFAULT_FILTERS: FilterState = {
	sortBy: "recommended",
	priceRange: null,
	wifiQuality: null,
	noiseLevel: null,
	powerOutlets: null,
	vibes: [],
	crowdType: [],
	dietaryOptions: [],
	seatingOptions: [],
	parkingOptions: [],
	hasAC: null,
	cuisine: null,
};

interface UseFiltersResult {
	filters: FilterState;
	setFilter: <K extends keyof FilterState>(
		key: K,
		value: FilterState[K]
	) => void;
	setFilters: (filters: FilterState) => void;
	toggleArrayFilter: (
		key:
			| "vibes"
			| "crowdType"
			| "dietaryOptions"
			| "seatingOptions"
			| "parkingOptions",
		value: string
	) => void;
	resetFilters: () => void;
	applyQuickFilter: (presetId: string) => void;
	buildQueryString: () => string;
	activeFilterCount: number;
	hasActiveFilters: boolean;
	updateFilter: <K extends keyof FilterState>(
		key: K,
		value: FilterState[K]
	) => void;
	queryString: string;
}

// Quick filter presets
const QUICK_FILTER_PRESETS: Record<string, Partial<FilterState>> = {
	deep_work: {
		wifiQuality: "fast",
		noiseLevel: "quiet",
		powerOutlets: "plenty",
	},
	client_meeting: {
		noiseLevel: "moderate",
		vibes: ["luxury", "minimalist"],
	},
	date_night: {
		vibes: ["cozy", "luxury"],
	},
};

export function useFilters(
	initialFilters?: Partial<FilterState>
): UseFiltersResult {
	const [filters, setFiltersState] = useState<FilterState>({
		...DEFAULT_FILTERS,
		...initialFilters,
	});

	// Set a single filter value
	const setFilter = useCallback(
		<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
			setFiltersState((prev) => ({ ...prev, [key]: value }));
		},
		[]
	);

	// Alias for updateFilter to match return type expectation if needed, or direct exposure
	const updateFilter = setFilter;

	const setFilters = useCallback((newFilters: FilterState) => {
		setFiltersState(newFilters);
	}, []);

	// Toggle an item in an array filter
	const toggleArrayFilter = useCallback(
		(
			key:
				| "vibes"
				| "crowdType"
				| "dietaryOptions"
				| "seatingOptions"
				| "parkingOptions",
			value: string
		) => {
			setFiltersState((prev) => {
				const current = prev[key];
				if (current.includes(value)) {
					return { ...prev, [key]: current.filter((v) => v !== value) };
				}
				return { ...prev, [key]: [...current, value] };
			});
		},
		[]
	);

	// Reset all filters to default
	const resetFilters = useCallback(() => {
		setFiltersState(DEFAULT_FILTERS);
	}, []);

	// Apply a quick filter preset
	const applyQuickFilter = useCallback((presetId: string) => {
		const preset = QUICK_FILTER_PRESETS[presetId];
		if (preset) {
			setFiltersState((prev) => ({ ...prev, ...preset }));
		}
	}, []);

	// Build query string for API call
	const buildQueryString = useCallback((): string => {
		const params = new URLSearchParams();

		// Always include status=approved for public feed
		params.set("status", "approved");

		if (filters.sortBy && filters.sortBy !== "recommended") {
			params.set("sort_by", filters.sortBy);
		}

		if (filters.priceRange !== null) {
			params.set("price_range", filters.priceRange.toString());
		}

		if (filters.wifiQuality && filters.wifiQuality !== "any") {
			params.set("wifi_quality", filters.wifiQuality);
		}

		if (filters.noiseLevel) {
			params.set("noise_level", filters.noiseLevel);
		}

		if (filters.powerOutlets && filters.powerOutlets !== "any") {
			params.set("power_outlets", filters.powerOutlets);
		}

		if (filters.cuisine) {
			params.set("cuisine", filters.cuisine);
		}

		if (filters.hasAC !== null) {
			params.set("has_ac", filters.hasAC.toString());
		}

		// Array filters
		if (filters.vibes.length > 0) {
			params.set("vibes", filters.vibes.join(","));
		}

		if (filters.crowdType.length > 0) {
			params.set("crowd_type", filters.crowdType.join(","));
		}

		if (filters.dietaryOptions.length > 0) {
			params.set("dietary_options", filters.dietaryOptions.join(","));
		}

		if (filters.seatingOptions.length > 0) {
			params.set("seating_options", filters.seatingOptions.join(","));
		}

		if (filters.parkingOptions.length > 0) {
			params.set("parking_options", filters.parkingOptions.join(","));
		}

		// Location for nearest sort
		if (filters.sortBy === "nearest" && filters.lat && filters.lng) {
			params.set("lat", filters.lat.toString());
			params.set("lng", filters.lng.toString());
		}

		return params.toString();
	}, [filters]);

	// Count active filters (excluding sortBy and location)
	const activeFilterCount = useMemo(() => {
		let count = 0;

		if (filters.priceRange !== null) count++;
		if (filters.wifiQuality && filters.wifiQuality !== "any") count++;
		if (filters.noiseLevel) count++;
		if (filters.powerOutlets && filters.powerOutlets !== "any") count++;
		if (filters.cuisine) count++;
		if (filters.hasAC !== null) count++;
		count += filters.vibes.length;
		count += filters.crowdType.length;
		count += filters.dietaryOptions.length;
		count += filters.seatingOptions.length;
		count += filters.parkingOptions.length;

		return count;
	}, [filters]);

	const hasActiveFilters = activeFilterCount > 0;

	// Create dynamic query string
	const queryString = useMemo(() => buildQueryString(), [buildQueryString]);

	return {
		filters,
		setFilter,
		setFilters,
		toggleArrayFilter,
		resetFilters,
		applyQuickFilter,
		buildQueryString,
		activeFilterCount,
		hasActiveFilters,
		updateFilter,
		queryString,
	};
}

// Hook to fetch POIs with filters
export function useFilteredPOIs(queryString: string, enabled: boolean = true) {
	const [pois, setPois] = useState<POI[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [total, setTotal] = useState(0);

	const fetchFilteredPOIs = useCallback(async () => {
		if (!enabled) return;

		setLoading(true);
		setError(null);

		try {
			// Query string from hook already includes params, but we ensure limit here if not present
			const url = `${API_URL}/api/v1/pois?${queryString}`;
			const finalUrl = url.includes("limit=") ? url : `${url}&limit=50`;

			const response = await fetch(finalUrl);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to fetch POIs");
			}

			// Handle response structure
			let results: POI[] = [];
			let count = 0;

			if (data.success && data.data) {
				if (data.data.data && Array.isArray(data.data.data)) {
					// Paginated response
					results = data.data.data;
					count = data.data.total || results.length;
				} else if (Array.isArray(data.data)) {
					// Flat array in data
					results = data.data;
					count = results.length;
				}
			} else if (Array.isArray(data.data)) {
				results = data.data;
				count = results.length;
			} else {
				// Fallback
				results = [];
			}

			setPois(results);
			setTotal(count);
		} catch (err) {
			console.error("Error fetching filtered POIs:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch POIs");
			setPois([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, [queryString, enabled]);

	// Automatically fetch when query string changes
	useEffect(() => {
		fetchFilteredPOIs();
	}, [fetchFilteredPOIs]);

	return { pois, loading, error, total, refetch: fetchFilteredPOIs };
}

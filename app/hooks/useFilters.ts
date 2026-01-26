"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
		value: FilterState[K],
	) => void;
	setFilters: (filters: FilterState) => void;
	toggleArrayFilter: (
		key:
			| "vibes"
			| "crowdType"
			| "dietaryOptions"
			| "seatingOptions"
			| "parkingOptions",
		value: string,
	) => void;
	resetFilters: () => void;
	applyQuickFilter: (presetId: string) => void;
	buildQueryString: () => string;
	activeFilterCount: number;
	hasActiveFilters: boolean;
	updateFilter: <K extends keyof FilterState>(
		key: K,
		value: FilterState[K],
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
	initialFilters?: Partial<FilterState>,
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
		[],
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
			value: string,
		) => {
			setFiltersState((prev) => {
				const current = prev[key];
				if (current.includes(value)) {
					return { ...prev, [key]: current.filter((v) => v !== value) };
				}
				return { ...prev, [key]: [...current, value] };
			});
		},
		[],
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
export function useFilteredPOIs(
	queryString: string,
	enabled: boolean = true,
	initialData?: POI[],
	initialTotal?: number,
) {
	const [pois, setPois] = useState<POI[]>(initialData ?? []);
	const [loading, setLoading] = useState(initialData ? false : true);
	const [error, setError] = useState<string | null>(null);
	const [total, setTotal] = useState(initialTotal ?? 0);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(
		initialData ? initialData.length < (initialTotal ?? 0) : true,
	);

	const fetchFilteredPOIs = useCallback(
		async (pageNum: number = 1, append: boolean = false) => {
			if (!enabled) return;

			setLoading(true);
			setError(null);

			try {
				// Query string from hook already includes params
				const url = `${API_URL}/api/v1/pois?${queryString}`;
				// Append paginaton params
				const finalUrl = `${url}${
					url.includes("limit=") ? "" : "&limit=50"
				}&page=${pageNum}`;

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

				setPois((prev) => {
					let updated: POI[];
					if (append) {
						const existingIds = new Set(prev.map((p) => p.poi_id));
						const uniqueResults = results.filter(
							(p) => !existingIds.has(p.poi_id),
						);
						updated = [...prev, ...uniqueResults];
					} else {
						updated = results;
					}

					// If this is the initial fetch (not appending) and results are low,
					// we might want to expand the search.
					if (!append && updated.length < 3) {
						// Logic handled in a separate effect or subsequent call would be cleaner,
						// but for simplicity, we trigger the expansion logic here or set a flag.
						// However, since we need to fetch *different* data, we can't just do it synchronously.
						// We'll trust the "auto-expand" logic below.
					}

					// Update hasMore based on total count
					setHasMore(updated.length < count);
					return updated;
				});
				setTotal(count);

				// Return data for the expansion check
				return { results, count };
			} catch (err) {
				console.error("Error fetching filtered POIs:", err);
				setError(err instanceof Error ? err.message : "Failed to fetch POIs");
				if (!append) {
					setPois([]);
					setTotal(0);
				}
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[queryString, enabled],
	);

	// Function to fetch recommendations when results are low
	const fetchRecommendations = useCallback(async () => {
		try {
			// Construct recommendation query - clear strict filters but keep status
			// If location exists, keep it for "nearest" fallback, otherwise use recommended sort
			const params = new URLSearchParams();
			params.set("status", "approved");
			params.set("sort_by", "recommended");
			params.set("limit", "20"); // Fetch a batch of recommendations

			const url = `${API_URL}/api/v1/pois?${params.toString()}`;
			const response = await fetch(url);
			const data = await response.json();

			if (data.success && data.data) {
				let recs: POI[] = [];
				if (data.data.data && Array.isArray(data.data.data)) {
					recs = data.data.data;
				} else if (Array.isArray(data.data)) {
					recs = data.data;
				}

				// Filter out duplicates (check against what's already in state to avoid races)
				setPois((prev) => {
					const currentIds = new Set(prev.map((p) => p.poi_id));
					const newRecs = recs
						.filter((p) => !currentIds.has(p.poi_id))
						.map((p) => ({ ...p, isSuggested: true }));

					if (newRecs.length > 0) {
						// Update hasMore as side effect - this is safe inside setState callback
						// but we need to do it outside. However, we can't reliably know if we added items
						// unless we check here.
						// Since we can't call setHasMore inside setPois updater (it's impure),
						// we'll just append and trust the effect.
						// Actually, to set hasMore correctly, we should calculate 'uniqueNewRecs' outside
						// but 'prev' is only known inside.
						// Accepted pattern:
						return [...prev, ...newRecs];
					}
					// If no new records, return strictly prev to avoid re-renders
					return prev;
				});

				// We'll optimistically enable scrolling if we got data from API, even if all were duplicates this time
				// (unlikely to happen in normal expanding scenario)
				if (recs.length > 0) {
					setHasMore(true);
				}
			}
		} catch (err) {
			console.error("Error fetching recommendations:", err);
		}
	}, []);

	// Track initial query string to detect filter changes
	const initialQueryRef = useRef(queryString);
	const hasInitialData = initialData && initialData.length > 0;

	// Automatically fetch when query string changes (skip initial if we have SSR data)
	useEffect(() => {
		// Skip if this is the first render and we have initial data
		if (hasInitialData && queryString === initialQueryRef.current) {
			return;
		}

		setPage(1);
		setHasMore(true);

		fetchFilteredPOIs(1, false).then((data) => {
			if (data && data.results.length < 3) {
				// Result count is low, expand search
				fetchRecommendations();
			}
		});
	}, [fetchFilteredPOIs, queryString, fetchRecommendations, hasInitialData]);

	const loadMore = useCallback(() => {
		if (!loading && hasMore) {
			setPage((prev) => {
				const nextPage = prev + 1;
				fetchFilteredPOIs(nextPage, true);
				return nextPage;
			});
		}
	}, [loading, hasMore, fetchFilteredPOIs]);

	return {
		pois,
		loading,
		error,
		total,
		loadMore,
		hasMore,
		refetch: () => fetchFilteredPOIs(1, false),
	};
}

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFilters, DEFAULT_FILTERS } from "./useFilters";

describe("useFilters hook", () => {
	describe("initialization", () => {
		it("should initialize with default filters", () => {
			const { result } = renderHook(() => useFilters());
			expect(result.current.filters).toEqual(DEFAULT_FILTERS);
			expect(result.current.activeFilterCount).toBe(0);
			expect(result.current.hasActiveFilters).toBe(false);
		});

		it("should initialize with custom filters", () => {
			const initialFilters = { priceRange: 2, wifiQuality: "fast" as const };
			const { result } = renderHook(() => useFilters(initialFilters));

			expect(result.current.filters.priceRange).toBe(2);
			expect(result.current.filters.wifiQuality).toBe("fast");
		});
	});

	describe("setFilter", () => {
		it("should update a single filter value", () => {
			const { result } = renderHook(() => useFilters());

			act(() => {
				result.current.setFilter("priceRange", 3);
			});

			expect(result.current.filters.priceRange).toBe(3);
		});

		it("should update multiple filters independently", () => {
			const { result } = renderHook(() => useFilters());

			act(() => {
				result.current.setFilter("priceRange", 2);
				result.current.setFilter("wifiQuality", "fast");
			});

			expect(result.current.filters.priceRange).toBe(2);
			expect(result.current.filters.wifiQuality).toBe("fast");
		});
	});

	describe("toggleArrayFilter", () => {
		it("should add value to array filter", () => {
			const { result } = renderHook(() => useFilters());

			act(() => {
				result.current.toggleArrayFilter("vibes", "cozy");
			});

			expect(result.current.filters.vibes).toContain("cozy");
		});

		it("should remove value from array filter if already present", () => {
			const { result } = renderHook(() => useFilters());

			act(() => {
				result.current.toggleArrayFilter("vibes", "cozy");
				result.current.toggleArrayFilter("vibes", "cozy");
			});

			expect(result.current.filters.vibes).not.toContain("cozy");
		});

		it("should handle multiple values in array filter", () => {
			const { result } = renderHook(() => useFilters());

			act(() => {
				result.current.toggleArrayFilter("dietaryOptions", "vegan");
				result.current.toggleArrayFilter("dietaryOptions", "halal");
			});

			expect(result.current.filters.dietaryOptions).toEqual(["vegan", "halal"]);
		});
	});

	describe("resetFilters", () => {
		it("should reset all filters to default", () => {
			const { result } = renderHook(() => useFilters());

			act(() => {
				result.current.setFilter("priceRange", 3);
				result.current.toggleArrayFilter("vibes", "cozy");
				result.current.resetFilters();
			});

			expect(result.current.filters).toEqual(DEFAULT_FILTERS);
		});
	});

	describe("applyQuickFilter", () => {
		it("should apply deep_work preset", () => {
			const { result } = renderHook(() => useFilters());

			act(() => {
				result.current.applyQuickFilter("deep_work");
			});

			expect(result.current.filters.wifiQuality).toBe("fast");
			expect(result.current.filters.noiseLevel).toBe("quiet");
			expect(result.current.filters.powerOutlets).toBe("plenty");
		});

		it("should apply date_night preset", () => {
			const { result } = renderHook(() => useFilters());

			act(() => {
				result.current.applyQuickFilter("date_night");
			});

			expect(result.current.filters.vibes).toEqual(["cozy", "luxury"]);
		});

		it("should not reset other filters when applying preset", () => {
			const { result } = renderHook(() => useFilters());

			act(() => {
				result.current.setFilter("priceRange", 3);
				result.current.applyQuickFilter("deep_work");
			});

			expect(result.current.filters.priceRange).toBe(3);
			expect(result.current.filters.wifiQuality).toBe("fast");
		});
	});

	describe("activeFilterCount", () => {
		it("should count active filters correctly", () => {
			const { result } = renderHook(() => useFilters());

			act(() => {
				result.current.setFilter("priceRange", 2);
				result.current.setFilter("wifiQuality", "fast");
				result.current.toggleArrayFilter("vibes", "cozy");
			});

			expect(result.current.activeFilterCount).toBe(3);
		});

		it("should not count null or default values", () => {
			const { result } = renderHook(() => useFilters());

			act(() => {
				result.current.setFilter("priceRange", null);
				result.current.setFilter("wifiQuality", "any");
			});

			expect(result.current.activeFilterCount).toBe(0);
		});

		it("should count array filters by length", () => {
			const { result } = renderHook(() => useFilters());

			act(() => {
				result.current.toggleArrayFilter("vibes", "cozy");
				result.current.toggleArrayFilter("vibes", "luxury");
				result.current.toggleArrayFilter("dietaryOptions", "vegan");
			});

			expect(result.current.activeFilterCount).toBe(3);
		});
	});

	describe("buildQueryString", () => {
		it("should always include status=approved", () => {
			const { result } = renderHook(() => useFilters());
			const queryString = result.current.buildQueryString();

			expect(queryString).toContain("status=approved");
		});

		it("should build query string with single filters", () => {
			const { result } = renderHook(() => useFilters());

			act(() => {
				result.current.setFilter("priceRange", 2);
				result.current.setFilter("wifiQuality", "fast");
			});

			const queryString = result.current.buildQueryString();

			expect(queryString).toContain("price_range=2");
			expect(queryString).toContain("wifi_quality=fast");
		});

		it("should build query string with array filters", () => {
			const { result } = renderHook(() => useFilters());

			act(() => {
				result.current.toggleArrayFilter("vibes", "cozy");
				result.current.toggleArrayFilter("vibes", "luxury");
			});

			const queryString = result.current.buildQueryString();

			expect(queryString).toContain("vibes=cozy%2Cluxury");
		});

		it("should include location for nearest sort", () => {
			const { result } = renderHook(() => useFilters());

			act(() => {
				result.current.setFilter("sortBy", "nearest");
				result.current.setFilter("lat", -8.65);
				result.current.setFilter("lng", 115.14);
			});

			const queryString = result.current.buildQueryString();

			expect(queryString).toContain("sort_by=nearest");
			expect(queryString).toContain("lat=-8.65");
			expect(queryString).toContain("lng=115.14");
		});

		it("should not include recommended in query string", () => {
			const { result } = renderHook(() => useFilters());

			act(() => {
				result.current.setFilter("sortBy", "recommended");
			});

			const queryString = result.current.buildQueryString();

			expect(queryString).not.toContain("sort_by=recommended");
		});
	});

	describe("queryString memoization", () => {
		it("should update queryString when filters change", () => {
			const { result } = renderHook(() => useFilters());
			const initialQueryString = result.current.queryString;

			act(() => {
				result.current.setFilter("priceRange", 3);
			});

			expect(result.current.queryString).not.toBe(initialQueryString);
			expect(result.current.queryString).toContain("price_range=3");
		});
	});
});

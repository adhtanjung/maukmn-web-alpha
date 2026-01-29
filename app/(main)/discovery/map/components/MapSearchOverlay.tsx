"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SearchSuggestion } from "@/app/types/map";
import { FilterDrawer } from "@/app/components/discovery/FilterDrawer";
import { FilterState } from "@/app/hooks/useFilters";

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

export function MapSearchOverlay({
	onSelectLocation,
	isLoading,
	filters,
	onFiltersChange,
	onApplyFilters,
	onResetFilters,
	resultCount,
}: {
	onSelectLocation: (loc: SearchSuggestion) => void;
	isLoading: boolean;
	filters?: FilterState;
	onFiltersChange?: (filters: FilterState) => void;
	onApplyFilters?: () => void;
	onResetFilters?: () => void;
	resultCount?: number;
}) {
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const debounceTimer = useRef<NodeJS.Timeout | null>(null);

	const searchAddress = async (text: string) => {
		if (!text || text.length < 3 || !GEOAPIFY_API_KEY) {
			setSuggestions([]);
			return;
		}

		try {
			const res = await fetch(
				`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
					text
				)}&apiKey=${GEOAPIFY_API_KEY}&limit=5&lang=id`
			);
			if (res.ok) {
				const data = await res.json();
				setSuggestions(
					data.features?.map(
						(f: {
							properties: { formatted: string; lat: number; lon: number };
						}) => ({
							formatted: f.properties.formatted,
							lat: f.properties.lat,
							lon: f.properties.lon,
						})
					) || []
				);
				setShowSuggestions(true);
			}
		} catch (error) {
			console.error("Search error", error);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setQuery(val);
		if (debounceTimer.current) clearTimeout(debounceTimer.current);
		debounceTimer.current = setTimeout(() => searchAddress(val), 300);
	};

	const handleSelect = (s: SearchSuggestion) => {
		setQuery(s.formatted);
		setShowSuggestions(false);
		onSelectLocation(s);
	};

	return (
		<div className="absolute top-20 left-0 right-0 z-30 p-4 bg-linear-to-b from-background/50 to-transparent flex flex-col gap-4 pointer-events-none">
			<div className="flex items-center gap-3 pointer-events-auto relative">
				<div className="flex-1 h-12 bg-background/90 backdrop-blur-md rounded-full shadow-lg flex items-center px-4 border border-border group transition-all focus-within:ring-2 focus-within:ring-primary/50">
					<span className="material-symbols-outlined text-muted-foreground group-focus-within:text-primary transition-colors">
						search
					</span>
					<input
						className="bg-transparent border-none focus:ring-0 text-foreground placeholder-muted-foreground w-full ml-2 text-sm font-medium outline-none"
						placeholder="Search areas, food, drinks..."
						type="text"
						value={query}
						onChange={handleChange}
						onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
						onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
					/>
					{query && (
						<button
							onClick={() => {
								setQuery("");
								setSuggestions([]);
							}}
							className="text-muted-foreground hover:text-foreground"
						>
							<span className="material-symbols-outlined text-[18px]">
								close
							</span>
						</button>
					)}
					{isLoading && (
						<span className="material-symbols-outlined text-muted-foreground animate-spin text-[18px]">
							progress_activity
						</span>
					)}
				</div>

				<FilterDrawer
					filters={filters}
					onFiltersChange={onFiltersChange}
					onApply={onApplyFilters}
					onReset={onResetFilters}
					resultCount={resultCount}
					loading={isLoading}
				>
					<Button
						size="icon"
						className="h-12 w-12 bg-primary backdrop-blur-md rounded-full border border-primary/20 shadow-lg hover:bg-primary/90 shrink-0"
					>
						<span className="material-symbols-outlined text-primary-foreground">
							tune
						</span>
						{/* Optional: Add active state identifier if needed in future */}
					</Button>
				</FilterDrawer>

				{showSuggestions && suggestions.length > 0 && (
					<div className="absolute top-full left-0 right-16 mt-2 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
						{suggestions.map((s, idx) => (
							<button
								key={idx}
								onClick={() => handleSelect(s)}
								className="w-full px-4 py-3 text-left hover:bg-accent text-sm text-foreground border-b border-border flex gap-3"
							>
								<span className="material-symbols-outlined text-primary text-[18px]">
									location_on
								</span>
								<span className="line-clamp-2">{s.formatted}</span>
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

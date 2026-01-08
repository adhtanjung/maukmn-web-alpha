"use client";

import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { FilterState } from "@/app/hooks/useFilters";

// Sub-components
import { FilterQuickActions } from "./filters/FilterQuickActions";
import { FilterEssentials } from "./filters/FilterEssentials";
import { FilterWorkMode } from "./filters/FilterWorkMode";
import { FilterAtmosphere } from "./filters/FilterAtmosphere";
import { FilterLogistics } from "./filters/FilterLogistics";

export interface FilterDrawerProps {
	children: React.ReactNode;
	// Controlled mode props
	filters?: FilterState;
	onFiltersChange?: (filters: FilterState) => void;
	onApply?: () => void;
	onReset?: () => void;
	resultCount?: number;
	loading?: boolean;
}

// Default filter values for internal state
const DEFAULT_INTERNAL_FILTERS: FilterState = {
	sortBy: "recommended",
	priceRange: 2,
	wifiQuality: "fast",
	noiseLevel: "moderate",
	powerOutlets: "plenty",
	vibes: [],
	crowdType: [],
	dietaryOptions: [],
	seatingOptions: [],
	parkingOptions: [],
	hasAC: null,
	cuisine: null,
};

export function FilterDrawer({
	children,
	filters: controlledFilters,
	onFiltersChange,
	onApply,
	onReset,
	resultCount,
	loading = false,
}: FilterDrawerProps) {
	// Use internal state if not controlled
	const [internalFilters, setInternalFilters] = useState<FilterState>(
		DEFAULT_INTERNAL_FILTERS
	);

	// Determine if we're in controlled mode
	const isControlled =
		controlledFilters !== undefined && onFiltersChange !== undefined;

	const currentFilters = isControlled ? controlledFilters : internalFilters;

	// Update handler for single values
	const updateFilter = useCallback(
		<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
			if (isControlled && onFiltersChange) {
				onFiltersChange({ ...currentFilters, [key]: value });
			} else {
				setInternalFilters((prev) => ({ ...prev, [key]: value }));
			}
		},
		[isControlled, onFiltersChange, currentFilters]
	);

	// Toggle handler for array values
	const toggleSelection = useCallback(
		(
			key:
				| "vibes"
				| "crowdType"
				| "dietaryOptions"
				| "seatingOptions"
				| "parkingOptions",
			item: string
		) => {
			const currentArray = currentFilters[key] || [];
			const newArray = currentArray.includes(item)
				? currentArray.filter((i: string) => i !== item)
				: [...currentArray, item];

			updateFilter(key, newArray);
		},
		[currentFilters, updateFilter]
	);

	// Reset handler
	const handleReset = useCallback(() => {
		if (onReset) {
			onReset();
		} else {
			setInternalFilters(DEFAULT_INTERNAL_FILTERS);
		}
	}, [onReset]);

	// Apply handler
	const handleApply = useCallback(() => {
		if (onApply) {
			onApply();
		}
	}, [onApply]);

	// Quick filter handler
	const handleQuickFilter = useCallback(
		(presetId: string) => {
			const presets: Record<string, Partial<FilterState>> = {
				deep_work: {
					wifiQuality: "fast",
					noiseLevel: "quiet",
					powerOutlets: "plenty",
				},
				client_meeting: {
					noiseLevel: "moderate",
					vibes: ["luxury", "minimalist"],
				},
				date_night: { vibes: ["cozy", "luxury"] },
			};
			const preset = presets[presetId];
			if (preset) {
				if (isControlled && onFiltersChange) {
					onFiltersChange({ ...currentFilters, ...preset });
				} else {
					setInternalFilters((prev) => ({ ...prev, ...preset }));
				}
			}
		},
		[isControlled, onFiltersChange, currentFilters]
	);

	return (
		<Drawer>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent className="bg-background-dark border-white/10 h-[94%] max-w-[430px] mx-auto rounded-t-xl">
				<div className="flex flex-col h-full overflow-hidden">
					{/* Header */}
					<div className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-background-dark/95 backdrop-blur-md z-20 shrink-0">
						<DrawerTitle className="text-xl font-bold text-white tracking-tight">
							Filters
						</DrawerTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleReset}
							className="text-primary hover:text-primary-dark hover:bg-transparent -mr-2"
						>
							Reset
						</Button>
					</div>

					{/* Content */}
					<div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5 pb-36">
						<FilterQuickActions onQuickFilter={handleQuickFilter} />

						<FilterEssentials
							sortBy={currentFilters.sortBy}
							priceRange={currentFilters.priceRange}
							onSortChange={(val) => updateFilter("sortBy", val)}
							onPriceChange={(val) => updateFilter("priceRange", val)}
						/>

						<FilterWorkMode
							wifiQuality={currentFilters.wifiQuality || "any"}
							noiseLevel={currentFilters.noiseLevel || "moderate"}
							powerOutlets={currentFilters.powerOutlets || "any"}
							seatingOptions={currentFilters.seatingOptions}
							onWifiChange={(val) => updateFilter("wifiQuality", val)}
							onNoiseChange={(val) => updateFilter("noiseLevel", val)}
							onOutletsChange={(val) => updateFilter("powerOutlets", val)}
							onSeatingToggle={(val) => toggleSelection("seatingOptions", val)}
						/>

						<FilterAtmosphere
							vibes={currentFilters.vibes}
							crowdType={currentFilters.crowdType}
							onVibeToggle={(val) => toggleSelection("vibes", val)}
							onCrowdToggle={(val) => toggleSelection("crowdType", val)}
						/>

						<FilterLogistics
							dietaryOptions={currentFilters.dietaryOptions}
							cuisine={currentFilters.cuisine}
							parkingOptions={currentFilters.parkingOptions}
							onDietaryToggle={(val) => toggleSelection("dietaryOptions", val)}
							onCuisineChange={(val) => updateFilter("cuisine", val)}
							onParkingToggle={(val) => toggleSelection("parkingOptions", val)}
						/>
					</div>

					<div className="p-4 border-t border-white/5 bg-background-dark/95 backdrop-blur-xl shrink-0">
						<DrawerClose asChild>
							<Button
								onClick={handleApply}
								disabled={loading}
								className="w-full h-12 bg-primary hover:bg-primary-dark text-white text-[15px] font-bold rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.25)] transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-50"
							>
								{loading
									? "Loading..."
									: `Show ${
											resultCount !== undefined ? resultCount : 124
									  } Results`}
							</Button>
						</DrawerClose>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}

import Link from "next/link";
import { FilterDrawer } from "./FilterDrawer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterState } from "@/app/hooks/useFilters";
import { GlassSurface } from "@/components/ui/GlassSurface";

interface TopHeaderProps {
	filters?: FilterState;
	onFiltersChange?: (filters: FilterState) => void;
	onApply?: () => void;
	onReset?: () => void;
	resultCount?: number;
	loading?: boolean;
}

export default function TopHeader({
	filters,
	onFiltersChange,
	onApply,
	onReset,
	resultCount,
	loading,
}: TopHeaderProps) {
	// Calculate active filter count
	const activeFilterCount = filters
		? (filters.priceRange !== 2 ? 1 : 0) + // Default price is 2 ($$)
			(filters.wifiQuality ? 1 : 0) +
			(filters.noiseLevel ? 1 : 0) +
			(filters.powerOutlets ? 1 : 0) +
			(filters.vibes?.length || 0) +
			(filters.crowdType?.length || 0) +
			(filters.dietaryOptions?.length || 0) +
			(filters.seatingOptions?.length || 0) +
			(filters.parkingOptions?.length || 0) +
			(filters.hasAC !== null ? 1 : 0) +
			(filters.cuisine ? 1 : 0)
		: 0;

	return (
		<div className="absolute top-0 left-0 w-full z-50 pointer-events-none">
			<div className="absolute inset-0 h-32 "></div>
			<div className="absolute top-0 w-full pt-[calc(1rem+env(safe-area-inset-top))] pb-2 px-4 flex flex-col gap-3 pointer-events-auto">
				{/* Top Row: Search, Map, Auth */}
				<div className="flex items-center gap-3 w-full">
					{/* Search Bar */}
					<GlassSurface
						interactive
						className="flex-1 h-12 flex items-center px-4 gap-3 active:scale-[0.99]"
					>
						<span className="material-symbols-outlined text-muted-foreground text-xl">
							search
						</span>
						<input
							className="bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-[15px] font-medium w-full h-full p-0 focus:ring-0"
							disabled
							placeholder="Search places, categories..."
							type="text"
						/>
					</GlassSurface>

					{/* Map Button */}
					<Link href="/discovery/map">
						<GlassSurface
							as="button"
							interactive
							className="w-12 h-12 flex items-center justify-center text-foreground active:scale-95"
						>
							<span className="material-symbols-outlined">map</span>
						</GlassSurface>
					</Link>
				</div>

				{/* Bottom Row: Filters */}
				<div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar w-full -mx-4 px-4 mask-linear-fade">
					<FilterDrawer
						filters={filters}
						onFiltersChange={onFiltersChange}
						onApply={onApply}
						onReset={onReset}
						resultCount={resultCount}
						loading={loading}
					>
						<GlassSurface
							as="button"
							id="filter-drawer-trigger"
							suppressHydrationWarning
							variant="pill"
							interactive
							className="h-9 pl-1 pr-3 flex items-center gap-2 shrink-0 hover:border-primary/50 active:scale-95"
						>
							<div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-sm">
								<span className="material-symbols-outlined text-primary-foreground text-base">
									tune
								</span>
							</div>
							<span className="text-xs font-bold text-foreground tracking-wide">
								Filter ({activeFilterCount})
							</span>
						</GlassSurface>
					</FilterDrawer>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<GlassSurface
								as="button"
								id="sort-menu-trigger"
								suppressHydrationWarning
								variant="pill"
								interactive
								className="h-9 px-3.5 flex items-center gap-1.5 shrink-0"
							>
								<span className="text-xs font-medium text-foreground">
									Sort By
								</span>
								<span className="material-symbols-outlined text-muted-foreground text-lg">
									sort
								</span>
							</GlassSurface>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="bg-popover/80 backdrop-blur-xl border-border/50 text-popover-foreground min-w-[150px]">
							<DropdownMenuItem className="text-xs font-medium cursor-pointer">
								Recommended
							</DropdownMenuItem>
							<DropdownMenuItem className="text-xs font-medium cursor-pointer">
								Nearest
							</DropdownMenuItem>
							<DropdownMenuItem className="text-xs font-medium cursor-pointer">
								Top Rated
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<GlassSurface
						as="button"
						variant="pill"
						interactive
						className="h-9 px-3.5 flex items-center gap-1.5 shrink-0"
					>
						<span className="text-xs font-medium text-foreground">
							All Categories
						</span>
						<span className="material-symbols-outlined text-muted-foreground text-lg">
							expand_more
						</span>
					</GlassSurface>
					<GlassSurface
						as="button"
						variant="pill"
						interactive
						className="h-9 pl-3.5 pr-2 flex items-center gap-2 shrink-0"
					>
						<span className="text-xs font-medium text-foreground">
							Open Now
						</span>
						<span className="material-symbols-outlined text-primary text-2xl -my-1 font-variation-settings-filled">
							toggle_on
						</span>
					</GlassSurface>
					<GlassSurface
						as="button"
						variant="pill"
						interactive
						className="h-9 px-3.5 flex items-center gap-1.5 shrink-0"
					>
						<span className="text-xs font-medium text-foreground">
							Fast Wifi
						</span>
						<span className="material-symbols-outlined text-muted-foreground text-base">
							add
						</span>
					</GlassSurface>
					<GlassSurface
						variant="pill"
						className="h-9 p-1 flex items-center shrink-0"
					>
						<button className="w-8 h-full rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm">
							$
						</button>
						<button className="w-8 h-full rounded-full text-muted-foreground text-[11px] font-medium flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-colors">
							$$
						</button>
						<button className="w-8 h-full rounded-full text-muted-foreground text-[11px] font-medium flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-colors">
							$$$
						</button>
					</GlassSurface>
					<GlassSurface
						as="button"
						variant="pill"
						interactive
						className="h-9 px-3.5 flex items-center gap-1.5 shrink-0"
					>
						<span className="text-xs font-medium text-foreground">Nearby</span>
						<span className="material-symbols-outlined text-muted-foreground text-lg">
							expand_more
						</span>
					</GlassSurface>
					<div className="w-4 shrink-0"></div>
				</div>
			</div>
		</div>
	);
}

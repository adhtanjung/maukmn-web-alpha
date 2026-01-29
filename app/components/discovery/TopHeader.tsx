import Link from "next/link";
import { FilterDrawer } from "./FilterDrawer";
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
	return (
		<div className="absolute top-0 left-0 w-full z-50 pointer-events-none">
			<div className="absolute inset-0 h-32 bg-linear-to-b from-black/60 to-transparent pointer-events-none" />
			<div className="absolute top-0 w-full pt-[calc(1rem+env(safe-area-inset-top))] pb-2 px-4 flex justify-end gap-3 pointer-events-auto">
				{/* Top Right Actions: Search & Map */}

				{/* Search Button - Triggers Search/Filter Mode */}
				<GlassSurface
					as="button"
					interactive
					className="w-12 h-12 flex items-center justify-center text-foreground active:scale-95 rounded-full"
					onClick={() => {
						// TODO: Trigger search/filter mode
						// For now, we can perhaps toggle the filter drawer or just log
						const drawerTrigger = document.getElementById(
							"filter-drawer-trigger",
						);
						if (drawerTrigger) drawerTrigger.click();
					}}
				>
					<span className="material-symbols-outlined text-[26px]">search</span>
				</GlassSurface>

				{/* Map Button */}
				<Link href="/discovery/map">
					<GlassSurface
						as="button"
						interactive
						className="w-12 h-12 flex items-center justify-center text-foreground active:scale-95 rounded-full"
					>
						<span className="material-symbols-outlined text-[26px] filled">
							map
						</span>
					</GlassSurface>
				</Link>

				{/* Hidden Filter Trigger to keep FilterDrawer logic working for now if needed,
				    or we can refactor FilterDrawer to be controlled.
					For this step, I'm keeping the FilterDrawer accessible via the search button as a quick hack
					or just hiding it until the dedicated screen is built.
					The prompt says: "When the user taps the search icon, then you can transition to a dedicated search/filter screen."
					I will wrap the Search button in the FilterDrawer for now so it still works!
				*/}
			</div>

			{/* Hidden Drawer Trigger for Logic continuity */}
			<div className="hidden">
				<FilterDrawer
					filters={filters}
					onFiltersChange={onFiltersChange}
					onApply={onApply}
					onReset={onReset}
					resultCount={resultCount}
					loading={loading}
				>
					<button id="filter-drawer-trigger">Open</button>
				</FilterDrawer>
			</div>
		</div>
	);
}

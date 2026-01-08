import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { FilterDrawer } from "./FilterDrawer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterState } from "@/app/hooks/useFilters";

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
			<div className="absolute inset-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent"></div>
			<div className="absolute top-0 w-full pt-4 pb-2 px-4 flex flex-col gap-3 pointer-events-auto">
				{/* Top Row: Search, Map, Auth */}
				<div className="flex items-center gap-3 w-full">
					{/* Search Bar */}
					<div className="flex-1 h-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center px-4 gap-3 shadow-lg active:scale-[0.99] transition-transform">
						<span className="material-symbols-outlined text-white/50">
							search
						</span>
						<input
							className="bg-transparent border-none outline-none text-white placeholder-white/50 text-[15px] font-medium w-full h-full p-0 focus:ring-0"
							disabled
							placeholder="Search places, categories..."
							type="text"
						/>
					</div>

					{/* Map Button */}
					<Link href="/discovery/map">
						<button className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white shadow-lg active:scale-95 transition-all hover:bg-white/20">
							<span className="material-symbols-outlined">map</span>
						</button>
					</Link>

					{/* Auth Button */}
					<div className="w-12 h-12 flex items-center justify-center">
						<SignedOut>
							<SignInButton mode="modal">
								<button
									className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-primary shadow-lg active:scale-95 transition-all hover:bg-white/20"
									title="Sign In"
								>
									<span className="material-symbols-outlined">login</span>
								</button>
							</SignInButton>
						</SignedOut>
						<SignedIn>
							<UserButton
								appearance={{
									elements: {
										avatarBox:
											"w-12 h-12 rounded-2xl border border-white/10 shadow-lg",
									},
								}}
							/>
						</SignedIn>
					</div>
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
						<button className="h-9 pl-1 pr-3 rounded-full bg-surface-dark border border-white/15 flex items-center gap-2 shrink-0 shadow-md active:scale-95 transition-transform hover:border-primary/50">
							<div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
								<span className="material-symbols-outlined text-primary text-[16px]!">
									tune
								</span>
							</div>
							<span className="text-xs font-bold text-white tracking-wide">
								Filter ({activeFilterCount})
							</span>
						</button>
					</FilterDrawer>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className="h-9 px-3.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 shrink-0 backdrop-blur-md active:bg-white/10 transition-colors">
								<span className="text-xs font-medium text-white/90">
									Sort By
								</span>
								<span className="material-symbols-outlined text-white/60 text-[18px]!">
									sort
								</span>
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="bg-background-dark border-white/10 text-white min-w-[150px]">
							<DropdownMenuItem className="text-xs font-medium focus:bg-white/10 focus:text-white cursor-pointer">
								Recommended
							</DropdownMenuItem>
							<DropdownMenuItem className="text-xs font-medium focus:bg-white/10 focus:text-white cursor-pointer">
								Nearest
							</DropdownMenuItem>
							<DropdownMenuItem className="text-xs font-medium focus:bg-white/10 focus:text-white cursor-pointer">
								Top Rated
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<button className="h-9 px-3.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 shrink-0 backdrop-blur-md active:bg-white/10 transition-colors">
						<span className="text-xs font-medium text-white/90">
							All Categories
						</span>
						<span className="material-symbols-outlined text-white/60 text-[18px]!">
							expand_more
						</span>
					</button>
					<button className="h-9 pl-3.5 pr-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 shrink-0 backdrop-blur-md active:bg-white/10 transition-colors">
						<span className="text-xs font-medium text-white/90">Open Now</span>
						<span className="material-symbols-outlined text-primary text-[28px]! -my-1">
							toggle_on
						</span>
					</button>
					<button className="h-9 px-3.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 shrink-0 backdrop-blur-md active:bg-white/10 transition-colors">
						<span className="text-xs font-medium text-white/90">Fast Wifi</span>
						<span className="material-symbols-outlined text-white/60 text-[16px]!">
							add
						</span>
					</button>
					<div className="h-9 p-1 rounded-full bg-white/5 border border-white/10 flex items-center shrink-0 backdrop-blur-md">
						<button className="w-8 h-full rounded-full bg-primary/20 border border-primary/30 text-white text-[11px] font-bold flex items-center justify-center hover:bg-primary/30 transition-colors shadow-sm">
							$
						</button>
						<button className="w-8 h-full rounded-full text-white/40 text-[11px] font-medium flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors">
							$$
						</button>
						<button className="w-8 h-full rounded-full text-white/40 text-[11px] font-medium flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors">
							$$$
						</button>
					</div>
					<button className="h-9 px-3.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 shrink-0 backdrop-blur-md active:bg-white/10 transition-colors">
						<span className="text-xs font-medium text-white/90">Nearby</span>
						<span className="material-symbols-outlined text-white/60 text-[18px]!">
							expand_more
						</span>
					</button>
					<div className="w-4 shrink-0"></div>
				</div>
			</div>
		</div>
	);
}

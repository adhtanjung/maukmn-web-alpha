"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface FilterEssentialsProps {
	sortBy: "recommended" | "nearest" | "top_rated";
	priceRange: number | null;
	onSortChange: (val: "recommended" | "nearest" | "top_rated") => void;
	onPriceChange: (val: number) => void;
}

export function FilterEssentials({
	sortBy,
	priceRange,
	onSortChange,
	onPriceChange,
}: FilterEssentialsProps) {
	return (
		<div className="space-y-4">
			<h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">
				Essentials
			</h3>

			<div className="space-y-2">
				<label className="text-sm font-medium text-white/90">Sort By</label>
				<ToggleGroup
					type="single"
					value={sortBy}
					onValueChange={(val) =>
						val && onSortChange(val as "recommended" | "nearest" | "top_rated")
					}
					className="flex bg-surface-dark p-1 rounded-xl border border-white/5 w-full justify-start"
				>
					<ToggleGroupItem
						value="recommended"
						className="flex-1 py-3 rounded-lg data-[state=on]:bg-white/10 data-[state=on]:text-white text-white/50 text-xs font-medium transition-all"
					>
						Recommended
					</ToggleGroupItem>
					<ToggleGroupItem
						value="nearest"
						className="flex-1 py-3 rounded-lg data-[state=on]:bg-white/10 data-[state=on]:text-white text-white/50 text-xs font-medium transition-all"
					>
						Nearest
					</ToggleGroupItem>
					<ToggleGroupItem
						value="top_rated"
						className="flex-1 py-3 rounded-lg data-[state=on]:bg-white/10 data-[state=on]:text-white text-white/50 text-xs font-medium transition-all"
					>
						Top Rated
					</ToggleGroupItem>
				</ToggleGroup>
			</div>

			<div className="space-y-2">
				<label className="text-xs font-medium text-white/90">Price Range</label>
				<ToggleGroup
					type="single"
					value={priceRange ? "$".repeat(priceRange) : undefined}
					onValueChange={(val) => val && onPriceChange(val.length)}
					className="flex gap-2 w-full"
				>
					{["$", "$$", "$$$", "$$$$"].map((price) => (
						<ToggleGroupItem
							key={price}
							value={price}
							className="flex-1 h-9 rounded-lg border border-white/10 bg-white/5 text-white/50 text-xs font-medium data-[state=on]:border-primary data-[state=on]:bg-primary/20 data-[state=on]:text-primary transition-all"
						>
							{price}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			</div>
		</div>
	);
}

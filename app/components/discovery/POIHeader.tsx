"use client";

export function POIHeader({
	name,
	category,
	openStatus,
	priceDisplay,
	description,
	rating,
	reviewCount,
	distance,
	isLoadingDistance,
}: {
	name: string;
	category: string;
	openStatus: { isOpen: boolean };
	priceDisplay: string;
	description: string;
	rating?: number;
	reviewCount?: number;
	distance?: string;
	isLoadingDistance?: boolean;
}) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight shadow-black drop-shadow-lg">
						{name}
					</h1>
					<div className="flex items-center gap-2 mt-1">
						<p className="text-muted-foreground font-medium text-sm">
							{category}
						</p>
						<span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
						{openStatus.isOpen ? (
							<div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
								<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
								<span className="text-xs font-bold uppercase tracking-wide">
									Open Now
								</span>
							</div>
						) : (
							<div className="flex items-center gap-1 text-destructive-foreground bg-destructive/90 px-2 py-0.5 rounded-full border border-destructive/20 shadow-sm shadow-destructive/20">
								<span className="text-xs font-bold uppercase tracking-wide">
									Closed
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="flex items-center gap-4 mt-2">
				{rating !== undefined && (
					<div className="flex items-center gap-1.5 bg-card/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5">
						<span className="text-foreground font-black text-lg">{rating}</span>
						<div className="flex text-amber-400">
							<span className="material-symbols-outlined text-[18px] fill-current">
								star
							</span>
						</div>
						{reviewCount !== undefined && (
							<span className="text-muted-foreground text-xs ml-1">
								({reviewCount})
							</span>
						)}
					</div>
				)}
				<div className="flex items-center gap-1 text-muted-foreground text-sm">
					<span className="material-symbols-outlined text-[18px]">sell</span>
					<span>{priceDisplay}</span>
				</div>
				{(distance || isLoadingDistance) && (
					<div className="flex items-center gap-1 text-muted-foreground text-sm">
						<span className="material-symbols-outlined text-[18px]">
							location_on
						</span>
						{isLoadingDistance ? (
							<span className="animate-pulse">Finding location...</span>
						) : (
							<span>{distance}</span>
						)}
					</div>
				)}
			</div>

			<p className="text-muted-foreground text-sm leading-relaxed mt-2 line-clamp-3">
				{description}
			</p>
		</div>
	);
}

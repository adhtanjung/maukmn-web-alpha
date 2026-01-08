"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterAtmosphereProps {
	vibes: string[];
	crowdType: string[];
	onVibeToggle: (vibe: string) => void;
	onCrowdToggle: (crowd: string) => void;
}

export function FilterAtmosphere({
	vibes,
	crowdType,
	onVibeToggle,
	onCrowdToggle,
}: FilterAtmosphereProps) {
	return (
		<div className="space-y-4">
			<h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">
				Vibe & Atmosphere
			</h3>
			<div className="grid grid-cols-3 gap-2">
				{[
					{ name: "Industrial", icon: "factory" },
					{ name: "Cozy", icon: "chair" },
					{ name: "Tropical", icon: "potted_plant" },
					{ name: "Minimalist", icon: "crop_square" },
					{ name: "Luxury", icon: "diamond" },
					{ name: "Retro", icon: "radio" },
					{ name: "Nature", icon: "park" },
				].map((vibe) => {
					const isSelected = vibes.includes(vibe.name.toLowerCase());
					return (
						<Button
							key={vibe.name}
							variant="outline"
							onClick={() => onVibeToggle(vibe.name.toLowerCase())}
							className={cn(
								"h-[60px] w-full rounded-xl border flex flex-col items-center justify-center gap-1 transition-all p-0",
								isSelected
									? "border-primary bg-primary/20 text-primary font-bold shadow-[inset_0_0_0_1px_rgba(16,185,129,0.5)] hover:bg-primary/25 hover:text-primary"
									: "border-white/10 bg-white/5 text-white/60 font-medium hover:bg-white/10 hover:border-white/20 hover:text-white"
							)}
						>
							<span
								className={cn(
									"material-symbols-outlined text-[20px]!",
									isSelected ? "" : "opacity-60"
								)}
							>
								{vibe.icon}
							</span>
							<span className="text-[10px]">{vibe.name}</span>
						</Button>
					);
				})}
			</div>

			<div className="space-y-2 pt-1">
				<label className="text-xs font-medium text-white/90">Crowd</label>
				<div className="flex flex-wrap gap-1.5">
					{["Quiet / Study", "Social / Lively", "Business"].map((crowd) => {
						const isSelected = crowdType.includes(
							crowd.replace(" / ", "_").toLowerCase()
						);
						return (
							<Button
								key={crowd}
								variant="outline"
								size="sm"
								onClick={() =>
									onCrowdToggle(crowd.replace(" / ", "_").toLowerCase())
								}
								className={cn(
									"h-auto py-1.5 px-3 rounded-lg text-[11px] font-medium transition-all border",
									isSelected
										? "border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]"
										: "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
								)}
							>
								{crowd}
							</Button>
						);
					})}
				</div>
			</div>
		</div>
	);
}

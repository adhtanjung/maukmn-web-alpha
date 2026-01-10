"use client";

import { cn } from "@/lib/utils";

interface OutletCardProps {
	value: string;
	label: string;
	current: string;
	onChange: (value: string) => void;
}

export function OutletCard({
	value,
	label,
	current,
	onChange,
}: OutletCardProps) {
	const isSelected = current === value;

	// Physics: Fluid height
	// limited: low red fluid
	// moderate: half yellow/orange fluid
	// plenty: full green fluid

	let height = "h-4";
	let fluidColor = "bg-red-500/20";
	let lineColor = "bg-red-400";

	if (value === "any") {
		height = "h-0";
	} else if (value === "limited") {
		height = "h-4";
		fluidColor = "bg-red-500/20";
		lineColor = "bg-red-400";
	} else if (value === "moderate") {
		height = "h-6";
		fluidColor = "bg-yellow-500/20";
		lineColor = "bg-yellow-400";
	} else if (value === "plenty") {
		height = "h-8";
		fluidColor = "bg-emerald-500/20";
		lineColor = "bg-emerald-400";
	}

	return (
		<button
			onClick={() => onChange(value)}
			className={cn(
				"h-[52px] rounded-xl border flex flex-col items-center justify-center gap-1.5 p-1 transition-colors relative overflow-hidden",
				isSelected
					? "border-primary bg-primary/10 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.3)]"
					: "border-border bg-card hover:bg-muted"
			)}
		>
			<div className="relative w-full flex items-end justify-center">
				{/* The Fluid Container */}
				<div className="w-5 h-6 rounded-[4px] border border-border bg-muted/20 relative overflow-hidden backdrop-blur-sm">
					{/* The Fluid */}
					<div
						className={cn(
							"absolute bottom-0 inset-x-0 transition-all duration-700 ease-in-out",
							isSelected ? `${height} ${fluidColor}` : "h-0"
						)}
					>
						<div
							className={cn(
								"absolute top-0 inset-x-0 h-[1.5px]",
								isSelected ? lineColor : "bg-transparent"
							)}
						/>
					</div>
					{/* Plug Icon Overlay */}
					<div className="absolute inset-0 flex items-center justify-center">
						<span
							className={cn(
								"material-symbols-outlined text-[12px]! transition-colors z-10",
								isSelected ? "text-foreground" : "text-muted-foreground"
							)}
						>
							power
						</span>
					</div>
				</div>
			</div>
			<span
				className={cn(
					"text-[9px] font-medium transition-colors leading-none",
					isSelected ? "text-foreground" : "text-muted-foreground"
				)}
			>
				{label}
			</span>
		</button>
	);
}

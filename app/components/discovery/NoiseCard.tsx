"use client";

import { cn } from "@/lib/utils";

interface NoiseCardProps {
	value: string;
	label: string;
	current: string;
	onChange: (value: string) => void;
}

export function NoiseCard({ value, label, current, onChange }: NoiseCardProps) {
	const isSelected = current === value;

	// Physics: Bar heights (0-100%)
	// silent: flat line (Blue)
	// quiet: small bumps (Cyan)
	// moderate: medium waves (Green)
	// lively: active waves (Orange)
	// loud: erratic spikes (Red)

	let bars: number[] = [20, 20, 20, 20, 20];
	let activeColor = "bg-primary";

	switch (value) {
		case "silent":
			bars = [15, 15, 15, 15, 15];
			activeColor = "bg-sky-400";
			break;
		case "quiet":
			bars = [20, 30, 25, 30, 20];
			activeColor = "bg-cyan-400";
			break;
		case "moderate":
			bars = [30, 50, 40, 55, 35];
			activeColor = "bg-emerald-400";
			break;
		case "lively":
			bars = [40, 75, 50, 80, 45];
			activeColor = "bg-orange-400";
			break;
		case "loud":
			bars = [50, 90, 60, 95, 70];
			activeColor = "bg-red-500";
			break;
	}

	return (
		<button
			onClick={() => onChange(value)}
			className={cn(
				"h-[52px] rounded-xl border flex flex-col items-center justify-center gap-2 p-1 transition-colors relative overflow-hidden",
				isSelected
					? "border-primary bg-primary/10 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.3)]"
					: "border-white/10 bg-white/5 hover:bg-white/10"
			)}
		>
			<div className="flex items-center justify-center gap-[3px] h-5">
				{bars.map((h, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: simple static list
						key={i}
						style={{ height: `${isSelected ? h : 15}%` }}
						className={cn(
							"w-[3px] rounded-full transition-all duration-500 ease-out",
							isSelected ? activeColor : "bg-zinc-700"
						)}
					/>
				))}
			</div>
			<span
				className={cn(
					"text-[9px] font-medium transition-colors leading-none",
					isSelected ? "text-white" : "text-white/50"
				)}
			>
				{label}
			</span>
		</button>
	);
}

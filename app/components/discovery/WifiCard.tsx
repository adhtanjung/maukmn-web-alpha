"use client";

import { cn } from "@/lib/utils";

interface WifiCardProps {
	value: string;
	label: string;
	current: string;
	onChange: (value: string) => void;
}

export function WifiCard({ value, label, current, onChange }: WifiCardProps) {
	const isSelected = current === value;

	// Define the active color palette based on speed
	const colorPalette =
		{
			slow: "text-orange-500",
			moderate: "text-yellow-400",
			fast: "text-emerald-400",
			excellent: "text-teal-400",
			any: "text-zinc-200",
			none: "text-zinc-200",
		}[value] || "text-zinc-200";

	// Define animation speeds
	const pulseSpeed =
		{
			slow: "duration-[3000ms]", // A long, slow breath
			moderate: "duration-[2000ms]", // A lazy wave
			fast: "duration-[1000ms]", // A steady beat
			excellent: "duration-[600ms]", // Rapid fire
		}[value] || "";

	// Logic to determine which arcs are visible based on signal strength
	// 0 = dot only, 1 = small arc, 2 = medium arc, 3 = large arc
	const signalStrength =
		{
			none: 0,
			slow: 1, // Dot + Smallest arc weakly lit
			moderate: 2, // Up to middle arc
			fast: 3, // Full signal
			excellent: 3, // Full signal + high energy
			any: 0,
		}[value] || 0;

	// Helper to determine if a specific arc should be active/colored
	const isActive = (tier: number) => isSelected && signalStrength >= tier;

	// Base classes for the SVG paths
	const arcBaseClass = "transition-all ease-in-out origin-bottom";
	const inactiveColor = "text-zinc-700/50 opacity-50";

	return (
		<button
			onClick={() => onChange(value)}
			className={cn(
				"h-[52px] w-full rounded-xl border flex flex-col items-center justify-center gap-1 p-1 transition-all duration-300 relative overflow-hidden group active:scale-95",
				isSelected
					? cn(
							"bg-primary/5 shadow-[inset_0_0_10px_0_rgba(0,0,0,0.05)] border-primary/20"
					  )
					: "border-white/5 bg-zinc-900/40 hover:bg-white/5 hover:border-white/10"
			)}
		>
			<div className="relative flex items-center justify-center w-full">
				{/* The Wi-Fi Icon SVG */}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 32 32"
					className={cn("w-6 h-6", isSelected ? colorPalette : "text-zinc-600")}
					fill="currentColor"
				>
					{/* ANIMATION STRATEGY:
             We use standard Tailwind `animate-pulse`.
             The key to the "broadcast" effect is staggering the animation using `delay`.
             Dot pulses first, outer arc pulses last.
          */}

					{/* The Dot (Tier 0) */}
					<circle
						cx="16"
						cy="28"
						r="3"
						className={cn(
							arcBaseClass,
							// The dot always pulses if selected to show it's "alive"
							isSelected ? `animate-pulse ${pulseSpeed}` : inactiveColor
						)}
					/>

					{/* Small Arc (Tier 1) */}
					<path
						d="M 8.5 20.5 C 8.5 20.5 12 17 16 17 C 20 17 23.5 20.5 23.5 20.5"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						className={cn(
							arcBaseClass,
							isActive(1) ? `animate-pulse ${pulseSpeed}` : inactiveColor,
							// Stagger delay: 100ms after dot
							isSelected && "delay-100"
						)}
					/>

					{/* Medium Arc (Tier 2) */}
					<path
						d="M 4 16 C 4 16 9 11 16 11 C 23 11 28 16 28 16"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						className={cn(
							arcBaseClass,
							isActive(2) ? `animate-pulse ${pulseSpeed}` : inactiveColor,
							// Stagger delay: 200ms after dot
							isSelected && "delay-200"
						)}
					/>

					{/* Large Arc (Tier 3) */}
					<path
						d="M 0.5 11.5 C 0.5 11.5 7 5 16 5 C 25 5 31.5 11.5 31.5 11.5"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						className={cn(
							arcBaseClass,
							isActive(3) ? `animate-pulse ${pulseSpeed}` : inactiveColor,
							// Stagger delay: 300ms after dot
							isSelected && "delay-300"
						)}
					/>
				</svg>

				{/* Optional: Subtle glow behind the icon for Excellent/Fast */}
				{isSelected && (value === "excellent" || value === "fast") && (
					<div
						className={cn(
							"absolute inset-0 blur-xl opacity-20 scale-150 z-[-1]",
							colorPalette.replace("text-", "bg-")
						)}
					></div>
				)}
			</div>

			<span
				className={cn(
					"text-[9px] font-medium tracking-wide transition-colors duration-300 leading-none",
					isSelected ? "text-white" : "text-white/40"
				)}
			>
				{label}
			</span>
		</button>
	);
}

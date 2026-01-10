"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { POIFormData } from "@/app/contexts/POIFormContext";

const VIBE_OPTIONS = [
	{ value: "industrial", label: "Industrial", icon: "factory" },
	{ value: "cozy", label: "Cozy", icon: "fireplace" },
	{ value: "tropical", label: "Tropical", icon: "beach_access" },
	{ value: "minimalist", label: "Minimalist", icon: "check_box_outline_blank" },
	{ value: "luxury", label: "Luxury", icon: "diamond" },
	{ value: "retro", label: "Retro", icon: "radio" },
	{ value: "nature", label: "Nature", icon: "park" },
] as const;

const LIGHTING_OPTIONS = [
	{
		value: "bright",
		label: "Bright",
		icon: "light_mode",
		// Wide, intense white beam reaching the bottom
		beamClass:
			"bg-[radial-gradient(100%_100%_at_50%_0%,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.4)_50%,transparent_100%)]",
		bulbClass: "bg-white shadow-[0_0_15px_rgba(255,255,255,1)]",
		textColor: "text-zinc-900", // Dark text for contrast against bright light
		iconColor: "text-zinc-900",
	},
	{
		value: "moderate",
		label: "Moderate",
		icon: "wb_twilight",
		// Softer, warm yellow beam fading halfway down
		beamClass:
			"bg-[radial-gradient(80%_90%_at_50%_0%,rgba(255,214,170,0.7)_0%,rgba(255,214,170,0.2)_60%,transparent_100%)]",
		bulbClass: "bg-amber-200 shadow-[0_0_10px_rgba(255,200,100,0.8)]",
		textColor: "text-amber-100",
		iconColor: "text-amber-100",
	},
	{
		value: "dim",
		label: "Dim",
		icon: "dark_mode",
		// Tight, weak, deep orange glow. Very short beam.
		beamClass:
			"bg-[radial-gradient(60%_70%_at_50%_0%,rgba(255,140,0,0.4)_0%,rgba(255,100,0,0.1)_50%,transparent_100%)]",
		bulbClass: "bg-orange-600/50 shadow-[0_0_5px_rgba(255,100,0,0.5)]",
		textColor: "text-zinc-400",
		iconColor: "text-zinc-500",
	},
	{
		value: "natural",
		label: "Natural",
		icon: "wb_sunny",
		// Clean, crisp blue-ish daylight beam.
		beamClass:
			"bg-[radial-gradient(90%_100%_at_50%_0%,rgba(220,240,255,0.7)_0%,rgba(200,230,255,0.2)_60%,transparent_100%)]",
		bulbClass: "bg-sky-100 shadow-[0_0_12px_rgba(200,230,255,0.9)]",
		textColor: "text-sky-100",
		iconColor: "text-sky-200",
	},
] as const;

const CROWD_TYPE_OPTIONS = [
	{ value: "students", label: "Students", icon: "school" },
	{ value: "professionals", label: "Professionals", icon: "work" },
	{ value: "families", label: "Families", icon: "family_restroom" },
	{ value: "tourists", label: "Tourists", icon: "flight" },
	{ value: "locals", label: "Locals", icon: "home" },
	{ value: "mixed", label: "Mixed", icon: "groups" },
] as const;

const CLEANLINESS_OPTIONS = [
	{ value: "poor", label: "Poor", icon: "sentiment_dissatisfied" },
	{ value: "average", label: "Average", icon: "sentiment_neutral" },
	{ value: "clean", label: "Clean", icon: "cleaning_services" },
	{ value: "spotless", label: "Spotless", icon: "star" },
] as const;

export default function AtmosphereTab() {
	const { control, watch, setValue } = useFormContext<POIFormData>();

	const vibes = watch("vibes") || [];
	const crowdType = watch("crowdType") || [];

	const toggleVibe = (vibe: string) => {
		const current = vibes || [];
		if (current.includes(vibe)) {
			setValue(
				"vibes",
				current.filter((v) => v !== vibe)
			);
		} else {
			setValue("vibes", [...current, vibe]);
		}
	};

	const toggleCrowdType = (crowd: string) => {
		const current = crowdType || [];
		if (current.includes(crowd)) {
			setValue(
				"crowdType",
				current.filter((c) => c !== crowd)
			);
		} else {
			setValue("crowdType", [...current, crowd]);
		}
	};

	return (
		<div className="px-4 py-4 space-y-8">
			{/* The Vibe Section */}
			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<Label className="text-primary text-xs font-bold tracking-wider uppercase">
						The Vibe
					</Label>
					<span className="text-muted-foreground text-xs">
						Select all that apply
					</span>
				</div>

				<div className="flex flex-wrap gap-2">
					{VIBE_OPTIONS.map((vibe) => (
						<Button
							key={vibe.value}
							type="button"
							onClick={() => toggleVibe(vibe.value)}
							variant={vibes.includes(vibe.value) ? "default" : "outline"}
							className="rounded-full"
						>
							<span className="material-symbols-outlined text-lg mr-2">
								{vibe.icon}
							</span>
							<span>{vibe.label}</span>
							{vibes.includes(vibe.value) && (
								<span className="material-symbols-outlined text-lg ml-2">
									check
								</span>
							)}
						</Button>
					))}
				</div>
			</section>

			<hr className="border-border" />

			{/* Lighting Section */}
			<section className="space-y-4">
				<Label className="text-primary text-xs font-bold tracking-wider uppercase">
					Lighting
				</Label>

				<Controller
					name="lighting"
					control={control}
					render={({ field }) => (
						<div
							role="radiogroup"
							aria-label="Lighting options"
							className="grid grid-cols-2 gap-4 sm:flex bg-card border border-border rounded-3xl p-4"
						>
							{LIGHTING_OPTIONS.map((option) => {
								const isSelected = field.value === option.value;

								return (
									<Button
										key={option.value}
										type="button"
										role="radio"
										aria-checked={isSelected}
										onClick={() => field.onChange(option.value)}
										variant="ghost"
										className={`
                                    relative group flex-1 h-40 flex-col justify-end pb-4 rounded-2xl overflow-hidden border transition-all duration-300
                                    ${
																			isSelected
																				? "border-primary/50 bg-primary/5"
																				: "border-border/50 hover:border-border hover:bg-muted/30"
																		}
                                `}
									>
										{/* --- 1. THE LIGHT BEAM (The Physics) --- */}
										{/* This div acts as the "Photon Stream" coming from the top */}
										<div
											className={`
                                        absolute top-0 inset-x-0 h-full w-full pointer-events-none transition-opacity duration-500 ease-in-out
                                        ${option.beamClass}
                                        ${
																					isSelected
																						? "opacity-100"
																						: "opacity-0 group-hover:opacity-20"
																				}
                                    `}
										/>

										{/* --- 2. THE LIGHT FIXTURE (The Bulb) --- */}
										{/* A small semi-circle at the top to simulate the source hardware */}
										<div className="absolute top-0 left-0 right-0 flex justify-center">
											<div
												className={`
                                            w-12 h-3 rounded-b-full transition-all duration-500 blur-[2px]
                                            ${
																							isSelected
																								? option.bulbClass
																								: "bg-muted-foreground/20"
																						}
                                        `}
											/>
										</div>

										{/* --- 3. DUST MOTES (Optional Polish) --- */}
										{/* Adds texture to the light beam so it looks like light hitting dust (Tyndall effect) */}
										{isSelected &&
											(field.value === "dim" || field.value === "moderate") && (
												<div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
											)}

										{/* --- 4. ICON & TEXT --- */}
										<div className="relative z-10 flex flex-col items-center gap-2">
											<span
												className={`material-symbols-outlined text-3xl transition-colors duration-300 ${
													isSelected
														? option.iconColor
														: "text-muted-foreground"
												}`}
											>
												{option.icon}
											</span>
											<span
												className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${
													isSelected
														? option.textColor
														: "text-muted-foreground"
												}`}
											>
												{option.label}
											</span>
										</div>
									</Button>
								);
							})}
						</div>
					)}
				/>
			</section>

			{/* Crowd Type Section */}
			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<Label className="text-primary text-xs font-bold tracking-wider uppercase">
						Crowd Type
					</Label>
					<span className="text-muted-foreground text-xs">
						Select all that apply
					</span>
				</div>

				<div className="flex flex-wrap gap-2">
					{CROWD_TYPE_OPTIONS.map((crowd) => (
						<Button
							key={crowd.value}
							type="button"
							onClick={() => toggleCrowdType(crowd.value)}
							variant={crowdType.includes(crowd.value) ? "default" : "outline"}
							className="rounded-full"
						>
							<span className="material-symbols-outlined text-lg mr-2">
								{crowd.icon}
							</span>
							<span>{crowd.label}</span>
							{crowdType.includes(crowd.value) && (
								<span className="material-symbols-outlined text-lg ml-2">
									check
								</span>
							)}
						</Button>
					))}
				</div>
			</section>

			{/* Cleanliness Section */}
			<section className="space-y-4">
				<Label className="text-primary text-xs font-bold tracking-wider uppercase">
					Cleanliness
				</Label>

				<Controller
					name="cleanliness"
					control={control}
					render={({ field }) => (
						<div className="flex flex-wrap gap-2">
							{CLEANLINESS_OPTIONS.map((option) => (
								<Button
									key={option.value}
									type="button"
									onClick={() => field.onChange(option.value)}
									variant={field.value === option.value ? "default" : "outline"}
									className="rounded-full"
								>
									<span className="material-symbols-outlined text-lg mr-2">
										{option.icon}
									</span>
									<span>{option.label}</span>
									{field.value === option.value && (
										<span className="material-symbols-outlined text-lg ml-2">
											check
										</span>
									)}
								</Button>
							))}
						</div>
					)}
				/>
			</section>
		</div>
	);
}

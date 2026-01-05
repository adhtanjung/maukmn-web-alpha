"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { POIFormData } from "@/app/contexts/POIFormContext";

const WIFI_QUALITY_OPTIONS = [
	{ value: "none", label: "None", icon: "wifi_off" },
	{ value: "slow", label: "Slow", icon: "signal_wifi_bad" },
	{ value: "moderate", label: "Moderate", icon: "network_wifi_2_bar" },
	{ value: "fast", label: "Fast", icon: "network_wifi" },
	{ value: "excellent", label: "Excellent", icon: "signal_wifi_4_bar" },
] as const;

const POWER_OUTLETS_OPTIONS = [
	{ value: "none", label: "None", icon: "power_off" },
	{ value: "limited", label: "Limited", icon: "battery_alert" },
	{ value: "moderate", label: "Moderate", icon: "battery_5_bar" },
	{ value: "plenty", label: "Plenty", icon: "power" },
] as const;

const SEATING_OPTIONS = [
	{ id: "ergonomic", label: "Ergonomic Chairs", icon: "chair" },
	{ id: "communal", label: "Communal Tables", icon: "table_restaurant" },
	{ id: "high-tops", label: "High-tops", icon: "chair_alt" },
	{ id: "outdoor", label: "Outdoor", icon: "deck" },
	{ id: "private-booths", label: "Private Booths", icon: "meeting_room" },
] as const;

const NOISE_LEVEL_OPTIONS = [
	{ value: "silent", label: "Silent", icon: "volume_mute" },
	{ value: "quiet", label: "Quiet", icon: "volume_down" },
	{ value: "moderate", label: "Moderate", icon: "volume_up" },
	{ value: "lively", label: "Lively", icon: "groups" },
	{ value: "loud", label: "Loud", icon: "campaign" },
] as const;

export default function WorkProdTab() {
	const { register, control, watch, setValue } = useFormContext<POIFormData>();

	const wifiQuality = watch("wifiQuality");
	const seatingOptions = watch("seatingOptions") || [];

	const toggleSeatingOption = (option: string) => {
		const current = seatingOptions || [];
		if (current.includes(option)) {
			setValue(
				"seatingOptions",
				current.filter((o) => o !== option)
			);
		} else {
			setValue("seatingOptions", [...current, option]);
		}
	};

	return (
		<div className="px-4 py-4 space-y-8">
			{/* Connectivity Section */}
			<section className="space-y-4">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Connectivity
				</Label>

				{/* WiFi Quality */}
				<div className="space-y-3">
					<Label className="text-foreground text-sm font-medium">
						WiFi Quality
					</Label>
					<div className="flex flex-wrap gap-2">
						{WIFI_QUALITY_OPTIONS.map((option) => {
							const isSelected = wifiQuality === option.value;
							return (
								<Button
									key={option.value}
									type="button"
									onClick={() => setValue("wifiQuality", option.value)}
									variant={isSelected ? "default" : "outline"}
									className="rounded-full"
								>
									<span className="material-symbols-outlined text-lg mr-2">
										{option.icon}
									</span>
									<span>{option.label}</span>
									{isSelected && (
										<span className="material-symbols-outlined text-lg ml-2">
											check
										</span>
									)}
								</Button>
							);
						})}
					</div>
				</div>
			</section>

			{/* Environment Section */}
			<section className="space-y-4">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Environment
				</Label>

				{/* Power Outlets */}
				<div className="space-y-3">
					<Label className="text-foreground text-sm font-medium">
						Power Outlets
					</Label>
					<Controller
						name="powerOutlets"
						control={control}
						render={({ field }) => (
							<div className="flex flex-wrap gap-2">
								{POWER_OUTLETS_OPTIONS.map((option) => {
									const isSelected = field.value === option.value;
									return (
										<Button
											key={option.value}
											type="button"
											onClick={() => field.onChange(option.value)}
											variant={isSelected ? "default" : "outline"}
											className="rounded-full"
										>
											<span className="material-symbols-outlined text-lg mr-2">
												{option.icon}
											</span>
											<span>{option.label}</span>
											{isSelected && (
												<span className="material-symbols-outlined text-lg ml-2">
													check
												</span>
											)}
										</Button>
									);
								})}
							</div>
						)}
					/>
				</div>

				{/* Noise Level */}
				<div className="space-y-3">
					<Label className="text-foreground text-sm font-medium">
						Noise Level
					</Label>
					<Controller
						name="noiseLevel"
						control={control}
						render={({ field }) => (
							<div className="flex flex-wrap gap-2">
								{NOISE_LEVEL_OPTIONS.map((option) => {
									const isSelected = field.value === option.value;
									return (
										<Button
											key={option.value}
											type="button"
											onClick={() => field.onChange(option.value)}
											variant={isSelected ? "default" : "outline"}
											className="rounded-full"
										>
											<span className="material-symbols-outlined text-lg mr-2">
												{option.icon}
											</span>
											<span>{option.label}</span>
											{isSelected && (
												<span className="material-symbols-outlined text-lg ml-2">
													check
												</span>
											)}
										</Button>
									);
								})}
							</div>
						)}
					/>
				</div>
			</section>

			{/* Comfort & Seating Section */}
			<section className="space-y-4">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Comfort & Seating
				</Label>

				{/* Seating Options */}
				<div className="space-y-3">
					<Label className="text-foreground text-sm font-medium">
						Seating Options
					</Label>
					<div className="flex flex-wrap gap-2">
						{SEATING_OPTIONS.map((option) => {
							const isSelected = seatingOptions.includes(option.id);
							return (
								<Button
									key={option.id}
									type="button"
									onClick={() => toggleSeatingOption(option.id)}
									variant={isSelected ? "default" : "outline"}
									className="rounded-full"
								>
									<span className="material-symbols-outlined text-lg mr-2">
										{option.icon}
									</span>
									<span>{option.label}</span>
									{isSelected && (
										<span className="material-symbols-outlined text-lg ml-2">
											check
										</span>
									)}
								</Button>
							);
						})}
					</div>
				</div>
			</section>

			{/* Facilities Section */}
			<section className="space-y-4">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Facilities
				</Label>

				{/* Air Conditioning */}
				<div className="flex items-center justify-between bg-surface-card border border-surface-border rounded-xl p-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center">
							<span className="material-symbols-outlined text-primary text-2xl leading-none">
								ac_unit
							</span>
						</div>
						<div>
							<p className="text-foreground font-medium">Air Conditioning</p>
							<p className="text-muted-foreground text-sm">
								Climate controlled space
							</p>
						</div>
					</div>
					<Controller
						name="hasAC"
						control={control}
						render={({ field }) => (
							<Switch checked={field.value} onCheckedChange={field.onChange} />
						)}
					/>
				</div>
			</section>
		</div>
	);
}

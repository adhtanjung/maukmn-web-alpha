"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { POIFormData } from "@/app/contexts/POIFormContext";

export default function SocialLifestyleTab() {
	const { register, control } = useFormContext<POIFormData>();

	return (
		<div className="px-4 py-4 space-y-8">
			{/* Policies Section */}
			<section className="space-y-4">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Policies
				</Label>

				{/* Kid Friendly */}
				<div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center">
							<span className="material-symbols-outlined text-primary text-2xl leading-none">
								family_restroom
							</span>
						</div>
						<div>
							<p className="text-foreground font-medium">Kid Friendly</p>
							<p className="text-muted-foreground text-sm">
								Suitable for families with children
							</p>
						</div>
					</div>
					<Controller
						name="kidsFriendly"
						control={control}
						render={({ field }) => (
							<Switch checked={field.value} onCheckedChange={field.onChange} />
						)}
					/>
				</div>

				{/* Smoker Friendly */}
				<div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center">
							<span className="material-symbols-outlined text-primary text-2xl leading-none">
								smoking_rooms
							</span>
						</div>
						<div>
							<p className="text-foreground font-medium">Smoker Friendly</p>
							<p className="text-muted-foreground text-sm">
								Designated smoking areas available
							</p>
						</div>
					</div>
					<Controller
						name="smokerFriendly"
						control={control}
						render={({ field }) => (
							<Switch checked={field.value} onCheckedChange={field.onChange} />
						)}
					/>
				</div>

				{/* Pet Policy */}
				<div className="space-y-2">
					<Label className="text-foreground text-sm font-medium">
						Pet Policy
					</Label>
					<Input
						type="text"
						placeholder="e.g. Dogs allowed on patio only"
						{...register("petPolicy")}
						className="h-12"
					/>
					<p className="text-muted-foreground text-xs">
						Specify restrictions or allowed areas for animals.
					</p>
				</div>
			</section>

			{/* Additional Info Section */}
			<section className="space-y-4">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Additional Info
				</Label>

				{/* Happy Hour */}
				<div className="space-y-2">
					<Label className="text-foreground text-sm font-medium">
						Happy Hour Info
					</Label>
					<Input
						type="text"
						placeholder="e.g. 5-7pm daily, 50% off drinks"
						{...register("happyHourInfo")}
						className="h-12"
					/>
				</div>

				{/* Loyalty Program */}
				<div className="space-y-2">
					<Label className="text-foreground text-sm font-medium">
						Loyalty Program
					</Label>
					<Textarea
						placeholder="e.g. Earn 1 point per $10 spent, redeem for free items..."
						{...register("loyaltyProgram")}
						rows={3}
					/>
				</div>
			</section>
		</div>
	);
}

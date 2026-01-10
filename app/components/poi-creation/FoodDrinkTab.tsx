import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { POIFormData } from "@/app/contexts/POIFormContext";

const CUISINE_OPTIONS = [
	{ value: "italian", label: "Italian", icon: "restaurant" },
	{ value: "japanese", label: "Japanese", icon: "ramen_dining" },
	{ value: "fusion", label: "Fusion", icon: "restaurant_menu" },
	{ value: "streetfood", label: "Street Food", icon: "fastfood" },
	{ value: "cafe", label: "Cafe", icon: "local_cafe" },
	{ value: "dessert", label: "Dessert", icon: "cake" },
] as const;

const PRICE_LEVELS = [
	{ value: 1, label: "$" },
	{ value: 2, label: "$$" },
	{ value: 3, label: "$$$" },
	{ value: 4, label: "$$$$" },
] as const;

const DIETARY_OPTIONS = [
	{ value: "vegan", label: "Vegan", icon: "eco" },
	{ value: "vegetarian", label: "Vegetarian", icon: "nutrition" },
	{ value: "halal", label: "Halal", icon: "verified" },
	{ value: "glutenfree", label: "Gluten-Free", icon: "block" },
	{ value: "nutfree", label: "Nut-Free", icon: "cancel" },
] as const;

export default function FoodDrinkTab() {
	const { control, watch, setValue } = useFormContext<POIFormData>();

	const dietaryOptions = watch("dietaryOptions") || [];
	const featuredItems = watch("featuredItems") || [];
	const specials = watch("specials") || [];

	const toggleDietary = (dietary: string) => {
		const current = dietaryOptions || [];
		if (current.includes(dietary)) {
			setValue(
				"dietaryOptions",
				current.filter((d) => d !== dietary)
			);
		} else {
			setValue("dietaryOptions", [...current, dietary]);
		}
	};

	// Helper to convert comma-separated string to array
	const handleFeaturedItemsChange = (value: string) => {
		const items = value
			.split(",")
			.map((item) => item.trim())
			.filter((item) => item.length > 0);
		setValue("featuredItems", items);
	};

	const handleSpecialsChange = (value: string) => {
		const items = value
			.split(",")
			.map((item) => item.trim())
			.filter((item) => item.length > 0);
		setValue("specials", items);
	};

	return (
		<div className="px-4 py-4 space-y-8">
			{/* Cuisine Section */}
			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
						Cuisine
					</Label>
					<Badge variant="secondary" className="bg-primary/20 text-primary">
						Required
					</Badge>
				</div>
				<p className="text-muted-foreground text-sm">
					Select the cuisine type that best describes this spot.
				</p>

				<Controller
					name="cuisine"
					control={control}
					render={({ field }) => (
						<div className="flex flex-wrap gap-2">
							{CUISINE_OPTIONS.map((cuisine) => (
								<Button
									key={cuisine.value}
									type="button"
									onClick={() => field.onChange(cuisine.value)}
									variant={
										field.value === cuisine.value ? "default" : "outline"
									}
									className="rounded-full"
								>
									<span className="material-symbols-outlined text-lg mr-2">
										{cuisine.icon}
									</span>
									{cuisine.label}
									{field.value === cuisine.value && (
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

			{/* Pricing Section */}
			<section className="space-y-4">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Pricing
				</Label>

				<Controller
					name="priceRange"
					control={control}
					render={({ field }) => (
						<div className="bg-card border border-border rounded-2xl p-2 flex">
							{PRICE_LEVELS.map((level) => (
								<Button
									key={level.value}
									type="button"
									onClick={() => field.onChange(level.value)}
									variant={field.value === level.value ? "secondary" : "ghost"}
									className="flex-1 rounded-xl font-bold"
								>
									{level.label}
								</Button>
							))}
						</div>
					)}
				/>
			</section>

			{/* Dietary Options Section */}
			<section className="space-y-4">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Dietary Options
				</Label>

				<div className="flex flex-wrap gap-2">
					{DIETARY_OPTIONS.map((option) => (
						<Button
							key={option.value}
							type="button"
							onClick={() => toggleDietary(option.value)}
							variant={
								dietaryOptions.includes(option.value) ? "default" : "outline"
							}
							className="rounded-full"
						>
							<span className="material-symbols-outlined text-lg mr-2">
								{option.icon}
							</span>
							{option.label}
							{dietaryOptions.includes(option.value) && (
								<span className="material-symbols-outlined text-lg ml-2">
									check
								</span>
							)}
						</Button>
					))}
				</div>
			</section>

			{/* Menu Details Section */}
			<section className="space-y-4">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Menu Details
				</Label>

				{/* Featured Items */}
				<div className="space-y-2">
					<Label className="text-primary text-xs font-bold tracking-wider uppercase">
						Featured Items
					</Label>
					<Textarea
						placeholder="Enter signature dishes separated by commas (e.g. Truffle Fries, Wagyu Burger, Tiramisu)"
						value={featuredItems.join(", ")}
						onChange={(e) => handleFeaturedItemsChange(e.target.value)}
						rows={3}
					/>
					<p className="text-muted-foreground text-xs">
						Separate items with commas
					</p>
				</div>

				{/* Specials */}
				<div className="space-y-2">
					<Label className="text-primary text-xs font-bold tracking-wider uppercase">
						Daily Specials
					</Label>
					<Textarea
						placeholder="Enter daily specials separated by commas (e.g. Monday: Half-price pasta, Weekend: Brunch buffet)"
						value={specials.join(", ")}
						onChange={(e) => handleSpecialsChange(e.target.value)}
						rows={3}
					/>
					<p className="text-muted-foreground text-xs">
						Separate items with commas
					</p>
				</div>
			</section>
		</div>
	);
}

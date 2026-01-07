import { POI } from "@/app/hooks/usePOIs";

interface DynamicBadge {
	icon: string;
	label: string;
	featured?: boolean;
}

/**
 * Generate category-aware "best features" badges based on POI type
 * Shows the most relevant features for each category
 */
export function getDynamicBadges(poi: POI): DynamicBadge[] {
	const badges: DynamicBadge[] = [];
	const categories = poi.category_names || [];
	const categoryStr = categories.join(" ").toLowerCase();

	// Determine POI type from categories
	const isCafe =
		categoryStr.includes("cafe") ||
		categoryStr.includes("coffee") ||
		categoryStr.includes("cowork");
	const isRestaurant =
		categoryStr.includes("restaurant") ||
		categoryStr.includes("food") ||
		categoryStr.includes("dining");
	const isBar =
		categoryStr.includes("bar") ||
		categoryStr.includes("pub") ||
		categoryStr.includes("club");

	// Cafe / Coworking: Prioritize work-related features
	if (isCafe) {
		if (poi.wifi_quality && poi.wifi_quality !== "none") {
			const wifiLabels: Record<string, string> = {
				slow: "WiFi",
				moderate: "Good WiFi",
				fast: "Fast WiFi",
				excellent: "⚡ Fast WiFi",
			};
			badges.push({
				icon: "wifi",
				label: wifiLabels[poi.wifi_quality] || "WiFi",
			});
		}
		if (poi.power_outlets && poi.power_outlets !== "none") {
			const outletLabels: Record<string, string> = {
				limited: "Some Outlets",
				moderate: "Outlets",
				plenty: "Plenty of Outlets",
			};
			badges.push({
				icon: "power",
				label: outletLabels[poi.power_outlets] || "Outlets",
			});
		}
		if (poi.noise_level === "quiet" || poi.noise_level === "silent") {
			badges.push({
				icon: "volume_off",
				label: "Quiet",
			});
		}
	}

	// Restaurant: Prioritize food-related features
	if (isRestaurant) {
		if (poi.cuisine) {
			badges.push({
				icon: "restaurant",
				label: poi.cuisine,
			});
		}
		if (poi.price_range) {
			badges.push({
				icon: "payments",
				label: "$".repeat(poi.price_range),
			});
		}
	}

	// Bar: Prioritize nightlife features
	if (isBar) {
		if (poi.happy_hour_info) {
			badges.push({
				icon: "local_bar",
				label: "Happy Hour",
			});
		}
		if (poi.vibes && poi.vibes.length > 0) {
			badges.push({
				icon: "music_note",
				label: poi.vibes[0],
			});
		}
	}

	// Universal badges (fallback if no category-specific badges)
	if (badges.length === 0) {
		if (poi.has_wifi) {
			badges.push({ icon: "wifi", label: "Free WiFi" });
		}
		if (poi.outdoor_seating) {
			badges.push({ icon: "deck", label: "Outdoor" });
		}
		if (poi.has_ac) {
			badges.push({ icon: "ac_unit", label: "AC" });
		}
	}

	// Add accessibility if available (important for all)
	if (poi.is_wheelchair_accessible && badges.length < 3) {
		badges.push({ icon: "accessible", label: "Accessible" });
	}

	// Add lifestyle badges
	if (poi.kids_friendly && badges.length < 3) {
		badges.push({ icon: "child_care", label: "Kid Friendly" });
	}
	if (poi.smoker_friendly && badges.length < 3) {
		badges.push({ icon: "smoking_rooms", label: "Smoker Area" });
	}
	if (poi.pet_friendly && poi.pet_friendly.length > 0 && badges.length < 3) {
		badges.push({ icon: "pets", label: "Pet Friendly" });
	}

	// Limit to 3 badges max for clean UI
	return badges.slice(0, 3);
}

/**
 * Get a featured/highlighted badge (e.g., "Open Now")
 */
export function getFeaturedBadge(
	isOpen: boolean,
	statusText?: string
): DynamicBadge | null {
	if (isOpen) {
		return {
			icon: "schedule",
			label: statusText?.split("·")[0].trim() || "Open Now",
			featured: true,
		};
	}
	return null;
}

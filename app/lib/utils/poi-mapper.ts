import { POIFormData, defaultPOIFormValues } from "../schemas/poi-form";

// This should match the backend response shape from POIRepository
interface ApiPOIData {
	poi_id?: string;
	name: string;
	brand?: string; // Changed from brand_name
	category_id?: string; // Changed from categories
	category_names?: string[]; // Added to match backend's name_key array
	description?: string;
	cover_image_url?: string;
	gallery_image_urls?: string[];
	address_id?: string; // Note: address might be handled differently if it's joined
	address?: string; // If the API returns a resolved address string
	floor_unit?: string;
	latitude?: number;
	longitude?: number;
	public_transport?: string;
	parking_options?: string[]; // Note: API might send 'amenities' or 'parking_info'
	parking_info?: string;
	amenities?: string[];
	wheelchair_accessible?: boolean;
	is_wheelchair_accessible?: boolean; // API key is is_wheelchair_accessible
	wifi_quality?: string;
	power_outlets?: string;
	seating_options?: string[];
	noise_level?: string;
	has_ac?: boolean;
	vibes?: string[];
	crowd_type?: string[];
	lighting?: string;
	music_type?: string;
	cleanliness?: string;
	cuisine?: string;
	price_range?: number;
	dietary_options?: string[];
	food_options?: string[];
	featured_items?: string[]; // mapped from featured_menu_items in DB but json is featured_items
	specials?: string[];
	open_hours?: Record<string, { open: string; close: string }> | null; // Can be null
	reservation_required?: boolean;
	reservation_platform?: string;
	payment_options?: string[];
	wait_time_estimate?: number;
	kids_friendly?: boolean;
	pet_friendly?: string[];
	smoker_friendly?: boolean;
	happy_hour_info?: string;
	loyalty_program?: string;
	phone?: string;
	email?: string;
	website?: string;
	social_links?: Record<string, string> | null; // Can be null
}

export function mapApiToFormData(apiData: ApiPOIData): POIFormData {
	if (!apiData) return defaultPOIFormValues;

	return {
		name: apiData.name || "",
		brandName: apiData.brand || "",
		categories:
			apiData.category_names ||
			(apiData.category_id ? [apiData.category_id] : []),
		description: apiData.description || "",
		coverImage: apiData.cover_image_url || null,
		galleryImages: apiData.gallery_image_urls || [],
		address: apiData.address || "", // Note: Backend might need to return address text if separate from ID
		floorUnit: apiData.floor_unit || "",
		latitude: apiData.latitude !== undefined ? apiData.latitude : null,
		longitude: apiData.longitude !== undefined ? apiData.longitude : null,
		publicTransport: apiData.public_transport || "",
		parkingOptions: apiData.parking_options || [], // Check if this maps to amenities or parking_info
		wheelchairAccessible: apiData.is_wheelchair_accessible || false,
		wifiQuality: (apiData.wifi_quality as POIFormData["wifiQuality"]) || "",
		powerOutlets: (apiData.power_outlets as POIFormData["powerOutlets"]) || "",
		seatingOptions: apiData.seating_options || [],
		noiseLevel: (apiData.noise_level as POIFormData["noiseLevel"]) || "",
		hasAC: apiData.has_ac || false,
		vibes: apiData.vibes || [],
		crowdType: apiData.crowd_type || [],
		lighting: (apiData.lighting as POIFormData["lighting"]) || "",
		musicType: apiData.music_type || "",
		cleanliness: (apiData.cleanliness as POIFormData["cleanliness"]) || "",
		cuisine: apiData.cuisine || "",
		priceRange: apiData.price_range !== undefined ? apiData.price_range : null,
		dietaryOptions: apiData.dietary_options || apiData.food_options || [],
		featuredItems: apiData.featured_items || [],
		specials: apiData.specials || [],
		openHours: apiData.open_hours || {},
		reservationRequired: apiData.reservation_required || false,
		reservationPlatform: apiData.reservation_platform || "",
		paymentOptions: apiData.payment_options || [],
		waitTimeEstimate:
			apiData.wait_time_estimate !== undefined
				? apiData.wait_time_estimate
				: null,
		kidsFriendly: apiData.kids_friendly || false,
		petFriendly: apiData.pet_friendly || [],
		petPolicy: "", // Not currently in API response, default to empty
		smokerFriendly: apiData.smoker_friendly || false,
		happyHourInfo: apiData.happy_hour_info || "",
		loyaltyProgram: apiData.loyalty_program || "",
		phone: apiData.phone || "",
		email: apiData.email || "",
		website: apiData.website || "",
		socialLinks: apiData.social_links || {},
	};
}

export interface POI {
	poi_id: string;
	name: string;
	brand?: string;
	description?: string;
	category_id?: string;
	category_names?: string[];
	cover_image_url?: string;
	latitude: number;
	longitude: number;
	has_wifi: boolean;
	outdoor_seating: boolean;
	kids_friendly: boolean;
	smoker_friendly: boolean;
	price_range?: number;
	cuisine?: string;
	amenities?: string[];
	status: string;
	distance_meters?: number;
}

export interface SearchSuggestion {
	formatted: string;
	lat: number;
	lon: number;
}

export interface RouteInfo {
	distance: number; // in meters
	duration: number; // in seconds
}

export interface NavigationDestination {
	poiId: string;
	lat: number;
	lng: number;
	name: string;
}

export type TravelMode = "driving" | "walking" | "cycling";

import { z } from "zod";

// POI Form Schema with validation
export const poiFormSchema = z.object({
	// Profile & Visuals
	name: z.string().min(1, "POI name is required").max(255),
	brandName: z.string().max(100).optional(),
	categories: z.array(z.string()).min(1, "Select at least one category"),
	description: z.string().max(2000).optional(),
	coverImage: z.string().url().nullable().optional(),
	galleryImages: z.array(z.string().url()).optional().default([]),

	// Location
	address: z.string().max(500).optional(),
	floorUnit: z.string().max(100).optional(),
	latitude: z.number().min(-90).max(90).nullable().optional(),
	longitude: z.number().min(-180).max(180).nullable().optional(),
	publicTransport: z.string().max(500).optional(),
	parkingOptions: z.array(z.string()).optional().default([]),
	wheelchairAccessible: z.boolean().optional().default(false),

	// Work & Prod
	wifiQuality: z
		.enum(["", "none", "slow", "moderate", "fast", "excellent"])
		.optional(),
	powerOutlets: z
		.enum(["", "none", "limited", "moderate", "plenty"])
		.optional(),
	seatingOptions: z.array(z.string()).optional().default([]),
	noiseLevel: z
		.enum(["", "silent", "quiet", "moderate", "lively", "loud"])
		.optional(),
	hasAC: z.boolean().optional().default(false),

	// Atmosphere
	vibes: z.array(z.string()).optional().default([]),
	crowdType: z.array(z.string()).optional().default([]),
	lighting: z.enum(["", "dim", "moderate", "bright", "natural"]).optional(),
	musicType: z.string().max(100).optional(),
	cleanliness: z.enum(["", "poor", "average", "clean", "spotless"]).optional(),

	// Food & Drink
	cuisine: z.string().max(100).optional(),
	priceRange: z.number().min(1).max(4).nullable().optional(),
	dietaryOptions: z.array(z.string()).optional().default([]),
	featuredItems: z.array(z.string()).optional().default([]),
	specials: z.array(z.string()).optional().default([]),

	// Operations
	openHours: z
		.record(
			z.string(),
			z.object({
				open: z.string(),
				close: z.string(),
			})
		)
		.optional()
		.default({}),
	reservationRequired: z.boolean().optional().default(false),
	reservationPlatform: z.string().max(255).optional(),
	paymentOptions: z.array(z.string()).optional().default([]),
	waitTimeEstimate: z.number().min(0).nullable().optional(),

	// Social & Lifestyle
	kidsFriendly: z.boolean().optional().default(false),
	petFriendly: z.array(z.string()).optional().default([]),
	petPolicy: z.string().max(500).optional(),
	smokerFriendly: z.boolean().optional().default(false),
	happyHourInfo: z.string().max(500).optional(),
	loyaltyProgram: z.string().max(500).optional(),

	// Contact
	phone: z.string().max(50).optional(),
	email: z.string().email().optional().or(z.literal("")),
	website: z.string().url().optional().or(z.literal("")),
	socialLinks: z
		.record(
			z.string(),
			z
				.string()
				.url("Please enter a valid URL (e.g., https://instagram.com/handle)")
				.or(z.literal(""))
		)
		.optional()
		.default({}),
});

export type POIFormData = z.infer<typeof poiFormSchema>;

// Default values for the form
export const defaultPOIFormValues: POIFormData = {
	name: "",
	brandName: "",
	categories: [],
	description: "",
	coverImage: null,
	galleryImages: [],
	address: "",
	floorUnit: "",
	latitude: null,
	longitude: null,
	publicTransport: "",
	parkingOptions: [],
	wheelchairAccessible: false,
	wifiQuality: "",
	powerOutlets: "",
	seatingOptions: [],
	noiseLevel: "",
	hasAC: false,
	vibes: [],
	crowdType: [],
	lighting: "",
	musicType: "",
	cleanliness: "",
	cuisine: "",
	priceRange: null,
	dietaryOptions: [],
	featuredItems: [],
	specials: [],
	openHours: {},
	reservationRequired: false,
	reservationPlatform: "",
	paymentOptions: [],
	waitTimeEstimate: null,
	kidsFriendly: false,
	petFriendly: [],
	petPolicy: "",
	smokerFriendly: false,
	happyHourInfo: "",
	loyaltyProgram: "",
	phone: "",
	email: "",
	website: "",
	socialLinks: {},
};

"use client";

import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useForm, FormProvider, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	poiFormSchema,
	POIFormData,
	defaultPOIFormValues,
} from "../lib/schemas/poi-form";

interface POIFormContextType {
	draftId: string | null;
	isSaving: boolean;
	lastSaved: Date | null;
	saveDraft: () => Promise<void>;
	submitForReview: () => Promise<void>;
	resetForm: () => void;
}

const POIFormContext = createContext<POIFormContextType | null>(null);

export function usePOIFormContext() {
	const context = useContext(POIFormContext);
	if (!context) {
		throw new Error("usePOIFormContext must be used within a POIFormProvider");
	}
	return context;
}

// Re-export for backward compatibility
export const usePOIForm = usePOIFormContext;

interface POIFormProviderProps {
	children: ReactNode;
}

export function POIFormProvider({ children }: POIFormProviderProps) {
	const { getToken } = useAuth();
	const [draftId, setDraftId] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);

	// API base URL from environment
	const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

	// Initialize react-hook-form with Zod resolver
	const form = useForm<POIFormData>({
		resolver: zodResolver(poiFormSchema),
		defaultValues: defaultPOIFormValues,
		mode: "onChange",
	});

	// Load draft from localStorage on mount
	useEffect(() => {
		const savedDraft = localStorage.getItem("poi-draft");
		if (savedDraft) {
			try {
				const parsed = JSON.parse(savedDraft);
				if (parsed.formData) {
					form.reset(parsed.formData);
				}
				if (parsed.draftId) {
					setDraftId(parsed.draftId);
				}
			} catch {
				console.error("Failed to parse saved draft");
			}
		}
	}, [form]);

	// Auto-save to localStorage when form changes
	useEffect(() => {
		const subscription = form.watch((formData) => {
			const timeout = setTimeout(() => {
				localStorage.setItem(
					"poi-draft",
					JSON.stringify({ formData, draftId })
				);
			}, 1000);
			return () => clearTimeout(timeout);
		});
		return () => subscription.unsubscribe();
	}, [form, draftId]);

	const saveDraft = useCallback(async () => {
		const formData = form.getValues();
		setIsSaving(true);
		try {
			const token = await getToken();
			const method = draftId ? "PUT" : "POST";
			const url = draftId
				? `${API_URL}/api/v1/pois/${draftId}`
				: `${API_URL}/api/v1/pois`;

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					// Profile & Visuals
					name: formData.name || "Untitled Draft",
					brand_name: formData.brandName || null,
					categories: formData.categories || [],
					description: formData.description || null,
					cover_image_url: formData.coverImage || null,
					gallery_image_urls: formData.galleryImages || [],
					// Location
					address: formData.address || null,
					floor_unit: formData.floorUnit || null,
					latitude: formData.latitude || 0,
					longitude: formData.longitude || 0,
					public_transport: formData.publicTransport || null,
					parking_options: formData.parkingOptions || [],
					wheelchair_accessible: formData.wheelchairAccessible || false,
					// Work & Prod
					wifi_quality: formData.wifiQuality || null,
					power_outlets: formData.powerOutlets || null,
					seating_options: formData.seatingOptions || [],
					noise_level: formData.noiseLevel || null,
					has_ac: formData.hasAC || false,
					// Atmosphere
					vibes: formData.vibes || [],
					crowd_type: formData.crowdType || [],
					lighting: formData.lighting || null,
					music_type: formData.musicType || null,
					cleanliness: formData.cleanliness || null,
					// Food & Drink
					cuisine: formData.cuisine || null,
					price_range: formData.priceRange || null,
					dietary_options: formData.dietaryOptions || [],
					featured_items: formData.featuredItems || [],
					specials: formData.specials || [],
					// Operations
					open_hours: formData.openHours || {},
					reservation_required: formData.reservationRequired || false,
					reservation_platform: formData.reservationPlatform || null,
					payment_options: formData.paymentOptions || [],
					wait_time_estimate: formData.waitTimeEstimate || null,
					// Social & Lifestyle
					kids_friendly: formData.kidsFriendly || false,
					pet_friendly: formData.petFriendly || [],
					smoker_friendly: formData.smokerFriendly || false,
					happy_hour_info: formData.happyHourInfo || null,
					loyalty_program: formData.loyaltyProgram || null,
					// Contact
					phone: formData.phone || null,
					email: formData.email || null,
					website: formData.website || null,
					social_links: formData.socialLinks || {},
				}),
			});

			if (!response.ok) throw new Error("Failed to save");

			const data = await response.json();
			if (!draftId && data.data?.poi_id) {
				setDraftId(data.data.poi_id);
			}
			setLastSaved(new Date());
		} catch (error) {
			console.error("Save draft error:", error);
			throw error;
		} finally {
			setIsSaving(false);
		}
	}, [form, draftId, getToken, API_URL]);

	const submitForReview = useCallback(async () => {
		// Validate form first
		const isValid = await form.trigger();

		// Check if there are any errors after triggering validation
		const errors = form.formState.errors;
		const hasErrors = Object.keys(errors).length > 0;

		console.log("Form validation check:", {
			isValid,
			hasErrors,
			errors,
			formValues: form.getValues(),
		});

		if (hasErrors) {
			console.error("Validation errors:", errors);
			throw new Error("Please fix validation errors before submitting");
		}

		if (!draftId) {
			await saveDraft();
		}

		const token = await getToken();
		const response = await fetch(`${API_URL}/api/v1/pois/${draftId}/submit`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) throw new Error("Failed to submit");

		// Clear local storage after successful submission
		localStorage.removeItem("poi-draft");
		form.reset(defaultPOIFormValues);
		setDraftId(null);
	}, [draftId, saveDraft, getToken, API_URL, form]);

	const resetForm = useCallback(() => {
		form.reset(defaultPOIFormValues);
		setDraftId(null);
		setLastSaved(null);
		localStorage.removeItem("poi-draft");
	}, [form]);

	return (
		<POIFormContext.Provider
			value={{
				draftId,
				isSaving,
				lastSaved,
				saveDraft,
				submitForReview,
				resetForm,
			}}
		>
			<FormProvider {...form}>{children}</FormProvider>
		</POIFormContext.Provider>
	);
}

// Export form type for use in components
export type { POIFormData };

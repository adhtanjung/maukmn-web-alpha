"use client";

import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	useRef,
	ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	poiFormSchema,
	POIFormData,
	defaultPOIFormValues,
} from "../lib/schemas/poi-form";
import { ApiResponse } from "../types/api";

interface POIFormContextType {
	draftId: string | null;
	isSaving: boolean;
	lastSaved: Date | null;
	saveDraft: () => Promise<string | null>;
	saveSection: (sectionName: string) => Promise<void>;
	fetchSection: (sectionName: string) => Promise<void>;
	submitForReview: () => Promise<ApiResponse<unknown>>;
	resetForm: () => void;
	getFirstErrorField: () => string | null;
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
	initialData?: POIFormData;
	initialDraftId?: string | null;
}

export function POIFormProvider({
	children,
	initialData,
	initialDraftId,
}: POIFormProviderProps) {
	const { getToken, userId } = useAuth();
	// Initialize draftId with prop if provided
	const [draftId, setDraftId] = useState<string | null>(initialDraftId || null);
	const [isSaving, setIsSaving] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);

	// Track in-flight section saves to prevent concurrent calls
	const savingPendingRef = useRef<Set<string>>(new Set());

	// API base URL from environment
	const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

	// Initialize react-hook-form with Zod resolver
	const form = useForm<POIFormData>({
		resolver: zodResolver(poiFormSchema) as any,
		defaultValues: initialData || defaultPOIFormValues, // Use initialData if provided
		mode: "onChange",
	});

	// Clear stale drafts when user changes (on auth state change)
	// This prevents 403 errors when a user logs in with a different account
	// that has a stale draft from a previous user in localStorage
	useEffect(() => {
		if (!userId) return; // Not logged in yet

		const savedDraft = localStorage.getItem("poi-draft");
		if (savedDraft) {
			try {
				const parsed = JSON.parse(savedDraft);
				// If draft exists and belongs to a different user, clear it immediately
				if (parsed.userId && parsed.userId !== userId) {
					console.warn("[Auth] Clearing POI draft from previous user on login");
					localStorage.removeItem("poi-draft");
					// Also reset the form if we're not in edit mode
					if (!initialData) {
						setDraftId(null);
						form.reset(defaultPOIFormValues);
					}
				}
			} catch {
				// Invalid JSON, clear it
				localStorage.removeItem("poi-draft");
			}
		}
		// This should only run when userId changes (auth state change)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	// Load draft from localStorage on mount ONLY if no initialData is provided (fresh create mode)
	useEffect(() => {
		if (initialData) {
			// If we have initialData (edit mode), ensure form is reset to it
			// This handles cases where initialData might be populated after first render
			// or if we switch between edit/create modes
			form.reset(initialData);
			return;
		}

		const savedDraft = localStorage.getItem("poi-draft");
		if (savedDraft) {
			try {
				const parsed = JSON.parse(savedDraft);

				// IMPORTANT: Validate that the saved draft belongs to the current user
				// to prevent 403 errors from stale drafts created by a different user
				if (parsed.userId && parsed.userId !== userId) {
					console.warn("Clearing stale POI draft from different user");
					localStorage.removeItem("poi-draft");
					return;
				}

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
	}, [form, initialData, userId]);

	// Auto-save to localStorage when form changes - ONLY for new creations (no initialData)
	useEffect(() => {
		if (initialData) return; // Don't auto-save to local storage for existing POIs

		const subscription = form.watch((formData) => {
			const timeout = setTimeout(() => {
				// Include userId to validate ownership when loading
				localStorage.setItem(
					"poi-draft",
					JSON.stringify({ formData, draftId, userId })
				);
			}, 1000);
			return () => clearTimeout(timeout);
		});
		return () => subscription.unsubscribe();
	}, [form, draftId, initialData, userId]);

	const saveDraft = useCallback(async (): Promise<string | null> => {
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

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					errorData.message ||
						errorData.error ||
						`Failed to save: ${response.statusText}`
				);
			}

			const data = await response.json();
			let currentDraftId = draftId;
			if (!draftId && data.data?.poi_id) {
				setDraftId(data.data.poi_id);
				currentDraftId = data.data.poi_id;
			}
			setLastSaved(new Date());
			return currentDraftId;
		} catch (error) {
			console.error("Save draft error:", error);
			throw error;
		} finally {
			setIsSaving(false);
		}
	}, [form, draftId, getToken, API_URL]);

	const submitForReview = useCallback(async (): Promise<
		ApiResponse<unknown>
	> => {
		// Prevent concurrent submissions
		if (isSubmitting) {
			throw new Error("Submission already in progress");
		}

		setIsSubmitting(true);

		try {
			// Trigger validation first
			await form.trigger();

			// Check if there are any errors after triggering validation
			const errors = form.formState.errors;
			const hasErrors = Object.keys(errors).length > 0;

			if (hasErrors) {
				const firstErrorField = Object.keys(errors)[0];
				const firstError = errors[firstErrorField as keyof typeof errors];
				const errorMessage = firstError?.message || "Please fix this field";
				console.error("Validation errors:", errors);
				// Include the first error field and its message for parsing
				// Format: validation:fieldName:errorMessage
				throw new Error(`validation:${firstErrorField}:${errorMessage}`);
			}

			// Always save draft before submitting to ensure latest changes are captured
			// saveDraft returns the ID, which is crucial when creating a new POI
			const currentDraftId = await saveDraft();

			if (!currentDraftId) {
				throw new Error("Failed to create POI before submission");
			}

			const token = await getToken();
			const response = await fetch(
				`${API_URL}/api/v1/pois/${currentDraftId}/submit`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || data.error || "Failed to submit");
			}

			// Clear local storage after successful submission
			localStorage.removeItem("poi-draft");
			form.reset(defaultPOIFormValues);
			setDraftId(null);

			return data;
		} finally {
			setIsSubmitting(false);
		}
	}, [isSubmitting, saveDraft, getToken, API_URL, form]);

	const saveSection = useCallback(
		async (sectionName: string) => {
			// Prevent concurrent saves for the same section
			// This prevents 500 errors from database race conditions
			if (savingPendingRef.current.has(sectionName)) {
				console.log(`Skipping duplicate save for section: ${sectionName}`);
				return;
			}

			if (!draftId) {
				// If no ID yet (first tab of create mode), we must create the POI first
				// using the standard saveDraft logic which hits POST /pois
				await saveDraft();
				return;
			}

			// Mark this section as being saved
			savingPendingRef.current.add(sectionName);

			// Map section name to endpoint and data fields
			let endpoint = "";
			let payload: any = {};
			const formData = form.getValues();

			switch (sectionName) {
				case "profile":
					endpoint = "profile";
					payload = {
						name: formData.name,
						brand_name: formData.brandName || null,
						categories: formData.categories || [],
						description: formData.description || null,
						cover_image_url: formData.coverImage || null,
						gallery_image_urls: formData.galleryImages || [],
					};
					break;
				case "location":
					endpoint = "location";
					payload = {
						address: formData.address || null,
						latitude: formData.latitude || 0,
						longitude: formData.longitude || 0,
						floor_unit: formData.floorUnit || null,
						public_transport: formData.publicTransport || null,
						parking_options: formData.parkingOptions || [],
						wheelchair_accessible: formData.wheelchairAccessible || false,
					};
					break;
				case "operations":
					endpoint = "operations";
					payload = {
						open_hours: formData.openHours || {},
						reservation_required: formData.reservationRequired || false,
						reservation_platform: formData.reservationPlatform || null,
						payment_options: formData.paymentOptions || [],
						wait_time_estimate: formData.waitTimeEstimate || null,
					};
					break;
				case "workprod":
					endpoint = "work-prod"; // Backend/DTO mapping needed
					payload = {
						wifi_quality: formData.wifiQuality || null,
						power_outlets: formData.powerOutlets || null,
						seating_options: formData.seatingOptions || [],
						noise_level: formData.noiseLevel || null,
						has_ac: formData.hasAC || false,
					};
					break;
				case "atmosphere":
					endpoint = "atmosphere";
					payload = {
						vibes: formData.vibes || [],
						crowd_type: formData.crowdType || [],
						lighting: formData.lighting || null,
						music_type: formData.musicType || null,
						cleanliness: formData.cleanliness || null,
					};
					break;
				case "fooddrink":
					endpoint = "food-drink";
					payload = {
						cuisine: formData.cuisine || null,
						price_range: formData.priceRange || null,
						dietary_options: formData.dietaryOptions || [],
						featured_items: formData.featuredItems || [],
						specials: formData.specials || [],
					};
					break;
				case "social":
					endpoint = "social";
					payload = {
						kids_friendly: formData.kidsFriendly || false,
						pet_friendly: formData.petFriendly || [],
						smoker_friendly: formData.smokerFriendly || false,
						happy_hour_info: formData.happyHourInfo || null,
						loyalty_program: formData.loyaltyProgram || null,
					};
					break;
				case "contact":
					endpoint = "contact";
					payload = {
						phone: formData.phone || null,
						email: formData.email || null,
						website: formData.website || null,
						social_links: formData.socialLinks || {},
					};
					break;
				// Add other sections...
				default:
					// Fallback to full save if unknown section (or for sections not yet migrated)
					console.warn("Unknown section for granular save:", sectionName);
					await saveDraft();
					return;
			}

			setIsSaving(true);
			try {
				const token = await getToken();
				const response = await fetch(
					`${API_URL}/api/v1/pois/${draftId}/section/${endpoint}`,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify(payload),
					}
				);

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || "Failed to save section");
				}

				setLastSaved(new Date());
			} catch (error) {
				console.error(`Save ${sectionName} error:`, error);
				throw error;
			} finally {
				// Remove from pending saves to allow future saves
				savingPendingRef.current.delete(sectionName);
				setIsSaving(false);
			}
		},
		[draftId, form, getToken, API_URL, saveDraft]
	);

	// Helper to map and update form values from section data
	const updateFormFromSection = useCallback(
		(sectionName: string, data: any) => {
			switch (sectionName) {
				case "profile":
					form.setValue("name", data.name ?? "");
					form.setValue("brandName", data.brand_name ?? "");
					form.setValue("categories", data.categories ?? []);
					form.setValue("description", data.description ?? "");
					form.setValue("coverImage", data.cover_image_url ?? null);
					form.setValue("galleryImages", data.gallery_image_urls ?? []);
					break;
				case "location":
					form.setValue("address", data.address ?? "");
					form.setValue("floorUnit", data.floor_unit ?? "");
					form.setValue("latitude", data.latitude ?? 0);
					form.setValue("longitude", data.longitude ?? 0);
					form.setValue("publicTransport", data.public_transport ?? "");
					form.setValue("parkingOptions", data.parking_options ?? []);
					form.setValue(
						"wheelchairAccessible",
						data.wheelchair_accessible ?? false
					);
					break;
				case "operations":
					form.setValue("openHours", data.open_hours ?? {});
					form.setValue(
						"reservationRequired",
						data.reservation_required ?? false
					);
					form.setValue("reservationPlatform", data.reservation_platform ?? "");
					form.setValue("paymentOptions", data.payment_options ?? []);
					form.setValue("waitTimeEstimate", data.wait_time_estimate ?? null);
					break;
				// Add other cases as needed or map generic
				case "workprod":
					form.setValue("wifiQuality", data.wifi_quality ?? "");
					form.setValue("powerOutlets", data.power_outlets ?? "");
					form.setValue("seatingOptions", data.seating_options ?? []);
					form.setValue("noiseLevel", data.noise_level ?? "");
					form.setValue("hasAC", data.has_ac ?? false);
					break;
				case "atmosphere":
					form.setValue("vibes", data.vibes ?? []);
					form.setValue("crowdType", data.crowd_type ?? []);
					form.setValue("lighting", data.lighting ?? "");
					form.setValue("musicType", data.music_type ?? "");
					form.setValue("cleanliness", data.cleanliness ?? "");
					break;
				case "fooddrink":
					form.setValue("cuisine", data.cuisine ?? "");
					form.setValue("priceRange", data.price_range ?? null);
					form.setValue("dietaryOptions", data.dietary_options ?? []);
					form.setValue("featuredItems", data.featured_items ?? []);
					form.setValue("specials", data.specials ?? []);
					break;
				case "social":
					form.setValue("kidsFriendly", data.kids_friendly ?? false);
					form.setValue("petFriendly", data.pet_friendly ?? []);
					form.setValue("smokerFriendly", data.smoker_friendly ?? false);
					form.setValue("happyHourInfo", data.happy_hour_info ?? "");
					form.setValue("loyaltyProgram", data.loyalty_program ?? "");
					break;
				case "contact":
					form.setValue("phone", data.phone ?? "");
					form.setValue("email", data.email ?? "");
					form.setValue("website", data.website ?? "");
					form.setValue("socialLinks", data.social_links ?? {});
					break;
			}
		},
		[form]
	);

	const fetchSection = useCallback(
		async (sectionName: string) => {
			if (!draftId) {
				return;
			}

			let endpoint = sectionName;
			if (sectionName === "workprod") endpoint = "work-prod";
			if (sectionName === "fooddrink") endpoint = "food-drink";

			try {
				const token = await getToken();
				const response = await fetch(
					`${API_URL}/api/v1/pois/${draftId}/section/${endpoint}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (!response.ok) {
					console.warn(`Failed to fetch section ${sectionName}`);
					return;
				}

				const data = await response.json();
				if (data.data) {
					updateFormFromSection(sectionName, data.data);
				}
			} catch (error) {
				console.error(`Fetch ${sectionName} error:`, error);
			}
		},
		[draftId, getToken, API_URL, updateFormFromSection]
	);

	const resetForm = useCallback(() => {
		form.reset(defaultPOIFormValues);
		setDraftId(null);
		setLastSaved(null);
		localStorage.removeItem("poi-draft");
	}, [form]);

	const getFirstErrorField = useCallback((): string | null => {
		const errors = form.formState.errors;
		const errorKeys = Object.keys(errors);
		return errorKeys.length > 0 ? errorKeys[0] : null;
	}, [form.formState.errors]);

	return (
		<POIFormContext.Provider
			value={{
				draftId,
				isSaving,
				lastSaved,
				saveDraft,
				saveSection,
				fetchSection,
				submitForReview,
				resetForm,
				getFirstErrorField,
			}}
		>
			<FormProvider {...form}>{children}</FormProvider>
		</POIFormContext.Provider>
	);
}

// Export form type for use in components
export type { POIFormData };

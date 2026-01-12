"use client";

import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	Suspense,
	lazy,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Button } from "@/components/ui/button";
import { usePOIForm } from "../../contexts/POIFormContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import * as Sentry from "@sentry/nextjs";

// Lazy load all tab components for better performance
const ProfileVisualsTab = lazy(() => import("./ProfileVisualsTab"));
const LocationTab = lazy(() => import("./LocationTab"));
const WorkProdTab = lazy(() => import("./WorkProdTab"));
const AtmosphereTab = lazy(() => import("./AtmosphereTab"));
const FoodDrinkTab = lazy(() => import("./FoodDrinkTab"));
const OperationsTab = lazy(() => import("./OperationsTab"));
const SocialLifestyleTab = lazy(() => import("./SocialLifestyleTab"));
const ContactTab = lazy(() => import("./ContactTab"));

// Loading skeleton for tabs
function TabSkeleton() {
	return (
		<div className="px-4 py-6 space-y-4 animate-pulse">
			<div className="h-6 w-32 bg-muted rounded" />
			<div className="h-14 w-full bg-muted rounded-xl" />
			<div className="h-14 w-full bg-muted rounded-xl" />
			<div className="h-32 w-full bg-muted rounded-xl" />
		</div>
	);
}

interface CreatePOIOverlayProps {
	onClose: () => void;
	mode?: "create" | "edit";
	initialTitle?: string;
}

type Tab =
	| "profile"
	| "location"
	| "workprod"
	| "atmosphere"
	| "fooddrink"
	| "operations"
	| "social"
	| "contact";

const TABS: Tab[] = [
	"profile",
	"location",
	"workprod",
	"atmosphere",
	"fooddrink",
	"operations",
	"social",
	"contact",
];

// Map form fields to their respective tabs
const FIELD_TO_TAB: Record<string, Tab> = {
	// Profile & Visuals
	name: "profile",
	brandName: "profile",
	categories: "profile",
	description: "profile",
	coverImage: "profile",
	galleryImages: "profile",
	// Location
	address: "location",
	floorUnit: "location",
	latitude: "location",
	longitude: "location",
	publicTransport: "location",
	parkingOptions: "location",
	wheelchairAccessible: "location",
	// Work & Prod
	wifiQuality: "workprod",
	powerOutlets: "workprod",
	seatingOptions: "workprod",
	noiseLevel: "workprod",
	hasAC: "workprod",
	// Atmosphere
	vibes: "atmosphere",
	crowdType: "atmosphere",
	lighting: "atmosphere",
	musicType: "atmosphere",
	cleanliness: "atmosphere",
	// Food & Drink
	cuisine: "fooddrink",
	priceRange: "fooddrink",
	dietaryOptions: "fooddrink",
	featuredItems: "fooddrink",
	specials: "fooddrink",
	// Operations
	openHours: "operations",
	reservationRequired: "operations",
	reservationPlatform: "operations",
	paymentOptions: "operations",
	waitTimeEstimate: "operations",
	// Social & Lifestyle
	kidsFriendly: "social",
	petFriendly: "social",
	petPolicy: "social",
	smokerFriendly: "social",
	happyHourInfo: "social",
	loyaltyProgram: "social",
	// Contact
	phone: "contact",
	email: "contact",
	website: "contact",
	socialLinks: "contact",
};

export default function CreatePOIOverlay({
	onClose,
	mode = "create",
	initialTitle = "Add New POI",
}: CreatePOIOverlayProps) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const tabsListRef = useRef<HTMLDivElement>(null);
	const tabRefs = useRef<Map<Tab, HTMLButtonElement>>(new Map());
	const {
		saveDraft,
		saveSection,
		fetchSection,
		submitForReview,
		isSaving,
		resetForm,
	} = usePOIForm();

	// Get initial tab from URL query param or default to "profile"
	const getInitialTab = (): Tab => {
		const tabFromUrl = searchParams.get("tab");
		if (tabFromUrl && TABS.includes(tabFromUrl as Tab)) {
			return tabFromUrl as Tab;
		}
		return "profile";
	};

	const [activeTab, setActiveTab] = useState<Tab>(getInitialTab);
	const [showLeftFade, setShowLeftFade] = useState(false);
	const [showRightFade, setShowRightFade] = useState(true);

	// Fetch initial tab data on mount if in edit mode
	useEffect(() => {
		if (mode === "edit") {
			fetchSection(activeTab);
		}
	}, [mode, fetchSection]); // activeTab excluded to run only on mount/mode specific (or include if we want refetch on tab change handled here? no handleTabChange handles that)

	// Sync URL query param when tab changes
	const handleTabChange = useCallback(
		async (tab: Tab) => {
			if (mode === "edit") {
				if (tab !== activeTab) {
					// Auto-save current tab before switching
					try {
						await saveSection(activeTab);
					} catch (error) {
						console.error("Auto-save failed on tab switch:", error);
						// Consider showing error feedback
					}
				}

				// Fetch new tab data
				// We don't await this to block UI, but we could show loading state if needed
				fetchSection(tab);
			}

			setActiveTab(tab);
			const params = new URLSearchParams(searchParams.toString());
			params.set("tab", tab);
			router.replace(`?${params.toString()}`, { scroll: false });
		},
		[router, searchParams, mode, activeTab, saveSection, fetchSection]
	);

	// Auto-scroll to active tab when it changes
	useEffect(() => {
		const activeTabElement = tabRefs.current.get(activeTab);
		if (activeTabElement && tabsListRef.current) {
			activeTabElement.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "center",
			});
		}
	}, [activeTab]);

	// Update fade visibility based on scroll position
	const handleScroll = useCallback(() => {
		const container = tabsListRef.current;
		if (!container) return;

		const { scrollLeft, scrollWidth, clientWidth } = container;
		const isAtStart = scrollLeft <= 5;
		const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 5;

		setShowLeftFade(!isAtStart);
		setShowRightFade(!isAtEnd);
	}, []);

	// Initialize fade state and add scroll listener
	useEffect(() => {
		const container = tabsListRef.current;
		if (!container) return;

		handleScroll(); // Initialize on mount
		container.addEventListener("scroll", handleScroll);
		return () => container.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

	const [saveFeedback, setSaveFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	// Clear feedback after 3 seconds
	useEffect(() => {
		if (saveFeedback) {
			const timer = setTimeout(() => {
				setSaveFeedback(null);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [saveFeedback]);

	const handleBack = () => {
		const currentIndex = TABS.indexOf(activeTab);
		if (currentIndex === 0) {
			onClose();
		} else {
			handleTabChange(TABS[currentIndex - 1]);
		}
	};

	const handleNext = async () => {
		const currentIndex = TABS.indexOf(activeTab);
		if (currentIndex < TABS.length - 1) {
			// Save current tab before moving next
			if (mode === "edit") {
				try {
					await saveSection(activeTab);
				} catch (error) {
					console.error("Failed to save on Next:", error);
					// Don't block navigation, errors are shown via feedback state
				}
			}
			handleTabChange(TABS[currentIndex + 1]);
		}
	};

	const handleSaveDraft = async () => {
		try {
			if (mode === "edit") {
				await saveSection(activeTab);
				setSaveFeedback({
					type: "success",
					message: "Changes saved successfully!",
				});
			} else {
				await saveDraft();
				setSaveFeedback({
					type: "success",
					message: "Draft saved successfully!",
				});
			}
		} catch (error) {
			console.error("Failed to save:", error);
			setSaveFeedback({
				type: "error",
				message: "Failed to save. Please try again.",
			});
		}
	};

	const handleSubmit = async () => {
		try {
			// In edit mode, save the last tab (contact) first
			if (mode === "edit") {
				await saveSection(activeTab);
			}

			// Wrapped in try-catch to catch network errors or throws from submitForReview
			const result = await submitForReview();

			// Check for standardized response structure if returned
			if (result && result.success) {
				setSaveFeedback({
					type: "success",
					message: "POI submitted for review successfully!",
				});
				// Close after a short delay to show success message
				setTimeout(() => onClose(), 1500);
			} else if (result && result.error) {
				setSaveFeedback({
					type: "error",
					message: `Failed to submit: ${result.message || result.error}`,
				});
			} else {
				// Fallback if the hook doesn't return the full object (depends on hook impl)
				setSaveFeedback({
					type: "success",
					message: "POI submitted for review!",
				});
				setTimeout(() => onClose(), 1500);
			}
		} catch (error: unknown) {
			console.error("Failed to submit:", error);
			Sentry.captureException(error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";

			// Check if this is a validation error with field info
			// Format: "validation:fieldName:errorMessage"
			if (errorMessage.startsWith("validation:")) {
				const parts = errorMessage.split(":");
				const fieldName = parts[1];
				const fieldErrorMessage = parts.slice(2).join(":"); // Join in case message contains colons
				const targetTab = FIELD_TO_TAB[fieldName];

				if (targetTab) {
					handleTabChange(targetTab);
				} else {
					// Fallback to first tab if field not mapped
					handleTabChange("profile");
				}

				// Show the actual field validation error message
				setSaveFeedback({
					type: "error",
					message:
						fieldErrorMessage ||
						"Please fix validation errors before submitting.",
				});
				return;
			}

			setSaveFeedback({
				type: "error",
				message: `Error submitting POI: ${errorMessage}`,
			});
		}
	};

	const handleDiscard = () => {
		if (
			confirm(
				"Are you sure you want to discard this draft? This action cannot be undone."
			)
		) {
			resetForm();
			onClose();
		}
	};

	return (
		<motion.div
			initial={{ y: "100%", opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			exit={{ y: "100%" }}
			transition={{
				type: "tween",
				damping: 100,
				stiffness: 300,
				duration: 0.4,
			}}
			className="absolute top-4 left-0 right-0 bottom-0 z-[100] bg-background flex flex-col rounded-t-3xl overflow-hidden"
		>
			<div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-border/50 pt-2">
				<div className="flex items-center p-4 pb-2 justify-between relative">
					<div className="w-10"></div> {/* Spacer for centering */}
					<h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] text-center absolute left-1/2 -translate-x-1/2">
						{initialTitle}
					</h2>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="w-10 h-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
					>
						<span className="material-symbols-outlined text-2xl leading-none">
							close
						</span>
					</Button>
				</div>
				<div className="px-4">
					<Tabs
						value={activeTab}
						onValueChange={(val) => handleTabChange(val as Tab)}
						variant="rounded"
						className="w-full"
					>
						<div className="relative">
							{/* Left fade overlay */}
							<div
								className={`absolute left-0 top-0 bottom-0 w-36 bg-linear-to-r from-background to-transparent z-10 pointer-events-none rounded-l-full transition-opacity duration-200 ${
									showLeftFade ? "opacity-100" : "opacity-0"
								}`}
							/>
							{/* Right fade overlay */}
							<div
								className={`absolute right-0 top-0 bottom-0 w-36 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none rounded-r-full transition-opacity duration-200 ${
									showRightFade ? "opacity-100" : "opacity-0"
								}`}
							/>
							<TabsList ref={tabsListRef}>
								<TabsTrigger
									value="profile"
									ref={(el) => {
										if (el) tabRefs.current.set("profile", el);
									}}
								>
									<p className="text-sm font-bold leading-normal tracking-[0.015em]">
										Profile & Visuals
									</p>
								</TabsTrigger>
								<TabsTrigger
									value="location"
									ref={(el) => {
										if (el) tabRefs.current.set("location", el);
									}}
								>
									<p className="text-sm font-bold leading-normal tracking-[0.015em]">
										Location
									</p>
								</TabsTrigger>

								<TabsTrigger
									value="workprod"
									ref={(el) => {
										if (el) tabRefs.current.set("workprod", el);
									}}
								>
									<p className="text-sm font-bold leading-normal tracking-[0.015em]">
										Work & Prod
									</p>
								</TabsTrigger>
								<TabsTrigger
									value="atmosphere"
									ref={(el) => {
										if (el) tabRefs.current.set("atmosphere", el);
									}}
								>
									<p className="text-sm font-bold leading-normal tracking-[0.015em]">
										Atmosphere
									</p>
								</TabsTrigger>
								<TabsTrigger
									value="fooddrink"
									ref={(el) => {
										if (el) tabRefs.current.set("fooddrink", el);
									}}
								>
									<p className="text-sm font-bold leading-normal tracking-[0.015em]">
										Food & Drink
									</p>
								</TabsTrigger>
								<TabsTrigger
									value="operations"
									ref={(el) => {
										if (el) tabRefs.current.set("operations", el);
									}}
								>
									<p className="text-sm font-bold leading-normal tracking-[0.015em]">
										Operations
									</p>
								</TabsTrigger>
								<TabsTrigger
									value="social"
									ref={(el) => {
										if (el) tabRefs.current.set("social", el);
									}}
								>
									<p className="text-sm font-bold leading-normal tracking-[0.015em]">
										Social
									</p>
								</TabsTrigger>
								<TabsTrigger
									value="contact"
									ref={(el) => {
										if (el) tabRefs.current.set("contact", el);
									}}
								>
									<p className="text-sm font-bold leading-normal tracking-[0.015em]">
										Contact
									</p>
								</TabsTrigger>
							</TabsList>
						</div>
					</Tabs>
				</div>
			</div>
			<main className="flex-1 overflow-y-auto no-scrollbar pb-24">
				<Suspense fallback={<TabSkeleton />}>
					<Tabs value={activeTab} variant="rounded" className="w-full">
						<TabsContent value="profile" className="mt-0">
							<ProfileVisualsTab />
						</TabsContent>
						<TabsContent value="location" className="mt-0">
							<LocationTab />
						</TabsContent>
						<TabsContent value="workprod" className="mt-0">
							<WorkProdTab />
						</TabsContent>
						<TabsContent value="atmosphere" className="mt-0">
							<AtmosphereTab />
						</TabsContent>
						<TabsContent value="fooddrink" className="mt-0">
							<FoodDrinkTab />
						</TabsContent>
						<TabsContent value="operations" className="mt-0">
							<OperationsTab />
						</TabsContent>
						<TabsContent value="social" className="mt-0">
							<SocialLifestyleTab />
						</TabsContent>
						<TabsContent value="contact" className="mt-0">
							<ContactTab />
						</TabsContent>
					</Tabs>
				</Suspense>
			</main>

			<div className="sticky bottom-0 left-0 right-0 p-4 pb-6 bg-background border-t border-border flex flex-col gap-3 z-50">
				{saveFeedback && (
					<div className="animate-in slide-in-from-bottom-5 fade-in duration-300">
						<Alert
							variant={
								saveFeedback.type === "error" ? "destructive" : "default"
							}
							className="bg-card border-border flex items-center py-2 px-3"
						>
							<span
								className={`material-symbols-outlined h-4 w-4 mr-2 ${
									saveFeedback.type === "success"
										? "text-green-500"
										: "text-destructive"
								}`}
							>
								{saveFeedback.type === "success" ? "check_circle" : "error"}
							</span>
							<div>
								<AlertTitle className="text-sm font-semibold mb-0">
									{saveFeedback.type === "success" ? "Success" : "Error"}
								</AlertTitle>
								<AlertDescription className="text-xs text-muted-foreground mt-0.5">
									{saveFeedback.message}
								</AlertDescription>
							</div>
						</Alert>
					</div>
				)}
				<div className="flex gap-3 w-full">
					<Button
						variant="outline"
						onClick={handleBack}
						className="h-12 px-4 rounded-full border-border text-foreground font-bold text-sm hover:bg-muted/50 transition-colors"
					>
						{activeTab === "profile" ? "Cancel" : "Back"}
					</Button>
					<Button
						variant="ghost"
						onClick={handleDiscard}
						className="h-12 w-12 rounded-full border border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive/80 transition-colors flex items-center justify-center"
						title="Discard Draft"
					>
						<span className="material-symbols-outlined text-xl">delete</span>
					</Button>
					<div className="flex-1" /> {/* Spacer */}
					<Button
						variant="ghost"
						onClick={handleSaveDraft}
						disabled={isSaving}
						className="h-12 w-12 rounded-full border border-border text-muted-foreground hover:bg-muted/50 transition-colors flex items-center justify-center"
						title="Save Draft"
					>
						<span
							className={`material-symbols-outlined text-xl ${
								isSaving ? "animate-spin" : ""
							}`}
						>
							{isSaving ? "progress_activity" : "save"}
						</span>
					</Button>
					<Button
						onClick={activeTab === "contact" ? handleSubmit : handleNext}
						className="flex-1 h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
					>
						{activeTab === "contact"
							? mode === "edit"
								? "Save Changes"
								: "Submit for Review"
							: "Next Step"}
						<span className="material-symbols-outlined text-lg">
							{activeTab === "contact"
								? mode === "edit"
									? "save"
									: "send"
								: "arrow_forward"}
						</span>
					</Button>
				</div>
			</div>
		</motion.div>
	);
}

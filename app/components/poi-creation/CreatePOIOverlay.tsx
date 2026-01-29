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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Button } from "@/components/ui/button";
import { usePOIForm } from "../../contexts/POIFormContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FixedFooter } from "@/components/layout";
import { MobileShell } from "@/components/layout/MobileShell";
import { useHideBottomNav } from "@/contexts/BottomNavContext";
import * as Sentry from "@sentry/nextjs";

// Lazy load all tab components
const ProfileVisualsTab = lazy(() => import("./ProfileVisualsTab"));
const LocationTab = lazy(() => import("./LocationTab"));
const WorkProdTab = lazy(() => import("./WorkProdTab"));
const AtmosphereTab = lazy(() => import("./AtmosphereTab"));
const FoodDrinkTab = lazy(() => import("./FoodDrinkTab"));
const OperationsTab = lazy(() => import("./OperationsTab"));
const SocialLifestyleTab = lazy(() => import("./SocialLifestyleTab"));
const ContactTab = lazy(() => import("./ContactTab"));

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

const FIELD_TO_TAB: Record<string, Tab> = {
	name: "profile",
	brandName: "profile",
	categories: "profile",
	description: "profile",
	coverImage: "profile",
	galleryImages: "profile",
	address: "location",
	floorUnit: "location",
	latitude: "location",
	longitude: "location",
	publicTransport: "location",
	parkingOptions: "location",
	wheelchairAccessible: "location",
	wifiQuality: "workprod",
	powerOutlets: "workprod",
	seatingOptions: "workprod",
	noiseLevel: "workprod",
	hasAC: "workprod",
	vibes: "atmosphere",
	crowdType: "atmosphere",
	lighting: "atmosphere",
	musicType: "atmosphere",
	cleanliness: "atmosphere",
	cuisine: "fooddrink",
	priceRange: "fooddrink",
	dietaryOptions: "fooddrink",
	featuredItems: "fooddrink",
	specials: "fooddrink",
	openHours: "operations",
	reservationRequired: "operations",
	reservationPlatform: "operations",
	paymentOptions: "operations",
	waitTimeEstimate: "operations",
	kidsFriendly: "social",
	petFriendly: "social",
	petPolicy: "social",
	smokerFriendly: "social",
	happyHourInfo: "social",
	loyaltyProgram: "social",
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

	// Correctly destructure only available context methods
	const { saveDraft, saveSection, fetchSection, submitForReview, resetForm } =
		usePOIForm();

	// Local state for UI feedback
	const [saveFeedback, setSaveFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const [isSubmittingForm, setIsSubmittingForm] = useState(false);
	const [isDraftSaving, setIsDraftSaving] = useState(false);

	useHideBottomNav();

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

	useEffect(() => {
		if (mode === "edit") {
			fetchSection(activeTab);
		}
	}, [mode, fetchSection, activeTab]);

	const handleTabChange = useCallback(
		async (tab: Tab) => {
			if (mode === "edit") {
				if (tab !== activeTab) {
					try {
						await saveSection(activeTab);
					} catch (error) {
						console.error("Auto-save failed on tab switch:", error);
					}
				}
				fetchSection(tab);
			}

			setActiveTab(tab);
			const params = new URLSearchParams(searchParams.toString());
			params.set("tab", tab);
			router.replace(`?${params.toString()}`, { scroll: false });
		},
		[router, searchParams, mode, activeTab, saveSection, fetchSection],
	);

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

	const handleScroll = useCallback(() => {
		const container = tabsListRef.current;
		if (!container) return;

		const { scrollLeft, scrollWidth, clientWidth } = container;
		const isAtStart = scrollLeft <= 5;
		const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 5;

		setShowLeftFade(!isAtStart);
		setShowRightFade(!isAtEnd);
	}, []);

	useEffect(() => {
		const container = tabsListRef.current;
		if (!container) return;
		handleScroll();
		container.addEventListener("scroll", handleScroll);
		return () => container.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

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
			if (mode === "edit") {
				try {
					await saveSection(activeTab);
				} catch (error) {
					console.error("Failed to save on Next:", error);
				}
			}
			handleTabChange(TABS[currentIndex + 1]);
		}
	};

	const handleSaveDraft = async () => {
		setIsDraftSaving(true);
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
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";

			if (
				errorMessage.toLowerCase().includes("not authorized") ||
				errorMessage.toLowerCase().includes("forbidden")
			) {
				setSaveFeedback({
					type: "error",
					message:
						"You don't have permission to save this POI. This draft may belong to a different account. Please discard and start fresh.",
				});
				return;
			}

			if (
				errorMessage.toLowerCase().includes("not found") ||
				errorMessage.toLowerCase().includes("poi not found")
			) {
				setSaveFeedback({
					type: "error",
					message:
						"This POI no longer exists. It may have been deleted. Please discard and start fresh.",
				});
				return;
			}

			setSaveFeedback({
				type: "error",
				message: "Failed to save. Please try again.",
			});
		} finally {
			setIsDraftSaving(false);
		}
	};

	const handleSubmit = async () => {
		if (isSubmittingForm) return;
		setIsSubmittingForm(true);

		try {
			const result = await submitForReview();

			if (result && result.success) {
				setSaveFeedback({
					type: "success",
					message: "POI submitted for review successfully!",
				});
				setTimeout(() => onClose(), 1500);
			} else if (result && result.error) {
				setSaveFeedback({
					type: "error",
					message: `Failed to submit: ${result.message || result.error}`,
				});
			} else {
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

			if (errorMessage.startsWith("validation:")) {
				const parts = errorMessage.split(":");
				const fieldName = parts[1];
				const fieldErrorMessage = parts.slice(2).join(":");
				const targetTab = FIELD_TO_TAB[fieldName];

				if (targetTab) {
					setActiveTab(targetTab);
					const params = new URLSearchParams(searchParams.toString());
					params.set("tab", targetTab);
					router.replace(`?${params.toString()}`, { scroll: false });
				}

				setSaveFeedback({
					type: "error",
					message:
						fieldErrorMessage ||
						"Please fix validation errors before submitting.",
				});
				return;
			}

			if (
				errorMessage.toLowerCase().includes("not authorized") ||
				errorMessage.toLowerCase().includes("forbidden")
			) {
				setSaveFeedback({
					type: "error",
					message:
						"You don't have permission to edit this POI. This draft may belong to a different account. Please discard and start fresh.",
				});
				return;
			}

			if (
				errorMessage.toLowerCase().includes("not found") ||
				errorMessage.toLowerCase().includes("poi not found")
			) {
				setSaveFeedback({
					type: "error",
					message:
						"This POI no longer exists. It may have been deleted. Please discard and start fresh.",
				});
				return;
			}

			setSaveFeedback({
				type: "error",
				message: `Error submitting POI: ${errorMessage}`,
			});
		} finally {
			setIsSubmittingForm(false);
		}
	};

	const handleDiscard = () => {
		if (
			confirm(
				"Are you sure you want to discard this draft? This action cannot be undone.",
			)
		) {
			resetForm();
			onClose();
		}
	};

	const headerContent = (
		<div className="flex-none z-50 bg-background/95 backdrop-blur-md border-border/50 pt-[calc(0.75rem+env(safe-area-inset-top))]">
			<div className="flex items-center p-4 pb-2 justify-between relative">
				<div className="w-10"></div>
				<h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] text-center absolute left-1/2 -translate-x-1/2 w-[70%] truncate">
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
						<div
							className={`absolute left-0 top-0 bottom-0 w-36 bg-linear-to-r from-background to-transparent z-10 pointer-events-none rounded-l-full transition-opacity duration-200 ${
								showLeftFade ? "opacity-100" : "opacity-0"
							}`}
						/>
						<div
							className={`absolute right-0 top-0 bottom-0 w-36 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none rounded-r-full transition-opacity duration-200 ${
								showRightFade ? "opacity-100" : "opacity-0"
							}`}
						/>
						<TabsList ref={tabsListRef}>
							{/* Tabs Triggers */}

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
	);

	const footerContent = (
		<FixedFooter showBorder contentClassName="flex flex-col gap-3">
			{saveFeedback && (
				<div className="animate-in slide-in-from-bottom-5 fade-in duration-300">
					<Alert
						variant={saveFeedback.type === "error" ? "destructive" : "default"}
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
				<div className="flex-1" />
				<Button
					variant="ghost"
					onClick={handleSaveDraft}
					disabled={isDraftSaving}
					className="h-12 w-12 rounded-full border border-border text-muted-foreground hover:bg-muted/50 transition-colors flex items-center justify-center"
					title="Save Draft"
				>
					<span
						className={`material-symbols-outlined text-xl ${
							isDraftSaving ? "animate-spin" : ""
						}`}
					>
						{isDraftSaving ? "progress_activity" : "save"}
					</span>
				</Button>
				<Button
					onClick={activeTab === "contact" ? handleSubmit : handleNext}
					disabled={
						isSubmittingForm || (activeTab === "contact" && isDraftSaving)
					}
					className="flex-1 h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSubmittingForm ? (
						<>
							<span className="material-symbols-outlined text-lg animate-spin">
								progress_activity
							</span>
							Submitting...
						</>
					) : (
						<>
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
						</>
					)}
				</Button>
			</div>
		</FixedFooter>
	);

	return (
		<div className="relative w-full h-full bg-background">
			<MobileShell
				header={headerContent}
				footer={footerContent}
				showBottomNav={false}
				className="h-full"
				contentClassName="pb-32"
			>
				<div className="h-full">
					<Suspense fallback={<TabSkeleton />}>
						<Tabs
							value={activeTab}
							variant="rounded"
							className="w-full h-full flex flex-col"
						>
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
				</div>
			</MobileShell>
		</div>
	);
}

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
			<div className="h-6 w-32 bg-surface-border rounded" />
			<div className="h-14 w-full bg-surface-border rounded-xl" />
			<div className="h-14 w-full bg-surface-border rounded-xl" />
			<div className="h-32 w-full bg-surface-border rounded-xl" />
		</div>
	);
}

interface CreatePOIOverlayProps {
	onClose: () => void;
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

export default function CreatePOIOverlay({ onClose }: CreatePOIOverlayProps) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const tabsListRef = useRef<HTMLDivElement>(null);
	const tabRefs = useRef<Map<Tab, HTMLButtonElement>>(new Map());
	const { saveDraft, submitForReview, isSaving } = usePOIForm();

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

	// Sync URL query param when tab changes
	const handleTabChange = useCallback(
		(tab: Tab) => {
			setActiveTab(tab);
			const params = new URLSearchParams(searchParams.toString());
			params.set("tab", tab);
			router.replace(`?${params.toString()}`, { scroll: false });
		},
		[router, searchParams]
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

	const handleNext = () => {
		const currentIndex = TABS.indexOf(activeTab);
		if (currentIndex < TABS.length - 1) {
			handleTabChange(TABS[currentIndex + 1]);
		}
	};

	const handleSaveDraft = async () => {
		try {
			await saveDraft();
			setSaveFeedback({
				type: "success",
				message: "Draft saved successfully!",
			});
		} catch (error) {
			console.error("Failed to save draft:", error);
			setSaveFeedback({
				type: "error",
				message: "Failed to save draft. Please try again.",
			});
		}
	};

	const handleSubmit = async () => {
		try {
			await submitForReview();
			onClose();
		} catch (error) {
			console.error("Failed to submit:", error);
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
			className="absolute top-4 left-0 right-0 bottom-0 z-[100] bg-background-light dark:bg-background-dark flex flex-col rounded-t-3xl overflow-hidden"
		>
			<div className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-surface-border/50 pt-2">
				<div className="flex items-center p-4 pb-2 justify-between relative">
					<div className="w-10"></div> {/* Spacer for centering */}
					<h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] text-center absolute left-1/2 -translate-x-1/2">
						Add New POI
					</h2>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="w-10 h-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-border/50 transition-colors"
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
								className={`absolute left-0 top-0 bottom-0 w-36 bg-gradient-to-r from-surface-dark to-transparent z-10 pointer-events-none rounded-l-full transition-opacity duration-200 ${
									showLeftFade ? "opacity-100" : "opacity-0"
								}`}
							/>
							{/* Right fade overlay */}
							<div
								className={`absolute right-0 top-0 bottom-0 w-36 bg-gradient-to-l from-surface-dark to-transparent z-10 pointer-events-none rounded-r-full transition-opacity duration-200 ${
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

			<div className="sticky bottom-0 left-0 right-0 p-4 pb-6 bg-background-dark border-t border-white/10 flex flex-col gap-3 z-50">
				{saveFeedback && (
					<div className="animate-in slide-in-from-bottom-5 fade-in duration-300">
						<Alert
							variant={
								saveFeedback.type === "error" ? "destructive" : "default"
							}
							className="bg-surface-card border-surface-border flex items-center py-2 px-3"
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
						className="h-12 px-4 rounded-full border-white/10 text-foreground font-bold text-sm hover:bg-surface-border/50 transition-colors"
					>
						{activeTab === "profile" ? "Cancel" : "Back"}
					</Button>
					<Button
						variant="ghost"
						onClick={handleSaveDraft}
						disabled={isSaving}
						className="h-12 px-4 rounded-full border border-white/10 text-muted-foreground font-medium text-sm hover:bg-surface-border/50 transition-colors"
					>
						{isSaving ? (
							<span className="material-symbols-outlined text-lg animate-spin">
								progress_activity
							</span>
						) : (
							<>
								<span className="material-symbols-outlined text-lg mr-1">
									save
								</span>
								Save Draft
							</>
						)}
					</Button>
					<Button
						onClick={activeTab === "contact" ? handleSubmit : handleNext}
						className="flex-1 h-12 rounded-full bg-primary text-black font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
					>
						{activeTab === "contact" ? "Submit for Review" : "Next Step"}
						<span className="material-symbols-outlined text-lg">
							{activeTab === "contact" ? "send" : "arrow_forward"}
						</span>
					</Button>
				</div>
			</div>
		</motion.div>
	);
}

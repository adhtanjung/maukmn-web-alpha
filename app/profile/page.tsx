"use client";

import { useAppUser } from "@/app/hooks/useAppUser";
import { useUserPOIs, UserPOI } from "@/app/hooks/useUserPOIs";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import BottomNav from "@/app/components/discovery/BottomNav";
import StickyHeader from "@/app/components/discovery/StickyHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Status badge color mapping
const statusColors: Record<string, string> = {
	draft: "bg-slate-500/10 text-slate-500 border-slate-500/20",
	pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
	approved: "bg-green-500/10 text-green-500 border-green-500/20",
	rejected: "bg-red-500/10 text-red-500 border-red-500/20",
};

// My Submissions Section Component
function MySubmissionsSection() {
	const router = useRouter();
	const { pois, loading, total } = useUserPOIs();

	if (loading) {
		return (
			<div className="rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 p-4 shadow-sm dark:shadow-none">
				<div className="flex items-center justify-between mb-3">
					<h3 className="font-bold text-slate-900 dark:text-white">
						My Submissions
					</h3>
				</div>
				<div className="animate-pulse space-y-3">
					<div className="h-14 bg-slate-200 dark:bg-white/5 rounded-lg" />
					<div className="h-14 bg-slate-200 dark:bg-white/5 rounded-lg" />
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm dark:shadow-none">
			<div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
				<div className="flex items-center gap-2">
					<span className="material-symbols-outlined text-primary">
						description
					</span>
					<h3 className="font-bold text-slate-900 dark:text-white">
						My Submissions
					</h3>
					<Badge variant="secondary" className="text-xs">
						{total}
					</Badge>
				</div>
			</div>
			{pois.length === 0 ? (
				<div className="p-6 text-center">
					<span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">
						note_add
					</span>
					<p className="text-sm text-slate-500 dark:text-slate-400">
						No submissions yet
					</p>
					<Button
						variant="outline"
						size="sm"
						className="mt-3"
						onClick={() => router.push("/create-poi")}
					>
						Create your first POI
					</Button>
				</div>
			) : (
				<div className="divide-y divide-slate-100 dark:divide-white/5">
					{pois.map((poi: UserPOI) => (
						<div
							key={poi.poi_id}
							className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
						>
							<div className="flex items-center gap-3 min-w-0 flex-1">
								<div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-white/5 shrink-0 overflow-hidden">
									{poi.cover_image_url ? (
										<img
											src={poi.cover_image_url}
											alt={poi.name}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<span className="material-symbols-outlined text-slate-400 text-sm">
												image
											</span>
										</div>
									)}
								</div>
								<div className="min-w-0">
									<p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
										{poi.name}
									</p>
									<Badge
										variant="outline"
										className={`text-[10px] uppercase tracking-wide mt-1 ${
											statusColors[poi.status] || statusColors.draft
										}`}
									>
										{poi.status}
									</Badge>
								</div>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="shrink-0"
								onClick={() => router.push(`/edit-poi/${poi.poi_id}`)}
							>
								<span className="material-symbols-outlined text-lg">edit</span>
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default function ProfilePage() {
	const { user, isLoaded } = useUser();
	const { isAdmin } = useAppUser();
	const router = useRouter();

	if (!isLoaded) return null;

	return (
		<main className="h-full w-full bg-background-light dark:bg-background-dark font-sans antialiased text-slate-900 dark:text-white min-h-screen flex flex-col overflow-hidden relative">
			{/* Scrollable Content Area */}
			<motion.div
				className="flex-1 overflow-y-auto no-scrollbar pb-24"
				initial={{ y: "100%" }}
				animate={{ y: 0 }}
				exit={{ y: "100%" }}
				transition={{
					type: "tween",
					damping: 100,
					stiffness: 300,
					duration: 0.4,
				}}
			>
				{/* Sticky Header */}
				<StickyHeader
					title="Profile"
					rightAction={
						<div className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors">
							<span className="material-symbols-outlined text-primary">
								share
							</span>
						</div>
					}
				/>

				{/* Profile Info Section */}
				<div className="px-5 pt-2 pb-6">
					<div className="flex items-start gap-5">
						<div className="relative shrink-0">
							<div
								className="h-20 w-20 rounded-full bg-cover bg-center border-2 border-background-light dark:border-white/10 shadow-lg"
								style={{
									backgroundImage: `url("${user?.imageUrl}")`,
								}}
							></div>
							<button className="absolute -bottom-1 -right-1 bg-primary hover:bg-primary/90 text-white rounded-full p-1.5 border-[3px] border-background-light dark:border-background-dark flex items-center justify-center shadow-sm transition-colors cursor-pointer">
								<span
									className="material-symbols-outlined"
									style={{ fontSize: "14px" }}
								>
									edit
								</span>
							</button>
						</div>
						<div className="flex-1 min-w-0 flex flex-col pt-1">
							<div className="flex justify-between items-start">
								<div>
									<h1 className="text-xl font-bold text-slate-900 dark:text-white truncate leading-tight">
										{user?.fullName || "User"}
									</h1>
									<p className="text-primary text-sm font-medium">
										{user?.username
											? `@${user.username}`
											: user?.primaryEmailAddress?.emailAddress}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-5 mt-3">
								<div className="flex flex-col">
									<span className="font-bold text-slate-900 dark:text-white text-base leading-none">
										0
									</span>
									<span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium uppercase tracking-wide mt-0.5">
										Reviews
									</span>
								</div>
								<div className="w-[1px] h-6 bg-slate-200 dark:bg-white/10"></div>
								<div className="flex flex-col">
									<span className="font-bold text-slate-900 dark:text-white text-base leading-none">
										0
									</span>
									<span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium uppercase tracking-wide mt-0.5">
										Photos
									</span>
								</div>
								<div className="w-[1px] h-6 bg-slate-200 dark:bg-white/10"></div>
								<div className="flex flex-col">
									<span className="font-bold text-slate-900 dark:text-white text-base leading-none">
										0
									</span>
									<span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium uppercase tracking-wide mt-0.5">
										Saved
									</span>
								</div>
							</div>
						</div>
					</div>
					<div className="mt-4 px-1">
						<p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
							Exploring the world, one POI at a time.
						</p>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="px-4 flex flex-col gap-4">
					{/* Admin Panel Button - Only visible to admins */}
					{isAdmin && (
						<motion.div
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 cursor-pointer hover:bg-primary/25 transition-all"
							onClick={() => router.push("/admin")}
						>
							<div className="flex items-center gap-3">
								<div className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
									<span className="material-symbols-outlined">
										admin_panel_settings
									</span>
								</div>
								<div>
									<p className="font-bold text-slate-900 dark:text-white text-base">
										Admin Panel
									</p>
									<p className="text-xs text-primary/80 font-medium">
										Manage users & POIs
									</p>
								</div>
							</div>
							<div className="bg-white/10 rounded-full p-1 group-hover:bg-white/20 transition-colors">
								<span
									className="material-symbols-outlined text-primary"
									style={{ fontSize: "20px" }}
								>
									arrow_forward
								</span>
							</div>
						</motion.div>
					)}

					{/* My Submissions Section */}
					<MySubmissionsSection />

					<div className="flex flex-col rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm dark:shadow-none mt-4">
						<div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer active:bg-slate-100 dark:active:bg-white/10 transition-colors">
							<div className="flex items-center gap-3">
								<div className="bg-slate-100 dark:bg-white/5 p-1.5 rounded-lg text-slate-500 dark:text-slate-400">
									<span
										className="material-symbols-outlined"
										style={{ fontSize: "20px" }}
									>
										settings
									</span>
								</div>
								<span className="text-slate-900 dark:text-white font-medium">
									Settings
								</span>
							</div>
							<span className="material-symbols-outlined text-slate-400 text-lg">
								chevron_right
							</span>
						</div>
						<div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer active:bg-slate-100 dark:active:bg-white/10 transition-colors">
							<div className="flex items-center gap-3">
								<div className="bg-slate-100 dark:bg-white/5 p-1.5 rounded-lg text-slate-500 dark:text-slate-400">
									<span
										className="material-symbols-outlined"
										style={{ fontSize: "20px" }}
									>
										notifications
									</span>
								</div>
								<span className="text-slate-900 dark:text-white font-medium">
									Notifications
								</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="size-2 rounded-full bg-red-500"></div>
								<span className="material-symbols-outlined text-slate-400 text-lg">
									chevron_right
								</span>
							</div>
						</div>
						<div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer active:bg-slate-100 dark:active:bg-white/10 transition-colors">
							<div className="flex items-center gap-3">
								<div className="bg-slate-100 dark:bg-white/5 p-1.5 rounded-lg text-slate-500 dark:text-slate-400">
									<span
										className="material-symbols-outlined"
										style={{ fontSize: "20px" }}
									>
										help
									</span>
								</div>
								<span className="text-slate-900 dark:text-white font-medium">
									Help & Support
								</span>
							</div>
							<span className="material-symbols-outlined text-slate-400 text-lg">
								chevron_right
							</span>
						</div>
					</div>

					<SignOutButton>
						<button className="w-full p-3.5 mt-2 mb-8 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 dark:text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 active:scale-[0.98] transition-all">
							<span
								className="material-symbols-outlined"
								style={{ fontSize: "20px" }}
							>
								logout
							</span>
							Log Out
						</button>
					</SignOutButton>

					<p className="text-center text-[10px] text-slate-400 dark:text-slate-600 mb-8 font-medium">
						v0.1.0 • Alpha
					</p>
				</div>
			</motion.div>

			<BottomNav
				onProfileClick={() => {}}
				onCreateClick={() => router.push("/create-poi")}
			/>
		</main>
	);
}

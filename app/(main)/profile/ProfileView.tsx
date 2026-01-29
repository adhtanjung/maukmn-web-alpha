"use client";

import { UserPOI } from "@/app/hooks/useUserPOIs";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import StickyHeader from "@/app/components/discovery/StickyHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import Image from "next/image";
import ProfileLoading from "./loading";

// Status badge color mapping
const statusColors: Record<string, string> = {
	draft: "bg-slate-500/10 text-slate-500 border-slate-500/20",
	pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
	approved: "bg-green-500/10 text-green-500 border-green-500/20",
	rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

interface ProfileViewProps {
	initialPOIs: UserPOI[];
	poiTotal: number;
	isAdmin: boolean;
	appUser: any; // Type this properly if shared types exist
}

function MySubmissionsSection({
	pois,
	total,
}: {
	pois: UserPOI[];
	total: number;
}) {
	const router = useRouter();

	return (
		<div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
			<div className="flex items-center justify-between p-4 border-b border-border">
				<div className="flex items-center gap-2">
					<span className="material-symbols-outlined text-primary">
						description
					</span>
					<h3 className="font-bold text-foreground">My Submissions</h3>
					<Badge variant="secondary" className="text-xs">
						{total}
					</Badge>
				</div>
			</div>
			{pois.length === 0 ? (
				<div className="p-6 text-center">
					<span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">
						note_add
					</span>
					<p className="text-sm text-muted-foreground">No submissions yet</p>
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
				<div className="divide-y divide-border">
					{pois.map((poi: UserPOI) => (
						<div
							key={poi.poi_id}
							className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
						>
							<div className="flex items-center gap-3 min-w-0 flex-1">
								<div className="w-12 h-12 rounded-lg bg-muted shrink-0 overflow-hidden relative">
									{poi.cover_image_url ? (
										<Image
											src={poi.cover_image_url}
											alt={poi.name}
											fill
											className="object-cover"
											unoptimized
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<span className="material-symbols-outlined text-muted-foreground text-sm">
												image
											</span>
										</div>
									)}
								</div>
								<div className="min-w-0">
									<p className="font-semibold text-sm text-foreground truncate">
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

export default function ProfileView({
	initialPOIs,
	poiTotal,
	isAdmin,
}: ProfileViewProps) {
	const { user, isLoaded } = useUser();
	const router = useRouter();
	const { theme, setTheme } = useTheme();

	// If Clerk is still loading, we show skeleton, but main data is already here via props
	if (!isLoaded) return <ProfileLoading />;

	return (
		<main className="h-full w-full bg-background font-sans antialiased text-foreground min-h-screen flex flex-col overflow-hidden relative">
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
						<div className="flex size-10 items-center justify-center rounded-full hover:bg-muted cursor-pointer transition-colors">
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
								className="h-20 w-20 rounded-full bg-cover bg-center border-2 border-background shadow-lg"
								style={{
									backgroundImage: `url("${user?.imageUrl}")`,
								}}
							></div>
							<button className="absolute -bottom-1 -right-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-1.5 border-[3px] border-background flex items-center justify-center shadow-sm transition-colors cursor-pointer">
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
									<h1 className="text-xl font-bold text-foreground truncate leading-tight">
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
									<span className="font-bold text-foreground text-base leading-none">
										0
									</span>
									<span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide mt-0.5">
										Reviews
									</span>
								</div>
								<div className="w-px h-6 bg-border"></div>
								<div className="flex flex-col">
									<span className="font-bold text-foreground text-base leading-none">
										0
									</span>
									<span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide mt-0.5">
										Photos
									</span>
								</div>
								<div className="w-px h-6 bg-border"></div>
								<div className="flex flex-col">
									<span className="font-bold text-foreground text-base leading-none">
										{poiTotal}
									</span>
									<span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide mt-0.5">
										Saved
									</span>
								</div>
							</div>
						</div>
					</div>
					<div className="mt-4 px-1">
						<p className="text-sm text-muted-foreground leading-relaxed font-normal">
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
							className="group flex items-center justify-between p-4 rounded-2xl bg-linear-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 cursor-pointer hover:bg-primary/25 transition-all"
							onClick={() => router.push("/admin")}
						>
							<div className="flex items-center gap-3">
								<div className="p-2 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20">
									<span className="material-symbols-outlined">
										admin_panel_settings
									</span>
								</div>
								<div>
									<p className="font-bold text-foreground text-base">
										Admin Panel
									</p>
									<p className="text-xs text-primary/80 font-medium">
										Manage users & POIs
									</p>
								</div>
							</div>
							<div className="bg-background/20 rounded-full p-1 group-hover:bg-background/30 transition-colors">
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
					<MySubmissionsSection pois={initialPOIs} total={poiTotal} />

					<div className="flex flex-col rounded-2xl bg-card border border-border overflow-hidden shadow-sm mt-4">
						{/* Dark Mode Toggle */}
						<div
							className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 cursor-pointer active:bg-muted transition-colors"
							onClick={() =>
								theme && setTheme(theme === "dark" ? "light" : "dark")
							}
						>
							<div className="flex items-center gap-3">
								<div className="bg-muted p-1.5 rounded-lg text-muted-foreground">
									<span
										className="material-symbols-outlined"
										style={{ fontSize: "20px" }}
									>
										{theme === "dark" ? "dark_mode" : "light_mode"}
									</span>
								</div>
								<span className="text-foreground font-medium">Dark Mode</span>
							</div>
							{theme && (
								<Switch
									checked={theme === "dark"}
									onCheckedChange={(checked) =>
										setTheme(checked ? "dark" : "light")
									}
								/>
							)}
						</div>

						<div className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 cursor-pointer active:bg-muted transition-colors">
							<div className="flex items-center gap-3">
								<div className="bg-muted p-1.5 rounded-lg text-muted-foreground">
									<span
										className="material-symbols-outlined"
										style={{ fontSize: "20px" }}
									>
										settings
									</span>
								</div>
								<span className="text-foreground font-medium">Settings</span>
							</div>
							<span className="material-symbols-outlined text-muted-foreground text-lg">
								chevron_right
							</span>
						</div>
						<div className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 cursor-pointer active:bg-muted transition-colors">
							<div className="flex items-center gap-3">
								<div className="bg-muted p-1.5 rounded-lg text-muted-foreground">
									<span
										className="material-symbols-outlined"
										style={{ fontSize: "20px" }}
									>
										notifications
									</span>
								</div>
								<span className="text-foreground font-medium">
									Notifications
								</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="size-2 rounded-full bg-destructive"></div>
								<span className="material-symbols-outlined text-muted-foreground text-lg">
									chevron_right
								</span>
							</div>
						</div>
						<div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer active:bg-muted transition-colors">
							<div className="flex items-center gap-3">
								<div className="bg-muted p-1.5 rounded-lg text-muted-foreground">
									<span
										className="material-symbols-outlined"
										style={{ fontSize: "20px" }}
									>
										help
									</span>
								</div>
								<span className="text-foreground font-medium">
									Help & Support
								</span>
							</div>
							<span className="material-symbols-outlined text-muted-foreground text-lg">
								chevron_right
							</span>
						</div>
					</div>

					<SignOutButton>
						<button className="w-full p-3.5 mt-2 mb-8 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive font-bold flex items-center justify-center gap-2 hover:bg-destructive/10 active:scale-[0.98] transition-all">
							<span
								className="material-symbols-outlined"
								style={{ fontSize: "20px" }}
							>
								logout
							</span>
							Log Out
						</button>
					</SignOutButton>

					<p className="text-center text-[10px] text-muted-foreground mb-8 font-medium">
						v0.1.0 • Alpha
					</p>
				</div>
			</motion.div>
		</main>
	);
}

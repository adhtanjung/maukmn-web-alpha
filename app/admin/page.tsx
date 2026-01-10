"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import StickyHeader from "@/app/components/discovery/StickyHeader";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
	const router = useRouter();

	return (
		<main className="bg-background font-sans antialiased text-foreground h-dvh flex flex-col overflow-hidden">
			<motion.div
				className="flex-1 overflow-y-auto no-scrollbar pb-8"
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
				<StickyHeader title="Admin Panel" />

				<div className="px-4 py-6">
					<div className="mb-6 px-1">
						<h1 className="text-2xl font-bold text-foreground mb-2">
							Dashboard
						</h1>
						<p className="text-sm text-muted-foreground">
							Manage app content, users, and settings.
						</p>
					</div>

					<div className="flex flex-col gap-4">
						{/* Stats Area */}
						<div className="grid grid-cols-2 gap-3 mb-2">
							<div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
								<div className="flex items-start justify-between mb-2">
									<span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg">
										warning
									</span>
									<Badge
										variant="destructive"
										className="px-1.5 py-0 h-5 min-w-5 flex items-center justify-center"
									>
										12
									</Badge>
								</div>
								<p className="text-2xl font-bold text-foreground">12</p>
								<p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
									Pending Reports
								</p>
							</div>
							<div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
								<div className="flex items-start justify-between mb-2">
									<span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
										verified
									</span>
									<Badge
										variant="default"
										className="px-1.5 py-0 h-5 min-w-5 flex items-center justify-center bg-primary text-primary-foreground"
									>
										5
									</Badge>
								</div>
								<p className="text-2xl font-bold text-foreground">5</p>
								<p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
									POI Approvals
								</p>
							</div>
						</div>

						{/* Management Section */}
						<h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1 mt-2 mb-1">
							Management
						</h3>
						<div className="flex flex-col rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
							<div className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 cursor-pointer active:scale-[0.98] transition-all group">
								<div className="flex items-center gap-4">
									<div className="bg-primary/10 p-2.5 rounded-xl text-primary">
										<span className="material-symbols-outlined filled">
											group
										</span>
									</div>
									<div>
										<span className="text-foreground font-bold block text-base">
											User Management
										</span>
										<span className="text-xs text-muted-foreground">
											View profiles, bans, and roles
										</span>
									</div>
								</div>
								<span className="material-symbols-outlined text-muted-foreground group-hover:text-primary transition-colors">
									chevron_right
								</span>
							</div>
							<div className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 cursor-pointer active:scale-[0.98] transition-all group">
								<div className="flex items-center gap-4">
									<div className="bg-secondary/10 p-2.5 rounded-xl text-secondary">
										<span className="material-symbols-outlined filled">
											flag
										</span>
									</div>
									<div>
										<span className="text-foreground font-bold block text-base">
											Reported Content
										</span>
										<span className="text-xs text-muted-foreground">
											Moderation queue
										</span>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Badge
										variant="outline"
										className="border-secondary text-secondary bg-secondary/5 font-bold"
									>
										12 New
									</Badge>
									<span className="material-symbols-outlined text-muted-foreground group-hover:text-primary transition-colors">
										chevron_right
									</span>
								</div>
							</div>
							<div
								className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 cursor-pointer active:scale-[0.98] transition-all group"
								onClick={() => router.push("/admin/poi-approvals")}
							>
								<div className="flex items-center gap-4">
									<div className="bg-primary/10 p-2.5 rounded-xl text-primary">
										<span className="material-symbols-outlined filled">
											location_on
										</span>
									</div>
									<div>
										<span className="text-foreground font-bold block text-base">
											POI Approvals
										</span>
										<span className="text-xs text-muted-foreground">
											Review new submissions
										</span>
									</div>
								</div>
								<span className="material-symbols-outlined text-muted-foreground group-hover:text-primary transition-colors">
									chevron_right
								</span>
							</div>
							<div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer active:scale-[0.98] transition-all group">
								<div className="flex items-center gap-4">
									<div className="bg-primary/10 p-2.5 rounded-xl text-primary">
										<span className="material-symbols-outlined filled">
											analytics
										</span>
									</div>
									<div>
										<span className="text-foreground font-bold block text-base">
											Analytics
										</span>
										<span className="text-xs text-muted-foreground">
											Platform growth & engagement
										</span>
									</div>
								</div>
								<span className="material-symbols-outlined text-muted-foreground group-hover:text-primary transition-colors">
									chevron_right
								</span>
							</div>
						</div>

						{/* System Section */}
						<h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1 mt-4 mb-1">
							System
						</h3>
						<div className="flex flex-col rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
							<div className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 cursor-pointer active:scale-[0.98] transition-all group">
								<div className="flex items-center gap-4">
									<div className="bg-muted p-2.5 rounded-xl text-muted-foreground">
										<span className="material-symbols-outlined">settings</span>
									</div>
									<div>
										<span className="text-foreground font-bold block text-base">
											Settings
										</span>
										<span className="text-xs text-muted-foreground">
											Global configuration
										</span>
									</div>
								</div>
								<span className="material-symbols-outlined text-muted-foreground group-hover:text-primary transition-colors">
									chevron_right
								</span>
							</div>
							<div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer active:scale-[0.98] transition-all group">
								<div className="flex items-center gap-4">
									<div className="bg-muted p-2.5 rounded-xl text-muted-foreground">
										<span className="material-symbols-outlined">history</span>
									</div>
									<div>
										<span className="text-foreground font-bold block text-base">
											Activity Logs
										</span>
										<span className="text-xs text-muted-foreground">
											Audit trail
										</span>
									</div>
								</div>
								<span className="material-symbols-outlined text-muted-foreground group-hover:text-primary transition-colors">
									chevron_right
								</span>
							</div>
						</div>

						<div className="mt-8 flex flex-col items-center gap-1">
							<p className="text-[10px] text-muted-foreground/60 font-medium tracking-widest uppercase">
								Admin Access
							</p>
							<p className="text-[10px] text-muted-foreground/40 font-mono">
								v2.4.0 (394)
							</p>
						</div>
					</div>
				</div>
			</motion.div>
		</main>
	);
}

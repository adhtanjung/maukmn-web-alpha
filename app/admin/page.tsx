"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import StickyHeader from "@/app/components/discovery/StickyHeader";

export default function AdminDashboard() {
	const router = useRouter();

	return (
		<main className="bg-background-light dark:bg-background-dark font-sans antialiased text-slate-900 dark:text-white h-dvh flex flex-col overflow-hidden">
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
						<h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
							Dashboard
						</h1>
						<p className="text-sm text-slate-500 dark:text-slate-400">
							Manage app content, users, and settings.
						</p>
					</div>

					<div className="flex flex-col gap-4">
						{/* Stats Area */}
						<div className="grid grid-cols-2 gap-3 mb-2">
							<div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm dark:shadow-none">
								<div className="flex items-start justify-between mb-2">
									<span className="material-symbols-outlined text-orange-500 bg-orange-500/10 p-2 rounded-lg">
										warning
									</span>
									<span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
										12
									</span>
								</div>
								<p className="text-2xl font-bold text-slate-900 dark:text-white">
									12
								</p>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									Pending Reports
								</p>
							</div>
							<div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm dark:shadow-none">
								<div className="flex items-start justify-between mb-2">
									<span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
										verified
									</span>
									<span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-full">
										5
									</span>
								</div>
								<p className="text-2xl font-bold text-slate-900 dark:text-white">
									5
								</p>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									POI Approvals
								</p>
							</div>
						</div>

						{/* Management Section */}
						<h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 mt-2 mb-1">
							Management
						</h3>
						<div className="flex flex-col rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm dark:shadow-none">
							<div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer active:bg-slate-100 dark:active:bg-white/10 transition-colors group">
								<div className="flex items-center gap-4">
									<div className="bg-blue-50 dark:bg-blue-500/10 p-2.5 rounded-xl text-blue-500">
										<span className="material-symbols-outlined filled">
											group
										</span>
									</div>
									<div>
										<span className="text-slate-900 dark:text-white font-bold block text-base">
											User Management
										</span>
										<span className="text-xs text-slate-500 dark:text-slate-400">
											View profiles, bans, and roles
										</span>
									</div>
								</div>
								<span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
									chevron_right
								</span>
							</div>
							<div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer active:bg-slate-100 dark:active:bg-white/10 transition-colors group">
								<div className="flex items-center gap-4">
									<div className="bg-red-50 dark:bg-red-500/10 p-2.5 rounded-xl text-red-500">
										<span className="material-symbols-outlined filled">
											flag
										</span>
									</div>
									<div>
										<span className="text-slate-900 dark:text-white font-bold block text-base">
											Reported Content
										</span>
										<span className="text-xs text-slate-500 dark:text-slate-400">
											Moderation queue
										</span>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-xs font-bold bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-2 py-0.5 rounded-md">
										12 New
									</span>
									<span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
										chevron_right
									</span>
								</div>
							</div>
							<div
								className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer active:bg-slate-100 dark:active:bg-white/10 transition-colors group"
								onClick={() => router.push("/admin/poi-approvals")}
							>
								<div className="flex items-center gap-4">
									<div className="bg-emerald-50 dark:bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500">
										<span className="material-symbols-outlined filled">
											location_on
										</span>
									</div>
									<div>
										<span className="text-slate-900 dark:text-white font-bold block text-base">
											POI Approvals
										</span>
										<span className="text-xs text-slate-500 dark:text-slate-400">
											Review new submissions
										</span>
									</div>
								</div>
								<span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
									chevron_right
								</span>
							</div>
							<div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer active:bg-slate-100 dark:active:bg-white/10 transition-colors group">
								<div className="flex items-center gap-4">
									<div className="bg-purple-50 dark:bg-purple-500/10 p-2.5 rounded-xl text-purple-500">
										<span className="material-symbols-outlined filled">
											analytics
										</span>
									</div>
									<div>
										<span className="text-slate-900 dark:text-white font-bold block text-base">
											Analytics
										</span>
										<span className="text-xs text-slate-500 dark:text-slate-400">
											Platform growth & engagement
										</span>
									</div>
								</div>
								<span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
									chevron_right
								</span>
							</div>
						</div>

						{/* System Section */}
						<h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 mt-4 mb-1">
							System
						</h3>
						<div className="flex flex-col rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm dark:shadow-none">
							<div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer active:bg-slate-100 dark:active:bg-white/10 transition-colors group">
								<div className="flex items-center gap-4">
									<div className="bg-slate-100 dark:bg-white/5 p-2.5 rounded-xl text-slate-500 dark:text-slate-400">
										<span className="material-symbols-outlined">settings</span>
									</div>
									<div>
										<span className="text-slate-900 dark:text-white font-bold block text-base">
											Settings
										</span>
										<span className="text-xs text-slate-500 dark:text-slate-400">
											Global configuration
										</span>
									</div>
								</div>
								<span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
									chevron_right
								</span>
							</div>
							<div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer active:bg-slate-100 dark:active:bg-white/10 transition-colors group">
								<div className="flex items-center gap-4">
									<div className="bg-slate-100 dark:bg-white/5 p-2.5 rounded-xl text-slate-500 dark:text-slate-400">
										<span className="material-symbols-outlined">history</span>
									</div>
									<div>
										<span className="text-slate-900 dark:text-white font-bold block text-base">
											Activity Logs
										</span>
										<span className="text-xs text-slate-500 dark:text-slate-400">
											Audit trail
										</span>
									</div>
								</div>
								<span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
									chevron_right
								</span>
							</div>
						</div>

						<div className="mt-8 flex justify-center">
							<p className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">
								ADMIN ACCESS - v2.4.0 (394)
							</p>
						</div>
					</div>
				</div>
			</motion.div>
		</main>
	);
}

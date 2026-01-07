"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import StickyHeader from "@/app/components/discovery/StickyHeader";

type POI = {
	poi_id: string;
	name: string;
	description: string;
	status: string;
	cover_image_url?: string;
	category_id?: string;
	address_id?: string; // Should resolve address details if needed
	amenities?: string[];
	// Using a placeholder for location string since specific address fields might be disparate
	location_text?: string;
};

const fetcher = async (url: string, token: string | null) => {
	if (!token) return { data: [], count: 0 };
	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) throw new Error("Failed to fetch");
	return res.json();
};

export default function POIApprovalsPage() {
	const router = useRouter();
	const { getToken } = useAuth();
	const [filter, setFilter] = useState<"pending" | "approved" | "rejected">(
		"pending"
	);

	// Map UI filter to API status value
	// "reviewed" in UI -> "approved" in API for simplicity, or we check if we want explicit 'reviewed' state?
	// The user asked for "Reviewed" tab, usually meaning "Approved".
	// Let's assume Filter key matches API param except for "reviewed" -> "approved" mapping if needed.
	// Actually current repo supports "approved", "rejected", "pending".

	const apiStatus = filter === "reviewed" ? "approved" : filter;

	const { data, error, mutate } = useSWR(
		[
			`${
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
			}/api/v1/pois/admin-list?status=${apiStatus}`,
			getToken,
		],
		async ([url, tokenFetcher]) => {
			const token = await tokenFetcher();
			return fetcher(url, token);
		}
	);

	const pois: POI[] = data?.data || [];
	const count = data?.meta?.total || data?.count || 0;

	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const toggleSelection = (id: string) => {
		const next = new Set(selectedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		setSelectedIds(next);
	};

	const handleBulkAction = async (action: "approve" | "reject") => {
		const token = await getToken();
		if (!token) return;

		// Parallel requests
		await Promise.all(
			Array.from(selectedIds).map(async (id) => {
				const endpoint = `${
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
				}/api/v1/pois/${id}/${action}`;
				await fetch(endpoint, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body:
						action === "reject"
							? JSON.stringify({ reason: "Bulk rejection" })
							: undefined,
				});
			})
		);

		setSelectedIds(new Set());
		mutate(); // Refresh list
	};

	return (
		<main className="bg-background-light dark:bg-background-dark font-sans antialiased text-slate-900 dark:text-white h-dvh flex flex-col overflow-hidden">
			<motion.div
				className="flex-1 overflow-y-auto no-scrollbar pb-[120px] sm:pb-[96px]"
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
					title="POI Approvals"
					rightAction={
						<div className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors">
							<span className="material-symbols-outlined text-slate-900 dark:text-white">
								filter_list
							</span>
						</div>
					}
				/>

				<div className="px-4 py-4">
					{/* Filter Tabs */}
					<div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
						<button
							onClick={() => setFilter("pending")}
							className={`px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-slate-200 dark:shadow-none whitespace-nowrap transition-colors ${
								filter === "pending"
									? "bg-slate-900 dark:bg-white text-white dark:text-black"
									: "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"
							}`}
						>
							Pending
						</button>
						<button
							onClick={() => setFilter("approved")}
							className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
								filter === "approved"
									? "bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg shadow-slate-200 dark:shadow-none"
									: "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"
							}`}
						>
							Approved
						</button>
						<button
							onClick={() => setFilter("rejected")}
							className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
								filter === "rejected"
									? "bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg shadow-slate-200 dark:shadow-none"
									: "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"
							}`}
						>
							Rejected
						</button>
					</div>

					{/* List Items */}
					<div className="flex flex-col">
						{pois.length === 0 && (
							<div className="text-center py-10 text-muted-foreground">
								<p>No POIs found in this category.</p>
							</div>
						)}
						{pois.map((poi) => (
							<label
								key={poi.poi_id}
								className="flex items-center gap-3 p-3 bg-surface-light dark:bg-surface-dark rounded-none border-b border-slate-200 dark:border-white/5 group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
								htmlFor={`poi-${poi.poi_id}`}
							>
								<input
									className="form-checkbox h-5 w-5 rounded-md text-primary bg-white dark:bg-white/10 border-slate-300 dark:border-white/20 focus:ring-primary focus:ring-offset-background-light dark:focus:ring-offset-background-dark"
									id={`poi-${poi.poi_id}`}
									type="checkbox"
									checked={selectedIds.has(poi.poi_id)}
									onChange={() => toggleSelection(poi.poi_id)}
								/>
								<div className="flex-1 flex items-center gap-3 min-w-0">
									<div className="w-14 h-14 rounded-lg bg-slate-200 dark:bg-white/5 shrink-0 overflow-hidden relative">
										{poi.cover_image_url ? (
											<img
												alt={poi.name}
												className="w-full h-full object-cover"
												src={poi.cover_image_url}
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center bg-white/10">
												<span className="material-symbols-outlined text-xs">
													image
												</span>
											</div>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-0.5">
											<h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
												{poi.name}
											</h3>
											{/* Placeholder for category badge until we join data properly */}
											<span className="px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] font-bold uppercase tracking-wide border border-purple-100 dark:border-purple-500/20 shrink-0">
												POI
											</span>
										</div>
										<p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">
											{poi.description || "No description provided."}
										</p>
										<div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
											<span className="material-symbols-outlined text-[13px] leading-none">
												location_on
											</span>
											<span className="truncate">
												{poi.location_text || "Coordinates available"}
											</span>
										</div>
									</div>
								</div>
								{/* Edit Button */}
								<button
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										router.push(`/edit-poi/${poi.poi_id}`);
									}}
									className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0"
									title="Edit POI"
								>
									<span className="material-symbols-outlined text-lg text-slate-500 dark:text-slate-400">
										edit
									</span>
								</button>
							</label>
						))}
					</div>

					<div className="mt-8 mb-4 text-center">
						<button className="text-sm text-primary font-bold flex items-center justify-center gap-1 mx-auto py-2 px-4 rounded-full hover:bg-primary/10 transition-colors">
							Load more requests
							<span className="material-symbols-outlined text-sm">
								expand_more
							</span>
						</button>
					</div>
				</div>
			</motion.div>

			{/* Sticky Bottom Actions */}
			{selectedIds.size > 0 && (
				<div className="sticky bottom-0 z-20 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 pt-4 pb-safe-bottom border-t border-slate-200/50 dark:border-white/5">
					<div className="flex gap-3 max-w-md mx-auto">
						<button
							onClick={() => handleBulkAction("reject")}
							className="flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors font-semibold text-sm flex-1"
						>
							<span className="material-symbols-outlined text-[18px]">
								close
							</span>
							Reject Selected ({selectedIds.size})
						</button>
						<button
							onClick={() => handleBulkAction("approve")}
							className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors font-semibold text-sm shadow-lg shadow-emerald-500/20 flex-1"
						>
							<span className="material-symbols-outlined text-[18px]">
								check
							</span>
							Approve Selected ({selectedIds.size})
						</button>
					</div>
				</div>
			)}
		</main>
	);
}

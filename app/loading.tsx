import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="flex flex-col h-screen w-full bg-background overflow-hidden">
			{/* Header Skeleton */}
			<div className="flex items-center justify-between px-4 pt-12 pb-4 border-b border-border bg-background/80 backdrop-blur-md">
				<Skeleton className="h-8 w-32 rounded-lg" />
				<div className="flex gap-2">
					<Skeleton className="h-9 w-9 rounded-full" />
					<Skeleton className="h-9 w-9 rounded-full" />
				</div>
			</div>

			{/* Content Area Skeleton */}
			<div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
				{/* Search/Filter area */}
				<div className="flex gap-2 pb-2 overflow-x-hidden">
					<Skeleton className="h-10 w-24 rounded-full shrink-0" />
					<Skeleton className="h-10 w-32 rounded-full shrink-0" />
					<Skeleton className="h-10 w-28 rounded-full shrink-0" />
				</div>

				{/* Feed Cards Skeletons */}
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={i}
						className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm"
					>
						<Skeleton className="h-64 w-full" />
						<div className="p-4 space-y-3">
							<div className="flex justify-between items-start">
								<div className="space-y-2 flex-1">
									<Skeleton className="h-5 w-3/4 rounded" />
									<Skeleton className="h-4 w-1/2 rounded" />
								</div>
								<Skeleton className="h-10 w-10 rounded-full" />
							</div>
							<div className="flex gap-2 pt-2">
								<Skeleton className="h-6 w-16 rounded-full" />
								<Skeleton className="h-6 w-20 rounded-full" />
								<Skeleton className="h-6 w-12 rounded-full" />
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Bottom Nav Skeleton */}
			<div className="h-20 border-t border-border bg-background flex items-center justify-around px-6">
				<Skeleton className="h-10 w-10 rounded-xl" />
				<Skeleton className="h-10 w-10 rounded-xl" />
				<div className="relative -top-4">
					<Skeleton className="h-14 w-14 rounded-2xl rotate-45 shrink-0" />
				</div>
				<Skeleton className="h-10 w-10 rounded-xl" />
				<Skeleton className="h-10 w-10 rounded-full" />
			</div>
		</div>
	);
}

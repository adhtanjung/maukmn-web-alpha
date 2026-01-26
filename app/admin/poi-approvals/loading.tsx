export default function POIApprovalsLoading() {
	return (
		<main className="bg-background h-dvh flex flex-col overflow-hidden">
			{/* Sticky Header Skeleton */}
			<div className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md px-4 py-3 border-b border-border flex items-center justify-between">
				<div className="h-6 w-32 bg-muted rounded-md animate-pulse" />
				<div className="size-10 rounded-full bg-muted animate-pulse" />
			</div>

			<div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
				{/* Filter Tabs Skeleton */}
				<div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
					<div className="h-10 w-24 bg-muted rounded-full animate-pulse" />
					<div className="h-10 w-24 bg-muted rounded-full animate-pulse" />
					<div className="h-10 w-24 bg-muted rounded-full animate-pulse" />
				</div>

				{/* List Items Skeleton */}
				<div className="flex flex-col">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div
							key={i}
							className="flex items-center gap-3 p-3 border-b border-border"
						>
							<div className="h-5 w-5 rounded bg-muted animate-pulse" />
							<div className="flex-1 flex items-center gap-3">
								<div className="w-14 h-14 rounded-lg bg-muted animate-pulse shrink-0" />
								<div className="flex-1 space-y-2">
									<div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
									<div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
									<div className="h-3 w-1/4 bg-muted rounded animate-pulse" />
								</div>
							</div>
							<div className="h-9 w-9 bg-muted rounded-lg animate-pulse" />
						</div>
					))}
				</div>
			</div>
		</main>
	);
}

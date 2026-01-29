export default function ProfileLoading() {
	return (
		<main className="h-full w-full bg-background flex flex-col overflow-hidden relative min-h-screen">
			{/* Sticky Header Skeleton */}
			<div className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md px-4 py-3 border-b border-border flex items-center justify-between">
				<div className="h-6 w-24 bg-muted rounded-md animate-pulse" />
				<div className="size-10 rounded-full bg-muted animate-pulse" />
			</div>

			<div className="flex-1 overflow-y-auto no-scrollbar pb-24">
				{/* Profile Info Section Skeleton */}
				<div className="px-5 pt-2 pb-6">
					<div className="flex items-start gap-5">
						<div className="h-20 w-20 rounded-full bg-muted animate-pulse shrink-0 shadow-lg" />
						<div className="flex-1 pt-1 space-y-3">
							<div className="space-y-1.5">
								<div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
								<div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
							</div>
							<div className="flex items-center gap-5 pt-1">
								<div className="h-8 w-12 bg-muted rounded animate-pulse" />
								<div className="h-8 w-12 bg-muted rounded animate-pulse" />
								<div className="h-8 w-12 bg-muted rounded animate-pulse" />
							</div>
						</div>
					</div>
					<div className="mt-4 px-1">
						<div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
					</div>
				</div>

				{/* Action Buttons Skeleton */}
				<div className="px-4 flex flex-col gap-4">
					{/* Submissions Section Skeleton */}
					<div className="rounded-2xl bg-card border border-border p-4 shadow-sm space-y-4">
						<div className="h-5 w-32 bg-muted rounded animate-pulse" />
						<div className="space-y-3">
							<div className="h-14 bg-muted rounded-xl animate-pulse" />
							<div className="h-14 bg-muted rounded-xl animate-pulse" />
						</div>
					</div>

					{/* Settings List Skeleton */}
					<div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								className="h-14 w-full border-b border-border bg-card animate-pulse"
							/>
						))}
					</div>
				</div>
			</div>

			{/* Bottom Nav Placeholder */}
			<div className="fixed bottom-0 left-0 right-0 h-20 bg-background border-t border-border" />
		</main>
	);
}

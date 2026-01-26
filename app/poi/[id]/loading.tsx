import { Button } from "@/components/ui/button";

export default function POIDetailLoading() {
	return (
		<div className="flex flex-col h-dvh bg-background font-sans overflow-hidden">
			<div className="flex-1 overflow-y-auto no-scrollbar relative">
				{/* Hero Section Skeleton */}
				<div className="relative h-[45vh] min-h-[400px] w-full bg-muted animate-pulse" />

				{/* Main Content Container Skeleton */}
				<div className="relative px-5 -mt-12 z-10 flex flex-col gap-6 pb-6">
					<div className="flex flex-col gap-2">
						<div className="h-10 w-3/4 bg-muted rounded-lg animate-pulse shadow-lg" />
						<div className="flex items-center gap-2 mt-1">
							<div className="h-4 w-24 bg-muted rounded animate-pulse" />
							<div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
						</div>

						{/* Badges Row Skeleton */}
						<div className="flex items-center gap-4 mt-2">
							<div className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
							<div className="h-6 w-16 bg-muted rounded animate-pulse" />
							<div className="h-6 w-16 bg-muted rounded animate-pulse" />
						</div>

						{/* Description Skeleton */}
						<div className="space-y-2 mt-2">
							<div className="h-4 w-full bg-muted rounded animate-pulse" />
							<div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
							<div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
						</div>
					</div>

					{/* Accordion Skeletons */}
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-16 w-full bg-muted rounded-xl animate-pulse"
							/>
						))}
					</div>
				</div>
			</div>

			{/* Sticky Footer Skeleton */}
			<div className="p-4 pb-8 bg-background border-t border-border z-50 shrink-0">
				<div className="h-14 w-full bg-muted rounded-xl animate-pulse" />
			</div>
		</div>
	);
}

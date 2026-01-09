export default function AdminLoading() {
	return (
		<div className="flex flex-col h-screen w-full bg-background-dark p-4 gap-6">
			{/* Header skeleton */}
			<div className="flex items-center justify-between">
				<div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
				<div className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
			</div>

			{/* Tabs skeleton */}
			<div className="flex gap-2">
				<div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
				<div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
			</div>

			{/* Table/List skeleton */}
			<div className="space-y-3">
				{[1, 2, 3, 4, 5].map((i) => (
					<div
						key={i}
						className="flex items-center gap-4 p-4 bg-card rounded-xl animate-pulse"
					>
						<div className="w-16 h-16 bg-muted rounded-lg shrink-0" />
						<div className="flex-1 space-y-2">
							<div className="h-4 w-3/4 bg-muted rounded" />
							<div className="h-3 w-1/2 bg-muted rounded" />
						</div>
						<div className="h-8 w-20 bg-muted rounded-lg" />
					</div>
				))}
			</div>
		</div>
	);
}

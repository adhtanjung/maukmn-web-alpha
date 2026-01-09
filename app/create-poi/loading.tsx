export default function CreatePOILoading() {
	return (
		<div className="flex flex-col h-screen w-full bg-background-dark p-4 gap-6">
			{/* Header skeleton */}
			<div className="flex items-center justify-between">
				<div className="h-8 w-32 bg-muted rounded-lg animate-pulse" />
				<div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
			</div>

			{/* Image upload area skeleton */}
			<div className="h-48 bg-card rounded-2xl animate-pulse" />

			{/* Form fields skeleton */}
			<div className="space-y-4">
				<div className="h-12 bg-muted rounded-xl animate-pulse" />
				<div className="h-12 bg-muted rounded-xl animate-pulse" />
				<div className="h-24 bg-muted rounded-xl animate-pulse" />
			</div>

			{/* Tabs skeleton */}
			<div className="flex gap-2 mt-4">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="h-10 flex-1 bg-muted rounded-full animate-pulse"
					/>
				))}
			</div>
		</div>
	);
}

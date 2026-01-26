export default function MapLoading() {
	return (
		<div className="flex flex-col h-screen w-full bg-background">
			{/* Map placeholder skeleton */}
			<div className="flex-1 bg-card animate-pulse" />

			{/* Bottom bar skeleton */}
			<div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-background to-transparent">
				<div className="h-12 bg-muted rounded-xl animate-pulse" />
			</div>
		</div>
	);
}

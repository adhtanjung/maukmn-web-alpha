export default function SentryExampleLoading() {
	return (
		<div className="flex items-center justify-center h-screen w-full bg-background">
			<div className="flex flex-col items-center gap-4">
				<div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
				<span className="text-muted-foreground text-sm font-medium">
					Loading example...
				</span>
			</div>
		</div>
	);
}

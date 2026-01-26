"use client";

import { Button } from "@/components/ui/button";

export default function OfflinePage() {
	return (
		<div className="flex flex-col items-center justify-center h-full p-8 text-center gap-6">
			<div className="text-6xl">📡</div>
			<h1 className="text-2xl font-bold text-foreground">
				You&apos;re Offline
			</h1>
			<p className="text-muted-foreground max-w-xs">
				It looks like you&apos;ve lost your internet connection. Please check
				your network and try again.
			</p>
			<Button
				onClick={() => window.location.reload()}
				className="bg-primary text-primary-foreground hover:bg-primary/90"
			>
				<span className="material-symbols-outlined mr-2">refresh</span>
				Try Again
			</Button>
		</div>
	);
}

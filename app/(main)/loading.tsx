import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="flex flex-col h-full w-full bg-background overflow-hidden relative">
			{/* Header area */}
			<div className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center px-4 justify-between">
				<Skeleton className="h-8 w-32" />
				<Skeleton className="h-9 w-9 rounded-full" />
			</div>

			{/* Content area */}
			<div className="flex-1 p-4 space-y-4">
				<Skeleton className="h-32 w-full rounded-xl" />
				<div className="space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
				</div>
				<div className="grid grid-cols-2 gap-4 pt-4">
					<Skeleton className="h-24 rounded-xl" />
					<Skeleton className="h-24 rounded-xl" />
				</div>
			</div>
		</div>
	);
}

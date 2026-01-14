import { Badge } from "@/components/ui/badge";

export default function FeedSeparator() {
	return (
		<div className="h-full w-full snap-start snap-always shrink-0 flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-md text-center animate-in fade-in zoom-in duration-500">
			<div className="max-w-xs space-y-4">
				<Badge
					variant="outline"
					className="border-primary/50 text-primary bg-primary/10 mb-2"
				>
					More to Explore
				</Badge>
				<h3 className="text-2xl font-bold text-white leading-tight">
					That&apos;s all the exact matches.
				</h3>
				<p className="text-white/70 text-sm">
					We&apos;ve added some highly rated places you might also enjoy!
				</p>
				<div className="w-16 h-1 bg-linear-to-r from-transparent via-primary to-transparent mx-auto mt-6 opacity-50" />
			</div>
		</div>
	);
}

import { Button } from "@/components/ui/button";

interface EndOfFeedCardProps {
	onReset: () => void;
}

export default function EndOfFeedCard({ onReset }: EndOfFeedCardProps) {
	return (
		<div className="h-full w-full snap-start snap-always shrink-0 flex flex-col items-center justify-center p-8 bg-muted/30 text-center">
			<div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10">
				<span className="material-symbols-outlined text-4xl text-white/50">
					check_circle
				</span>
			</div>

			<h2 className="text-3xl font-bold text-white mb-3">
				You&apos;ve seen it all!
			</h2>
			<p className="text-white/60 max-w-xs mx-auto mb-8 leading-relaxed">
				There are no more places matching your criteria. Try adjusting your
				filters or explore the map.
			</p>

			<div className="flex flex-col gap-3 w-full max-w-[200px]">
				<Button
					variant="default"
					size="lg"
					onClick={onReset}
					className="w-full font-bold shadow-lg shadow-primary/20"
				>
					Reset Filters
				</Button>
				<Button
					variant="outline"
					size="lg"
					className="w-full border-white/10 text-white hover:bg-white/10"
					onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
				>
					Back to Top
				</Button>
			</div>
		</div>
	);
}

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EndOfFeedCardProps {
	onReset: () => void;
	onBackToTop?: () => void;
}

export default function EndOfFeedCard({
	onReset,
	onBackToTop,
}: EndOfFeedCardProps) {
	const handleBackToTop = () => {
		if (onBackToTop) {
			onBackToTop();
		} else {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	return (
		<div className="h-full w-full snap-start snap-always shrink-0 flex flex-col items-center justify-center p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] bg-muted/30 text-center">
			<div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10 animate-pulse">
				<span className="material-symbols-outlined text-4xl text-white/50">
					check_circle
				</span>
			</div>

			<h2 className="text-3xl font-bold text-white mb-3">
				You&apos;ve seen it all!
			</h2>
			<p className="text-white/60 max-w-xs mx-auto mb-8 leading-relaxed">
				There are no more places matching your criteria. Try adjusting your
				filters or explore other options.
			</p>

			<div className="flex flex-col gap-3 w-full max-w-[240px]">
				<Button
					variant="default"
					size="lg"
					onClick={onReset}
					className="w-full font-bold shadow-lg shadow-primary/20 h-12"
				>
					Reset Filters
				</Button>

				<Button
					asChild
					variant="outline"
					size="lg"
					className="w-full border-white/10 text-white hover:bg-white/10 h-12 gap-2"
				>
					<Link href="/discovery/map">
						<span className="material-symbols-outlined text-lg">map</span>
						View on Map
					</Link>
				</Button>

				<Button
					asChild
					variant="ghost"
					size="lg"
					className="w-full text-white/70 hover:text-white hover:bg-white/5 h-12 gap-2"
				>
					<Link href="/flag-planting">
						<span className="material-symbols-outlined text-lg">
							add_location
						</span>
						Add a Place
					</Link>
				</Button>

				<div className="border-t border-white/10 my-1 w-full" />

				<Button
					variant="ghost"
					size="sm"
					className="w-full text-white/50 hover:text-white hover:bg-transparent h-auto py-1"
					onClick={handleBackToTop}
				>
					Back to Top
				</Button>
			</div>
		</div>
	);
}

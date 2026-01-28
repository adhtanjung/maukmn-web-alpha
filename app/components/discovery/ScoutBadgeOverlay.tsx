"use client";

export function ScoutBadgeOverlay({ foundingUser }: { foundingUser?: string }) {
	if (!foundingUser) return null;

	return (
		<div className="absolute bottom-16 right-5 z-20">
			<div className="flex items-center gap-3 bg-muted/40 backdrop-blur-xl border border-white/10 rounded-full p-1.5 pr-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/5 hover:bg-muted/60 transition-colors cursor-default">
				<div className="relative">
					<div className="w-10 h-10 rounded-full bg-muted border-2 border-primary shadow-lg shadow-primary/20 flex items-center justify-center overflow-hidden">
						<span className="material-symbols-outlined text-white">person</span>
					</div>
					<div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-white/10">
						<div className="bg-primary/20 rounded-full p-0.5">
							<span className="material-symbols-outlined text-[10px] text-primary block">
								verified
							</span>
						</div>
					</div>
				</div>
				<div className="flex flex-col">
					<span className="text-[10px] font-extrabold text-primary uppercase tracking-wider leading-none mb-0.5 drop-shadow-sm">
						Founding Scout
					</span>
					<span className="text-xs font-semibold text-white leading-none tracking-wide">
						Discovered by <span className="opacity-90">@{foundingUser}</span>
					</span>
				</div>
			</div>
		</div>
	);
}

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface BottomNavProps {
	onCreateClick?: () => void;
	onProfileClick?: () => void;
}

export default function BottomNav({
	onCreateClick,
	onProfileClick,
}: BottomNavProps) {
	const createButtonStyles =
		"flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-primary-dark to-primary shadow-lg shadow-primary/30 active:scale-95 transition-transform border border-white/10 -mt-8 mb-2 ring-4 ring-background-dark hover:brightness-110";
	return (
		<div className="absolute bottom-8 left-5 right-5 z-50">
			<div className="bg-surface-dark/95 backdrop-blur-2xl border border-white/10 rounded-full h-[72px] shadow-2xl shadow-black/60 flex items-center justify-between px-6">
				<Button
					variant="ghost"
					className="flex flex-col items-center justify-center gap-1 w-12 h-auto p-0 hover:bg-transparent group"
				>
					<div className="relative">
						<span className="material-symbols-outlined text-primary !text-[28px] group-hover:scale-110 transition-transform">
							home
						</span>
						<div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
					</div>
				</Button>
				<Button
					variant="ghost"
					className="flex flex-col items-center justify-center gap-1 w-12 h-auto p-0 text-muted-foreground hover:text-foreground hover:bg-transparent transition-colors group"
				>
					<span className="material-symbols-outlined !text-[28px] group-hover:scale-110 transition-transform">
						explore
					</span>
				</Button>
				{onCreateClick ? (
					<>
						<SignedIn>
							<Button onClick={onCreateClick} className={createButtonStyles}>
								<span className="material-symbols-outlined text-white !text-[32px]">
									add
								</span>
							</Button>
						</SignedIn>
						<SignedOut>
							<SignInButton mode="modal">
								<Button className={createButtonStyles}>
									<span className="material-symbols-outlined text-white !text-[32px]">
										add
									</span>
								</Button>
							</SignInButton>
						</SignedOut>
					</>
				) : (
					<div className="w-12 h-12"></div>
				)}
				<Button
					variant="ghost"
					className="flex flex-col items-center justify-center gap-1 w-12 h-auto p-0 text-muted-foreground hover:text-foreground hover:bg-transparent transition-colors group"
				>
					<span className="material-symbols-outlined !text-[28px] group-hover:scale-110 transition-transform">
						bookmark
					</span>
				</Button>
				<Button
					variant="ghost"
					className="flex flex-col items-center justify-center gap-1 w-12 h-auto p-0 text-muted-foreground hover:text-foreground hover:bg-transparent transition-colors group"
					onClick={onProfileClick}
				>
					<span className="material-symbols-outlined !text-[28px] group-hover:scale-110 transition-transform">
						person
					</span>
				</Button>
			</div>
		</div>
	);
}

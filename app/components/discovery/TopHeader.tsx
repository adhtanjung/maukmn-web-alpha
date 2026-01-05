import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function TopHeader() {
	return (
		<div className="absolute top-0 left-0 w-full z-50 pointer-events-none">
			<div className="absolute inset-0 h-40 bg-gradient-to-b from-black/90 to-transparent"></div>
			<div className="absolute top-0 w-full p-4 pt-14 flex items-center justify-between pointer-events-auto px-5">
				<Button className="flex items-center gap-2 h-11 pl-2 pr-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10 active:scale-95 transition-all hover:bg-white/10 shadow-lg group">
					<div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors border border-primary/20">
						<span className="material-symbols-outlined !text-[16px] text-primary">
							map
						</span>
					</div>
					<span className="text-xs font-bold text-foreground uppercase tracking-wide">
						Map View
					</span>
				</Button>
				<div className="flex items-center gap-3">
					<SignedOut>
						<SignInButton mode="modal">
							<Button className="h-11 px-4 flex items-center justify-center rounded-full bg-primary text-black font-bold text-sm shadow-lg active:scale-95 transition-all">
								Sign In
							</Button>
						</SignInButton>
					</SignedOut>
					<SignedIn>
						<UserButton
							appearance={{
								elements: {
									avatarBox: "w-11 h-11 border border-white/10",
								},
							}}
						/>
					</SignedIn>

					<Button
						size="icon"
						className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 active:scale-95 transition-all text-foreground hover:bg-white/10 shadow-lg"
					>
						<span className="material-symbols-outlined !text-[22px]">
							search
						</span>
					</Button>
					<Button
						size="icon"
						className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 active:scale-95 transition-all text-foreground hover:bg-white/10 shadow-lg relative"
					>
						<div className="absolute top-3 right-3 w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
						<span className="material-symbols-outlined !text-[22px]">tune</span>
					</Button>
				</div>
			</div>
		</div>
	);
}

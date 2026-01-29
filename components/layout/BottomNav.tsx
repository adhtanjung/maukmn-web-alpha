"use client";

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Export height constant for layout calculations
export const BOTTOM_NAV_HEIGHT = 80; // px, not including safe area

export interface BottomNavProps {
	onHomeClick?: () => void;
	className?: string;
}

export default function BottomNav({ onHomeClick, className }: BottomNavProps) {
	const router = useRouter();
	const { isLoaded } = useUser();

	// "Tropical Modernist" Floating Action Button
	// Using Primary (Emerald) for the main action
	// ring-background ensures a clean separation from the nav bar
	const createButtonStyles =
		"flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 active:scale-95 transition-transform border border-border -mt-8 mb-2 ring-4 ring-background hover:brightness-110";

	return (
		<div
			className={cn(
				// Fixed positioning with proper centering
				"fixed bottom-[calc(0.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50",
				// Constrain to app max-width
				"w-full max-w-[430px] px-4",
				"flex justify-center pointer-events-none",
				className,
			)}
		>
			<div className="pointer-events-auto bg-card/90 backdrop-blur-xl border border-border/50 rounded-full h-[64px] shadow-2xl shadow-black/10 flex items-center justify-between px-6 gap-2 w-auto min-w-[320px] max-w-sm mx-4">
				<Button
					variant="ghost"
					className="flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-full p-0 hover:bg-muted/50 transition-colors group"
					onClick={() => {
						if (onHomeClick) {
							onHomeClick();
						} else {
							router.push("/");
						}
					}}
				>
					<div className="relative flex flex-col items-center">
						<span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform font-variation-settings-filled">
							home
						</span>
						{/* Active Dot Indicator using the Emerald Primary */}
						<div className="absolute -bottom-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)]"></div>
					</div>
				</Button>

				<Button
					variant="ghost"
					className="flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-full p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors group"
				>
					<span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
						explore
					</span>
				</Button>

				{/* Floating Action Button (FAB) - Always Flag Planting */}
				<div className="relative top-0">
					<>
						<SignedIn>
							<Button
								onClick={() => router.push("/flag-planting")}
								className={createButtonStyles}
							>
								<span className="material-symbols-outlined text-3xl">add</span>
							</Button>
						</SignedIn>
						<SignedOut>
							<SignInButton mode="modal">
								<Button className={createButtonStyles}>
									<span className="material-symbols-outlined text-3xl">
										add
									</span>
								</Button>
							</SignInButton>
						</SignedOut>
					</>
				</div>

				<Button
					variant="ghost"
					className="flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-full p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors group"
				>
					<span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
						bookmark
					</span>
				</Button>

				{/* Profile / Auth Button */}
				<div className="flex flex-col items-center justify-center w-12 h-12">
					{!isLoaded ? (
						<Skeleton className="w-10 h-10 rounded-full bg-muted" />
					) : (
						<>
							<SignedOut>
								<SignInButton mode="modal">
									<Button
										variant="ghost"
										className="flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-full p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors group"
										title="Sign In"
									>
										<span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
											login
										</span>
									</Button>
								</SignInButton>
							</SignedOut>
							<SignedIn>
								<ProfileButton />
							</SignedIn>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

function ProfileButton() {
	const { user } = useUser();
	const router = useRouter();

	return (
		<Button
			variant="ghost"
			className="w-8 h-8 rounded-full p-0 overflow-hidden border border-border shadow-sm hover:opacity-80 transition-opacity"
			onClick={() => router.push("/profile")}
			title="Go to Profile"
		>
			{user?.imageUrl ? (
				<img
					src={user.imageUrl}
					alt="Profile"
					className="w-full h-full object-cover"
				/>
			) : (
				<span className="material-symbols-outlined text-2xl text-muted-foreground">
					person
				</span>
			)}
		</Button>
	);
}

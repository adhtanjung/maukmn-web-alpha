"use client";

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { GlassSurface } from "@/components/ui/GlassSurface";
import { ThinkingLogoButton } from "@/components/ui/ThinkingLogoButton";
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
		"flex items-center justify-center w-12 h-12 active:scale-95 transition-transform";

	return (
		<div
			className={cn(
				// Fixed positioning at bottom
				"fixed bottom-0 left-1/2 -translate-x-1/2 z-50",
				// Full width limited to max app width
				"w-full max-w-[430px]",
				"flex justify-center",
				className,
			)}
		>
			<GlassSurface className="w-full flex flex-col pointer-events-auto border-x-0 border-b-0 rounded-none rounded-t-2xl">
				<div className="h-[64px] flex items-center justify-between px-6 gap-2 w-full">
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

					{/* Floating Action Button (FAB) - Thinking Bounce Animation */}
					<div className="relative">
						<>
							<SignedIn>
								<ThinkingLogoButton
									onClick={() => router.push("/flag-planting")}
									className={createButtonStyles}
								/>
							</SignedIn>
							<SignedOut>
								<SignInButton mode="modal">
									<ThinkingLogoButton className={createButtonStyles} />
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
				{/* Safe Area Spacer */}
				<div className="h-[env(safe-area-inset-bottom)] w-full" />
			</GlassSurface>
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

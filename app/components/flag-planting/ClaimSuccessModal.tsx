"use client";

import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface ClaimSuccessModalProps {
	onClose: () => void;
	poiId?: string;
}

export default function ClaimSuccessModal({
	onClose,
	poiId,
}: ClaimSuccessModalProps) {
	const { user } = useUser();
	const router = useRouter();

	const handleAddDetails = () => {
		if (poiId) {
			router.push(`/create-poi?mode=edit&id=${poiId}`);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
		>
			<div className="bg-background rounded-3xl p-8 w-full max-w-sm text-center border-2 border-amber-400/50 shadow-[0_0_50px_rgba(251,191,36,0.2)] relative overflow-hidden">
				{/* Confetti / Ray Background Effect */}
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.amber.400/0.1),transparent)] animate-pulse pointer-events-none" />

				<motion.div
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="relative"
				>
					<div className="w-24 h-24 bg-amber-100 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-amber-400">
						<span className="material-symbols-outlined text-5xl text-amber-600">
							flag
						</span>
					</div>

					<h2 className="text-3xl font-black text-foreground mb-2">
						FLAG PLANTED!
					</h2>
					<p className="text-muted-foreground mb-6">
						Territory claimed by{" "}
						<span className="font-bold text-amber-500">
							@{user?.username || "Scout"}
						</span>
					</p>

					<div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-8">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-bold text-muted-foreground">
								REWARD
							</span>
							<span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded font-bold">
								PENDING
							</span>
						</div>
						<div className="flex items-center gap-3">
							<span className="material-symbols-outlined text-amber-500 text-2xl">
								stars
							</span>
							<span className="text-2xl font-black text-foreground">
								+100 XP
							</span>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col gap-3">
						{poiId && (
							<Button
								onClick={handleAddDetails}
								className="w-full h-12 rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90"
							>
								<span className="material-symbols-outlined mr-2 text-lg">
									edit_note
								</span>
								Add More Details (+20 XP)
							</Button>
						)}
						<Button
							onClick={onClose}
							variant={poiId ? "outline" : "default"}
							className={`w-full h-12 rounded-full font-bold ${
								!poiId
									? "bg-foreground text-background hover:bg-foreground/90"
									: ""
							}`}
						>
							Return to Map
						</Button>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

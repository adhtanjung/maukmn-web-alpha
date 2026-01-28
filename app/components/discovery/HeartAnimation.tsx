"use client";

import { motion, AnimatePresence } from "motion/react";
import { Heart } from "lucide-react";

interface HeartAnimationProps {
	isVisible: boolean;
	onAnimationComplete?: () => void;
}

export default function HeartAnimation({
	isVisible,
	onAnimationComplete,
}: HeartAnimationProps) {
	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1, rotate: [0, -15, 15, 0] }}
					exit={{ scale: 0, opacity: 0 }}
					transition={{ duration: 0.5, type: "spring" }}
					className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
					onAnimationComplete={onAnimationComplete}
				>
					<div className="relative">
						<Heart
							className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-lg"
							strokeWidth={0}
						/>
						<motion.div
							initial={{ scale: 1, opacity: 0.5 }}
							animate={{ scale: 1.5, opacity: 0 }}
							transition={{ duration: 0.5 }}
							className="absolute inset-0 bg-red-500 rounded-full blur-xl -z-10"
						/>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

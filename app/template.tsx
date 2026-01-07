"use client";

import { motion } from "motion/react";

export default function Template({ children }: { children: React.ReactNode }) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
			animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
			exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
			transition={{ ease: "easeOut", duration: 0.3 }}
			className="h-full w-full"
		>
			{children}
		</motion.div>
	);
}

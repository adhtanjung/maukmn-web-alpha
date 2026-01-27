"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SmartImageProps extends ImageProps {
	containerClassName?: string;
	fallbackIcon?: string;
}

export function SmartImage({
	src,
	alt,
	className,
	containerClassName,
	fallbackIcon = "image_not_supported",
	onLoad,
	onError,
	...props
}: SmartImageProps) {
	const [status, setStatus] = useState<"loading" | "loaded" | "error">(
		"loading",
	);

	const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		setStatus("loaded");
		onLoad?.(e);
	};

	const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		setStatus("error");
		onError?.(e);
	};

	return (
		<div
			key={src?.toString()}
			className={cn("relative overflow-hidden", containerClassName)}
		>
			{/* Loading Skeleton */}
			<AnimatePresence>
				{status === "loading" && (
					<motion.div
						initial={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.4 }}
						className="absolute inset-0 z-10"
					>
						<Skeleton className="h-full w-full rounded-none" />
					</motion.div>
				)}
			</AnimatePresence>

			{/* Error Fallback */}
			<AnimatePresence>
				{status === "error" && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-muted text-muted-foreground gap-2"
					>
						<span className="material-symbols-outlined text-4xl opacity-50">
							{fallbackIcon}
						</span>
						<span className="text-xs font-medium opacity-50 uppercase tracking-widest">
							Image Unavailable
						</span>
					</motion.div>
				)}
			</AnimatePresence>

			{/* The Actual Image */}
			<Image
				src={src}
				alt={alt}
				className={cn(
					"transition-opacity duration-500",
					status === "loaded" ? "opacity-100" : "opacity-0",
					className,
				)}
				onLoad={handleLoad}
				onError={handleError}
				{...props}
			/>
		</div>
	);
}

"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StickyHeaderProps {
	title: string;
	showBack?: boolean;
	rightAction?: ReactNode;
	className?: string;
}

export default function StickyHeader({
	title,
	showBack = true,
	rightAction,
	className,
}: StickyHeaderProps) {
	const router = useRouter();

	return (
		<div
			className={cn(
				"sticky top-0 z-50 flex items-center bg-background-light dark:bg-background-dark backdrop-blur-md p-4 pt-8 pb-2 justify-between border-b border-slate-200/50 dark:border-white/5",
				className
			)}
		>
			<div className="flex items-center flex-1">
				{showBack ? (
					<div
						className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors"
						onClick={() => router.back()}
					>
						<span className="material-symbols-outlined text-slate-900 dark:text-white">
							arrow_back
						</span>
					</div>
				) : (
					<div className="size-10 shrink-0" />
				)}
				<h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
					{title}
				</h2>
				<div className="flex size-10 shrink-0 items-center justify-center">
					{rightAction || <div className="size-10" />}
				</div>
			</div>
		</div>
	);
}

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
				"sticky top-0 z-50 flex items-center bg-background/90 backdrop-blur-md p-4 pt-8 pb-2 justify-between border-b border-border",
				className
			)}
		>
			<div className="flex items-center flex-1">
				{showBack ? (
					<div
						className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-muted cursor-pointer transition-colors"
						onClick={() => router.back()}
					>
						<span className="material-symbols-outlined text-foreground">
							arrow_back
						</span>
					</div>
				) : (
					<div className="size-10 shrink-0" />
				)}
				<h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
					{title}
				</h2>
				<div className="flex size-10 shrink-0 items-center justify-center">
					{rightAction || <div className="size-10" />}
				</div>
			</div>
		</div>
	);
}

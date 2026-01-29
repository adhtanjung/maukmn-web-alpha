"use client";

import React from "react";
import BottomNav from "@/components/layout/BottomNav";
import { useBottomNav } from "@/contexts/BottomNavContext";

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { showBottomNav, onHomeClick } = useBottomNav();

	return (
		<>
			{children}
			{showBottomNav && <BottomNav onHomeClick={onHomeClick} />}
		</>
	);
}

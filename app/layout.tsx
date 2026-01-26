import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

import { ThemeProvider } from "@/app/components/theme-provider";

const plusJakartaSans = Plus_Jakarta_Sans({
	variable: "--font-plus-jakarta-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Maukemana - Discovery Feed",
	description:
		"Hyper-personalized, community-curated discovery platform for Indonesia",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang="en" suppressHydrationWarning>
				<head>
					{/*
						Material Symbols uses variable axes (FILL, wght) not supported by next/font/google.
						Loading in root layout.tsx ensures it's applied globally.
					*/}
					{/* eslint-disable-next-line @next/next/no-page-custom-font */}
					<link
						rel="preload"
						as="style"
						href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
					/>
					{/* eslint-disable-next-line @next/next/no-page-custom-font */}
					<link
						rel="stylesheet"
						href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
					/>
					<noscript>
						<link
							rel="stylesheet"
							href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
						/>
					</noscript>
				</head>
				<body
					className={`${plusJakartaSans.variable} font-sans antialiased bg-black text-foreground overflow-hidden h-dvh w-screen flex items-center justify-center`}
					suppressHydrationWarning
				>
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						enableSystem={false}
						disableTransitionOnChange
					>
						<div className="relative w-full h-full max-w-[430px] bg-background overflow-hidden shadow-2xl">
							{children}
						</div>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}

import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

import { ThemeProvider } from "@/app/components/theme-provider";
import { BottomNavProvider } from "@/contexts/BottomNavContext";
import NextTopLoader from "nextjs-toploader";

const plusJakartaSans = Plus_Jakarta_Sans({
	variable: "--font-plus-jakarta-sans",
	subsets: ["latin"],
	display: "block",
});

import localFont from "next/font/local";

const materialSymbols = localFont({
	src: "./fonts/MaterialSymbolsOutlined.woff2",
	variable: "--font-material-symbols",
	display: "block",
});

export const metadata: Metadata = {
	title: "Maukemana - Discovery Feed",
	description:
		"Hyper-personalized, community-curated discovery platform for Indonesia",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "Maukemana",
	},
	icons: {
		icon: "/icon-192x192.png",
		apple: "/apple-touch-icon.png",
	},
};

export const viewport: Viewport = {
	themeColor: "#18181b",
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: "cover",
};

export default function RootLayout({
	children,
	modal,
}: Readonly<{
	children: React.ReactNode;
	modal: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang="en" suppressHydrationWarning>
				<head>
					{/*
						Material Symbols loaded via next/font/local to avoid waterfalls.
						See globals.css for usage.
					*/}
				</head>
				<body
					className={`${plusJakartaSans.variable} ${materialSymbols.variable} font-sans antialiased bg-black text-foreground overflow-hidden h-dvh w-screen flex items-center justify-center`}
					suppressHydrationWarning
				>
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						enableSystem={false}
						disableTransitionOnChange
					>
						<BottomNavProvider>
							<NextTopLoader color="#ff4500" showSpinner={false} height={3} />
							<div className="relative w-full h-full max-w-[430px] bg-background overflow-hidden shadow-2xl">
								{children}
								{modal}
							</div>
						</BottomNavProvider>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}

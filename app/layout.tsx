import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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
			<html lang="en" className="dark" suppressHydrationWarning>
				<head>
					<link
						rel="stylesheet"
						href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
					/>
				</head>
				<body
					className={`${plusJakartaSans.variable} font-sans antialiased bg-black text-white overflow-hidden h-dvh w-screen flex items-center justify-center`}
					suppressHydrationWarning
				>
					<div className="relative w-full h-full max-w-[430px] bg-background-dark overflow-hidden shadow-2xl">
						{children}
					</div>
				</body>
			</html>
		</ClerkProvider>
	);
}

"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import TopHeader from "./components/discovery/TopHeader";
import POICard from "./components/discovery/POICard";
import BottomNav from "./components/discovery/BottomNav";

const SAMPLE_POIS = [
	{
		name: "The Emerald Bean",
		category: "Coffee Shop",
		rating: 4.9,
		distance: "0.4 mi",
		description:
			"Artisan roaster featuring a lush indoor garden and distinct single-origin pours.",
		imageUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBsBuD5znnCOrgnQs-ghPiUC7RMf-or6-D4cKS8He57z0_SJihT0YIhqrGKXCdfVaTDDH9VmagU8w_KWMd7TkC6gpyd7oNS2whAQ1LWpg91TkrsEkVl6kAXNzS34Qx80p989ZhAAGeGS-DiO5TJX3eIWyFe_pDU0UBLYBpJcppEg0WbSx6xsmMurKXRbKfDZHRDkoo7W_Dp7sKqjt05XpY47NqP_dMjX9jNUfuXTqC142G3LVbXL9wu5hi3y0uOk5dyBNT-iGUWkSB",
		amenities: [
			{ icon: "wifi", label: "Free Wifi" },
			{ icon: "power", label: "Power" },
			{ icon: "schedule", label: "Open Now", featured: true },
		],
		likes: 890,
		comments: 124,
	},
	{
		name: "Neon Nights",
		category: "Cocktail Bar",
		rating: 4.5,
		distance: "1.2 mi",
		description:
			"Experience mixology at its finest in a cyberpunk-inspired setting. Live DJ sets every Friday.",
		imageUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuC1dYRPVwQnvDHrbNGbGSbzREfyNlatRJBhHEtQUfNxttOcA7P8hZ9238ofZuYRjwNunxb_gmJ6cVVM1f-ibfPJ_9vdxW0bpvDoC6_xjy4l32hOmRrX152Ah16RBalw5UL8ksNMDtA5AnkZ1KEKQ9bJVz98vaezjgHM9MiUl1Bdl5g9ejpZuD6Iw4CEjtasavSIXn77h--3qWRm6sl228DtcsHmiGXm6qVorXkUK4rRIRvV2Z7KSOptYq_m3beGP0zMGAT0xGIDgHqZ",
		amenities: [
			{ icon: "music_note", label: "Live Music" },
			{ icon: "local_bar", label: "Full Bar" },
		],
		likes: 854,
		comments: 92,
	},
];

export default function Home() {
	const { user } = useUser();
	const router = useRouter();

	// Check if user is admin based on metadata (adjust key as needed based on actual Clerk setup)
	// TODO: revert this bypass for production
	const isAdmin = true; // (user?.publicMetadata as any)?.role === "admin";

	const handleCreateClick = () => {
		router.push("/create-poi");
	};

	return (
		<main className="h-full w-full bg-background-dark overflow-hidden relative">
			<TopHeader />

			<div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth relative">
				{SAMPLE_POIS.map((poi, idx) => (
					<POICard key={idx} {...poi} />
				))}
			</div>

			<BottomNav onCreateClick={isAdmin ? handleCreateClick : undefined} />
		</main>
	);
}

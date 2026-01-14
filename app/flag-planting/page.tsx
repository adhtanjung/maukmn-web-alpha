"use client";

import React, { useState } from "react";
import ScannerView from "../components/flag-planting/ScannerView";
import { AnimatePresence, motion } from "motion/react";
import VibeCheckOverlay from "../components/flag-planting/VibeCheckOverlay";
import ClaimSuccessModal from "../components/flag-planting/ClaimSuccessModal";
import NearbyPOICheck from "../components/flag-planting/NearbyPOICheck";
import { useRouter } from "next/navigation";

export default function FlagPlantingPage() {
	const router = useRouter();
	const [capturedImage, setCapturedImage] = useState<string | null>(null);
	const [userLocation, setUserLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [showNearbyCheck, setShowNearbyCheck] = useState(false);
	const [showVibeCheck, setShowVibeCheck] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [createdPoiId, setCreatedPoiId] = useState<string | null>(null);

	const handleCapture = async (imageSrc: string) => {
		setCapturedImage(imageSrc);

		// Get user location
		try {
			const position = await new Promise<GeolocationPosition>(
				(resolve, reject) =>
					navigator.geolocation.getCurrentPosition(resolve, reject, {
						enableHighAccuracy: true,
						timeout: 10_000,
						maximumAge: 0,
					})
			);

			setUserLocation({
				lat: position.coords.latitude,
				lng: position.coords.longitude,
			});
			setShowNearbyCheck(true);
		} catch (err) {
			console.error("Location error:", err);
			// If location fails, skip nearby check and go straight to VibeCheck
			setShowVibeCheck(true);
		}
	};

	const handleConfirmNew = () => {
		setShowNearbyCheck(false);
		setShowVibeCheck(true);
	};

	const handleSelectExisting = (poiId: string) => {
		// Redirect to update intel flow
		router.push(`/create-poi?mode=edit&id=${poiId}`);
	};

	const handleSuccess = (poiId: string) => {
		setCreatedPoiId(poiId);
		setShowSuccess(true);
	};

	const handleReset = () => {
		setCapturedImage(null);
		setUserLocation(null);
		setShowNearbyCheck(false);
		setShowVibeCheck(false);
	};

	return (
		<main className="h-screen w-full overflow-hidden bg-black text-white relative">
			<AnimatePresence mode="wait">
				{!capturedImage ? (
					<motion.div
						key="scanner"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="h-full w-full"
					>
						<ScannerView
							onCapture={handleCapture}
							onClose={() => {
								window.location.href = "/";
							}}
						/>
					</motion.div>
				) : (
					<motion.div
						key="preview"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="relative h-full w-full"
					>
						{/* Background Image (Captured) */}
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={capturedImage}
							alt="Captured Territory"
							className="absolute inset-0 w-full h-full object-cover filter brightness-75"
						/>

						{/* Nearby POI Check */}
						{showNearbyCheck && userLocation && (
							<NearbyPOICheck
								latitude={userLocation.lat}
								longitude={userLocation.lng}
								onConfirmNew={handleConfirmNew}
								onSelectExisting={handleSelectExisting}
								onClose={handleReset}
							/>
						)}

						{/* Vibe Check Overlay */}
						{showVibeCheck && (
							<VibeCheckOverlay
								imageSrc={capturedImage}
								onReset={handleReset}
								onSuccess={handleSuccess}
							/>
						)}

						{/* Success Modal */}
						{showSuccess && (
							<ClaimSuccessModal
								poiId={createdPoiId || undefined}
								onClose={() => {
									window.location.href = "/?flag_planted=true";
								}}
							/>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}

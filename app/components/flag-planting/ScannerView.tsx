"use client";

import React, { useRef, useState, useCallback, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";

interface ScannerViewProps {
	onCapture: (imageSrc: string) => void;
	onClose?: () => void;
}

// --- Sub-components ---

const GridOverlay = memo(({ show }: { show: boolean }) => {
	if (!show) return null;
	return (
		<div className="absolute inset-0 pointer-events-none z-10">
			<div className="w-full h-full grid grid-cols-3 grid-rows-3 text-white/20">
				<div className="border-r border-b border-current" />
				<div className="border-r border-b border-current" />
				<div className="border-b border-current" />
				<div className="border-r border-b border-current" />
				<div className="border-r border-b border-current" />
				<div className="border-b border-current" />
				<div className="border-r border-current" />
				<div className="border-r border-current" />
				<div />
			</div>
		</div>
	);
});
GridOverlay.displayName = "GridOverlay";

const ScannerHeader = memo(({ onClose }: { onClose: () => void }) => (
	<div className="flex justify-between items-start p-6 pointer-events-none">
		<div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 pointer-events-auto">
			<p className="text-xs text-emerald-400 font-mono flex items-center gap-2">
				<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
				SCANNING TERRITORY...
			</p>
		</div>
		<Button
			variant="ghost"
			size="icon"
			className="pointer-events-auto text-white hover:bg-white/20 rounded-full"
			onClick={onClose}
		>
			<span className="material-symbols-outlined">close</span>
		</Button>
	</div>
));
ScannerHeader.displayName = "ScannerHeader";

const ScannerFooter = memo(
	({
		showGrid,
		onToggleGrid,
		onCapture,
		onGalleryClick,
	}: {
		showGrid: boolean;
		onToggleGrid: () => void;
		onCapture: () => void;
		onGalleryClick: () => void;
	}) => (
		<div className="flex justify-between items-center p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pointer-events-auto">
			<Button
				variant="ghost"
				size="icon"
				className={`text-white hover:bg-white/20 rounded-full ${showGrid ? "bg-white/20" : ""}`}
				onClick={onToggleGrid}
			>
				<span className="material-symbols-outlined">grid_on</span>
			</Button>

			<button
				onClick={onCapture}
				className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group active:scale-95 transition-transform"
			>
				<div className="w-16 h-16 bg-white rounded-full group-hover:bg-emerald-400 transition-colors" />
			</button>

			<Button
				variant="ghost"
				size="icon"
				className="text-white hover:bg-white/20 rounded-full"
				onClick={onGalleryClick}
			>
				<span className="material-symbols-outlined">photo_library</span>
			</Button>
		</div>
	),
);
ScannerFooter.displayName = "ScannerFooter";

const Reticle = memo(() => (
	<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/20 rounded-lg opacity-50 pointer-events-none">
		<div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500" />
		<div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500" />
		<div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500" />
		<div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500" />
	</div>
));
Reticle.displayName = "Reticle";

// --- Main Component ---

export default function ScannerView({ onCapture, onClose }: ScannerViewProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [showGrid, setShowGrid] = useState(false);
	const router = useRouter();

	// Stop camera utility
	const stopCamera = useCallback(() => {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			setStream(null);
		}
	}, [stream]);

	// Initialize Camera
	useEffect(() => {
		let mounted = true;

		async function startCamera() {
			try {
				const mediaStream = await navigator.mediaDevices.getUserMedia({
					video: {
						facingMode: "environment",
						width: { ideal: 1920 },
						height: { ideal: 1080 },
					},
					audio: false,
				});

				if (mounted) {
					setStream(mediaStream);
					if (videoRef.current) {
						videoRef.current.srcObject = mediaStream;
					}
				} else {
					mediaStream.getTracks().forEach((track) => track.stop());
				}
			} catch (err) {
				console.error("Camera access error:", err);
				if (mounted) {
					setError("Camera access denied or unavailable.");
				}
			}
		}

		startCamera();
		return () => {
			mounted = false;
		};
	}, []);

	// Separate cleanup
	useEffect(() => {
		return () => {
			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
			}
		};
	}, [stream]);

	const handleCapture = useCallback(() => {
		if (videoRef.current && canvasRef.current) {
			const video = videoRef.current;
			const canvas = canvasRef.current;
			const context = canvas.getContext("2d");

			if (context) {
				if (typeof navigator !== "undefined" && navigator.vibrate) {
					navigator.vibrate(50);
				}

				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				context.drawImage(video, 0, 0, canvas.width, canvas.height);
				const imageSrc = canvas.toDataURL("image/jpeg", 0.95);
				stopCamera();
				onCapture(imageSrc);
			}
		}
	}, [onCapture, stopCamera]);

	const handleGalleryUpload = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = (event) => {
				const imageSrc = event.target?.result as string;
				stopCamera();
				onCapture(imageSrc);
			};
			reader.readAsDataURL(file);
		},
		[onCapture, stopCamera],
	);

	const handleClose = useCallback(() => {
		stopCamera();
		if (onClose) {
			onClose();
		} else {
			router.push("/");
		}
	}, [stopCamera, onClose, router]);

	const toggleGrid = useCallback(() => {
		setShowGrid((prev) => !prev);
	}, []);

	const handleGalleryClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	return (
		<div className="fixed inset-0 z-50 bg-black overflow-hidden">
			<MobileShell
				showBottomNav={false}
				className="h-full bg-transparent"
				header={<ScannerHeader onClose={handleClose} />}
				footer={
					!error && (
						<ScannerFooter
							showGrid={showGrid}
							onToggleGrid={toggleGrid}
							onCapture={handleCapture}
							onGalleryClick={handleGalleryClick}
						/>
					)
				}
			>
				<div className="relative h-full w-full overflow-hidden">
					{error ? (
						<div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-black">
							<span className="material-symbols-outlined text-red-500 text-4xl mb-4">
								videocam_off
							</span>
							<p className="text-white mb-6 uppercase tracking-widest font-mono text-sm">
								{error}
							</p>
							<Button
								onClick={handleClose}
								variant="secondary"
								className="rounded-full px-8"
							>
								Return to Map
							</Button>
						</div>
					) : (
						<>
							{/* Camera Feed - behind everything in children */}
							<video
								ref={videoRef}
								autoPlay
								playsInline
								muted
								className="absolute inset-0 w-full h-full object-cover"
							/>

							{/* Hidden Elements */}
							<canvas ref={canvasRef} className="hidden" />
							<input
								type="file"
								ref={fileInputRef}
								className="hidden"
								accept="image/*"
								onChange={handleGalleryUpload}
							/>

							{/* Overlays */}
							<GridOverlay show={showGrid} />
							<Reticle />
						</>
					)}
				</div>
			</MobileShell>
		</div>
	);
}

"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ScannerViewProps {
	onCapture: (imageSrc: string) => void;
	onClose?: () => void;
}

export default function ScannerView({ onCapture, onClose }: ScannerViewProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [error, setError] = useState<string | null>(null);
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
					video: { facingMode: "environment" }, // Prefer back camera
					audio: false,
				});
				if (mounted) {
					setStream(mediaStream);
					if (videoRef.current) {
						videoRef.current.srcObject = mediaStream;
					}
				} else {
					// Component unmounted before stream was ready
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

	// Cleanup on unmount
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
				// Set canvas dimensions to match video
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;

				// Draw current frame
				context.drawImage(video, 0, 0, canvas.width, canvas.height);

				// Convert to base64
				const imageSrc = canvas.toDataURL("image/jpeg", 0.8);

				// Stop stream after capture
				stopCamera();

				onCapture(imageSrc);
			}
		}
	}, [onCapture, stopCamera]);

	const handleClose = useCallback(() => {
		stopCamera();
		if (onClose) {
			onClose();
		} else {
			router.push("/");
		}
	}, [stopCamera, onClose, router]);

	return (
		<div className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
			{/* Error State */}
			{error ? (
				<div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
					<span className="material-symbols-outlined text-red-500 text-4xl mb-4">
						videocam_off
					</span>
					<p className="text-white mb-6">{error}</p>
					<Button onClick={handleClose} variant="secondary">
						Return to Map
					</Button>
				</div>
			) : (
				<>
					{/* Camera Feed */}
					<video
						ref={videoRef}
						autoPlay
						playsInline
						muted
						className="absolute inset-0 w-full h-full object-cover"
					/>

					{/* Hidden Canvas for Capture */}
					<canvas ref={canvasRef} className="hidden" />

					{/* HUD Overlay */}
					<div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 pb-[calc(3rem+env(safe-area-inset-bottom))] z-10">
						{/* Top Bar */}
						<div className="flex justify-between items-start">
							<div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
								<p className="text-xs text-emerald-400 font-mono flex items-center gap-2">
									<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
									SCANNING TERRITORY...
								</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="pointer-events-auto text-white hover:bg-white/20 rounded-full"
								onClick={handleClose}
							>
								<span className="material-symbols-outlined">close</span>
							</Button>
						</div>

						{/* Center Reticle (Fancy SVG) */}
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/20 rounded-lg opacity-50">
							<div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500" />
							<div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500" />
							<div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500" />
							<div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500" />
						</div>

						{/* Bottom Controls */}
						<div className="flex justify-center items-center pointer-events-auto">
							<button
								onClick={handleCapture}
								className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group active:scale-95 transition-transform"
							>
								<div className="w-16 h-16 bg-white rounded-full group-hover:bg-emerald-400 transition-colors" />
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

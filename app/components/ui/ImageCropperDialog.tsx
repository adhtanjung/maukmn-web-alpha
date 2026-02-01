"use client";

import React, { useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface ImageCropperDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	imageUrl: string | null;
	aspectRatio?: number;
	onCropSuccess: (newUrl: string) => void;
}

type Area = { x: number; y: number; width: number; height: number };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ImageCropperDialog({
	open,
	onOpenChange,
	imageUrl,
	aspectRatio = 16 / 9,
	onCropSuccess,
}: ImageCropperDialogProps) {
	const { getToken } = useAuth();

	const [imageToCrop, setImageToCrop] = useState<string | null>(null);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [cropDataRel, setCropDataRel] = useState<Area | null>(null);

	const [loading, setLoading] = useState(false);
	const [processing, setProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Extract hash from URL
	const getHashFromUrl = (url: string) => {
		try {
			const parts = url.split("/");
			const imgIndex = parts.indexOf("img");
			if (imgIndex !== -1 && imgIndex + 1 < parts.length) {
				return parts[imgIndex + 1];
			}
		} catch {
			return null;
		}
		return null;
	};

	// Load original image when dialog opens
	useEffect(() => {
		const loadOriginal = async (url: string) => {
			const hash = getHashFromUrl(url);
			if (!hash) {
				setError("Invalid image URL");
				return;
			}

			setLoading(true);
			setError(null);
			try {
				const originalUrl = `${API_URL}/img/${hash}/original?t=${Date.now()}`;
				const response = await fetch(originalUrl);
				if (!response.ok) throw new Error("Failed to load original image");

				const blob = await response.blob();
				const reader = new FileReader();
				reader.addEventListener("load", () => {
					setImageToCrop(reader.result as string);
					setLoading(false);
				});
				reader.readAsDataURL(blob);
			} catch (e) {
				console.error("Failed to load original", e);
				setError("Failed to load original image");
				setLoading(false);
			}
		};

		if (open && imageUrl) {
			loadOriginal(imageUrl);
		} else {
			// Reset state on close
			setImageToCrop(null);
			setError(null);
			setLoading(false);
			setProcessing(false);
			setZoom(1);
			setCrop({ x: 0, y: 0 });
		}
	}, [open, imageUrl]);

	const onCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
		// We use relative values for backend compatibility if needed,
		// but ImageUpload sent 'cropData' derived from 'pixels'.
		// However, standardizing on percentage (0-1) is often safer for different resolutions,
		// unless backend strictly needs pixels.
		// Assuming backend handles relative or pixel values based on implementation.
		// Let's stick to percentage for now as my previous implementation used it?
		// Wait, looking at `ImageUpload.tsx`:
		// const cropDataForBackend = { x: pixels.x, y: pixels.y ... }
		// The backend `processJob` uses `imaging.Crop`.
		// If I send percentage, the Go code must interpret it.
		// `service.go`: CropData *CropConfig.
		// If I look at `rendition.go` or where crop is used.
		// I should probably send PIXELS to match ImageUpload.

		setCropDataRel({
			x: croppedAreaPixels.x,
			y: croppedAreaPixels.y,
			width: croppedAreaPixels.width,
			height: croppedAreaPixels.height,
		});
	};

	const pollForCompletion = async (
		assetId: string,
		token: string | null,
	): Promise<string> => {
		const maxAttempts = 60;
		const interval = 1000;

		for (let i = 0; i < maxAttempts; i++) {
			await new Promise((resolve) => setTimeout(resolve, interval));

			const res = await fetch(`${API_URL}/api/v1/assets/${assetId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) continue;

			const data = await res.json();
			const asset = data.data;

			if (asset.status === "ready") {
				// Return original URL with timestamp
				return `${API_URL}/img/${asset.content_hash}/gallery_preview.webp`;
			} else if (asset.status === "failed") {
				throw new Error(asset.error || "Processing failed");
			}
		}
		throw new Error("Processing timed out");
	};

	const handleSave = async () => {
		if (!imageUrl || !cropDataRel) return;
		const hash = getHashFromUrl(imageUrl);
		if (!hash) return;

		setProcessing(true);
		try {
			const token = await getToken();
			const res = await fetch(`${API_URL}/api/v1/assets/${hash}/reprocess`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					crop_data: cropDataRel, // Sending PIXELS now consistent with ImageUpload
				}),
			});

			if (!res.ok) throw new Error("Reprocessing request failed");

			const data = await res.json();
			const { asset_id } = data.data;

			await pollForCompletion(asset_id, token);

			const timestamp = Date.now();
			const newUrl = imageUrl.includes("?")
				? `${imageUrl.split("?")[0]}?t=${timestamp}`
				: `${imageUrl}?t=${timestamp}`;

			onCropSuccess(newUrl);
			onOpenChange(false);
		} catch (e) {
			console.error("Failed to save crop", e);
			setError("Failed to save crop");
		} finally {
			setProcessing(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>Adjust Image</DialogTitle>
				</DialogHeader>

				{error ? (
					<div className="flex items-center justify-center p-8 text-destructive">
						{error}
					</div>
				) : loading ? (
					<div className="flex flex-col items-center justify-center p-12 space-y-4">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<p className="text-sm text-muted-foreground">
							Loading original image...
						</p>
					</div>
				) : (
					<>
						<div className="relative w-full h-80 bg-black rounded-md overflow-hidden">
							{imageToCrop && (
								<Cropper
									image={imageToCrop}
									crop={crop}
									zoom={zoom}
									aspect={aspectRatio}
									onCropChange={setCrop}
									onZoomChange={setZoom}
									onCropComplete={onCropComplete}
									showGrid={true}
								/>
							)}
						</div>
						<div className="py-4 space-y-4">
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">Zoom</span>
								<Slider
									value={[zoom]}
									min={1}
									max={3}
									step={0.1}
									onValueChange={(v) => setZoom(v[0])}
									className="flex-1"
								/>
							</div>
						</div>
					</>
				)}

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={processing}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={loading || !!error || processing}
					>
						{processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save & Update
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

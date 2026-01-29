"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@clerk/nextjs";
import { motion } from "motion/react";
import { useMemo, useState, useCallback, memo } from "react";

// --- Types ---
type WifiQuality = "" | "slow" | "moderate" | "excellent";
type PowerOutlets = "unknown" | "none" | "limited" | "plenty";

interface VibeCheckOverlayProps {
	imageSrc: string;
	onReset: () => void;
	onSuccess: (poiId: string) => void;
}

// --- Sub-components (Memoized) ---

const ImagePreview = memo(({ src }: { src: string }) => {
	if (!src) return null;
	return (
		<div className="relative overflow-hidden rounded-2xl border border-white/10 bg-muted/20">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={src}
				alt="Captured location"
				className="w-full h-40 object-cover"
			/>
			<div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
			<div className="absolute bottom-3 left-3">
				<div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
					Captured
				</div>
			</div>
		</div>
	);
});
ImagePreview.displayName = "ImagePreview";

const VibeFormHeader = memo(() => (
	<div>
		<h2 className="text-2xl font-black tracking-tight text-foreground">
			Vibe Check
		</h2>
		<p className="text-muted-foreground text-sm">
			Verify the intel for the next Scout.
		</p>
	</div>
));
VibeFormHeader.displayName = "VibeFormHeader";

const PowerOutletsGrid = memo(
	({
		value,
		onChange,
	}: {
		value: PowerOutlets;
		onChange: (v: PowerOutlets) => void;
	}) => (
		<div className="space-y-3">
			<label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
				Power Plugs
			</label>
			<div className="grid grid-cols-3 gap-2">
				{[
					{ id: "none" as const, label: "None", icon: "power_off" },
					{ id: "limited" as const, label: "Some", icon: "power" },
					{ id: "plenty" as const, label: "Plenty", icon: "bolt" },
				].map((opt) => (
					<button
						key={opt.id}
						type="button"
						onClick={() => onChange(opt.id)}
						className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
							value === opt.id
								? "border-primary bg-primary/10 text-primary"
								: "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
						}`}
					>
						<span className="material-symbols-outlined mb-1">{opt.icon}</span>
						<span className="text-xs font-bold">{opt.label}</span>
					</button>
				))}
			</div>
		</div>
	),
);
PowerOutletsGrid.displayName = "PowerOutletsGrid";

const ErgonomicsGrid = memo(
	({
		value,
		onChange,
	}: {
		value: boolean | null;
		onChange: (v: boolean) => void;
	}) => (
		<div className="space-y-3">
			<label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
				Ergonomics
			</label>
			<div className="grid grid-cols-2 gap-3">
				<button
					type="button"
					onClick={() => onChange(false)}
					className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
						value === false
							? "border-red-500 bg-red-500/10 text-red-500"
							: "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
					}`}
				>
					<span className="material-symbols-outlined">chair_alt</span>
					<span className="font-bold text-sm">Hard Chair</span>
				</button>
				<button
					type="button"
					onClick={() => onChange(true)}
					className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
						value === true
							? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
							: "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
					}`}
				>
					<span className="material-symbols-outlined">chair</span>
					<span className="font-bold text-sm">Ergonomic</span>
				</button>
			</div>
		</div>
	),
);
ErgonomicsGrid.displayName = "ErgonomicsGrid";

// --- Hoisted Helpers ---

const dataURLtoFile = (dataUrl: string, filename: string): File => {
	const arr = dataUrl.split(",");
	const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
	const bstr = atob(arr[1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], filename, { type: mime });
};

const getBestRenditionName = (cat: string) => {
	switch (cat) {
		case "profile":
			return "profile_200";
		case "cover":
			return "cover_1200";
		case "gallery":
			return "gallery_640";
		default:
			return "general_640";
	}
};

const pollForCompletion = async (
	assetId: string,
	token: string | null,
): Promise<string> => {
	const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
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
			const bestRendition = getBestRenditionName("cover");
			return `${API_URL}/img/${asset.content_hash}/${bestRendition}`;
		} else if (asset.status === "failed") {
			throw new Error(asset.error || "Processing failed");
		}
	}
	throw new Error("Processing timed out");
};

const uploadImage = async (
	dataUrl: string,
	token: string,
): Promise<string | null> => {
	try {
		const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
		// Dynamically import image-compression only when needed
		const imageCompression = (await import("browser-image-compression"))
			.default;

		const originalFile = dataURLtoFile(dataUrl, `flag-${Date.now()}.jpg`);
		let fileToUpload = originalFile;

		try {
			const options = {
				maxSizeMB: 1.5,
				maxWidthOrHeight: 2048,
				useWebWorker: true,
				initialQuality: 0.8,
				fileType: "image/jpeg",
			};

			if (originalFile.size > 1.5 * 1024 * 1024) {
				const compressedFile = await imageCompression(originalFile, options);
				fileToUpload = new File([compressedFile], originalFile.name, {
					type: compressedFile.type,
					lastModified: Date.now(),
				});
			}
		} catch (err) {
			console.warn("Compression failed, using original", err);
		}

		const presignRes = await fetch(`${API_URL}/api/v1/uploads/presign`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				filename: fileToUpload.name,
				content_type: fileToUpload.type,
				category: "cover",
			}),
		});

		if (!presignRes.ok) return null;

		const presignData = await presignRes.json();
		const { upload_url, key } = presignData.data;

		const uploadRes = await fetch(upload_url, {
			method: "PUT",
			headers: {
				"Content-Type": fileToUpload.type,
			},
			body: fileToUpload,
		});

		if (!uploadRes.ok) return null;

		const finalizeRes = await fetch(`${API_URL}/api/v1/uploads/finalize`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				upload_key: key,
				category: "cover",
			}),
		});

		if (!finalizeRes.ok) return null;

		const finalizeData = await finalizeRes.json();
		const { asset_id } = finalizeData.data;

		return await pollForCompletion(asset_id, token);
	} catch (error) {
		console.error("Image upload error:", error);
		return null;
	}
};

export default function VibeCheckOverlay({
	imageSrc,
	onReset,
	onSuccess,
}: VibeCheckOverlayProps) {
	const { getToken } = useAuth();

	// --- Form State ---
	const [name, setName] = useState("");
	const [wifiSpeedInput, setWifiSpeedInput] = useState("");
	const [powerStatus, setPowerStatus] = useState<PowerOutlets>("unknown");
	const [ergonomics, setErgonomics] = useState<boolean | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Parse wifi speed from input
	const wifiSpeedMbps = useMemo(() => {
		const parsed = parseInt(wifiSpeedInput, 10);
		return isNaN(parsed) || parsed <= 0 ? null : parsed;
	}, [wifiSpeedInput]);

	const wifiQuality: WifiQuality = useMemo(() => {
		if (wifiSpeedMbps == null) return "";
		if (wifiSpeedMbps > 50) return "excellent";
		if (wifiSpeedMbps > 15) return "moderate";
		return "slow";
	}, [wifiSpeedMbps]);

	const handleSubmit = useCallback(async () => {
		if (!name.trim()) {
			alert("Please name this location!");
			return;
		}

		setIsSubmitting(true);

		try {
			const token = await getToken();
			if (!token) throw new Error("No auth token. Please sign in again.");

			const API_URL =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

			// Parallelize cover upload and geolocation if possible
			// (Strictly speaking, geolocation needs to be awaited before payload, but we can start it)
			const geoPromise = new Promise<GeolocationPosition>((resolve, reject) =>
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					enableHighAccuracy: true,
					timeout: 10_000,
					maximumAge: 0,
				}),
			);

			const uploadPromise = imageSrc
				? uploadImage(imageSrc, token)
				: Promise.resolve(null);

			const [position, coverImageUrl] = await Promise.all([
				geoPromise,
				uploadPromise,
			]);

			const payload = {
				name: name.trim(),
				wifi_quality: wifiQuality,
				wifi_speed_mbps: wifiSpeedMbps,
				power_outlets: powerStatus === "unknown" ? "" : powerStatus,
				ergonomic_seating: ergonomics,
				status: "pending",
				cover_image_url: coverImageUrl,
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			};

			const response = await fetch(`${API_URL}/api/v1/pois`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});

			const data = await response.json().catch(() => ({}));

			if (!response.ok) {
				throw new Error(data?.message || data?.error || "Planting failed");
			}

			onSuccess(data.data?.poi_id || data.poi_id);
		} catch (error: unknown) {
			console.error(error);
			const message =
				error instanceof Error ? error.message : "Failed to plant flag";
			alert(`Error: ${message}`);
		} finally {
			setIsSubmitting(false);
		}
	}, [
		name,
		wifiQuality,
		wifiSpeedMbps,
		powerStatus,
		ergonomics,
		imageSrc,
		getToken,
		onSuccess,
	]);

	return (
		<motion.div
			initial={{ y: "100%" }}
			animate={{ y: 0 }}
			className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl rounded-t-3xl p-6 pb-12 border-t border-white/10 shadow-2xl z-20 max-h-[85vh] overflow-y-auto"
		>
			<Button
				variant="ghost"
				size="icon"
				className="absolute top-4 right-4 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
				onClick={onReset}
				aria-label="Close"
			>
				<span className="material-symbols-outlined">close</span>
			</Button>

			<div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6 opacity-50" />

			<div className="space-y-6">
				<ImagePreview src={imageSrc} />
				<VibeFormHeader />

				{/* 1. Name Input */}
				<div className="space-y-2">
					<label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
						Location Name
					</label>
					<Input
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="e.g. Kopitagram Tebet"
						className="bg-muted/50 border-transparent text-lg font-semibold h-12"
						autoFocus
					/>
				</div>

				{/* 2. Wi-Fi Speed */}
				<div className="space-y-2">
					<label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
						Wi-Fi Speed (Mbps)
					</label>
					<div className="flex items-center gap-3">
						<Input
							type="number"
							inputMode="numeric"
							value={wifiSpeedInput}
							onChange={(e) => setWifiSpeedInput(e.target.value)}
							placeholder="e.g. 50"
							className="bg-muted/50 border-transparent text-lg font-semibold h-12 font-mono"
						/>
						{wifiSpeedMbps != null && (
							<div
								className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
									wifiQuality === "excellent"
										? "bg-emerald-500/20 text-emerald-500"
										: wifiQuality === "moderate"
											? "bg-amber-500/20 text-amber-500"
											: "bg-red-500/20 text-red-500"
								}`}
							>
								{wifiQuality}
							</div>
						)}
					</div>
					<p className="text-[11px] text-muted-foreground">
						Optional. Run a speed test on your phone and enter the result.
					</p>
				</div>

				<PowerOutletsGrid value={powerStatus} onChange={setPowerStatus} />
				<ErgonomicsGrid value={ergonomics} onChange={setErgonomics} />

				{/* Footer / Submit */}
				<div className="pt-6 flex gap-3">
					<Button
						variant="ghost"
						className="h-14 w-14 rounded-full"
						onClick={onReset}
						aria-label="Reset"
					>
						<span className="material-symbols-outlined">refresh</span>
					</Button>

					<Button
						className="flex-1 h-14 rounded-full text-lg font-bold shadow-lg shadow-primary/25"
						onClick={handleSubmit}
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<span className="flex items-center gap-2">
								<span className="material-symbols-outlined animate-spin">
									refresh
								</span>
								Planting...
							</span>
						) : (
							<span className="flex items-center gap-2">
								<span className="material-symbols-outlined">flag</span>
								Plant Flag (+100 XP)
							</span>
						)}
					</Button>
				</div>
			</div>
		</motion.div>
	);
}

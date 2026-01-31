"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { ImagePlus, Upload, Trash2, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useImageUpload } from "@/app/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
	value?: string | null;
	onChange: (url: string | null) => void;
	onMultipleChange?: (urls: string[]) => void;
	multiple?: boolean;
	category?: "cover" | "gallery" | "profile" | "general";
	aspectRatio?: "video" | "square";
	className?: string;
	onImageClick?: (url: string) => void;
}

interface UploadState {
	isUploading: boolean;
	progress: number;
	statusText?: string;
	error: string | null;
	count?: {
		current: number;
		total: number;
	};
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ImageUpload({
	value,
	onChange,
	onMultipleChange,
	multiple = false,
	category = "general",
	aspectRatio = "video",
	className = "",
	onImageClick,
}: ImageUploadProps) {
	const { getToken } = useAuth();
	const [uploadState, setUploadState] = useState<UploadState>({
		isUploading: false,
		progress: 0,
		error: null,
	});

	// Single File Upload Logic (Internal)
	const uploadSingleFile = async (file: File): Promise<string | null> => {
		try {
			// Validate file type
			if (!file.type.startsWith("image/")) {
				throw new Error("Please select an image file");
			}

			// Client-side Compression
			let fileToUpload = file;
			try {
				// Only compress if larger than the server hard limit (25MB)
				// Otherwise, upload original to preserve maximum quality
				if (file.size > 25 * 1024 * 1024) {
					console.log("Compressing image client-side...", file.name);
					const options = {
						maxSizeMB: 25, // Match server limit
						// maxWidthOrHeight: 4096, // REMOVED: Do not resize, let server handle everything
						useWebWorker: true,
						initialQuality: 0.9, // Slight compression to fit under limit
						alwaysKeepResolution: true,
					};

					const compressedFile = await imageCompression(file, options);

					// If compression made it larger (rare but possible), keep original
					if (compressedFile.size < file.size) {
						fileToUpload = new File([compressedFile], file.name, {
							type: compressedFile.type,
							lastModified: Date.now(),
						});
						console.log(
							`Compression complete: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`,
						);
					} else {
						console.log("Compression skipped (result larger than original)");
					}
				}
			} catch (compressionError) {
				console.warn(
					"Client-side compression failed, uploading original:",
					compressionError,
				);
				// Absolute hard limit check
				if (file.size > 25 * 1024 * 1024) {
					throw new Error("File too large (> 25MB)");
				}
			}

			// Get presigned URL from backend
			const token = await getToken();
			const presignRes = await fetch(`${API_URL}/api/v1/uploads/presign`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					filename: fileToUpload.name,
					content_type: fileToUpload.type,
					category,
				}),
			});

			if (!presignRes.ok) throw new Error("Failed to get upload URL");

			const presignData = await presignRes.json();
			const { upload_url, key } = presignData.data;

			// Upload directly to R2
			const uploadRes = await fetch(upload_url, {
				method: "PUT",
				headers: {
					"Content-Type": fileToUpload.type,
				},
				body: fileToUpload,
			});

			if (!uploadRes.ok) throw new Error("Failed to upload image");

			// Finalize upload and trigger processing
			const finalizeRes = await fetch(`${API_URL}/api/v1/uploads/finalize`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					upload_key: key,
					category,
				}),
			});

			if (!finalizeRes.ok) throw new Error("Failed to finalize upload");

			const finalizeData = await finalizeRes.json();
			const { asset_id } = finalizeData.data;

			// Poll for status
			return await pollForCompletion(asset_id, token);
		} catch (error) {
			console.error("Upload error:", error);
			throw error;
		}
	};

	const pollForCompletion = async (
		assetId: string,
		token: string | null,
	): Promise<string> => {
		// Increased timeout to 60s for handling large high-res images
		const maxAttempts = 60;
		const interval = 1000; // 1s

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

			// Map backend status to user-friendly messages
			const statusMessages: Record<string, { text: string; progress: number }> =
				{
					pending: { text: "Queueing...", progress: 20 },
					downloading: { text: "Downloading...", progress: 30 },
					processing: { text: "Optimizing...", progress: 50 },
					uploading: { text: "Finalizing...", progress: 80 },
					ready: { text: "Complete", progress: 100 },
					failed: { text: "Failed", progress: 0 },
				};

			const status = statusMessages[asset.status] || {
				text: "Processing...",
				progress: 40,
			};

			setUploadState((s) => ({
				...s,
				statusText: status.text,
				progress: status.progress,
			}));

			if (asset.status === "ready") {
				// Return the URL for the "original" or best derivative representation
				// For simple display, we can reconstruct the URL or use a specific derivative
				// If derivatives exist, prefer a suitable one, otherwise original logic if available
				// The API returns derivatives map. Let's pick a default based on category.
				// Or constructs a CDN URL.

				// For now, construct the optimal CDN URL based on content hash and category
				// Ideally we'd pick the best format, but for the input value (string),
				// we likely want a base URL that the ResponsiveImage component handles,
				// or a specific jpg/webp fallback for simple <img> tags.

				// Let's return the content hash + rendition name pattern
				// e.g. /img/{hash}/{rendition}

				// However, existing consumers of this component expect a full URL string
				// that likely works in <Image src={...}>.

				// We'll return a WebP version of the largest non-original rendition as the "value"
				// which provides good backward compat until we switch to ResponsiveImage.

				const bestRendition = getBestRenditionName(category);
				return `${process.env.NEXT_PUBLIC_API_URL}/img/${asset.content_hash}/${bestRendition}`;
				// Note: using API_URL/img is a proxy assumption, or we use the R2 public URL pattern if no CDN proxy yet.
				// The implementation plan mentions CDN URL.
				// Let's assume direct R2 public URL for now if CDN isn't set up, OR the storage client's GetPublicURL logic.
				// Actually, let's use the URL pattern from the first available derivative to be safe.

				if (asset.derivatives) {
					const renditions = Object.keys(asset.derivatives);
					if (renditions.length > 0) {
						// Prefer the intended one
						const pref = getBestRenditionName(category);
						if (asset.derivatives[pref]) {
							// Use the first format available, prefer webp or jpg
							// The URL pattern from API is like /img/{hash}/{rendition}
							// We probably want to append a default format extension for simple usages
							return asset.derivatives[pref].url_pattern + ".webp"; // simplistic
						}
						// Fallback
						const first = renditions[0];
						return asset.derivatives[first].url_pattern + ".webp";
					}
				}
				return ""; // Should not happen if ready
			} else if (asset.status === "failed") {
				throw new Error(asset.error || "Processing failed");
			}
		}
		throw new Error("Processing timed out");
	};

	const getBestRenditionName = (cat: string) => {
		switch (cat) {
			case "profile":
				return "profile_200";
			case "cover":
				return "cover_1200";
			case "gallery":
				return "gallery_960"; // TODO: INI GANTI KE 640 KALAU KEBERATAN
			default:
				return "general_960";
		}
	};

	const handleUploadProcess = async (file: File) => {
		setUploadState({ isUploading: true, progress: 10, error: null });
		try {
			const url = await uploadSingleFile(file);
			setUploadState({
				isUploading: false,
				progress: 100,
				statusText: "Success",
				error: null,
			});
			onChange(url);
		} catch (error) {
			setUploadState({
				isUploading: false,
				progress: 0,
				error: error instanceof Error ? error.message : "Upload failed",
			});
			onChange(null);
		}
	};

	const handleMultipleUploadProcess = async (
		items: { url: string; file: File }[],
	) => {
		setUploadState({
			isUploading: true,
			progress: 0,
			error: null,
			count: { current: 0, total: items.length },
		});

		const urls: string[] = [];
		let errorOccurred = false;

		for (let i = 0; i < items.length; i++) {
			setUploadState((s) => ({
				...s,
				count: { current: i + 1, total: items.length },
				progress: Math.round(((i + 1) / items.length) * 100),
			}));

			try {
				const url = await uploadSingleFile(items[i].file);
				if (url) urls.push(url);
			} catch (error) {
				console.error(`Failed to upload file ${i + 1}:`, error);
				errorOccurred = true;
			}
		}

		setUploadState({
			isUploading: false,
			progress: 100,
			error: errorOccurred ? "Some uploads failed" : null,
		});

		if (urls.length > 0) {
			onMultipleChange?.(urls);
		}
	};

	const {
		previewUrl,
		fileInputRef,
		handleThumbnailClick,
		handleFileChange,
		handleRemove: hookHandleRemove,
	} = useImageUpload({
		onUpload: (_, file) => handleUploadProcess(file),
		onMultipleUpload: (items) => handleMultipleUploadProcess(items),
	});

	const [isDragging, setIsDragging] = useState(false);

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);

			const files = Array.from(e.dataTransfer.files).filter((file) =>
				file.type.startsWith("image/"),
			);

			if (files.length > 0) {
				const fakeEvent = {
					target: {
						files: files,
					},
				} as unknown as React.ChangeEvent<HTMLInputElement>;
				handleFileChange(fakeEvent);
			}
		},
		[handleFileChange],
	);

	const handleRemove = useCallback(() => {
		hookHandleRemove();
		onChange(null);
		setUploadState({ isUploading: false, progress: 0, error: null });
	}, [hookHandleRemove, onChange]);

	// Display either the hook's local preview or the persisted value
	const displayUrl = previewUrl || value;
	const aspectClass =
		aspectRatio === "square" ? "aspect-square" : "aspect-video";

	return (
		<div className={cn("w-full space-y-2", className)}>
			<Input
				type="file"
				accept="image/*"
				className="hidden"
				ref={fileInputRef}
				onChange={handleFileChange}
				multiple={multiple}
			/>

			{!displayUrl ? (
				<div
					onClick={handleThumbnailClick}
					onDragOver={handleDragOver}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className={cn(
						"flex flex-col items-center justify-center gap-4 rounded-sm border-2 border-dashed border-input bg-muted/30 transition-colors hover:bg-muted/50 cursor-pointer",
						aspectClass,
						isDragging && "border-primary/50 bg-primary/5",
					)}
				>
					<div className="rounded-full bg-background p-3 shadow-sm ring-1 ring-border">
						<ImagePlus className="h-6 w-6 text-muted-foreground" />
					</div>

					{/* Uploading Overlay for empty state */}
					{uploadState.isUploading && (
						<div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center text-center px-4 rounded-sm">
							<Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
							<p className="text-white text-xs font-medium">
								{uploadState.count
									? `Uploading ${uploadState.count.current}/${uploadState.count.total}`
									: uploadState.statusText ||
										`Uploading ${uploadState.progress}%`}
							</p>
						</div>
					)}
				</div>
			) : (
				<div className="relative group">
					<div
						className={cn(
							"relative overflow-hidden rounded-sm border bg-muted",
							aspectClass,
							onImageClick && "cursor-pointer",
						)}
						onClick={() => displayUrl && onImageClick?.(displayUrl)}
					>
						<Image
							src={displayUrl}
							alt="Preview"
							fill
							className="object-cover transition-transform duration-300 "
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							unoptimized
						/>

						{/* Uploading Overlay */}
						{uploadState.isUploading && (
							<div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center text-center px-4">
								<Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
								<p className="text-white text-xs font-medium">
									{uploadState.count
										? `Uploading ${uploadState.count.current}/${uploadState.count.total}`
										: uploadState.statusText ||
											`Uploading ${uploadState.progress}%`}
								</p>
							</div>
						)}

						<div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
						<div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 z-10">
							<Button
								size="sm"
								variant="secondary"
								onClick={(e) => {
									e.stopPropagation();
									handleThumbnailClick();
								}}
								className="h-9 w-9 p-0 rounded-full"
								type="button"
							>
								<Upload className="h-4 w-4" />
							</Button>
							<Button
								size="sm"
								variant="destructive"
								onClick={(e) => {
									e.stopPropagation();
									handleRemove();
								}}
								className="h-9 w-9 p-0 rounded-full"
								type="button"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Error message */}
			{uploadState.error && (
				<p className="text-destructive text-xs ml-1">{uploadState.error}</p>
			)}
		</div>
	);
}

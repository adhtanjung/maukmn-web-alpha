"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { useAuth } from "@clerk/nextjs";
import { ImagePlus, Upload, Trash2, Loader2 } from "lucide-react";
import { useImageUpload } from "@/app/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
	value?: string | null;
	onChange: (url: string | null) => void;
	category?: "cover" | "gallery" | "profile" | "general";
	aspectRatio?: "video" | "square";
	className?: string;
	onImageClick?: (url: string) => void;
}

interface UploadState {
	isUploading: boolean;
	progress: number;
	error: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ImageUpload({
	value,
	onChange,
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

	// R2 Upload Logic
	const handleUploadProcess = async (file: File) => {
		try {
			// Validate file type
			if (!file.type.startsWith("image/")) {
				setUploadState((s) => ({ ...s, error: "Please select an image file" }));
				return;
			}

			setUploadState({ isUploading: true, progress: 10, error: null });

			// Compress the image
			setUploadState((s) => ({ ...s, progress: 30 }));
			const options = {
				maxSizeMB: 1,
				maxWidthOrHeight: 1920,
				useWebWorker: true,
				fileType: "image/webp" as const,
			};

			let compressedFile = file;
			try {
				compressedFile = await imageCompression(file, options);
			} catch (err) {
				console.error("Compression error:", err);
				// Continue with original file if compression fails
			}

			// Get presigned URL from backend
			setUploadState((s) => ({ ...s, progress: 50 }));
			const token = await getToken();
			const presignRes = await fetch(`${API_URL}/api/v1/uploads/presign`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					filename: compressedFile.name,
					content_type: "image/webp",
					category,
				}),
			});

			if (!presignRes.ok) {
				throw new Error("Failed to get upload URL");
			}

			const response = await presignRes.json();
			const { upload_url, public_url } = response.data;

			// Upload directly to R2
			setUploadState((s) => ({ ...s, progress: 70 }));
			const uploadRes = await fetch(upload_url, {
				method: "PUT",
				headers: {
					"Content-Type": "image/webp",
				},
				body: compressedFile,
			});

			if (!uploadRes.ok) {
				throw new Error("Failed to upload image");
			}

			// Success!
			setUploadState({ isUploading: false, progress: 100, error: null });
			onChange(public_url);
		} catch (error) {
			console.error("Upload error:", error);
			setUploadState({
				isUploading: false,
				progress: 0,
				error: error instanceof Error ? error.message : "Upload failed",
			});
			onChange(null); // Clear value on error
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

			const file = e.dataTransfer.files?.[0];
			if (file && file.type.startsWith("image/")) {
				// Manually trigger file change handler with the dropped file
				// We need to construct a synthetic event or just call upload process directly
				// The hook expects a ChangeEvent, let's try to mimic or just reuse logic
				const fakeEvent = {
					target: {
						files: [file],
					},
				} as unknown as React.ChangeEvent<HTMLInputElement>;
				handleFileChange(fakeEvent);
			}
		},
		[handleFileChange]
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
						isDragging && "border-primary/50 bg-primary/5"
					)}
				>
					<div className="rounded-full bg-background p-3 shadow-sm ring-1 ring-border">
						<ImagePlus className="h-6 w-6 text-muted-foreground" />
					</div>
					{/* <div className="text-center px-4">
						{aspectRatio === "square" ? (
							<p className="text-xs font-medium text-muted-foreground">
								Add Photo
							</p>
						) : (
							<>
								<p className="text-sm font-medium text-foreground">
									Click to select
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									or drag and drop file here (max 10MB)
								</p>
							</>
						)}
					</div> */}
				</div>
			) : (
				<div className="relative group">
					<div
						className={cn(
							"relative overflow-hidden rounded-sm border bg-muted",
							aspectClass,
							onImageClick && "cursor-pointer"
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
							<div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center">
								<Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
								<p className="text-white text-xs font-medium">
									Uploading {uploadState.progress}%
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

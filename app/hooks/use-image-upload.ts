import React, { useCallback, useEffect, useRef, useState } from "react";

interface UseImageUploadProps {
	onUpload?: (url: string, file: File) => void;
	onMultipleUpload?: (items: { url: string; file: File }[]) => void;
}

export function useImageUpload({
	onUpload,
	onMultipleUpload,
}: UseImageUploadProps = {}) {
	const previewRefs = useRef<string[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);
	const [fileName, setFileName] = useState<string | null>(null);

	const handleThumbnailClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleFileChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const files = event.target.files;
			if (!files || files.length === 0) return;

			if (files.length === 1) {
				const file = files[0];
				setFileName(file.name);
				const url = URL.createObjectURL(file);
				setPreviewUrl(url);
				previewRefs.current = [url];
				onUpload?.(url, file);
			} else {
				const items: { url: string; file: File }[] = [];
				const urls: string[] = [];

				Array.from(files).forEach((file) => {
					const url = URL.createObjectURL(file);
					items.push({ url, file });
					urls.push(url);
				});

				setPreviewUrls(urls);
				previewRefs.current = urls;
				onMultipleUpload?.(items);
			}
		},
		[onUpload, onMultipleUpload]
	);

	const handleRemove = useCallback(() => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		previewUrls.forEach((url) => URL.revokeObjectURL(url));

		setPreviewUrl(null);
		setPreviewUrls([]);
		setFileName(null);
		previewRefs.current = [];
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, [previewUrl, previewUrls]);

	useEffect(() => {
		return () => {
			previewRefs.current.forEach((url) => URL.revokeObjectURL(url));
		};
	}, []);

	return {
		previewUrl,
		previewUrls,
		fileName,
		fileInputRef,
		handleThumbnailClick,
		handleFileChange,
		handleRemove,
	};
}

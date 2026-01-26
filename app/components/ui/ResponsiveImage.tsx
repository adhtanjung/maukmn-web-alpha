"use client";

interface ResponsiveImageProps {
	hash: string;
	rendition: "profile" | "cover" | "gallery" | "general";
	alt: string;
	className?: string;
	priority?: boolean;
}

const RENDITION_CONFIG = {
	profile: {
		sizes: [48, 96, 200, 400],
		defaultSize: 200,
		aspectRatio: 1,
	},
	cover: {
		sizes: [320, 640, 960, 1200, 1920],
		defaultSize: 1200,
		aspectRatio: 16 / 9,
	},
	gallery: {
		sizes: [150, 320, 640, 960, 1200, 1920, 2560],
		defaultSize: 960,
		aspectRatio: undefined, // Preserve original
	},
	general: {
		sizes: [320, 640, 960, 1200],
		defaultSize: 960,
		aspectRatio: undefined,
	},
};

export function ResponsiveImage({
	hash,
	rendition,
	alt,
	className,
	priority = false,
}: ResponsiveImageProps) {
	const config = RENDITION_CONFIG[rendition];
	const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

	// Generate srcSet for all available sizes
	// URL pattern: /img/{hash}/{renditionName}
	// This assumes the backend serves e.g. /img/abc1234/profile_200 which handles format negotiation
	const srcSet = config.sizes
		.map((size) => {
			// Construct rendition name, typically {category}_{size}
			// Exception: gallery_thumb for 150
			let renditionName = `${rendition}_${size}`;
			if (rendition === "gallery" && size === 150) {
				renditionName = "gallery_thumb";
			}

			return `${baseUrl}/img/${hash}/${renditionName} ${size}w`;
		})
		.join(", ");

	// Sizes attribute tells browser which size to pick
	const sizes = getSizesForRendition(rendition);

	// Default src for fallback
	const defaultRenditionName = `${rendition}_${config.defaultSize}`;

	return (
		<img
			src={`${baseUrl}/img/${hash}/${defaultRenditionName}`}
			srcSet={srcSet}
			sizes={sizes}
			alt={alt}
			width={config.defaultSize}
			height={
				config.aspectRatio ? config.defaultSize / config.aspectRatio : undefined
			}
			className={className}
			loading={priority ? "eager" : "lazy"}
			decoding="async"
		/>
	);
}

function getSizesForRendition(rendition: string): string {
	switch (rendition) {
		case "profile":
			return "(max-width: 640px) 96px, 200px";
		case "cover":
			return "(max-width: 640px) 100vw, (max-width: 1024px) 960px, 1200px";
		case "gallery":
			return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
		default:
			return "100vw";
	}
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/app/components/ui/ImageUpload";
import type { POIFormData } from "@/app/contexts/POIFormContext";
import { cn } from "@/lib/utils";

const CATEGORIES = [
	{ id: "cafe", label: "Cafe", icon: "local_cafe" },
	{ id: "restaurant", label: "Restaurant", icon: "restaurant" },
	{ id: "coworking", label: "Coworking", icon: "work" },
	{ id: "bar", label: "Bar", icon: "local_bar" },
	{ id: "park", label: "Park", icon: "park" },
] as const;

const COVER_EXAMPLES = [
	{
		src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
		thumb:
			"https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&h=112&fit=crop",
		alt: "Wide cafe interior with warm lighting",
		isGood: true,
		label: "Wide interior shot",
	},
	{
		src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
		thumb:
			"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=112&fit=crop",
		alt: "Restaurant ambiance with tables",
		isGood: true,
		label: "Restaurant atmosphere",
	},
	{
		src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
		thumb:
			"https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=112&fit=crop",
		alt: "Modern coworking space",
		isGood: true,
		label: "Coworking space",
	},
	{
		src: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
		thumb:
			"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=112&fit=crop",
		alt: "Coffee cup close-up",
		isGood: false,
		label: "Close-up only ✗",
	},
];

const GUIDELINES = [
	{
		icon: "check_circle",
		text: "Wide shot showing the overall atmosphere and vibe",
		type: "success",
	},
	{
		icon: "check_circle",
		text: "Good lighting (natural light works best)",
		type: "success",
	},
	{
		icon: "check_circle",
		text: "Clear and sharp - no blurry images",
		type: "success",
	},
	{
		icon: "cancel",
		text: "Avoid close-ups, people's faces, or text overlays",
		type: "error",
	},
] as const;

const GALLERY_TIPS = [
	{ icon: "restaurant", label: "Food & Drinks", color: "blue" },
	{ icon: "chair", label: "Seating Areas", color: "purple" },
	{ icon: "storefront", label: "Entrance", color: "amber" },
	{ icon: "menu_book", label: "Menu", color: "emerald" },
] as const;

// Helper Components
function GuidelineItem({
	icon,
	text,
	type,
}: {
	icon: string;
	text: string;
	type: "success" | "error";
}) {
	return (
		<li className="flex items-start gap-2">
			<span
				className={cn(
					"material-symbols-outlined text-sm mt-0.5",
					type === "success" ? "text-green-500" : "text-destructive"
				)}
			>
				{icon}
			</span>
			<span>{text}</span>
		</li>
	);
}

function GalleryTip({
	icon,
	label,
	color,
}: {
	icon: string;
	label: string;
	color: string;
}) {
	// Map abstract colors to specific tailwind classes safely if needed,
	// or use style for dynamic colors. Using standard theme colors for safety.
	const colorMap: Record<string, string> = {
		blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
		purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
		amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
		emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
	};

	return (
		<div
			className={cn(
				"flex items-center gap-2 px-3 py-2 border rounded-lg shrink-0",
				colorMap[color]
			)}
		>
			<span className="material-symbols-outlined text-lg">{icon}</span>
			<span className="text-xs opacity-90">{label}</span>
		</div>
	);
}

export default function ProfileVisualsTab() {
	const {
		register,
		control,
		watch,
		formState: { errors },
	} = useFormContext<POIFormData>();
	const description = watch("description") || "";
	const [previewImage, setPreviewImage] = useState<{
		src: string;
		alt: string;
		isGood?: boolean;
		label?: string;
	} | null>(null);

	return (
		<div className="px-4 py-4 space-y-6">
			<section>
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase block pb-4">
					Basic Info
				</Label>
				<div className="flex flex-col gap-5">
					{/* POI Name */}
					<div className="flex flex-col w-full space-y-2">
						<Label className="text-foreground text-sm font-medium ml-1">
							POI Name <span className="text-destructive">*</span>
						</Label>
						<Input
							placeholder="e.g., The Grind Cafe"
							type="text"
							className="h-14"
							{...register("name")}
						/>
						{errors.name && (
							<p className="text-destructive text-xs ml-1">
								{errors.name.message}
							</p>
						)}
					</div>

					{/* Brand Name */}
					<div className="flex flex-col w-full space-y-2">
						<Label className="text-foreground text-sm font-medium ml-1">
							Brand Name{" "}
							<span className="text-muted-foreground text-xs font-normal">
								(Optional)
							</span>
						</Label>
						<Input
							placeholder="e.g., Grind Coffee Co."
							type="text"
							className="h-14"
							{...register("brandName")}
						/>
					</div>

					{/* Categories */}
					<div className="flex flex-col w-full">
						<Label className="text-foreground text-sm font-medium pb-3 ml-1">
							Category <span className="text-destructive">*</span>
						</Label>
						<Controller
							name="categories"
							control={control}
							render={({ field }) => (
								<div className="flex flex-wrap gap-2">
									{CATEGORIES.map((category) => {
										const isSelected = field.value?.includes(category.id);
										return (
											<Button
												key={category.id}
												type="button"
												onClick={() => {
													const newValue = isSelected
														? field.value.filter((c) => c !== category.id)
														: [...(field.value || []), category.id];
													field.onChange(newValue);
												}}
												variant={isSelected ? "default" : "outline"}
												className="rounded-full"
											>
												<span className="material-symbols-outlined text-lg mr-2">
													{category.icon}
												</span>
												<span>{category.label}</span>
												{isSelected && (
													<span className="material-symbols-outlined text-lg ml-2">
														check
													</span>
												)}
											</Button>
										);
									})}
								</div>
							)}
						/>
						{errors.categories && (
							<p className="text-destructive text-xs ml-1 mt-2">
								{errors.categories.message}
							</p>
						)}
					</div>

					{/* Description */}
					<div className="flex flex-col w-full space-y-2">
						<div className="flex justify-between items-baseline ml-1">
							<Label className="text-foreground text-sm font-medium">
								Description
							</Label>
							<p className="text-muted-foreground text-xs">
								{description.length}/2000
							</p>
						</div>
						<Textarea
							placeholder="Tell us about the vibe, the crowd, and what makes this place special..."
							className="min-h-[120px]"
							{...register("description")}
						/>
					</div>
				</div>
			</section>

			<div className="h-px bg-border"></div>

			{/* Visual Assets Section */}
			<section>
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase block pb-4">
					Visual Assets
				</Label>
				<div className="flex flex-col gap-6">
					{/* Cover Image with Guidelines */}
					<div className="flex flex-col gap-3">
						<div className="flex items-center justify-between">
							<Label className="text-foreground text-sm font-medium ml-1">
								Cover Image
							</Label>
							<span className="text-muted-foreground text-xs">
								16:9 recommended
							</span>
						</div>

						{/* Image Guidelines Card */}
						<div className="bg-card border border-border rounded-xl p-4 space-y-3">
							<div className="flex items-start gap-3">
								<span className="material-symbols-outlined text-primary text-xl">
									lightbulb
								</span>
								<div className="flex-1">
									<p className="text-foreground text-sm font-medium mb-2">
										What makes a great cover?
									</p>
									<ul className="text-muted-foreground text-xs space-y-1.5">
										{GUIDELINES.map((guide, idx) => (
											<GuidelineItem key={idx} {...guide} />
										))}
									</ul>
								</div>
							</div>

							{/* Example Images */}
							<div className="pt-2 border-t border-border">
								<p className="text-muted-foreground text-xs mb-2">Examples:</p>
								<div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
									{COVER_EXAMPLES.map((example, idx) => (
										<button
											key={idx}
											type="button"
											onClick={() => setPreviewImage(example)}
											className="relative shrink-0 group focus:outline-none"
										>
											<Image
												src={example.thumb}
												alt={example.alt}
												width={100}
												height={56}
												className={cn(
													"rounded-md object-cover transition-opacity",
													!example.isGood
														? "opacity-60"
														: "group-hover:opacity-90"
												)}
											/>
											<div className="absolute bottom-1 left-1 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
												<span
													className={cn(
														"text-[12px] font-bold",
														example.isGood ? "text-green-400" : "text-red-400"
													)}
												>
													{example.isGood ? "✓" : "✗"}
												</span>
											</div>
										</button>
									))}
								</div>
							</div>
						</div>

						<Controller
							name="coverImage"
							control={control}
							render={({ field }) => (
								<ImageUpload
									value={field.value}
									onChange={field.onChange}
									category="cover"
									aspectRatio="video"
									onImageClick={(url) =>
										setPreviewImage({
											src: url,
											alt: "Cover Image",
											label: "Cover Preview",
										})
									}
								/>
							)}
						/>
					</div>

					{/* Photo Gallery with Guidelines */}
					<div className="flex flex-col gap-3">
						<div className="flex items-center justify-between">
							<Label className="text-foreground text-sm font-medium ml-1">
								Photo Gallery
							</Label>
							<span className="text-muted-foreground text-xs">
								Up to 10 photos
							</span>
						</div>

						{/* Gallery Tips */}
						{/* <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
							{GALLERY_TIPS.map((tip, idx) => (
								<GalleryTip key={idx} {...tip} />
							))}
						</div> */}

						<Controller
							name="galleryImages"
							control={control}
							render={({ field }) => (
								<div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
									{(field.value || []).map((url: string, idx: number) => (
										<div
											key={url} // Use URL as key for robust deletion tracking
											className="relative aspect-square rounded-md overflow-hidden bg-background group border border-border cursor-pointer"
											onClick={() =>
												setPreviewImage({
													src: url,
													alt: `Gallery Image ${idx + 1}`,
													label: "Gallery Preview",
												})
											}
										>
											<Image
												alt={`Gallery image ${idx + 1}`}
												className="object-cover"
												fill
												src={url}
												unoptimized
												sizes="(max-width: 768px) 33vw, 25vw"
											/>
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													const newValue = field.value.filter(
														(val) => val !== url
													);
													field.onChange(newValue);
												}}
												className="absolute top-1 right-1 bg-black/50 hover:bg-destructive/90 rounded-full w-6 h-6 flex items-center justify-center transition-colors backdrop-blur-[2px]"
											>
												<span className="material-symbols-outlined text-white text-sm">
													close
												</span>
											</button>
											{/* Image number badge */}
											<div className="absolute bottom-1 left-1 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 pointer-events-none">
												<span className="text-white text-[10px] font-medium">
													{idx + 1}
												</span>
											</div>
										</div>
									))}
									{/* Add photo button */}
									{(field.value?.length || 0) < 10 && (
										<div className="aspect-square">
											<ImageUpload
												key={field.value?.length || 0}
												value={null}
												onChange={(url) => {
													if (url) {
														field.onChange([...(field.value || []), url]);
													}
												}}
												category="gallery"
												aspectRatio="square"
												className="w-full h-full"
											/>
										</div>
									)}
								</div>
							)}
						/>

						{/* Gallery count */}
						<p className="text-muted-foreground text-xs ml-1">
							{watch("galleryImages")?.length || 0} of 10 photos added
						</p>
					</div>
				</div>
			</section>

			{/* Image Preview Modal */}
			{previewImage && (
				<div
					className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
					onClick={() => setPreviewImage(null)}
				>
					<button
						className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
						onClick={() => setPreviewImage(null)}
					>
						<span className="material-symbols-outlined text-3xl">close</span>
					</button>
					<div
						className="relative w-full max-w-4xl max-h-[85vh] rounded-xl overflow-hidden bg-background shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="relative w-full aspect-video bg-black/20">
							<Image
								src={previewImage.src}
								alt={previewImage.alt}
								fill
								className="object-contain"
								unoptimized
							/>
						</div>
						<div className="p-4 bg-card border-t border-border flex items-center justify-between">
							<div>
								<h3 className="text-foreground font-medium">
									{previewImage.label}
								</h3>
								<p className="text-muted-foreground text-sm">
									{previewImage.alt}
								</p>
							</div>
							{previewImage.isGood !== undefined && (
								<div
									className={cn(
										"flex items-center gap-2 px-3 py-1.5 rounded-full",
										previewImage.isGood
											? "bg-green-500/10 text-green-500"
											: "bg-destructive/10 text-destructive"
									)}
								>
									<span className="material-symbols-outlined text-lg">
										{previewImage.isGood ? "check_circle" : "cancel"}
									</span>
									<span className="text-sm font-medium">
										{previewImage.isGood ? "Good Example" : "Avoid This"}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

"use client";

import { SmartImage } from "@/components/ui/smart-image";

export function POIGallery({
	images,
	onImageClick,
}: {
	images: string[];
	onImageClick: (src: string) => void;
}) {
	return (
		<div className="py-4">
			<div className="flex items-center justify-between mb-3 px-1">
				<h3 className="text-lg font-bold text-foreground">Gallery</h3>
			</div>
			<div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x">
				{images.length > 0 ? (
					images.map((src, idx) => (
						<div
							key={idx}
							className="flex-none w-40 h-40 rounded-xl overflow-hidden snap-center ring-1 ring-white/10 relative cursor-pointer active:scale-95 transition-transform"
							onClick={() => onImageClick(src)}
						>
							<SmartImage
								src={src}
								alt={`Gallery ${idx + 1}`}
								fill
								className="object-cover"
								containerClassName="w-full h-full"
								sizes="160px"
							/>
						</div>
					))
				) : (
					<p className="text-muted-foreground text-sm p-4">
						No photos available
					</p>
				)}
			</div>
		</div>
	);
}

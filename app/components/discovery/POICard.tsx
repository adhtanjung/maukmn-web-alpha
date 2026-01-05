import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Amenity {
	icon: string;
	label: string;
	featured?: boolean;
}

interface POICardProps {
	name: string;
	category: string;
	rating: number;
	distance: string;
	description: string;
	imageUrl: string;
	amenities: Amenity[];
	likes: number;
	comments: number;
}

export default function POICard({
	name,
	category,
	rating,
	distance,
	description,
	imageUrl,
	amenities,
	likes,
	comments,
}: POICardProps) {
	return (
		<div className="relative w-full h-full snap-start shrink-0 overflow-hidden">
			{/* Hero Image */}
			<div
				className="absolute inset-0 w-full h-[100%] bg-cover bg-center"
				style={{ backgroundImage: `url("${imageUrl}")` }}
			></div>

			{/* Gradient Overlay */}
			<div className="absolute bottom-0 left-0 w-full h-[65%] bg-image-gradient-fade pointer-events-none"></div>

			{/* Action Buttons */}
			<div className="absolute right-4 bottom-[140px] flex flex-col items-center gap-5 z-20 pb-6">
				<div className="flex flex-col items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 active:scale-90 transition-all shadow-lg hover:bg-white/10 group"
					>
						<span className="material-symbols-outlined text-foreground !text-[26px] group-hover:text-red-500 transition-colors">
							favorite
						</span>
					</Button>
					<span className="text-xs font-semibold text-foreground drop-shadow-md">
						{likes}
					</span>
				</div>
				<div className="flex flex-col items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 active:scale-90 transition-all shadow-lg hover:bg-white/10"
					>
						<span className="material-symbols-outlined text-foreground !text-[26px]">
							chat_bubble
						</span>
					</Button>
					<span className="text-xs font-semibold text-foreground drop-shadow-md">
						{comments}
					</span>
				</div>
				<div className="flex flex-col items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 active:scale-90 transition-all shadow-lg hover:bg-white/10"
					>
						<span className="material-symbols-outlined text-foreground !text-[26px]">
							share
						</span>
					</Button>
					<span className="text-xs font-semibold text-foreground drop-shadow-md">
						Share
					</span>
				</div>
			</div>

			{/* POI Info */}
			<div className="absolute bottom-0 w-full px-5 pb-[110px] z-10 flex flex-col gap-3">
				<div className="flex flex-col gap-1.5">
					<div className="flex items-start justify-between pr-16">
						<h1 className="text-[28px] leading-tight font-extrabold tracking-tight text-white drop-shadow-lg">
							{name}
						</h1>
					</div>
					<div className="flex items-center flex-wrap gap-2 text-foreground text-sm font-medium">
						<Badge
							variant="outline"
							className="flex items-center gap-1 bg-black/30 backdrop-blur-sm border-white/5"
						>
							<span className="material-symbols-outlined text-primary !text-[16px] pb-0.5">
								star
							</span>
							<span className="text-foreground text-xs font-bold">
								{rating}
							</span>
						</Badge>
						<span className="w-1 h-1 rounded-full bg-white/40"></span>
						<span>{category}</span>
						<span className="w-1 h-1 rounded-full bg-white/40"></span>
						<div className="flex items-center gap-1 text-primary-dark">
							<span className="material-symbols-outlined !text-[16px] text-primary">
								location_on
							</span>
							<span className="text-primary text-xs font-bold uppercase tracking-wide">
								{distance}
							</span>
						</div>
					</div>
				</div>
				<p className="text-muted-foreground text-[13px] leading-relaxed line-clamp-2 max-w-[85%] font-medium drop-shadow-md">
					{description}
					<span className="text-foreground font-bold underline decoration-white/30 underline-offset-2 ml-1 cursor-pointer">
						more
					</span>
				</p>

				{/* Amenity Chips */}
				<div className="flex gap-2.5 overflow-x-auto no-scrollbar pt-2 mask-linear-fade">
					{amenities.map((amenity, idx) => (
						<Badge
							key={idx}
							variant={amenity.featured ? "default" : "outline"}
							className={`flex h-7 shrink-0 items-center justify-center gap-x-1.5 pl-2.5 pr-3 ${
								amenity.featured
									? "bg-primary/90 shadow-[0_0_15px_rgba(16,185,129,0.4)] border-primary/50"
									: "bg-white/10 backdrop-blur-md border-white/10"
							}`}
						>
							<span
								className={`material-symbols-outlined !text-[16px] ${
									amenity.featured ? "text-foreground" : "text-primary"
								}`}
							>
								{amenity.icon}
							</span>
							<p
								className={`text-[11px] ${
									amenity.featured
										? "text-foreground font-bold"
										: "text-foreground font-semibold"
								}`}
							>
								{amenity.label}
							</p>
						</Badge>
					))}
				</div>
			</div>
		</div>
	);
}

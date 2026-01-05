"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { POIFormData } from "@/app/contexts/POIFormContext";

const SOCIAL_PLATFORMS = [
	{
		key: "instagram",
		label: "Instagram",
		icon: "photo_camera",
		placeholder: "https://instagram.com/yourhandle",
		pattern: "instagram.com/",
	},
	{
		key: "facebook",
		label: "Facebook",
		icon: "group",
		placeholder: "https://facebook.com/yourpage",
		pattern: "facebook.com/",
	},
	{
		key: "twitter",
		label: "X (Twitter)",
		icon: "alternate_email",
		placeholder: "https://x.com/yourhandle",
		pattern: "(x.com/|twitter.com/)",
	},
	{
		key: "tiktok",
		label: "TikTok",
		icon: "music_note",
		placeholder: "https://tiktok.com/@yourhandle",
		pattern: "tiktok.com/@",
	},
	{
		key: "youtube",
		label: "YouTube",
		icon: "play_circle",
		placeholder: "https://youtube.com/@yourchannel",
		pattern: "youtube.com/",
	},
	{
		key: "linkedin",
		label: "LinkedIn",
		icon: "work",
		placeholder: "https://linkedin.com/company/yourcompany",
		pattern: "linkedin.com/",
	},
] as const;

export default function ContactTab() {
	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = useFormContext<POIFormData>();

	const socialLinks = watch("socialLinks") || {};
	const socialLinksErrors =
		(errors.socialLinks as Record<string, { message?: string }> | undefined) ||
		{};

	const handleSocialLinkChange = (platform: string, value: string) => {
		const updated = { ...socialLinks };
		if (value.trim() === "") {
			delete updated[platform];
		} else {
			updated[platform] = value;
		}
		setValue("socialLinks", updated);
	};

	return (
		<div className="px-4 py-4 space-y-8">
			{/* Digital Presence Section */}
			<section className="space-y-4">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Digital Presence
				</Label>

				{/* Website */}
				<div className="space-y-2">
					<Label className="text-muted-foreground text-sm font-medium">
						Website
					</Label>
					<div className="relative">
						<Input
							type="url"
							placeholder="https://www.example.com"
							{...register("website")}
							className="pr-12"
						/>
						<span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary material-symbols-outlined">
							language
						</span>
					</div>
				</div>

				{/* Phone / WhatsApp */}
				<div className="space-y-2">
					<Label className="text-muted-foreground text-sm font-medium">
						Phone / WhatsApp
					</Label>
					<div className="relative">
						<Input
							type="tel"
							placeholder="+1 (555) 000-0000"
							{...register("phone")}
							className="pr-12"
						/>
						<span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary material-symbols-outlined">
							call
						</span>
					</div>
				</div>

				{/* Email */}
				<div className="space-y-2">
					<Label className="text-muted-foreground text-sm font-medium">
						Email
					</Label>
					<div className="relative">
						<Input
							type="email"
							placeholder="contact@example.com"
							{...register("email")}
							className="pr-12"
						/>
						<span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary material-symbols-outlined">
							mail
						</span>
					</div>
				</div>
			</section>

			<hr className="border-surface-border" />

			{/* Social Media Section */}
			<section className="space-y-4">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Social Media
				</Label>
				<p className="text-muted-foreground text-sm">
					Add your social media profiles to help customers connect with you.
				</p>

				<div className="space-y-4">
					{SOCIAL_PLATFORMS.map((platform) => {
						const error = socialLinksErrors[platform.key];
						return (
							<div key={platform.key} className="space-y-2">
								<Label className="text-muted-foreground text-sm font-medium">
									{platform.label}
								</Label>
								<div className="relative">
									<Input
										type="url"
										placeholder={platform.placeholder}
										value={socialLinks[platform.key] || ""}
										onChange={(e) =>
											handleSocialLinkChange(platform.key, e.target.value)
										}
										className={`pr-12 ${
											error ? "border-red-500 focus-visible:ring-red-500" : ""
										}`}
									/>
									<span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary material-symbols-outlined">
										{platform.icon}
									</span>
								</div>
								{error?.message && (
									<p className="text-red-500 text-xs flex items-center gap-1">
										<span className="material-symbols-outlined text-sm">
											error
										</span>
										{error.message}
									</p>
								)}
							</div>
						);
					})}
				</div>
			</section>
		</div>
	);
}

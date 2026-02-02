"use client";

import { cn } from "@/lib/utils";
import { motion, type Variants } from "motion/react";

import Link from "next/link"; // Added import

interface ThinkingLogoButtonProps {
	className?: string;
	onClick?: () => void;
	href?: string;
}

/**
 * ThinkingLogoButton Component
 *
 * A reusable button featuring "The Excited Hop" animation.
 * The whole logo squats down (squashes) and hops into the air.
 * The "Dot" trails slightly behind the "Curve" due to gravity - Pixar Lamp style!
 */
export const ThinkingLogoButton = ({
	className,
	onClick,
	href,
}: ThinkingLogoButtonProps) => {
	// Container animation - handles the overall hop movement
	const containerVariants = {
		idle: { y: 0, scaleY: 1, scaleX: 1 },
		hover: {
			y: [0, 8, -25, -20, 0], // Squat down, hop up high, slight settle, land
			scaleY: [1, 0.85, 1.1, 1.05, 1], // Squash on crouch, stretch on jump
			scaleX: [1, 1.1, 0.95, 0.98, 1], // Expand on squash, compress on stretch
			transition: {
				duration: 0.7,
				times: [0, 0.2, 0.5, 0.7, 1],
				ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // Custom easing for bouncy feel
			},
		},
		tap: { scale: 0.95 },
	};

	// Body (Curve) animation - leads the hop
	const bodyVariants = {
		idle: { y: 0, rotate: 0 },
		hover: {
			y: [0, 0, -8, -5, 0], // Slight additional lift on top of container
			rotate: [0, 2, -3, 1, 0], // Subtle wobble during flight
			transition: {
				duration: 0.7,
				times: [0, 0.2, 0.5, 0.7, 1],
				ease: "easeOut" as const,
			},
		},
		tap: { scale: 0.95 },
	};

	// Dot animation - trails behind due to "gravity"
	const dotVariants = {
		idle: { y: 0 },
		hover: {
			y: [0, 5, -15, -10, 0], // Lags behind: stays down during squat, catches up late
			transition: {
				duration: 0.7,
				times: [0, 0.25, 0.55, 0.75, 1], // Delayed timing compared to body
				ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number], // Bouncy overshoot
			},
		},
		tap: { scale: 0.9 },
	};

	if (href) {
		return (
			<Link href={href} onClick={onClick} className="block">
				<motion.div
					whileHover="hover"
					whileTap="tap"
					initial="idle"
					className={cn(
						"relative flex items-center justify-center overflow-visible cursor-pointer",
						className,
					)}
				>
					{/* Container for the hop - applies to the whole logo */}
					<motion.div
						variants={containerVariants}
						style={{ transformOrigin: "center bottom" }} // Hop from the bottom
						className="flex items-center justify-center"
					>
						<LogoSvg bodyVariants={bodyVariants} dotVariants={dotVariants} />
					</motion.div>
				</motion.div>
			</Link>
		);
	}

	return (
		<motion.button
			onClick={onClick}
			whileHover="hover"
			whileTap="tap"
			initial="idle"
			className={cn(
				"relative flex items-center justify-center overflow-visible",
				className,
			)}
		>
			{/* Container for the hop - applies to the whole logo */}
			<motion.div
				variants={containerVariants}
				style={{ transformOrigin: "center bottom" }} // Hop from the bottom
				className="flex items-center justify-center"
			>
				<LogoSvg bodyVariants={bodyVariants} dotVariants={dotVariants} />
			</motion.div>
		</motion.button>
	);
};

const LogoSvg = ({
	bodyVariants,
	dotVariants,
}: {
	bodyVariants: Variants;
	dotVariants: Variants;
}) => (
	<svg
		width="32"
		height="44"
		viewBox="0 0 290 420"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		style={{ overflow: "visible" }}
	>
		<defs>
			{/* Inner shadow filter for the curve */}
			<filter
				id="curveInnerShadow"
				x="-50%"
				y="-50%"
				width="200%"
				height="200%"
				filterUnits="userSpaceOnUse"
				colorInterpolationFilters="sRGB"
			>
				<feFlood floodOpacity="0" result="BackgroundImageFix" />
				<feBlend
					mode="normal"
					in="SourceGraphic"
					in2="BackgroundImageFix"
					result="shape"
				/>
				<feColorMatrix
					in="SourceAlpha"
					type="matrix"
					values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
					result="hardAlpha"
				/>
				<feOffset dy="20" />
				<feGaussianBlur stdDeviation="3" />
				<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
				<feColorMatrix
					type="matrix"
					values="0 0 0 0 0.78 0 0 0 0 0.21 0 0 0 0 0 0 0 0 0.5 0"
				/>
				<feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
			</filter>
			{/* Inner shadow filter for the dot */}
			<filter
				id="dotInnerShadow"
				x="-50%"
				y="-50%"
				width="200%"
				height="200%"
				filterUnits="userSpaceOnUse"
				colorInterpolationFilters="sRGB"
			>
				<feFlood floodOpacity="0" result="BackgroundImageFix" />
				<feBlend
					mode="normal"
					in="SourceGraphic"
					in2="BackgroundImageFix"
					result="shape"
				/>
				<feColorMatrix
					in="SourceAlpha"
					type="matrix"
					values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
					result="hardAlpha"
				/>
				<feOffset dx="6" dy="10" />
				<feGaussianBlur stdDeviation="2" />
				<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
				<feColorMatrix
					type="matrix"
					values="0 0 0 0 0.78 0 0 0 0 0.21 0 0 0 0 0 0 0 0 0.5 0"
				/>
				<feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
			</filter>
		</defs>

		{/* Body (Question Mark Curve) - leads the hop */}
		<motion.g
			filter="url(#curveInnerShadow)"
			variants={bodyVariants}
			style={{ transformOrigin: "145px 150px" }}
		>
			<path
				d="M56.7817 84.1519L130.767 60.7708C201.114 38.5397 260.188 117.298 219.154 178.609L175.999 243.092"
				stroke="#FF4500"
				strokeWidth="113"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</motion.g>

		{/* Dot (The Ball) - trails behind due to gravity */}
		<motion.g
			filter="url(#dotInnerShadow)"
			variants={dotVariants}
			style={{ transformOrigin: "106px 355px" }}
		>
			<ellipse cx="106" cy="360" rx="54" ry="55" fill="#FF4500" />
		</motion.g>
	</svg>
);

export default ThinkingLogoButton;

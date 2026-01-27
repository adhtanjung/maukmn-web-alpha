import { POI } from "@/app/hooks/usePOIs";

/**
 * Calculate a workability/productivity score from 1-5 based on:
 * - WiFi quality
 * - Power outlet availability
 * - Noise level (quieter = better for work)
 */
export function calculateWorkabilityScore(poi: POI): number | null {
	if (!poi) return null;

	const wifiScores: Record<string, number> = {
		none: 0,
		slow: 1,
		moderate: 2,
		fast: 3,
		excellent: 4,
	};

	const outletScores: Record<string, number> = {
		none: 0,
		limited: 1,
		moderate: 2,
		plenty: 3,
	};

	const noiseScores: Record<string, number> = {
		loud: 0,
		lively: 1,
		moderate: 2,
		quiet: 3,
		silent: 4,
	};

	// Check if we have enough data to calculate a score
	const hasWifiData = poi.wifi_quality && poi.wifi_quality !== "none";
	const hasOutletData = poi.power_outlets && poi.power_outlets !== "none";
	const hasNoiseData = Boolean(poi.noise_level);

	// Need at least 2 data points to show a meaningful score
	const dataPoints = [hasWifiData, hasOutletData, hasNoiseData].filter(
		Boolean,
	).length;
	if (dataPoints < 2) return null;

	const wifiScore = wifiScores[poi.wifi_quality || "none"] ?? 0;
	const outletScore = outletScores[poi.power_outlets || "none"] ?? 0;
	const noiseScore = noiseScores[poi.noise_level || "moderate"] ?? 2;

	// Max possible score: 4 + 3 + 4 = 11
	// Convert to 1-5 scale
	const rawScore = wifiScore + outletScore + noiseScore;
	const normalizedScore = Math.round((rawScore / 11) * 4) + 1;

	return Math.min(5, Math.max(1, normalizedScore));
}

/**
 * Get a label for the workability score
 */
export function getWorkabilityLabel(score: number): string {
	switch (score) {
		case 5:
			return "Excellent";
		case 4:
			return "Great";
		case 3:
			return "Good";
		case 2:
			return "Fair";
		default:
			return "Limited";
	}
}

export const getWifiPercent = (quality?: string) => {
	switch (quality) {
		case "excellent":
			return 100;
		case "fast":
			return 85;
		case "moderate":
			return 50;
		case "slow":
			return 25;
		default:
			return 0;
	}
};

export const getPowerPercent = (amount?: string) => {
	switch (amount) {
		case "plenty":
			return 90;
		case "moderate":
			return 60;
		case "limited":
			return 30;
		default:
			return 0;
	}
};

export const getNoisePercent = (level?: string) => {
	switch (level) {
		case "loud":
			return 90;
		case "lively":
			return 70;
		case "moderate":
			return 50;
		case "quiet":
			return 25;
		case "silent":
			return 10;
		default:
			return 0;
	}
};

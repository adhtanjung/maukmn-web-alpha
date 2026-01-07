interface OpenHours {
	open: string;
	close: string;
}

interface OpenStatus {
	isOpen: boolean;
	statusText: string;
	closesAt: string | null;
	opensAt: string | null;
}

/**
 * Parse time string (e.g., "09:00", "21:00") to minutes since midnight
 */
function parseTimeToMinutes(timeStr: string): number {
	const [hours, minutes] = timeStr.split(":").map(Number);
	return hours * 60 + (minutes || 0);
}

/**
 * Format time from 24h to 12h format (e.g., "21:00" -> "9 PM")
 */
function formatTime(timeStr: string): string {
	const [hours, minutes] = timeStr.split(":").map(Number);
	const period = hours >= 12 ? "PM" : "AM";
	const displayHours = hours % 12 || 12;
	if (minutes && minutes > 0) {
		return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
	}
	return `${displayHours} ${period}`;
}

/**
 * Get the current day key for open_hours lookup
 */
function getCurrentDayKey(): string {
	const days = [
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
	];
	return days[new Date().getDay()];
}

/**
 * Get the next day key
 */
function getNextDayKey(currentDay: string): string {
	const days = [
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
	];
	const currentIndex = days.indexOf(currentDay);
	return days[(currentIndex + 1) % 7];
}

/**
 * Determine if a POI is currently open based on open_hours
 */
export function getOpenStatus(
	openHours: Record<string, OpenHours> | undefined | null
): OpenStatus {
	if (!openHours || Object.keys(openHours).length === 0) {
		return {
			isOpen: false,
			statusText: "Hours unavailable",
			closesAt: null,
			opensAt: null,
		};
	}

	const now = new Date();
	const currentDayKey = getCurrentDayKey();
	const currentMinutes = now.getHours() * 60 + now.getMinutes();

	const todayHours = openHours[currentDayKey];

	// No hours for today - check next opening
	if (!todayHours || !todayHours.open || !todayHours.close) {
		// Find next open day
		let nextOpenDay = getNextDayKey(currentDayKey);
		for (let i = 0; i < 7; i++) {
			if (openHours[nextOpenDay]?.open) {
				return {
					isOpen: false,
					statusText: `Closed · Opens ${
						nextOpenDay.charAt(0).toUpperCase() + nextOpenDay.slice(1)
					}`,
					closesAt: null,
					opensAt: formatTime(openHours[nextOpenDay].open),
				};
			}
			nextOpenDay = getNextDayKey(nextOpenDay);
		}
		return {
			isOpen: false,
			statusText: "Closed",
			closesAt: null,
			opensAt: null,
		};
	}

	const openTime = parseTimeToMinutes(todayHours.open);
	const closeTime = parseTimeToMinutes(todayHours.close);

	// Handle overnight hours (e.g., open 18:00, close 02:00)
	const isOvernight = closeTime < openTime;

	let isOpen: boolean;
	if (isOvernight) {
		isOpen = currentMinutes >= openTime || currentMinutes < closeTime;
	} else {
		isOpen = currentMinutes >= openTime && currentMinutes < closeTime;
	}

	if (isOpen) {
		const closesAt = formatTime(todayHours.close);
		// Calculate time until close
		let minutesUntilClose: number;
		if (isOvernight && currentMinutes < closeTime) {
			minutesUntilClose = closeTime - currentMinutes;
		} else if (isOvernight) {
			minutesUntilClose = 24 * 60 - currentMinutes + closeTime;
		} else {
			minutesUntilClose = closeTime - currentMinutes;
		}

		// Warning if closing soon (within 1 hour)
		if (minutesUntilClose <= 60) {
			return {
				isOpen: true,
				statusText: `Closes in ${minutesUntilClose} min`,
				closesAt,
				opensAt: null,
			};
		}

		return {
			isOpen: true,
			statusText: `Open · Closes ${closesAt}`,
			closesAt,
			opensAt: null,
		};
	} else {
		// Currently closed
		if (currentMinutes < openTime) {
			// Opens later today
			return {
				isOpen: false,
				statusText: `Closed · Opens ${formatTime(todayHours.open)}`,
				closesAt: null,
				opensAt: formatTime(todayHours.open),
			};
		} else {
			// Closed for today, check tomorrow
			const nextDayKey = getNextDayKey(currentDayKey);
			const tomorrowHours = openHours[nextDayKey];
			if (tomorrowHours?.open) {
				return {
					isOpen: false,
					statusText: `Closed · Opens tomorrow ${formatTime(
						tomorrowHours.open
					)}`,
					closesAt: null,
					opensAt: formatTime(tomorrowHours.open),
				};
			}
			return {
				isOpen: false,
				statusText: "Closed",
				closesAt: null,
				opensAt: null,
			};
		}
	}
}

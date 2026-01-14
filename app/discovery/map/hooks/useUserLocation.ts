"use client";

import { useState, useCallback, useEffect } from "react";

export function useUserLocation() {
	const [userLocation, setUserLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [isLocating, setIsLocating] = useState(false);

	const locateUser = useCallback(() => {
		if (!navigator.geolocation) {
			console.error("Geolocation not supported");
			return;
		}

		setIsLocating(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				setUserLocation({ lat: latitude, lng: longitude });
				setIsLocating(false);
			},
			(error) => {
				console.error("Geolocation error:", error);
				setIsLocating(false);
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
		);
	}, []);

	// Initial location check
	useEffect(() => {
		locateUser();
	}, [locateUser]);

	return { userLocation, isLocating, locateUser };
}

"use client";

import { useState, useEffect } from "react";
import { NavigationDestination, RouteInfo, TravelMode } from "@/app/types/map";

export function useMapRoute(
	userLocation: { lat: number; lng: number } | null,
	destination: NavigationDestination | null,
	travelMode: TravelMode
) {
	const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
		[]
	);
	const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
	const [isLoadingRoute, setIsLoadingRoute] = useState(false);

	useEffect(() => {
		if (!userLocation || !destination) return;

		const fetchRoute = async () => {
			setIsLoadingRoute(true);
			try {
				// OSRM uses 'car' for driving
				const osrmMode = travelMode === "driving" ? "car" : travelMode;
				const url = `https://router.project-osrm.org/route/v1/${osrmMode}/${userLocation.lng},${userLocation.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

				const response = await fetch(url);
				const data = await response.json();

				if (data.routes && data.routes.length > 0) {
					const route = data.routes[0];
					setRouteCoordinates(route.geometry.coordinates);
					setRouteInfo({
						distance: route.distance,
						duration: route.duration,
					});
				}
			} catch (error) {
				console.error("Failed to fetch route:", error);
			} finally {
				setIsLoadingRoute(false);
			}
		};

		fetchRoute();
	}, [userLocation, destination, travelMode]);

	return { routeCoordinates, routeInfo, isLoadingRoute };
}

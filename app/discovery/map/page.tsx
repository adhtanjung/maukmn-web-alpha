"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
	Map,
	useMap,
	MapMarker,
	MarkerContent,
	MapRoute,
} from "@/components/ui/map";
import { MapPin } from "./components/Marker";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNav from "@/app/components/discovery/BottomNav";
import StickyHeader from "@/app/components/discovery/StickyHeader";
import type maplibregl from "maplibre-gl";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

// POI type from API
interface POI {
	poi_id: string;
	name: string;
	brand?: string;
	description?: string;
	category_id?: string;
	category_names?: string[];
	cover_image_url?: string;
	latitude: number;
	longitude: number;
	has_wifi: boolean;
	outdoor_seating: boolean;
	kids_friendly: boolean;
	smoker_friendly: boolean;
	price_range?: number;
	cuisine?: string;
	status: string;
	distance_meters?: number;
}

// Search suggestion type
interface SearchSuggestion {
	formatted: string;
	lat: number;
	lon: number;
}

// Map marker type
type MarkerType = "restaurant" | "cafe" | "number" | "ramen";

// Default center (Jakarta)
const DEFAULT_CENTER: [number, number] = [106.8456, -6.2088];
const DEFAULT_ZOOM = 14;

// Dark mode map style (same as LocationTab)
const MAP_STYLES = {
	dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
	light: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

// Travel mode types
type TravelMode = "driving" | "walking" | "cycling";

// Route info type
interface RouteInfo {
	distance: number; // in meters
	duration: number; // in seconds
}

// Navigation destination type
interface NavigationDestination {
	poiId: string;
	lat: number;
	lng: number;
	name: string;
}

// Calculate distance between two points in meters (Haversine formula)
function calculateDistance(
	lat1: number,
	lng1: number,
	lat2: number,
	lng2: number
): number {
	const R = 6371000; // Earth's radius in meters
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLng = ((lng2 - lng1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLng / 2) *
			Math.sin(dLng / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

function MapContent({
	pois,
	selectedPoi,
	setSelectedPoi,
	onBoundsChange,
	flyToLocation,
	searchRadius,
	searchCenter,
	userLocation,
	isNavigationMode,
	routeCoordinates,
	navigationDestination,
}: {
	pois: POI[];
	selectedPoi: POI | null;
	setSelectedPoi: (poi: POI | null) => void;
	onBoundsChange: (
		center: { lat: number; lng: number },
		radius: number
	) => void;
	flyToLocation: { lat: number; lng: number; key: number } | null;
	searchRadius: number;
	searchCenter: { lat: number; lng: number };
	userLocation: { lat: number; lng: number } | null;
	isNavigationMode: boolean;
	routeCoordinates: [number, number][];
	navigationDestination: NavigationDestination | null;
}) {
	const { map, isLoaded } = useMap();
	const lastFlyToKey = useRef<number>(-1);

	// Fixed 5km radius (no longer viewport-based)
	const FIXED_RADIUS = 5000; // 5km in meters

	// Handle map movement
	useEffect(() => {
		if (!map || !isLoaded) return;

		const handleMoveEnd = () => {
			const center = map.getCenter();
			// Always use fixed radius
			onBoundsChange({ lat: center.lat, lng: center.lng }, FIXED_RADIUS);
		};

		map.on("moveend", handleMoveEnd);
		return () => {
			map.off("moveend", handleMoveEnd);
		};
	}, [map, isLoaded, onBoundsChange]);

	// Add/update radius circle layer
	useEffect(() => {
		if (!map || !isLoaded) return;

		const sourceId = "radius-circle-source";
		const layerId = "radius-circle-layer";
		const outlineLayerId = "radius-circle-outline";

		// Create GeoJSON circle (approximated with polygon points)
		const createCircleGeoJSON = (
			center: { lat: number; lng: number },
			radiusMeters: number
		) => {
			const points = 64;
			const coords: [number, number][] = [];
			const distanceX =
				radiusMeters / (111320 * Math.cos((center.lat * Math.PI) / 180));
			const distanceY = radiusMeters / 110540;

			for (let i = 0; i < points; i++) {
				const angle = (i / points) * (2 * Math.PI);
				const x = center.lng + distanceX * Math.cos(angle);
				const y = center.lat + distanceY * Math.sin(angle);
				coords.push([x, y]);
			}
			coords.push(coords[0]); // Close the polygon

			return {
				type: "Feature" as const,
				properties: {},
				geometry: {
					type: "Polygon" as const,
					coordinates: [coords],
				},
			};
		};

		// Use userLocation for circle center (fixed position), fallback to searchCenter
		const circleCenter = userLocation || searchCenter;
		const circleData = createCircleGeoJSON(circleCenter, searchRadius);

		if (map.getSource(sourceId)) {
			// Update existing source
			(map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(
				circleData as GeoJSON.Feature
			);
		} else {
			// Add new source and layers
			map.addSource(sourceId, {
				type: "geojson",
				data: circleData as GeoJSON.Feature,
			});

			// Fill layer (semi-transparent)
			map.addLayer({
				id: layerId,
				type: "fill",
				source: sourceId,
				paint: {
					"fill-color": "#10b981",
					"fill-opacity": 0.08,
				},
			});

			// Outline layer
			map.addLayer({
				id: outlineLayerId,
				type: "line",
				source: sourceId,
				paint: {
					"line-color": "#10b981",
					"line-width": 2,
					"line-opacity": 0.5,
					"line-dasharray": [2, 2],
				},
			});
		}

		return () => {
			// Cleanup is handled by map removal
		};
	}, [map, isLoaded, userLocation, searchCenter, searchRadius]);

	// Fly to location when requested - only if map is loaded and key is new
	useEffect(() => {
		console.log(
			"[FlyTo Effect] map:",
			!!map,
			"isLoaded:",
			isLoaded,
			"flyToLocation:",
			flyToLocation
		);
		if (!map || !isLoaded || !flyToLocation) return;
		if (flyToLocation.key === lastFlyToKey.current) {
			console.log("[FlyTo] Skipping - same key:", flyToLocation.key);
			return;
		}

		console.log(
			"[FlyTo] Flying to:",
			flyToLocation.lat,
			flyToLocation.lng,
			"key:",
			flyToLocation.key
		);
		lastFlyToKey.current = flyToLocation.key;

		map.flyTo({
			center: [flyToLocation.lng, flyToLocation.lat],
			zoom: 15,
			duration: 1500,
			essential: true,
		});
	}, [map, isLoaded, flyToLocation]);

	// Determine marker type based on POI category
	const getMarkerType = (poi: POI): MarkerType => {
		const categoryName = poi.category_names?.[0]?.toLowerCase() || "";
		const cuisine = poi.cuisine?.toLowerCase() || "";

		if (categoryName.includes("cafe") || categoryName.includes("coffee")) {
			return "cafe";
		}
		if (
			cuisine.includes("ramen") ||
			cuisine.includes("japanese") ||
			categoryName.includes("ramen")
		) {
			return "ramen";
		}
		return "restaurant";
	};

	return (
		<>
			{/* User Location Marker */}
			{userLocation && (
				<MapMarker longitude={userLocation.lng} latitude={userLocation.lat}>
					<MarkerContent>
						<div className="flex flex-col items-center">
							{/* Pulsing outer ring */}
							<div className="relative">
								<div className="absolute inset-0 w-8 h-8 bg-blue-500/30 rounded-full animate-ping" />
								<div className="absolute inset-0 w-8 h-8 bg-blue-500/20 rounded-full animate-pulse" />
								{/* Inner dot */}
								<div className="relative w-8 h-8 flex items-center justify-center">
									<div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
								</div>
							</div>
						</div>
					</MarkerContent>
				</MapMarker>
			)}

			{/* Route Line (Navigation Mode) */}
			{isNavigationMode && routeCoordinates.length > 0 && (
				<MapRoute
					coordinates={routeCoordinates}
					color="#10B981"
					width={5}
					opacity={0.9}
				/>
			)}

			{/* Navigation Destination Marker */}
			{isNavigationMode && navigationDestination && (
				<MapMarker
					longitude={navigationDestination.lng}
					latitude={navigationDestination.lat}
				>
					<MarkerContent>
						<div className="flex flex-col items-center">
							<div className="bg-primary text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg mb-1 max-w-[150px] truncate">
								{navigationDestination.name}
							</div>
							<div className="w-8 h-8 bg-primary rounded-full border-3 border-white shadow-lg flex items-center justify-center">
								<span className="material-symbols-outlined text-black text-[18px]!">
									location_on
								</span>
							</div>
						</div>
					</MarkerContent>
				</MapMarker>
			)}

			{/* POI Markers (only in Discovery Mode) */}
			{!isNavigationMode &&
				pois.map((poi, idx) => (
					<MapPin
						key={poi.poi_id}
						longitude={poi.longitude}
						latitude={poi.latitude}
						type={getMarkerType(poi)}
						rating={
							poi.price_range ? `${"$".repeat(poi.price_range)}` : undefined
						}
						active={selectedPoi?.poi_id === poi.poi_id}
						delay={idx * 0.05}
						onClick={() => setSelectedPoi(poi)}
					/>
				))}
		</>
	);
}

function DiscoveryMapContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [pois, setPois] = useState<POI[]>([]);
	const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
		lat: DEFAULT_CENTER[1],
		lng: DEFAULT_CENTER[0],
	});
	const [flyToLocation, setFlyToLocation] = useState<{
		lat: number;
		lng: number;
		key: number;
	} | null>(null);
	const [showSearchButton, setShowSearchButton] = useState(false);
	const [isLocating, setIsLocating] = useState(false);
	const [userLocation, setUserLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const flyToKeyRef = useRef(0);

	// Search radius state (in meters)
	const [searchRadius, setSearchRadius] = useState(5000); // Default 5km
	const [searchCenter, setSearchCenter] = useState<{
		lat: number;
		lng: number;
	}>({
		lat: DEFAULT_CENTER[1],
		lng: DEFAULT_CENTER[0],
	});

	// Search suggestions state
	const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

	// Debounce timer refs
	const searchDebounceTimer = useRef<NodeJS.Timeout | null>(null);
	const boundsChangeRef = useRef<{ lat: number; lng: number }>({
		lat: DEFAULT_CENTER[1],
		lng: DEFAULT_CENTER[0],
	});

	// ========== NAVIGATION MODE STATE ==========
	const [isNavigationMode, setIsNavigationMode] = useState(false);
	const [navigationDestination, setNavigationDestination] =
		useState<NavigationDestination | null>(null);
	const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
		[]
	);
	const [travelMode, setTravelMode] = useState<TravelMode>("driving");
	const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
	const [isLoadingRoute, setIsLoadingRoute] = useState(false);
	const [showArrivalSheet, setShowArrivalSheet] = useState(false);

	// Parse URL params for navigation mode
	useEffect(() => {
		const navigatePoiId = searchParams.get("navigate");
		const lat = searchParams.get("lat");
		const lng = searchParams.get("lng");
		const name = searchParams.get("name");

		if (navigatePoiId && lat && lng && name) {
			const destination: NavigationDestination = {
				poiId: navigatePoiId,
				lat: parseFloat(lat),
				lng: parseFloat(lng),
				name: decodeURIComponent(name),
			};
			setNavigationDestination(destination);
			setIsNavigationMode(true);

			// Fly to destination
			setFlyToLocation({
				lat: destination.lat,
				lng: destination.lng,
				key: ++flyToKeyRef.current,
			});
			setMapCenter({ lat: destination.lat, lng: destination.lng });
		}
	}, [searchParams]);

	// Fetch route from OSRM when in navigation mode
	const fetchRoute = useCallback(
		async (
			start: { lat: number; lng: number },
			end: { lat: number; lng: number },
			mode: TravelMode
		) => {
			setIsLoadingRoute(true);
			try {
				// OSRM uses 'car' for driving
				const osrmMode = mode === "driving" ? "car" : mode;
				const url = `https://router.project-osrm.org/route/v1/${osrmMode}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

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
		},
		[]
	);

	// Fetch route when navigation mode is active and we have user location
	useEffect(() => {
		if (isNavigationMode && userLocation && navigationDestination) {
			fetchRoute(userLocation, navigationDestination, travelMode);
		}
	}, [
		isNavigationMode,
		userLocation,
		navigationDestination,
		travelMode,
		fetchRoute,
	]);

	// Check proximity for arrival sheet (30m threshold)
	useEffect(() => {
		if (!isNavigationMode || !userLocation || !navigationDestination) return;

		const distance = calculateDistance(
			userLocation.lat,
			userLocation.lng,
			navigationDestination.lat,
			navigationDestination.lng
		);

		if (distance <= 30 && !showArrivalSheet) {
			setShowArrivalSheet(true);
		}
	}, [userLocation, navigationDestination, isNavigationMode, showArrivalSheet]);

	// Exit navigation mode
	const exitNavigationMode = () => {
		setIsNavigationMode(false);
		setNavigationDestination(null);
		setRouteCoordinates([]);
		setRouteInfo(null);
		setShowArrivalSheet(false);
		// Clear URL params
		router.replace("/discovery/map");
	};

	// Open in external maps
	const openInGoogleMaps = () => {
		if (navigationDestination) {
			const url = `https://www.google.com/maps/dir/?api=1&destination=${navigationDestination.lat},${navigationDestination.lng}`;
			window.open(url, "_blank");
		}
	};

	const openInWaze = () => {
		if (navigationDestination) {
			const url = `https://waze.com/ul?ll=${navigationDestination.lat},${navigationDestination.lng}&navigate=yes`;
			window.open(url, "_blank");
		}
	};

	// Format duration (seconds to readable)
	const formatDuration = (seconds: number) => {
		const minutes = Math.round(seconds / 60);
		if (minutes < 60) return `${minutes} min`;
		const hours = Math.floor(minutes / 60);
		const remainingMins = minutes % 60;
		return `${hours}h ${remainingMins}m`;
	};

	// Format distance (meters to readable)
	const formatDistance = (meters: number) => {
		if (meters < 1000) return `${Math.round(meters)}m`;
		return `${(meters / 1000).toFixed(1)} km`;
	};

	// Fetch POIs from API with dynamic radius
	const fetchPOIs = useCallback(
		async (lat?: number, lng?: number, radius: number = 5000) => {
			setLoading(true);
			try {
				let url = `${API_URL}/api/v1/pois?status=approved&limit=50`;

				// Use nearby endpoint if we have coordinates
				if (lat && lng) {
					url = `${API_URL}/api/v1/pois/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=50`;
				}

				const response = await fetch(url);
				const data = await response.json();

				if (data.success && data.data) {
					// Handle nearby response structure
					if (data.data.data) {
						setPois(data.data.data);
					} else if (Array.isArray(data.data)) {
						setPois(data.data);
					}
				} else if (Array.isArray(data.data)) {
					setPois(data.data);
				}
			} catch (error) {
				console.error("Failed to fetch POIs:", error);
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	// Search address with Geoapify (debounced)
	const searchAddress = useCallback(async (query: string) => {
		if (!query || query.length < 3 || !GEOAPIFY_API_KEY) {
			setSuggestions([]);
			return;
		}

		setIsLoadingSuggestions(true);

		try {
			const response = await fetch(
				`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
					query
				)}&apiKey=${GEOAPIFY_API_KEY}&limit=5&lang=id`
			);

			if (response.status === 429) {
				setSuggestions([]);
				setIsLoadingSuggestions(false);
				return;
			}

			if (!response.ok) {
				setSuggestions([]);
				setIsLoadingSuggestions(false);
				return;
			}

			const data = await response.json();
			const results: SearchSuggestion[] =
				data.features?.map(
					(f: {
						properties: { formatted: string; lat: number; lon: number };
					}) => ({
						formatted: f.properties.formatted,
						lat: f.properties.lat,
						lon: f.properties.lon,
					})
				) || [];

			setSuggestions(results);
			setShowSuggestions(true);
		} catch (error) {
			console.error("Address search error:", error);
			setSuggestions([]);
		} finally {
			setIsLoadingSuggestions(false);
		}
	}, []);

	// Debounced search handler
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchQuery(value);

		if (searchDebounceTimer.current) {
			clearTimeout(searchDebounceTimer.current);
		}

		searchDebounceTimer.current = setTimeout(() => {
			searchAddress(value);
		}, 300);
	};

	// Select search suggestion
	const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
		setSearchQuery(suggestion.formatted);
		setShowSuggestions(false);
		setSuggestions([]);

		// Fly to location and fetch nearby POIs
		setFlyToLocation({
			lat: suggestion.lat,
			lng: suggestion.lon,
			key: ++flyToKeyRef.current,
		});
		setMapCenter({ lat: suggestion.lat, lng: suggestion.lon });
		boundsChangeRef.current = { lat: suggestion.lat, lng: suggestion.lon };
		fetchPOIs(suggestion.lat, suggestion.lon);
	};

	// Initial load: Try to get user location, fallback to default
	useEffect(() => {
		console.log("[Init] Checking geolocation support...");
		if (!navigator.geolocation) {
			console.log("[Init] Geolocation not supported");
			fetchPOIs();
			return;
		}

		console.log("[Init] Requesting geolocation...");
		setIsLocating(true);

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				console.log("[Init] Got position:", latitude, longitude);

				// Set initial position to user location
				setMapCenter({ lat: latitude, lng: longitude });
				boundsChangeRef.current = { lat: latitude, lng: longitude };
				const newKey = ++flyToKeyRef.current;
				console.log("[Init] Setting flyToLocation with key:", newKey);
				setFlyToLocation({
					lat: latitude,
					lng: longitude,
					key: newKey,
				});

				// Save user location for marker
				setUserLocation({ lat: latitude, lng: longitude });

				// Fetch POIs near user
				fetchPOIs(latitude, longitude);
				setIsLocating(false);
			},
			(error) => {
				console.log("[Init] Geolocation error:", error.code, error.message);
				fetchPOIs();
				setIsLocating(false);
			},
			{
				enableHighAccuracy: true,
				timeout: 15000, // 15 seconds timeout
				maximumAge: 60000, // Accept cached position up to 1 minute old
			}
		);
	}, [fetchPOIs]);

	// Cleanup timers
	useEffect(() => {
		return () => {
			if (searchDebounceTimer.current) {
				clearTimeout(searchDebounceTimer.current);
			}
		};
	}, []);

	// Handle map bounds change
	const handleBoundsChange = useCallback(
		(center: { lat: number; lng: number }, radius: number) => {
			// Update search center and radius
			setSearchCenter(center);
			setSearchRadius(radius);

			// Show search button if center moved significantly
			const distance = Math.sqrt(
				Math.pow(center.lat - boundsChangeRef.current.lat, 2) +
					Math.pow(center.lng - boundsChangeRef.current.lng, 2)
			);
			if (distance > 0.005) {
				setShowSearchButton(true);
				setMapCenter(center);
			}
		},
		[]
	);

	// Handle search this area
	const handleSearchArea = () => {
		boundsChangeRef.current = mapCenter;
		setSearchCenter(mapCenter);
		fetchPOIs(mapCenter.lat, mapCenter.lng, searchRadius);
		setShowSearchButton(false);
	};

	// Get user location and fly to it
	const handleMyLocation = () => {
		if (!navigator.geolocation) {
			console.error("Geolocation not supported");
			return;
		}

		setIsLocating(true);

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;

				// Fly to user location
				setFlyToLocation({
					lat: latitude,
					lng: longitude,
					key: ++flyToKeyRef.current,
				});
				setMapCenter({ lat: latitude, lng: longitude });
				boundsChangeRef.current = { lat: latitude, lng: longitude };

				// Save user location for marker
				setUserLocation({ lat: latitude, lng: longitude });

				// Fetch nearby POIs
				fetchPOIs(latitude, longitude);
				setIsLocating(false);
				setShowSearchButton(false);
			},
			(error) => {
				console.error("Geolocation error:", error);
				setIsLocating(false);
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0,
			}
		);
	};

	// Format price range
	const formatPriceRange = (priceRange?: number) => {
		if (!priceRange) return "$$";
		return "$".repeat(priceRange);
	};

	return (
		<main className="relative flex-1 w-full h-full overflow-hidden bg-background-dark">
			{/* Custom Styles for Map View Pin Animations */}
			<style jsx global>{`
				.pin-bounce {
					animation: pin-bounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)
						both;
				}
				@keyframes pin-bounce {
					0% {
						transform: scale(0);
						opacity: 0;
					}
					60% {
						transform: scale(1.1);
					}
					100% {
						transform: scale(1);
						opacity: 1;
					}
				}
			`}</style>

			{/* Sticky Header with Back Button */}
			<StickyHeader
				title={
					isNavigationMode
						? `Directions to ${navigationDestination?.name}`
						: "Map View"
				}
				className="absolute top-0 left-0 right-0 z-50 bg-background-dark/80 backdrop-blur-md pt-8"
				rightAction={
					<div className="flex size-10 items-center justify-center rounded-full hover:bg-white/10 cursor-pointer transition-colors">
						<span className="material-symbols-outlined text-primary">
							share
						</span>
					</div>
				}
			/>

			{/* Map Container */}
			<div className="absolute inset-0 z-10">
				<Map
					center={[mapCenter.lng, mapCenter.lat]}
					zoom={DEFAULT_ZOOM}
					styles={MAP_STYLES}
				>
					<MapContent
						pois={pois}
						selectedPoi={selectedPoi}
						setSelectedPoi={setSelectedPoi}
						onBoundsChange={handleBoundsChange}
						flyToLocation={flyToLocation}
						searchRadius={searchRadius}
						searchCenter={searchCenter}
						userLocation={userLocation}
						isNavigationMode={isNavigationMode}
						routeCoordinates={routeCoordinates}
						navigationDestination={navigationDestination}
					/>
				</Map>
			</div>

			{/* Navigation Mode Overlay */}
			{isNavigationMode && (
				<div className="absolute top-20 left-0 right-0 z-30 p-4 flex flex-col gap-3 pointer-events-none">
					{/* Travel Mode Switcher */}
					<div className="flex justify-center gap-2 pointer-events-auto">
						{(["driving", "walking", "cycling"] as TravelMode[]).map((mode) => (
							<Button
								key={mode}
								onClick={() => setTravelMode(mode)}
								className={`h-10 px-4 rounded-full flex items-center gap-2 transition-all ${
									travelMode === mode
										? "bg-primary text-black font-bold"
										: "bg-surface-dark/90 text-white border border-white/10"
								}`}
							>
								<span className="material-symbols-outlined text-[18px]!">
									{mode === "driving"
										? "directions_car"
										: mode === "walking"
										? "directions_walk"
										: "directions_bike"}
								</span>
								<span className="text-sm capitalize">{mode}</span>
							</Button>
						))}
					</div>

					{/* Route Info */}
					{routeInfo && (
						<div className="flex justify-center">
							<div className="bg-surface-dark/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3 pointer-events-auto">
								{isLoadingRoute ? (
									<span className="material-symbols-outlined text-primary animate-spin text-[18px]">
										progress_activity
									</span>
								) : (
									<>
										<span className="material-symbols-outlined text-primary text-[18px]">
											schedule
										</span>
										<span className="text-white font-bold">
											{formatDuration(routeInfo.duration)}
										</span>
										<span className="text-muted-foreground">•</span>
										<span className="text-white">
											{formatDistance(routeInfo.distance)}
										</span>
									</>
								)}
							</div>
						</div>
					)}

					{/* External Maps Buttons */}
					<div className="flex justify-center gap-2 pointer-events-auto">
						<Button
							onClick={openInGoogleMaps}
							className="h-9 px-3 rounded-full bg-surface-dark/90 text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 hover:bg-white/10"
						>
							<span className="material-symbols-outlined text-[16px]!">
								open_in_new
							</span>
							Google Maps
						</Button>
						<Button
							onClick={openInWaze}
							className="h-9 px-3 rounded-full bg-surface-dark/90 text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 hover:bg-white/10"
						>
							<span className="material-symbols-outlined text-[16px]!">
								open_in_new
							</span>
							Waze
						</Button>
					</div>
				</div>
			)}

			{/* Top Search Overlay - Discovery Mode Only */}
			{!isNavigationMode && (
				<div className="absolute top-20 left-0 right-0 z-30 p-4 bg-linear-to-b from-background-dark/50 to-transparent flex flex-col gap-4 pointer-events-none">
					<div className="flex items-center gap-3 pointer-events-auto relative">
						<div className="flex-1 h-12 bg-surface-dark/90 backdrop-blur-md rounded-full shadow-lg flex items-center px-4 border border-white/10 group transition-all focus-within:ring-2 focus-within:ring-primary/50">
							<span className="material-symbols-outlined text-muted-foreground group-focus-within:text-primary transition-colors">
								search
							</span>
							<input
								className="bg-transparent border-none focus:ring-0 text-white placeholder-muted-foreground w-full ml-2 text-sm font-medium outline-none"
								placeholder="Search areas, food, drinks..."
								type="text"
								value={searchQuery}
								onChange={handleSearchChange}
								onFocus={() =>
									suggestions.length > 0 && setShowSuggestions(true)
								}
								onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
								autoComplete="off"
							/>
							{isLoadingSuggestions && (
								<span className="material-symbols-outlined text-muted-foreground animate-spin text-[18px]">
									progress_activity
								</span>
							)}
							{searchQuery && !isLoadingSuggestions && (
								<button
									onClick={() => {
										setSearchQuery("");
										setSuggestions([]);
									}}
									className="text-muted-foreground hover:text-white transition-colors"
								>
									<span className="material-symbols-outlined text-[18px]">
										close
									</span>
								</button>
							)}
						</div>
						<Button
							size="icon"
							className="h-12 w-12 bg-surface-dark/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all"
						>
							<span className="material-symbols-outlined">tune</span>
						</Button>

						{/* Search Suggestions Dropdown */}
						{showSuggestions && suggestions.length > 0 && (
							<div className="absolute top-full left-0 right-16 mt-2 bg-surface-dark/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
								{suggestions.map((suggestion, index) => (
									<button
										key={index}
										type="button"
										onClick={() => handleSelectSuggestion(suggestion)}
										className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors text-sm text-white border-b border-white/5 last:border-b-0 flex items-start gap-3"
									>
										<span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
											location_on
										</span>
										<span className="line-clamp-2">{suggestion.formatted}</span>
									</button>
								))}
							</div>
						)}
					</div>
					{showSearchButton && (
						<div className="flex justify-center animate-in fade-in slide-in-from-top-2 duration-200">
							<Button
								onClick={handleSearchArea}
								className="bg-surface-dark/90 backdrop-blur-md border border-white/10 text-primary text-sm font-bold px-4 py-2 h-auto rounded-full shadow-lg flex items-center gap-2 transform active:scale-95 transition-all hover:bg-white/10 pointer-events-auto"
							>
								<span className="material-symbols-outlined text-[18px]">
									refresh
								</span>
								Search this area
							</Button>
						</div>
					)}
				</div>
			)}

			{/* Loading Indicator */}
			{loading && (
				<div className="absolute top-40 left-1/2 -translate-x-1/2 z-40 bg-surface-dark/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
					<div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
					<span className="text-sm text-white font-medium">Loading...</span>
				</div>
			)}

			{/* POI Count Badge */}
			{!loading && pois.length > 0 && (
				<div className="absolute top-40 left-1/2 -translate-x-1/2 z-40 bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30 flex items-center gap-2">
					<span className="text-xs text-primary font-bold">
						{pois.length} places found
					</span>
					<span className="text-xs text-primary/70">
						•{" "}
						{searchRadius >= 1000
							? `${(searchRadius / 1000).toFixed(1)}km`
							: `${searchRadius}m`}{" "}
						radius
					</span>
				</div>
			)}

			{/* Floating Controls (Right Side) */}
			<div className="absolute right-4 bottom-52 z-30 flex flex-col gap-3">
				<Button
					size="icon"
					className="w-12 h-12 bg-surface-dark/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg text-white border border-white/10 active:scale-95 transition-all hover:bg-white/10"
				>
					<span className="material-symbols-outlined">layers</span>
				</Button>
				<Button
					size="icon"
					onClick={handleMyLocation}
					disabled={isLocating}
					className="w-12 h-12 bg-surface-dark/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg text-white border border-white/10 active:scale-95 transition-all hover:bg-white/10 disabled:opacity-50"
				>
					{isLocating ? (
						<span className="material-symbols-outlined animate-spin">
							progress_activity
						</span>
					) : (
						<span className="material-symbols-outlined">my_location</span>
					)}
				</Button>
			</div>

			{/* Bottom POI Card */}
			{selectedPoi && (
				<div className="absolute bottom-28 left-4 right-4 z-40 animate-in slide-in-from-bottom-4 fade-in duration-300">
					<div className="bg-surface-dark/95 backdrop-blur-xl rounded-lg p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 flex gap-4 items-center relative">
						{/* Close Button */}
						<button
							onClick={() => setSelectedPoi(null)}
							className="absolute -top-2 -right-2 w-8 h-8 bg-surface-dark border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 shadow-lg"
							aria-label="Close"
						>
							<span className="material-symbols-outlined text-white text-[18px]">
								close
							</span>
						</button>

						<div className="flex-1 min-w-0 flex flex-col gap-1">
							<div className="flex items-center gap-2 mb-1">
								<span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
									{formatPriceRange(selectedPoi.price_range)}
								</span>
								<span className="text-muted-foreground text-xs font-medium truncate uppercase tracking-wider">
									{selectedPoi.category_names?.[0] ||
										selectedPoi.cuisine ||
										"Restaurant"}
								</span>
							</div>
							<h3 className="text-white text-lg font-bold leading-tight truncate">
								{selectedPoi.name}
							</h3>
							<p className="text-muted-foreground text-sm truncate">
								{selectedPoi.description || "No description available"}
							</p>
							<div className="mt-3 flex items-center gap-3">
								<Button
									onClick={() => router.push(`/poi/${selectedPoi.poi_id}`)}
									className="bg-primary hover:bg-primary/90 text-black text-sm font-bold px-5 py-2.5 h-auto rounded-full transition-all flex items-center gap-2 active:scale-95"
								>
									View Details
									<span className="material-symbols-outlined text-[16px]">
										arrow_forward
									</span>
								</Button>
								<Button
									size="icon"
									variant="outline"
									className="w-10 h-10 rounded-full border border-white/10 bg-transparent flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/5 transition-all active:scale-95"
								>
									<span className="material-symbols-outlined text-[20px]">
										bookmark
									</span>
								</Button>
							</div>
						</div>
						<div className="w-24 h-24 shrink-0 rounded-lg relative overflow-hidden border border-white/10 group cursor-pointer shadow-inner">
							<Image
								src={
									selectedPoi.cover_image_url ||
									"https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400"
								}
								alt={selectedPoi.name}
								fill
								className="object-cover group-hover:scale-110 transition-transform duration-500"
							/>
							<div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
						</div>
					</div>
				</div>
			)}

			{/* Bottom Navigation */}
			<BottomNav
				onProfileClick={() => router.push("/profile")}
				onCreateClick={() => router.push("/create-poi")}
			/>
		</main>
	);
}

export default function DiscoveryMapPage() {
	return (
		<Suspense fallback={null}>
			<DiscoveryMapContent />
		</Suspense>
	);
}

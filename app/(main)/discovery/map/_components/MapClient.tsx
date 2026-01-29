"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
	Map as MapContainer,
	useMap,
	MapMarker,
	MarkerContent,
	MapRoute,
} from "@/components/ui/map";
import maplibregl from "maplibre-gl";

import StickyHeader from "@/app/components/discovery/StickyHeader";
import { POI, NavigationDestination, TravelMode } from "@/app/types/map";

// Hooks
import { useUserLocation } from "../hooks/useUserLocation";
import { usePOIs } from "../hooks/usePOIs";
import { useMapRoute } from "../hooks/useMapRoute";
import { useFilters } from "@/app/hooks/useFilters";

// Components
import { NavigationOverlay } from "../components/NavigationOverlay";
import { MapSearchOverlay } from "../components/MapSearchOverlay";
import { POIDetailCard } from "../components/POIDetailCard";
import { MapControls } from "../components/MapControls";
import { MapUserMarker } from "../components/MapUserMarker";

const DEFAULT_CENTER: [number, number] = [106.8456, -6.2088]; // Jakarta
const DEFAULT_ZOOM = 14;
const MAP_STYLES = {
	dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
	light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

// Utils
function calculateDistance(
	lat1: number,
	lng1: number,
	lat2: number,
	lng2: number,
): number {
	const R = 6371000;
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
	onSelectPoi,
	onBoundsChange,
	cameraConfig,
	userLocation,
	routeCoordinates,
	navigationDestination,
}: {
	pois: POI[];
	selectedPoi: POI | null;
	onSelectPoi: (poi: POI | null) => void;
	onBoundsChange: (
		center: { lat: number; lng: number },
		radius: number,
	) => void;
	cameraConfig: { lat: number; lng: number; zoom?: number; key: number } | null;
	userLocation: { lat: number; lng: number } | null;
	routeCoordinates: [number, number][];
	navigationDestination: NavigationDestination | null;
}) {
	const { map, isLoaded } = useMap();
	const lastFlyToKey = useRef<number>(-1);

	// Calculate radius safely
	const getRadius = useCallback(() => {
		if (!map) return 5000;
		const bounds = map.getBounds();
		const center = map.getCenter();
		const ne = bounds.getNorthEast();
		// Cap at 15km
		return Math.min(
			calculateDistance(center.lat, center.lng, ne.lat, ne.lng),
			15000,
		);
	}, [map]);

	useEffect(() => {
		if (!map || !isLoaded) return;
		const handleMove = () => {
			const c = map.getCenter();
			onBoundsChange({ lat: c.lat, lng: c.lng }, getRadius());
		};
		map.on("moveend", handleMove);
		return () => {
			map.off("moveend", handleMove);
		};
	}, [map, isLoaded, onBoundsChange, getRadius]);

	useEffect(() => {
		if (
			!map ||
			!isLoaded ||
			!cameraConfig ||
			cameraConfig.key === lastFlyToKey.current
		)
			return;
		lastFlyToKey.current = cameraConfig.key;
		map.flyTo({
			center: [cameraConfig.lng, cameraConfig.lat],
			zoom: cameraConfig.zoom || 15,
			duration: 1500,
			essential: true,
		});
	}, [map, isLoaded, cameraConfig]);

	// Convert POIs to GeoJSON
	const poiGeoJson = useMemo(() => {
		// Create a map of POIs to ensure uniqueness
		const uniquePois = new Map(pois.map((p) => [p.poi_id, p]));

		// If we have a selected POI, ensure it's in the list (even if out of view/limit)
		if (selectedPoi) {
			uniquePois.set(selectedPoi.poi_id, selectedPoi);
		}

		return {
			type: "FeatureCollection",
			features: Array.from(uniquePois.values()).map((poi) => {
				let type = "default";
				const cuisine = (poi.cuisine || "").toLowerCase();
				const amenities = (poi.amenities || []).join(" ").toLowerCase();

				if (
					cuisine.includes("cafe") ||
					cuisine.includes("coffee") ||
					amenities.includes("coffee")
				) {
					type = "cafe";
				} else if (
					cuisine.includes("ramen") ||
					cuisine.includes("noodle") ||
					amenities.includes("ramen")
				) {
					type = "ramen";
				} else if (cuisine.length > 0) {
					// Any other cuisine is treated as a restaurant
					type = "restaurant";
				} else {
					// Fallback based on simple logic
					type = "restaurant";
				}

				return {
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: [poi.longitude, poi.latitude],
					},
					properties: {
						id: poi.poi_id,
						type: type,
						price_range: poi.price_range,
						active: selectedPoi?.poi_id === poi.poi_id,
						status: poi.status, // 'approved', 'pending', 'draft'
						rating: 4.5, // Mock
					},
				};
			}),
		};
	}, [pois, selectedPoi]);

	// Manage Source & Layers
	useEffect(() => {
		if (!map || !isLoaded) return;

		const sourceId = "poi-source";
		const symbolLayerId = "poi-layer-symbol";
		const clusterLayerId = "poi-layer-cluster";
		const clusterCountLayerId = "poi-layer-cluster-count";

		const loadImage = (url: string) => {
			return new Promise<HTMLImageElement>((resolve, reject) => {
				const img = new Image();
				img.crossOrigin = "Anonymous";
				img.onload = () => resolve(img);
				img.onerror = reject;
				img.src = url;
			});
		};

		const loadAndComposeIcons = async () => {
			try {
				// Wait for fonts to be ready to ensure Material Symbols render
				await document.fonts.ready;

				const bgImage = await loadImage("/icons/marker.png");

				// Colors from globals.css
				const COLORS = {
					primary: "#0a5c44", // Deep Tropical Emerald
					secondary: "#ff6b4a", // Jakarta Sunset
					sand: "#fdfbf7", // Bali Sand
					pending: "#6b7280", // Muted grey for pending POIs
				};

				const iconList = [
					{ name: "cafe", icon: "local_cafe", color: COLORS.secondary },
					{
						name: "restaurant",
						icon: "restaurant",
						color: COLORS.primary,
					},
					{
						name: "ramen",
						icon: "ramen_dining",
						color: COLORS.primary,
					},
				];

				const ratio = 4; // High-res scaling

				// Helper to compose high-res icon
				const compose = async (
					name: string,
					iconName: string,
					bgColor: string,
				) => {
					const iconId = `composed-${name}`;
					if (map.hasImage(iconId)) return;

					try {
						const canvas = document.createElement("canvas");
						canvas.width = bgImage.width * ratio;
						canvas.height = bgImage.height * ratio;
						const ctx = canvas.getContext("2d");
						if (!ctx) return;

						// 1. Draw Background Marker
						ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

						// Dimensions
						const w = canvas.width;
						// Use slightly larger circle for the font icon
						const iconSize = w * 0.55;
						const centerX = w / 2;
						const centerY = w / 2; // Center of the head

						// 2. Draw Colored Circle (Brand Color)
						ctx.beginPath();
						ctx.arc(centerX, centerY, iconSize / 2 + 4 * ratio, 0, Math.PI * 2);
						ctx.fillStyle = bgColor;
						ctx.fill();

						// 3. Draw Material Symbol (Text)
						// This ensures crisp vector rendering at any scale
						ctx.font = `normal 400 ${iconSize}px "Material Symbols Outlined"`;
						ctx.fillStyle = COLORS.sand;
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						ctx.fillText(iconName, centerX, centerY);

						// Add to Map
						map.addImage(iconId, ctx.getImageData(0, 0, w, canvas.height), {
							pixelRatio: ratio,
						});
					} catch (e) {
						console.warn(`Failed to compose icon ${name}`, e);
					}
				};

				await Promise.all(
					iconList.map((i) => compose(i.name, i.icon, i.color)),
				);

				// Create pending (grey) versions of all icons
				await Promise.all(
					iconList.map((i) =>
						compose(`${i.name}-pending`, i.icon, COLORS.pending),
					),
				);

				// 3. Add Default Marker
				if (!map.hasImage("icon-default")) {
					// Use a default composition (Generic location pin)
					const canvas = document.createElement("canvas");
					canvas.width = bgImage.width * ratio;
					canvas.height = bgImage.height * ratio;
					const ctx = canvas.getContext("2d");
					if (ctx) {
						ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
						// Draw Circle
						ctx.beginPath();
						ctx.arc(
							canvas.width / 2,
							canvas.width / 2,
							(canvas.width * 0.55) / 2 + 4 * ratio,
							0,
							Math.PI * 2,
						);
						ctx.fillStyle = COLORS.primary;
						ctx.fill();

						// Default Icon
						ctx.font = `normal 400 ${
							canvas.width * 0.55
						}px "Material Symbols Outlined"`;
						ctx.fillStyle = COLORS.sand;
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						ctx.fillText("location_on", canvas.width / 2, canvas.width / 2);

						map.addImage(
							"icon-default",
							ctx.getImageData(0, 0, canvas.width, canvas.height),
							{ pixelRatio: ratio },
						);
					}
				}

				// Create pending default icon
				if (!map.hasImage("icon-default-pending")) {
					const canvas = document.createElement("canvas");
					canvas.width = bgImage.width * ratio;
					canvas.height = bgImage.height * ratio;
					const ctx = canvas.getContext("2d");
					if (ctx) {
						ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
						ctx.beginPath();
						ctx.arc(
							canvas.width / 2,
							canvas.width / 2,
							(canvas.width * 0.55) / 2 + 4 * ratio,
							0,
							Math.PI * 2,
						);
						ctx.fillStyle = COLORS.pending;
						ctx.fill();
						ctx.font = `normal 400 ${
							canvas.width * 0.55
						}px "Material Symbols Outlined"`;
						ctx.fillStyle = COLORS.sand;
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						ctx.fillText("location_on", canvas.width / 2, canvas.width / 2);
						map.addImage(
							"icon-default-pending",
							ctx.getImageData(0, 0, canvas.width, canvas.height),
							{ pixelRatio: ratio },
						);
					}
				}
			} catch (err) {
				console.error("Failed to load map icons:", err);
			}
		};

		loadAndComposeIcons().then(() => {
			// Add Source with Clustering Enabled
			if (!map.getSource(sourceId)) {
				map.addSource(sourceId, {
					type: "geojson",
					data: poiGeoJson as any,
					cluster: true,
					clusterMaxZoom: 14, // Max zoom to cluster points on
					clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
				});
			} else {
				(map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(
					poiGeoJson as any,
				);
			}

			// Add Cluster Layer (Circles)
			if (!map.getLayer(clusterLayerId)) {
				map.addLayer({
					id: clusterLayerId,
					type: "circle",
					source: sourceId,
					filter: ["has", "point_count"],
					paint: {
						// Use step expressions (https://maplibre.org/maplibre-style-spec/expressions/#step)
						// with three steps to implement three types of circles:
						//   * Blue, 20px circles when point count is less than 10
						//   * Yellow, 30px circles when point count is between 10 and 30
						//   * Pink, 40px circles when point count is greater than or equal to 30
						"circle-color": [
							"step",
							["get", "point_count"],
							"#0a5c44", // Primary color (Deep Tropical Emerald) for small clusters
							5,
							"#ff6b4a", // Secondary color (Jakarta Sunset) for medium clusters
							15,
							"#f1c40f", // Warning color (Solar Yellow) for large clusters
						],
						"circle-radius": [
							"step",
							["get", "point_count"],
							20, // radius for count < 5
							5,
							25, // radius for count >= 5
							15,
							30, // radius for count >= 15
						],
						"circle-stroke-width": 2,
						"circle-stroke-color": "#fdfbf7", // Bali Sand
					},
				});
			}

			// Add Cluster Count Layer (Text)
			if (!map.getLayer(clusterCountLayerId)) {
				map.addLayer({
					id: clusterCountLayerId,
					type: "symbol",
					source: sourceId,
					filter: ["has", "point_count"],
					layout: {
						"text-field": "{point_count_abbreviated}",
						"text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
						"text-size": 14,
					},
					paint: {
						"text-color": "#ffffff",
					},
				});
			}

			// Add Unclustered Symbol Layer
			if (!map.getLayer(symbolLayerId)) {
				map.addLayer({
					id: symbolLayerId,
					type: "symbol",
					source: sourceId,
					filter: ["!", ["has", "point_count"]], // Filter out clusters
					layout: {
						"icon-image": [
							"case",
							["==", ["get", "status"], "approved"],
							[
								"match",
								["get", "type"],
								"cafe",
								"composed-cafe",
								"ramen",
								"composed-ramen",
								"restaurant",
								"composed-restaurant",
								"icon-default",
							],
							// Pending/Draft/Other status = grey icons
							[
								"match",
								["get", "type"],
								"cafe",
								"composed-cafe-pending",
								"ramen",
								"composed-ramen-pending",
								"restaurant",
								"composed-restaurant-pending",
								"icon-default-pending",
							],
						],
						"icon-size": [
							"interpolate",
							["linear"],
							["zoom"],
							10,
							["case", ["boolean", ["get", "active"], false], 2.0, 1.4],
							15,
							["case", ["boolean", ["get", "active"], false], 4.0, 3.0], // Significantly increased
						],
						"icon-allow-overlap": true,
						"icon-anchor": "bottom",
					},
				});
			}
		});

		// Interaction Handlers
		const onMouseEnter = () => {
			map.getCanvas().style.cursor = "pointer";
		};
		const onMouseLeave = () => {
			map.getCanvas().style.cursor = "";
		};
		const onClick = async (e: maplibregl.MapMouseEvent) => {
			// Check for clusters first
			const clusters = map.queryRenderedFeatures(e.point, {
				layers: [clusterLayerId],
			});

			if (clusters.length > 0) {
				const cluster = clusters[0];
				const clusterId = cluster.properties?.cluster_id;
				const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;

				try {
					const zoom = await source.getClusterExpansionZoom(clusterId);
					// Smooth zoom to the cluster expansion level
					map.flyTo({
						center: (cluster.geometry as any).coordinates,
						zoom: zoom + 0.5, // slightly more to ensure break
						speed: 1.2,
					});
				} catch (err) {
					console.error("Error getting cluster expansion zoom:", err);
				}
				return;
			}

			// Check for individual markers
			const features = map.queryRenderedFeatures(e.point, {
				layers: [symbolLayerId],
			});
			if (features.length > 0) {
				const feature = features[0];
				const poiId = feature.properties?.id;
				const poi = pois.find((p) => p.poi_id === poiId);
				// If not found in current list (rare because we force include it),
				// try to use the selectedPoi if it matches
				if (poi) {
					onSelectPoi(poi);
				} else if (selectedPoi?.poi_id === poiId) {
					onSelectPoi(selectedPoi);
				}
			}
		};

		// Event listeners for clusters
		map.on("mouseenter", clusterLayerId, onMouseEnter);
		map.on("mouseleave", clusterLayerId, onMouseLeave);
		map.on("click", clusterLayerId, onClick);

		// Event listeners for individual markers
		map.on("mouseenter", symbolLayerId, onMouseEnter);
		map.on("mouseleave", symbolLayerId, onMouseLeave);
		map.on("click", symbolLayerId, onClick);

		return () => {
			map.off("mouseenter", clusterLayerId, onMouseEnter);
			map.off("mouseleave", clusterLayerId, onMouseLeave);
			map.off("click", clusterLayerId, onClick);

			map.off("mouseenter", symbolLayerId, onMouseEnter);
			map.off("mouseleave", symbolLayerId, onMouseLeave);
			map.off("click", symbolLayerId, onClick);
		};
	}, [map, isLoaded, poiGeoJson, onSelectPoi, pois, selectedPoi]);

	return (
		<>
			{userLocation && <MapUserMarker location={userLocation} />}

			{routeCoordinates.length > 0 && (
				<MapRoute
					coordinates={routeCoordinates}
					color="#0a5c44"
					width={5}
					opacity={0.9}
				/>
			)}

			{navigationDestination && (
				<MapMarker
					longitude={navigationDestination.lng}
					latitude={navigationDestination.lat}
				>
					<MarkerContent>
						<div className="flex flex-col items-center">
							<div className="bg-primary text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg mb-1 max-w-[150px] truncate">
								{navigationDestination.name}
							</div>
							<div className="w-8 h-8 bg-primary rounded-full border-3 border-background shadow-lg flex items-center justify-center">
								<span className="material-symbols-outlined text-black text-[18px]!">
									location_on
								</span>
							</div>
						</div>
					</MarkerContent>
				</MapMarker>
			)}
		</>
	);
}

export default function MapClient() {
	const searchParams = useSearchParams();
	const { pois, loading: poisLoading, fetchPOIs } = usePOIs();
	const { userLocation, isLocating, locateUser } = useUserLocation();

	// Filter State
	const {
		filters,
		setFilters,
		resetFilters,
		queryString,
		hasActiveFilters,
		updateFilter,
	} = useFilters();

	const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
	const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
		lat: DEFAULT_CENTER[1],
		lng: DEFAULT_CENTER[0],
	});

	// Camera control
	const [cameraConfig, setCameraConfig] = useState<{
		lat: number;
		lng: number;
		key: number;
		zoom?: number;
	} | null>(null);

	const flyTo = useCallback((lat: number, lng: number) => {
		setCameraConfig({ lat, lng, key: Date.now() });
		setMapCenter({ lat, lng });
	}, []);

	// Navigation State
	const [navDest, setNavDest] = useState<NavigationDestination | null>(null);
	const [travelMode, setTravelMode] = useState<TravelMode>("driving");

	// Use the routing hook
	const { routeCoordinates, routeInfo, isLoadingRoute } = useMapRoute(
		userLocation,
		navDest,
		travelMode,
	);

	// Load Nav from URL
	useEffect(() => {
		const pid = searchParams.get("navigate");
		const lat = searchParams.get("lat");
		const lng = searchParams.get("lng");
		const name = searchParams.get("name");

		if (pid && lat && lng && name) {
			const dLat = parseFloat(lat);
			const dLng = parseFloat(lng);
			setNavDest({
				poiId: pid,
				lat: dLat,
				lng: dLng,
				name: decodeURIComponent(name),
			});
			flyTo(dLat, dLng);
		}
	}, [searchParams, flyTo]);

	// Debouced Bounds Change
	const boundsDebounce = useRef<NodeJS.Timeout>(null!);

	// Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			if (boundsDebounce.current) clearTimeout(boundsDebounce.current);
		};
	}, []);

	const handleBoundsChange = useCallback(
		(center: { lat: number; lng: number }, radius: number) => {
			// Check if center effectively changed significantly or just allow re-fetch
			setMapCenter(center);

			// Update filter location context for "Nearest" sorting
			if (hasActiveFilters && filters.sortBy === "nearest") {
				updateFilter("lat", center.lat);
				updateFilter("lng", center.lng);
			}

			if (boundsDebounce.current) clearTimeout(boundsDebounce.current);

			boundsDebounce.current = setTimeout(() => {
				if (!navDest) {
					fetchPOIs(
						center.lat,
						center.lng,
						radius,
						hasActiveFilters ? queryString : undefined,
					);
				}
			}, 500);
		},
		[
			fetchPOIs,
			navDest,
			hasActiveFilters,
			queryString,
			filters.sortBy,
			updateFilter,
		],
	);

	const handleApplyFilters = useCallback(() => {
		// Force fetch with current center/radius and new filters
		fetchPOIs(
			mapCenter.lat,
			mapCenter.lng,
			5000, // Approximate radius if unknown, or rely on bounds change
			queryString,
		);
	}, [fetchPOIs, mapCenter, queryString]);

	// Initial user location fetch
	const hasLocated = useRef(false);
	useEffect(() => {
		if (!hasLocated.current && !navDest) {
			hasLocated.current = true;
			// Try to locate user on mount
			// We access the locateUser from hook which updates state
			// We need to react to that state update to flyTo their location
			locateUser();
		}
	}, [locateUser, navDest]);

	// Fly to user location when found for the first time
	const [initialLocationFlown, setInitialLocationFlown] = useState(false);
	useEffect(() => {
		if (userLocation && !initialLocationFlown && !navDest) {
			flyTo(userLocation.lat, userLocation.lng);
			setInitialLocationFlown(true);
		}
	}, [userLocation, initialLocationFlown, navDest, flyTo]);

	const handleLocateUser = useCallback(() => {
		if (userLocation) flyTo(userLocation.lat, userLocation.lng);
		else locateUser();
	}, [userLocation, flyTo, locateUser]);

	const handleClosePoi = useCallback(() => setSelectedPoi(null), []);

	return (
		<main className="relative flex-1 w-full h-full overflow-hidden bg-background">
			<StickyHeader
				title={navDest ? `Directions to ${navDest.name}` : "Map View"}
				className="absolute top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md pt-8"
				rightAction={
					<div className="flex size-10 items-center justify-center rounded-full hover:bg-accent cursor-pointer transition-colors">
						<span className="material-symbols-outlined text-primary">
							share
						</span>
					</div>
				}
			/>

			{/* Map Layer */}
			<div className="absolute inset-0 z-10">
				<MapContainer
					center={[mapCenter.lng, mapCenter.lat]}
					zoom={DEFAULT_ZOOM}
					styles={MAP_STYLES}
				>
					<MapContent
						pois={pois}
						selectedPoi={selectedPoi}
						onSelectPoi={setSelectedPoi}
						onBoundsChange={handleBoundsChange}
						cameraConfig={cameraConfig}
						userLocation={userLocation}
						routeCoordinates={routeCoordinates}
						navigationDestination={navDest}
					/>
				</MapContainer>
			</div>

			{/* Overlays */}
			{navDest ? (
				<NavigationOverlay
					destination={navDest}
					routeInfo={routeInfo}
					isLoadingRoute={isLoadingRoute}
					travelMode={travelMode}
					onTravelModeChange={setTravelMode}
				/>
			) : (
				<MapSearchOverlay
					isLoading={poisLoading}
					onSelectLocation={(loc) => {
						flyTo(loc.lat, loc.lon);
						// Fetch logic handled by bounds change after flyTo
					}}
					filters={filters}
					onFiltersChange={setFilters}
					onApplyFilters={handleApplyFilters}
					onResetFilters={() => {
						resetFilters();
						// Optional: immediately refetch without filters
						setTimeout(() => handleApplyFilters(), 0);
					}}
					resultCount={pois.length}
				/>
			)}

			{/* Loading & Status */}
			{poisLoading && !navDest && (
				<div className="absolute top-40 left-1/2 -translate-x-1/2 z-40 bg-background/90 backdrop-blur-md px-4 py-2 rounded-full border border-border flex items-center gap-2">
					<div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
					<span className="text-sm text-foreground font-medium">
						Loading...
					</span>
				</div>
			)}

			{/* POI Count Badge */}
			{!poisLoading && pois.length > 0 && !navDest && (
				<div className="absolute top-40 left-1/2 -translate-x-1/2 z-40 bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30 flex items-center gap-2">
					<span className="text-xs text-primary font-bold">
						{pois.length} places found
					</span>
				</div>
			)}

			<MapControls onLocateUser={handleLocateUser} isLocating={isLocating} />

			{selectedPoi && (
				<POIDetailCard poi={selectedPoi} onClose={handleClosePoi} />
			)}
		</main>
	);
}

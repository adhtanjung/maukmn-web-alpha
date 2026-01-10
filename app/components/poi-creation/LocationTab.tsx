"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Map,
	MapMarker,
	MarkerContent,
	MapControls,
} from "@/components/ui/map";
import type { POIFormData } from "@/app/contexts/POIFormContext";
import type maplibregl from "maplibre-gl";

const PARKING_OPTIONS = [
	{ id: "car", label: "Car Parking", icon: "directions_car" },
	{ id: "motorcycle", label: "Motorcycle", icon: "two_wheeler" },
	{ id: "valet", label: "Valet", icon: null, iconText: "P" },
] as const;

// Default center: Jakarta, Indonesia
const DEFAULT_CENTER: [number, number] = [106.845599, -6.208763];

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

interface AddressSuggestion {
	formatted: string;
	lat: number;
	lon: number;
}

export default function LocationTab() {
	const { register, control, setValue, getValues, watch } =
		useFormContext<POIFormData>();

	// Initialize map state from form values or default
	const initialLat = getValues("latitude");
	const initialLng = getValues("longitude");
	const initialPosition: [number, number] =
		initialLat && initialLng ? [initialLng, initialLat] : DEFAULT_CENTER;

	// Map state
	const [mapCenter, setMapCenter] = useState<[number, number]>(initialPosition);
	const [markerPosition, setMarkerPosition] =
		useState<[number, number]>(initialPosition);

	// UI state
	const [isLocating, setIsLocating] = useState(false);
	const [locationError, setLocationError] = useState<string | null>(null);
	const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
	const [autocompleteDisabled, setAutocompleteDisabled] = useState(false);
	const [isAddressOverridden, setIsAddressOverridden] = useState(false);

	const debounceTimer = useRef<NodeJS.Timeout | null>(null);
	const reverseGeocodeTimer = useRef<NodeJS.Timeout | null>(null);

	// Watch values for display
	const currentLat = watch("latitude");
	const currentLng = watch("longitude");

	// Helper: Update coordinates in one place
	const updateCoordinates = useCallback(
		(lat: number, lng: number) => {
			setValue("latitude", lat);
			setValue("longitude", lng);
			setMarkerPosition([lng, lat]);
			setMapCenter([lng, lat]);
		},
		[setValue]
	);

	// Reverse geocode coordinates to address
	const reverseGeocode = useCallback(
		async (lat: number, lng: number) => {
			if (!GEOAPIFY_API_KEY || autocompleteDisabled || isAddressOverridden)
				return;

			try {
				const response = await fetch(
					`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`
				);

				if (response.status === 429) {
					setAutocompleteDisabled(true);
					setTimeout(() => setAutocompleteDisabled(false), 60000);
					return;
				}

				if (!response.ok) return;

				const data = await response.json();
				if (data.features?.[0]?.properties?.formatted) {
					setValue("address", data.features[0].properties.formatted);
				}
			} catch (error) {
				console.error("Reverse geocode error:", error);
			}
		},
		[setValue, autocompleteDisabled, isAddressOverridden]
	);

	// Search address with Geoapify
	const searchAddress = useCallback(
		async (query: string) => {
			if (
				!query ||
				query.length < 3 ||
				!GEOAPIFY_API_KEY ||
				autocompleteDisabled ||
				isAddressOverridden
			) {
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
					setAutocompleteDisabled(true);
					setTimeout(() => setAutocompleteDisabled(false), 60000);
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
				const results: AddressSuggestion[] =
					data.features?.map((f: { properties: AddressSuggestion }) => ({
						formatted: f.properties.formatted,
						lat: f.properties.lat,
						lon: f.properties.lon,
					})) || [];

				setSuggestions(results);
				setShowSuggestions(true);
			} catch (error) {
				console.error("Address search error:", error);
				setSuggestions([]);
			} finally {
				setIsLoadingSuggestions(false);
			}
		},
		[autocompleteDisabled, isAddressOverridden]
	);

	// Debounced address input handler
	const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setValue("address", value);

		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current);
		}

		debounceTimer.current = setTimeout(() => {
			searchAddress(value);
		}, 300);
	};

	// Select address suggestion
	const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
		setValue("address", suggestion.formatted);
		updateCoordinates(suggestion.lat, suggestion.lon);
		setShowSuggestions(false);
		setSuggestions([]);
	};

	const handleUseCurrentLocation = () => {
		if (navigator.geolocation) {
			setIsLocating(true);
			setLocationError(null);

			navigator.geolocation.getCurrentPosition(
				(position) => {
					const lat = position.coords.latitude;
					const lng = position.coords.longitude;
					updateCoordinates(lat, lng);
					reverseGeocode(lat, lng);
					setIsLocating(false);
				},
				(error) => {
					setIsLocating(false);
					let errorMessage = "Unable to get your location";

					switch (error.code) {
						case error.PERMISSION_DENIED:
							errorMessage =
								"Location permission denied. Please enable location access.";
							break;
						case error.POSITION_UNAVAILABLE:
							errorMessage = "Location information unavailable.";
							break;
						case error.TIMEOUT:
							errorMessage = "Location request timed out. Please try again.";
							break;
					}

					setLocationError(errorMessage);
					setTimeout(() => setLocationError(null), 5000);
				},
				{
					enableHighAccuracy: true,
					timeout: 10000, // 10 second timeout to prevent hanging
					maximumAge: 60000, // Accept cached position up to 1 minute old
				}
			);
		} else {
			setLocationError("Geolocation is not supported by your browser");
			setTimeout(() => setLocationError(null), 5000);
		}
	};

	const handleMarkerDragEnd = (lngLat: { lng: number; lat: number }) => {
		updateCoordinates(lngLat.lat, lngLat.lng);

		// Debounce reverse geocode
		if (reverseGeocodeTimer.current) {
			clearTimeout(reverseGeocodeTimer.current);
		}
		reverseGeocodeTimer.current = setTimeout(() => {
			reverseGeocode(lngLat.lat, lngLat.lng);
		}, 500);
	};

	const handleLocate = (coords: { longitude: number; latitude: number }) => {
		updateCoordinates(coords.latitude, coords.longitude);
		reverseGeocode(coords.latitude, coords.longitude);
	};

	// Map click handler
	const handleMapClick = (e: maplibregl.MapMouseEvent) => {
		if (e.lngLat) {
			const { lng, lat } = e.lngLat;
			updateCoordinates(lat, lng);
			reverseGeocode(lat, lng);
		}
	};

	// Cleanup timers
	useEffect(() => {
		return () => {
			if (debounceTimer.current) clearTimeout(debounceTimer.current);
			if (reverseGeocodeTimer.current)
				clearTimeout(reverseGeocodeTimer.current);
		};
	}, []);

	return (
		<div className="px-4 py-4 space-y-6">
			{/* Error Alert */}
			{locationError && (
				<Alert variant="destructive" className="animate-in slide-in-from-top-2">
					<span className="material-symbols-outlined h-4 w-4">error</span>
					<AlertTitle>Location Error</AlertTitle>
					<AlertDescription>{locationError}</AlertDescription>
				</Alert>
			)}

			{/* Autocomplete Disabled Notice */}
			{autocompleteDisabled && (
				<Alert className="animate-in slide-in-from-top-2">
					<span className="material-symbols-outlined h-4 w-4">info</span>
					<AlertTitle>Notice</AlertTitle>
					<AlertDescription>
						Address autocomplete temporarily unavailable. Please enter address
						manually.
					</AlertDescription>
				</Alert>
			)}

			{/* Physical Address */}
			<section className="space-y-3">
				<div className="flex items-center justify-between">
					<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
						Physical Address
					</Label>
					<div className="flex items-center space-x-2">
						<Label htmlFor="address-override" className="text-xs font-medium">
							Manual Override
						</Label>
						<Switch
							id="address-override"
							checked={isAddressOverridden}
							onCheckedChange={setIsAddressOverridden}
						/>
					</div>
				</div>
				<div className="relative">
					<span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary material-symbols-outlined">
						location_on
					</span>
					<Input
						type="text"
						placeholder="Enter street address"
						className="pl-12 h-14"
						{...register("address")}
						onChange={handleAddressChange}
						onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
						onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
						autoComplete="off"
					/>

					{/* Autocomplete Dropdown */}
					{showSuggestions && suggestions.length > 0 && (
						<div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto text-popover-foreground">
							{suggestions.map((suggestion, index) => (
								<button
									key={index}
									type="button"
									onClick={() => handleSelectSuggestion(suggestion)}
									className="w-full px-4 py-3 text-left hover:bg-muted transition-colors text-sm text-foreground border-b border-border last:border-b-0"
								>
									{suggestion.formatted}
								</button>
							))}
						</div>
					)}

					{isLoadingSuggestions && (
						<span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground material-symbols-outlined animate-spin">
							progress_activity
						</span>
					)}
				</div>

				{/* Lat/Long display when overridden */}
				{isAddressOverridden && (
					<div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2">
						<div>
							<Label className="text-xs text-muted-foreground">Latitude</Label>
							<Input
								value={currentLat || ""}
								readOnly
								className="bg-muted font-mono text-sm h-10"
							/>
						</div>
						<div>
							<Label className="text-xs text-muted-foreground">Longitude</Label>
							<Input
								value={currentLng || ""}
								readOnly
								className="bg-muted font-mono text-sm h-10"
							/>
						</div>
					</div>
				)}
			</section>

			{/* Floor/Unit Number */}
			<section className="space-y-3">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Floor / Unit Number
					<span className="text-muted-foreground font-normal text-xs ml-2 normal-case tracking-normal">
						(Optional)
					</span>
				</Label>
				<div className="relative">
					<span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary material-symbols-outlined">
						apartment
					</span>
					<Input
						type="text"
						placeholder="e.g. Floor 3, Unit 12A"
						className="pl-12 h-14"
						{...register("floorUnit")}
					/>
				</div>
			</section>

			{/* Map Location */}
			<section className="space-y-3" aria-label="Map location selector">
				<div className="relative bg-card border border-border rounded-xl overflow-hidden">
					{/* Interactive Map */}
					<div className="w-full h-64">
						<Map
							center={mapCenter}
							zoom={13}
							styles={{
								dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
								light:
									"https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
							}}
							onClick={handleMapClick}
						>
							<MapMarker
								longitude={markerPosition[0]}
								latitude={markerPosition[1]}
								draggable={true}
								onDragEnd={handleMarkerDragEnd}
							>
								<MarkerContent>
									<div className="relative">
										<div className="w-4 h-4 bg-primary rounded-full shadow-lg shadow-primary/50" />
										<div className="w-0.5 h-4 bg-primary mx-auto" />
									</div>
								</MarkerContent>
							</MapMarker>
							<MapControls showLocate={true} onLocate={handleLocate} />
						</Map>
					</div>

					{/* Coordinate Display */}
					{currentLat && currentLng && !isAddressOverridden && (
						<div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
							<span className="text-xs text-muted-foreground font-mono">
								📍 {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
							</span>
						</div>
					)}

					{/* Use Current Location Button */}
					<button
						type="button"
						onClick={handleUseCurrentLocation}
						disabled={isLocating}
						aria-label="Use my current location"
						className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-background/90 backdrop-blur-sm rounded-full border border-border disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLocating ? (
							<span className="w-3 h-3 material-symbols-outlined text-primary text-sm animate-spin">
								progress_activity
							</span>
						) : (
							<span className="w-3 h-3 bg-primary rounded-full animate-pulse" />
						)}
						<span className="text-primary font-medium text-sm">
							{isLocating ? "Locating..." : "Use Current Location"}
						</span>
					</button>
				</div>
			</section>

			{/* Nearest Public Transport */}
			<section className="space-y-3">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Nearest Public Transport
				</Label>
				<Input
					type="text"
					placeholder="e.g. 5 min walk from Central Station"
					className="h-14"
					{...register("publicTransport")}
				/>
			</section>

			{/* Parking Availability */}
			<section className="space-y-3">
				<Label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
					Parking Availability
				</Label>
				<Controller
					name="parkingOptions"
					control={control}
					render={({ field }) => (
						<div className="flex flex-wrap gap-2">
							{PARKING_OPTIONS.map((option) => {
								const isSelected = field.value?.includes(option.id);
								return (
									<Button
										key={option.id}
										type="button"
										onClick={() => {
											const newValue = isSelected
												? field.value.filter((p) => p !== option.id)
												: [...(field.value || []), option.id];
											field.onChange(newValue);
										}}
										variant={isSelected ? "default" : "outline"}
										className="rounded-full"
									>
										{option.icon ? (
											<span className="material-symbols-outlined text-lg mr-2">
												{option.icon}
											</span>
										) : (
											<span className="font-bold text-lg mr-2">
												{option.iconText}
											</span>
										)}
										<span>{option.label}</span>
										{isSelected && (
											<span className="material-symbols-outlined text-lg ml-2">
												check
											</span>
										)}
									</Button>
								);
							})}
						</div>
					)}
				/>
			</section>

			{/* Wheelchair Accessible */}
			<section className="space-y-3">
				<div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center">
							<span className="material-symbols-outlined text-primary text-2xl leading-none">
								accessible
							</span>
						</div>
						<div>
							<p className="text-foreground font-medium">
								Wheelchair Accessible
							</p>
							<p className="text-muted-foreground text-sm">
								Accessible facilities and entrances
							</p>
						</div>
					</div>
					<Controller
						name="wheelchairAccessible"
						control={control}
						render={({ field }) => (
							<Switch
								checked={field.value}
								onCheckedChange={field.onChange}
								aria-label="Wheelchair accessible"
							/>
						)}
					/>
				</div>
			</section>
		</div>
	);
}

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useBookingStore } from "@/lib/store";
import { ArrowRight, ArrowLeft, Search, MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLoadScript } from "@react-google-maps/api";
import { useTranslations } from "next-intl";

// Define Koh Phangan Bounds strictly
const KOH_PHANGAN_BOUNDS = {
    north: 9.83,
    south: 9.66,
    east: 100.09,
    west: 99.93,
};

// Define libraries array outside component to prevent reloads
const LIBRARIES: ("places" | "geocoding")[] = ["places", "geocoding"];

export function StepLocation() {
    const t = useTranslations('Booking');
    const { nextStep, prevStep, setLocation, address, lat, lng } = useBookingStore();

    // State
    const [center, setCenter] = useState<{ lat: number, lng: number } | null>(
        lat && lng ? { lat, lng } : { lat: 9.7319, lng: 100.0136 } // Default Koh Phangan
    );
    const [isDragging, setIsDragging] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);

    // Refs
    const mapRef = useRef<HTMLElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    // Load Google Maps API (Core + Places + Geocoding)
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: LIBRARIES,
        version: "weekly"
    });

    // Reverse Geocoding Function
    const reverseGeocode = useCallback((lat: number, lng: number) => {
        if (!geocoderRef.current) return;

        setIsLoadingAddress(true);
        geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
            setIsLoadingAddress(false);
            if (status === "OK" && results && results[0]) {
                const addressResult = results[0].formatted_address;
                // Check if it's roughly in Koh Phangan
                if (addressResult.includes("Ko Pha-ngan") || addressResult.includes("Surat Thani")) {
                    setLocation(addressResult, lat, lng);
                    if (inputRef.current) {
                        inputRef.current.value = addressResult;
                    }
                } else {
                    setLocation("Outside Service Area (Koh Phangan only)", lat, lng);
                }
            } else {
                setLocation("Unknown location", lat, lng);
            }
        });
    }, [setLocation]);

    // Initialize Map
    useEffect(() => {
        if (!isLoaded) return;

        // Load web component script just in case (for the container)
        if (!customElements.get('gmp-map')) {
            const script = document.createElement('script');
            script.src = "https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js";
            script.type = "module";
            script.async = true;
            document.head.appendChild(script);
        }

        const initLogic = async () => {
            await customElements.whenDefined('gmp-map');

            const mapElement = mapRef.current as any;
            if (!mapElement || !mapElement.innerMap) {
                setTimeout(initLogic, 100);
                return;
            }

            const map = mapElement.innerMap as google.maps.Map;
            mapInstanceRef.current = map;
            geocoderRef.current = new google.maps.Geocoder();

            // Configure Map
            map.setOptions({
                minZoom: 9, // Allow zoom out to see full island
                maxZoom: 18, // Limit detail zoom
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                zoomControl: true, // Enable zoom buttons for better UX
                clickableIcons: false, // Don't let users click POIs to open info windows
                gestureHandling: "greedy", // Better touch handling
            });

            // Set Initial Center
            if (center) {
                map.setCenter(center);
                map.setZoom(15);
            }

            // Listeners for "Grab Style" Interaction
            map.addListener("dragstart", () => {
                setIsDragging(true);
            });

            map.addListener("idle", () => {
                setIsDragging(false);
                const newCenter = map.getCenter();
                if (newCenter) {
                    const lat = newCenter.lat();
                    const lng = newCenter.lng();
                    setCenter({ lat, lng });

                    // Check if inside bounds
                    const isInside =
                        lat <= KOH_PHANGAN_BOUNDS.north &&
                        lat >= KOH_PHANGAN_BOUNDS.south &&
                        lng <= KOH_PHANGAN_BOUNDS.east &&
                        lng >= KOH_PHANGAN_BOUNDS.west;

                    if (isInside) {
                        // Trigger reverse geocoding only if inside
                        reverseGeocode(lat, lng);
                    } else {
                        setLocation("Outside Service Area (Koh Phangan only)", lat, lng);
                    }
                }
            });

            // Initialize Autocomplete
            if (inputRef.current && !autocompleteRef.current) {
                const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
                    bounds: KOH_PHANGAN_BOUNDS,
                    strictBounds: false, // Use bounds as preference, not hard limit
                    componentRestrictions: { country: "th" },
                    fields: ["geometry", "formatted_address", "name"],
                });

                autocompleteRef.current = autocomplete;

                autocomplete.addListener("place_changed", () => {
                    const place = autocomplete.getPlace();
                    if (!place.geometry || !place.geometry.location) return;

                    // Update Map
                    if (place.geometry.viewport) {
                        map.fitBounds(place.geometry.viewport);
                    } else {
                        map.setCenter(place.geometry.location);
                        map.setZoom(17);
                    }

                    // Update Store DIRECTLY
                    if (place.formatted_address) {
                        setLocation(place.formatted_address, place.geometry.location.lat(), place.geometry.location.lng());
                        if (inputRef.current) {
                            inputRef.current.value = place.formatted_address;
                        }
                    }
                });
            }
        };

        initLogic();
    }, [isLoaded, reverseGeocode, setLocation, center]);

    const handleCurrentLocation = () => {
        if (navigator.geolocation && mapInstanceRef.current) {
            navigator.geolocation.getCurrentPosition((position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                mapInstanceRef.current?.setCenter(pos);
                mapInstanceRef.current?.setZoom(17);
            });
        }
    };

    const handleNext = () => {
        if (address && center) {
            nextStep();
        }
    };

    if (loadError) return <div className="text-red-500">Error loading Maps</div>;
    if (!isLoaded) return <div className="h-[500px] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aura-teal"></div></div>;

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-serif font-bold text-gray-900">{t('location_selection.title')}</h2>
                <p className="text-gray-600">{t('location_selection.subtitle')}</p>
            </div>

            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-gray-200 shadow-inner group bg-gray-100">

                {/* Search Bar Overlay */}
                <div className="absolute top-4 left-4 right-4 z-10">
                    <div className="relative shadow-lg rounded-lg bg-white">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search for a place..."
                            className="block w-full pl-10 pr-3 py-3 border-none rounded-lg leading-5 bg-transparent placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                            onFocus={(e) => e.target.select()}
                            defaultValue={address || ""}
                        />
                    </div>
                </div>

                {/* Map */}
                {React.createElement('gmp-map', {
                    ref: mapRef,
                    style: { height: '100%', width: '100%' }
                })}

                {/* CENTER PIN (Fixed) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none flex flex-col items-center pb-[38px]">
                    {/* The Pin Icon */}
                    <div className={cn(
                        "text-aura-teal drop-shadow-md transition-transform duration-200",
                        isDragging ? "-translate-y-2 scale-110" : "translate-y-0"
                    )}>
                        <MapPin size={48} fill="currentColor" className="text-aura-teal" />
                    </div>
                    {/* The Shadow dot */}
                    <div className="w-2 h-1 bg-black/20 rounded-full blur-[1px]"></div>
                </div>

                {/* Current Location Button */}
                <button
                    onClick={handleCurrentLocation}
                    className="absolute bottom-24 right-4 bg-white p-3 rounded-full shadow-lg text-gray-600 hover:text-aura-teal hover:bg-gray-50 transition-colors z-10"
                >
                    <Navigation size={20} />
                </button>

                {/* Address Card Overlay (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/5 to-transparent pointer-events-none flex justify-center">
                    <div className="bg-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 max-w-[90%] pointer-events-auto transform transition-all duration-300 translate-y-0">
                        {isLoadingAddress ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-aura-teal"></div>
                        ) : (
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        )}
                        <span className="text-sm font-medium text-gray-800 truncate max-w-[250px]">
                            {isDragging ? t('location_selection.getting_location') : (address || t('location_selection.address_placeholder'))}
                        </span>
                    </div>
                </div>

            </div>

            {/* Selected Location Info & Notes */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-aura-teal/10 rounded-full text-aura-teal mt-1">
                        <MapPin size={20} />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wider block mb-1">{t('location_selection.address_label')}</label>
                        <div className="font-medium text-gray-900">{address || t('location_selection.address_placeholder')}</div>
                        {center && (
                            <div className="text-xs text-gray-400 mt-1 font-mono">
                                {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Location Notes Input */}
                {address && !address.includes("Outside") && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wider block mb-2">
                            {t('location_selection.notes_label')}
                        </label>
                        <textarea
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-aura-teal focus:border-transparent outline-none transition-all placeholder-gray-400"
                            placeholder={t('location_selection.notes_placeholder')}
                            rows={2}
                            defaultValue={useBookingStore.getState().locationNotes || ""}
                            onChange={(e) => useBookingStore.getState().setLocationNotes(e.target.value)}
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-4">
                <button
                    onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-gray-500 hover:bg-gray-100 transition-all"
                >
                    <ArrowLeft size={18} /> {t('back')}
                </button>
                <button
                    onClick={handleNext}
                    disabled={!address || isDragging || address.includes("Outside")}
                    className={cn(
                        "flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all",
                        address && !isDragging && !address.includes("Outside")
                            ? "bg-aura-teal text-white shadow-lg hover:bg-teal-500 hover:shadow-aura-teal/25"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                >
                    {t('next')} <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}

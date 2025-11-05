import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Search, MapPin } from 'lucide-react';

const libraries: ("places")[] = ["places"];

interface LocationData {
    address: string;
    lat: number;
    lng: number;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}

interface LocationMapPickerProps {
    onLocationSelect: (location: LocationData) => void;
    initialAddress?: string;
    initialLat?: number;
    initialLng?: number;
}

export function LocationMapPicker({
                                      onLocationSelect,
                                      initialAddress = '',
                                      initialLat = 28.6139,
                                      initialLng = 77.2090,
                                  }: LocationMapPickerProps) {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [marker, setMarker] = useState<google.maps.Marker | null>(null);
    const [markerPosition, setMarkerPosition] = useState({ lat: initialLat, lng: initialLng });
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const parseAddressComponents = (components: google.maps.GeocoderAddressComponent[]) => {
        const result: any = {};
        for (const comp of components) {
            if (comp.types.includes('street_number')) result.street_number = comp.long_name;
            if (comp.types.includes('route')) result.street = comp.long_name;
            if (comp.types.includes('locality')) result.city = comp.long_name;
            if (comp.types.includes('administrative_area_level_1')) result.state = comp.long_name;
            if (comp.types.includes('country')) result.country = comp.long_name;
            if (comp.types.includes('postal_code')) result.postalCode = comp.long_name;
        }
        return result;
    };

    const mapContainerStyle = { width: '100%', height: '400px' };

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
        const newMarker = new google.maps.Marker({
            map,
            position: { lat: initialLat, lng: initialLng },
            draggable: true,
        });

        newMarker.addListener('dragend', (event) => {
            const lat = event.latLng?.lat() || 0;
            const lng = event.latLng?.lng() || 0;
            setMarkerPosition({ lat, lng });
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const address = results[0].formatted_address;
                    const details = parseAddressComponents(results[0].address_components);
                    onLocationSelect({
                        address,
                        lat,
                        lng,
                        street: `${details.street_number || ''} ${details.street || ''}`.trim(),
                        city: details.city || '',
                        state: details.state || '',
                        country: details.country || '',
                        postalCode: details.postalCode || '',
                    });
                }
            });
        });

        setMarker(newMarker);
    }, [onLocationSelect]);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng && map && marker) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarkerPosition({ lat, lng });
            marker.setPosition({ lat, lng });
            map.panTo({ lat, lng });

            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const address = results[0].formatted_address;
                    const details = parseAddressComponents(results[0].address_components);
                    onLocationSelect({
                        address,
                        lat,
                        lng,
                        street: `${details.street_number || ''} ${details.street || ''}`.trim(),
                        city: details.city || '',
                        state: details.state || '',
                        country: details.country || '',
                        postalCode: details.postalCode || '',
                    });
                }
            });
        }
    }, [map, marker, onLocationSelect]);

    // ✅ Stable Google Autocomplete setup
    useEffect(() => {
        if (!isLoaded || !searchInputRef.current || !window.google?.maps?.places) return;

        const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
            fields: ['formatted_address', 'geometry', 'address_components'],
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry?.location || !map || !marker) return;

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const address = place.formatted_address || '';
            const details = parseAddressComponents(place.address_components || []);

            setMarkerPosition({ lat, lng });
            marker.setPosition({ lat, lng });
            map.panTo({ lat, lng });
            map.setZoom(15);

            onLocationSelect({
                address,
                lat,
                lng,
                street: `${details.street_number || ''} ${details.street || ''}`.trim(),
                city: details.city || '',
                state: details.state || '',
                country: details.country || '',
                postalCode: details.postalCode || '',
            });
        });
    }, [isLoaded, map, marker, onLocationSelect]);

    if (loadError) return <p>Error loading map</p>;
    if (!isLoaded) return <p>Loading...</p>;

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search for a location..."
                    defaultValue={initialAddress}
                    className="pl-10 w-full border rounded-md h-10"
                />
            </div>

            <div className="relative rounded-lg overflow-hidden border">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={markerPosition}
                    zoom={13}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={onMapClick}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
                    }}
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg border">
                    <p className="text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Click on map to select location
                    </p>
                </div>
            </div>
        </div>
    );
}

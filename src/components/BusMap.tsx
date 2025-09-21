import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Bus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bus icon
const busIcon = new L.DivIcon({
  className: '',
  html: `<div class="w-8 h-8 bg-bus-route-1 rounded-full flex items-center justify-center text-white shadow-lg animate-bus-move">
    <div class="w-4 h-4">🚌</div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Bus stop icon
const busStopIcon = new L.DivIcon({
  className: '',
  html: `<div class="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
    <div class="w-2 h-2 bg-white rounded-full"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Current location icon
const locationIcon = new L.DivIcon({
  className: '',
  html: `<div class="w-6 h-6 bg-location-pulse rounded-full border-2 border-white shadow-lg animate-pulse-location"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface Bus {
  id: string;
  route: string;
  lat: number;
  lng: number;
  direction: string;
  nextStop: string;
  delay: number;
}

interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  routes: string[];
}

// Mock data
const mockBuses: Bus[] = [
  {
    id: '1',
    route: 'Route 42',
    lat: 40.7589,
    lng: -73.9851,
    direction: 'Downtown',
    nextStop: 'Central Station',
    delay: 2,
  },
  {
    id: '2',
    route: 'Route 15',
    lat: 40.7614,
    lng: -73.9776,
    direction: 'Uptown',
    nextStop: 'Broadway Plaza',
    delay: 0,
  },
  {
    id: '3',
    route: 'Route 8',
    lat: 40.7505,
    lng: -73.9934,
    direction: 'Crosstown',
    nextStop: 'Park Avenue',
    delay: 5,
  },
];

const mockBusStops: BusStop[] = [
  { id: '1', name: 'Central Station', lat: 40.7580, lng: -73.9855, routes: ['42', '15'] },
  { id: '2', name: 'Broadway Plaza', lat: 40.7620, lng: -73.9780, routes: ['15', '8'] },
  { id: '3', name: 'Park Avenue', lat: 40.7510, lng: -73.9940, routes: ['8', '42'] },
  { id: '4', name: 'Metro Hub', lat: 40.7550, lng: -73.9800, routes: ['15', '42', '8'] },
];

function LocationTracker({ onLocationFound }: { onLocationFound: (lat: number, lng: number) => void }) {
  useMapEvents({
    locationfound: (e) => {
      onLocationFound(e.latlng.lat, e.latlng.lng);
    },
    locationerror: () => {
      toast({
        title: "Location Error",
        description: "Unable to access your location. Please enable location services.",
        variant: "destructive",
      });
    },
  });
  return null;
}

const BusMap = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [buses, setBuses] = useState<Bus[]>(mockBuses);
  const mapRef = useRef<L.Map | null>(null);

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
          }
          toast({
            title: "Location Found",
            description: "Centered map on your current location",
          });
        },
        () => {
          toast({
            title: "Location Error",
            description: "Unable to access your location. Please enable location services.",
            variant: "destructive",
          });
        }
      );
    }
  };

  // Simulate bus movement
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses(prevBuses => 
        prevBuses.map(bus => ({
          ...bus,
          lat: bus.lat + (Math.random() - 0.5) * 0.001,
          lng: bus.lng + (Math.random() - 0.5) * 0.001,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen">
      <MapContainer
        center={[40.7589, -73.9851]}
        zoom={13}
        className="w-full h-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <LocationTracker 
          onLocationFound={(lat, lng) => setUserLocation([lat, lng])}
        />

        {/* User location */}
        {userLocation && (
          <>
            <Marker position={userLocation} icon={locationIcon}>
              <Popup>
                <div className="text-center">
                  <MapPin className="w-4 h-4 mx-auto mb-1 text-accent" />
                  <p className="font-semibold">Your Location</p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={userLocation}
              radius={100}
              pathOptions={{
                color: 'hsl(var(--location-pulse))',
                weight: 2,
                fillColor: 'hsl(var(--location-pulse))',
                fillOpacity: 0.1,
              }}
            />
          </>
        )}

        {/* Bus stops */}
        {mockBusStops.map((stop) => (
          <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={busStopIcon}>
            <Popup>
              <div className="text-center min-w-[150px]">
                <Bus className="w-4 h-4 mx-auto mb-1 text-primary" />
                <p className="font-semibold">{stop.name}</p>
                <p className="text-sm text-muted-foreground">
                  Routes: {stop.routes.join(', ')}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Buses */}
        {buses.map((bus) => (
          <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={busIcon}>
            <Popup>
              <div className="text-center min-w-[180px]">
                <Bus className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="font-bold text-primary">{bus.route}</p>
                <p className="text-sm">{bus.direction}</p>
                <p className="text-sm text-muted-foreground">
                  Next: {bus.nextStop}
                </p>
                {bus.delay > 0 && (
                  <p className="text-sm text-warning-foreground bg-warning rounded px-2 py-1 mt-1">
                    Delayed {bus.delay} min
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Location button */}
      <Button
        onClick={handleLocationClick}
        className="absolute top-4 right-4 z-[1000] bg-gradient-primary hover:bg-primary-hover shadow-lg"
        size="lg"
      >
        <Navigation className="w-4 h-4 mr-2" />
        My Location
      </Button>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border">
        <h3 className="font-semibold mb-2 text-card-foreground">Legend</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-bus-route-1 rounded-full flex items-center justify-center text-xs">🚌</div>
            <span className="text-card-foreground">Active Bus</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full border border-white"></div>
            <span className="text-card-foreground">Bus Stop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-location-pulse rounded-full border border-white"></div>
            <span className="text-card-foreground">Your Location</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusMap;
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Navigation, Bus, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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

// Mock data for Delhi, India
const mockBuses: Bus[] = [
  {
    id: '1',
    route: 'DTC 764',
    lat: 28.6139,
    lng: 77.2090,
    direction: 'CP to Dwarka',
    nextStop: 'Connaught Place',
    delay: 3,
  },
  {
    id: '2',
    route: 'DTC 420',
    lat: 28.6280,
    lng: 77.2190,
    direction: 'ISBT to Gurgaon',
    nextStop: 'Rajiv Chowk',
    delay: 0,
  },
  {
    id: '3',
    route: 'DTC 715',
    lat: 28.6020,
    lng: 77.2300,
    direction: 'Khan Market to Lajpat Nagar',
    nextStop: 'India Gate',
    delay: 5,
  },
  {
    id: '4',
    route: 'DTC 543',
    lat: 28.6350,
    lng: 77.2240,
    direction: 'Old Delhi to New Delhi',
    nextStop: 'Red Fort',
    delay: 1,
  },
];

const mockBusStops: BusStop[] = [
  { id: '1', name: 'Connaught Place', lat: 28.6315, lng: 77.2167, routes: ['764', '420'] },
  { id: '2', name: 'Rajiv Chowk Metro', lat: 28.6330, lng: 77.2194, routes: ['420', '715'] },
  { id: '3', name: 'India Gate', lat: 28.6129, lng: 77.2295, routes: ['715', '543'] },
  { id: '4', name: 'Red Fort', lat: 28.6562, lng: 77.2410, routes: ['543', '764'] },
  { id: '5', name: 'ISBT Kashmere Gate', lat: 28.6677, lng: 77.2273, routes: ['420', '543'] },
  { id: '6', name: 'Khan Market', lat: 28.5984, lng: 77.2319, routes: ['715', '764'] },
  { id: '7', name: 'Lajpat Nagar', lat: 28.5657, lng: 77.2431, routes: ['715'] },
  { id: '8', name: 'Dwarka Sector 21', lat: 28.5520, lng: 77.0522, routes: ['764'] },
];

const SimpleMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Delhi, India with zoom controls on the right
    const map = L.map(mapRef.current, {
      zoomControl: false // Disable default zoom control
    }).setView([28.6139, 77.2090], 12);

    // Add zoom control to the top right
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Custom bus icon with Indian styling
    const busIcon = L.divIcon({
      className: 'custom-bus-marker',
      html: `<div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
        🚌
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Custom bus stop icon
    const busStopIcon = L.divIcon({
      className: 'custom-stop-marker',
      html: `<div class="w-6 h-6 bg-secondary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
        <div class="w-2 h-2 bg-white rounded-full"></div>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Add bus stops
    mockBusStops.forEach((stop) => {
      const marker = L.marker([stop.lat, stop.lng], { icon: busStopIcon })
        .bindPopup(`
          <div class="text-center min-w-[150px] p-2">
            <div class="flex items-center justify-center mb-2">
              <div class="w-4 h-4 text-primary">🚏</div>
            </div>
            <p class="font-semibold text-foreground">${stop.name}</p>
            <p class="text-sm text-muted-foreground">DTC Routes: ${stop.routes.join(', ')}</p>
          </div>
        `)
        .addTo(map);
      
      markersRef.current[`stop-${stop.id}`] = marker;
    });

    // Add buses
    mockBuses.forEach((bus) => {
      const marker = L.marker([bus.lat, bus.lng], { icon: busIcon })
        .bindPopup(`
          <div class="text-center min-w-[180px] p-2">
            <div class="flex items-center justify-center mb-2">
              <div class="w-5 h-5 text-primary">🚌</div>
            </div>
            <p class="font-bold text-primary">${bus.route}</p>
            <p class="text-sm text-foreground">${bus.direction}</p>
            <p class="text-sm text-muted-foreground">Next: ${bus.nextStop}</p>
            ${bus.delay > 0 ? `<p class="text-sm text-warning bg-warning/20 rounded px-2 py-1 mt-1">Delayed ${bus.delay} min</p>` : ''}
          </div>
        `)
        .addTo(map);
      
      markersRef.current[`bus-${bus.id}`] = marker;
    });

    // Simulate bus movement
    const interval = setInterval(() => {
      mockBuses.forEach((bus) => {
        const marker = markersRef.current[`bus-${bus.id}`];
        if (marker) {
          const newLat = bus.lat + (Math.random() - 0.5) * 0.001;
          const newLng = bus.lng + (Math.random() - 0.5) * 0.001;
          marker.setLatLng([newLat, newLng]);
          bus.lat = newLat;
          bus.lng = newLng;
        }
      });
    }, 5000);

    return () => {
      clearInterval(interval);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleLocationClick = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Remove existing location marker if any
          if (markersRef.current['user-location']) {
            mapInstanceRef.current?.removeLayer(markersRef.current['user-location']);
          }

          // Custom location icon
          const locationIcon = L.divIcon({
            className: 'custom-location-marker',
            html: `<div class="w-6 h-6 bg-accent rounded-full border-2 border-white shadow-lg animate-pulse"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          // Add location marker
          const marker = L.marker([latitude, longitude], { icon: locationIcon })
            .bindPopup(`
              <div class="text-center p-2">
                <div class="flex items-center justify-center mb-2">
                  <div class="w-4 h-4 text-accent">📍</div>
                </div>
                <p class="font-semibold text-foreground">Your Location</p>
              </div>
            `)
            .addTo(mapInstanceRef.current!);

          markersRef.current['user-location'] = marker;

          // Add accuracy circle
          L.circle([latitude, longitude], {
            radius: 100,
            color: 'hsl(var(--accent))',
            weight: 2,
            fillColor: 'hsl(var(--accent))',
            fillOpacity: 0.1,
          }).addTo(mapInstanceRef.current!);

          mapInstanceRef.current!.setView([latitude, longitude], 15);
          
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

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} className="w-full h-full" />

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
            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center text-xs">🚌</div>
            <span className="text-card-foreground">DTC Bus</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-secondary rounded-full border border-white"></div>
            <span className="text-card-foreground">Bus Stop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent rounded-full border border-white"></div>
            <span className="text-card-foreground">Your Location</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleMap;
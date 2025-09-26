import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bus, Clock, MapPin, ChevronRight, Search } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';

interface Route {
  id: string;
  name: string;
  color: string;
  direction: string;
  activeBuses: number;
  nextArrivals: { 
    stop: string; 
    time: number; 
    delayed?: boolean; 
    occupancy: 'Low' | 'Medium' | 'High' | 'Full';
  }[];
}

const mockRoutes: Route[] = [
  {
    id: '764',
    name: 'DTC 764',
    color: 'bus-route-1',
    direction: 'CP ↔ Dwarka',
    activeBuses: 4,
    nextArrivals: [
      { stop: 'Connaught Place', time: 3, occupancy: 'Medium' },
      { stop: 'Khan Market', time: 12, occupancy: 'Low' },
      { stop: 'Dwarka Sector 21', time: 25, delayed: true, occupancy: 'High' },
    ],
  },
  {
    id: '420',
    name: 'DTC 420',
    color: 'bus-route-2',
    direction: 'ISBT ↔ Gurgaon',
    activeBuses: 3,
    nextArrivals: [
      { stop: 'Rajiv Chowk Metro', time: 2, occupancy: 'Full' },
      { stop: 'ISBT Kashmere Gate', time: 18, occupancy: 'Medium' },
    ],
  },
  {
    id: '715',
    name: 'DTC 715',
    color: 'bus-route-3',
    direction: 'Khan Market ↔ Lajpat',
    activeBuses: 2,
    nextArrivals: [
      { stop: 'India Gate', time: 7, occupancy: 'Low' },
      { stop: 'Khan Market', time: 15, occupancy: 'Medium' },
      { stop: 'Lajpat Nagar', time: 20, delayed: true, occupancy: 'High' },
    ],
  },
  {
    id: '543',
    name: 'DTC 543',
    color: 'bus-route-4',
    direction: 'Old Delhi ↔ New Delhi',
    activeBuses: 5,
    nextArrivals: [
      { stop: 'Red Fort', time: 1, occupancy: 'Medium' },
      { stop: 'ISBT Kashmere Gate', time: 8, occupancy: 'Low' },
      { stop: 'India Gate', time: 16, occupancy: 'Full' },
    ],
  },
];

const RoutePanel = () => {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const { searchQuery } = useSearch();

  const getOccupancyColor = (occupancy: string) => {
    switch (occupancy) {
      case 'Low': return 'text-green-600 bg-green-100 border-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'High': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'Full': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const filteredRoutes = useMemo(() => {
    if (!searchQuery.trim()) return mockRoutes;
    
    const query = searchQuery.toLowerCase().trim();
    return mockRoutes.filter(route => 
      route.id.toLowerCase().includes(query) ||
      route.name.toLowerCase().includes(query) ||
      route.direction.toLowerCase().includes(query) ||
      route.nextArrivals.some(arrival => 
        arrival.stop.toLowerCase().includes(query)
      )
    );
  }, [searchQuery]);

  return (
    <div className="absolute left-4 top-20 z-[1000] w-80 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <Card className="bg-card/95 backdrop-blur-sm shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <Bus className="w-5 h-5 text-primary" />
            DTC Routes - Delhi
          </h2>
          {searchQuery && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="w-4 h-4" />
              <span>{filteredRoutes.length} routes found for "{searchQuery}"</span>
            </div>
          )}
        </div>
        
        <div className="p-2 space-y-2">
          {filteredRoutes.length === 0 && searchQuery ? (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No routes found for "{searchQuery}"</p>
              <p className="text-xs">Try searching by bus number (764, 420) or destination</p>
            </div>
          ) : (
            filteredRoutes.map((route) => (
            <Card
              key={route.id}
              className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                selectedRoute === route.id ? 'ring-2 ring-primary shadow-md' : ''
              }`}
              onClick={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-8 bg-${route.color} rounded-sm`}></div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">{route.name}</h3>
                    <p className="text-sm text-muted-foreground">{route.direction}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {route.activeBuses} buses
                  </Badge>
                  <ChevronRight 
                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                      selectedRoute === route.id ? 'rotate-90' : ''
                    }`} 
                  />
                </div>
              </div>

              {selectedRoute === route.id && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <h4 className="text-sm font-medium text-card-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Next Arrivals
                  </h4>
                  {route.nextArrivals.map((arrival, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-card-foreground">{arrival.stop}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={arrival.delayed ? 'text-warning' : 'text-primary'}>
                            {arrival.time} min
                          </span>
                          {arrival.delayed && (
                            <Badge variant="outline" className="text-xs text-warning border-warning">
                              Delayed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end ml-5">
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-0.5 ${getOccupancyColor(arrival.occupancy)}`}
                        >
                          {arrival.occupancy} occupancy
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            ))
          )}
        </div>

        <div className="p-4 border-t">
          <Button className="w-full bg-gradient-primary hover:bg-primary-hover" size="sm">
            View All DTC Routes
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RoutePanel;
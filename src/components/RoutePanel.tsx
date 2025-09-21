import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bus, Clock, MapPin, ChevronRight } from 'lucide-react';

interface Route {
  id: string;
  name: string;
  color: string;
  direction: string;
  activeBuses: number;
  nextArrivals: { stop: string; time: number; delayed?: boolean }[];
}

const mockRoutes: Route[] = [
  {
    id: '42',
    name: 'Route 42',
    color: 'bus-route-1',
    direction: 'Downtown ↔ Uptown',
    activeBuses: 3,
    nextArrivals: [
      { stop: 'Central Station', time: 2 },
      { stop: 'Broadway Plaza', time: 8 },
      { stop: 'Metro Hub', time: 12, delayed: true },
    ],
  },
  {
    id: '15',
    name: 'Route 15',
    color: 'bus-route-2',
    direction: 'East ↔ West',
    activeBuses: 2,
    nextArrivals: [
      { stop: 'Park Avenue', time: 5 },
      { stop: 'Central Station', time: 15 },
    ],
  },
  {
    id: '8',
    name: 'Route 8',
    color: 'bus-route-3',
    direction: 'Crosstown Express',
    activeBuses: 4,
    nextArrivals: [
      { stop: 'Metro Hub', time: 1 },
      { stop: 'Broadway Plaza', time: 6 },
      { stop: 'Park Avenue', time: 11, delayed: true },
    ],
  },
];

const RoutePanel = () => {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  return (
    <div className="absolute left-4 top-20 z-[1000] w-80 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <Card className="bg-card/95 backdrop-blur-sm shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <Bus className="w-5 h-5 text-primary" />
            Active Routes
          </h2>
        </div>
        
        <div className="p-2 space-y-2">
          {mockRoutes.map((route) => (
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
                    <div key={index} className="flex items-center justify-between text-sm">
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
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="p-4 border-t">
          <Button className="w-full bg-gradient-primary hover:bg-primary-hover" size="sm">
            View All Routes
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RoutePanel;
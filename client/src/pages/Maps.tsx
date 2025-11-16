import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { Layers, MapPin, Droplets, Sprout, Gauge } from "lucide-react";

export default function Maps() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [showFarms, setShowFarms] = useState(true);
  const [showFields, setShowFields] = useState(true);
  const [showDevices, setShowDevices] = useState(true);
  const [showIrrigation, setShowIrrigation] = useState(false);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  const { data: overview } = trpc.dashboard.overview.useQuery();

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    renderMapLayers();
  };

  const renderMapLayers = () => {
    if (!mapRef.current || !overview?.farms) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    // Add farm markers
    if (showFarms && overview.farms) {
      overview.farms.forEach((farm) => {
        if (farm.location) {
          const [lat, lng] = farm.location.split(',').map(parseFloat);
          if (!isNaN(lat) && !isNaN(lng)) {
            const marker = new google.maps.Marker({
              position: { lat, lng },
              map: mapRef.current!,
              title: farm.name,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#16a34a",
                fillOpacity: 0.8,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              },
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 8px;">
                  <h3 style="font-weight: bold; margin-bottom: 4px;">${farm.name}</h3>
                  <p style="font-size: 12px; color: #666;">
                    ${(farm.totalArea / 4200).toFixed(1)} فدان
                  </p>
                  <p style="font-size: 12px; color: #666;">
                    ${farm.region}, ${farm.country}
                  </p>
                </div>
              `,
            });

            marker.addListener("click", () => {
              infoWindow.open(mapRef.current!, marker);
            });

            newMarkers.push(marker);
          }
        }
      });
    }

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      mapRef.current?.fitBounds(bounds);
    }
  };

  // Re-render layers when toggles change
  useState(() => {
    renderMapLayers();
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-green-900">الخرائط التفاعلية</h1>
          <p className="text-green-700 mt-1">
            عرض جميع المزارع والحقول والأجهزة على الخريطة
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Map Controls */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-green-700" />
                طبقات الخريطة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="farms" className="flex items-center gap-2 cursor-pointer">
                  <MapPin className="w-4 h-4 text-green-600" />
                  المزارع
                </Label>
                <Switch
                  id="farms"
                  checked={showFarms}
                  onCheckedChange={(checked) => {
                    setShowFarms(checked);
                    setTimeout(renderMapLayers, 100);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="fields" className="flex items-center gap-2 cursor-pointer">
                  <Sprout className="w-4 h-4 text-green-600" />
                  الحقول
                </Label>
                <Switch
                  id="fields"
                  checked={showFields}
                  onCheckedChange={setShowFields}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="devices" className="flex items-center gap-2 cursor-pointer">
                  <Gauge className="w-4 h-4 text-purple-600" />
                  أجهزة IoT
                </Label>
                <Switch
                  id="devices"
                  checked={showDevices}
                  onCheckedChange={setShowDevices}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="irrigation" className="flex items-center gap-2 cursor-pointer">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  أنظمة الري
                </Label>
                <Switch
                  id="irrigation"
                  checked={showIrrigation}
                  onCheckedChange={setShowIrrigation}
                />
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3 text-sm">الإحصائيات</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المزارع:</span>
                    <Badge variant="secondary">{overview?.totalFarms || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المساحة:</span>
                    <Badge variant="secondary">
                      {overview ? ((overview.totalArea || 0) / 4200).toFixed(1) : 0} فدان
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    if (mapRef.current && overview?.farms && overview.farms.length > 0) {
                      const firstFarm = overview.farms[0];
                      if (firstFarm.location) {
                        const [lat, lng] = firstFarm.location.split(',').map(parseFloat);
                        if (!isNaN(lat) && !isNaN(lng)) {
                          mapRef.current.setCenter({ lat, lng });
                          mapRef.current.setZoom(10);
                        }
                      }
                    }
                  }}
                >
                  إعادة توسيط الخريطة
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Map View */}
          <Card className="lg:col-span-3">
            <CardContent className="p-0">
              <div className="h-[600px] rounded-lg overflow-hidden">
                <MapView
                  onMapReady={handleMapReady}
                  initialCenter={{ lat: 15.5527, lng: 48.5164 }}
                  initialZoom={7}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">دليل الرموز</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-600"></div>
                <span className="text-sm">مزرعة نشطة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                <span className="text-sm">حقل مزروع</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                <span className="text-sm">جهاز IoT</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-600"></div>
                <span className="text-sm">نظام ري</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

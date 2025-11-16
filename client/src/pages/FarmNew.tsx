import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, MapPin, Save } from "lucide-react";
import { MapView } from "@/components/Map";

export default function FarmNew() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [totalArea, setTotalArea] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("Yemen");
  const [region, setRegion] = useState("");
  const [farmType, setFarmType] = useState<"crop" | "livestock" | "mixed" | "greenhouse" | "organic">("crop");
  const [location, setLocationCoords] = useState("");
  const [mapReady, setMapReady] = useState(false);

  const createFarmMutation = trpc.farm.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المزرعة بنجاح!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !totalArea) {
      toast.error("الرجاء إدخال اسم المزرعة والمساحة");
      return;
    }

    createFarmMutation.mutate({
      name,
      description: description || undefined,
      totalArea: parseFloat(totalArea),
      location: location || undefined,
      address: address || undefined,
      country: country || undefined,
      region: region || undefined,
      farmType,
    });
  };

  const handleMapReady = (map: google.maps.Map) => {
    setMapReady(true);
    
    // Add click listener to set location
    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setLocationCoords(`${lat},${lng}`);
        
        // Add marker
        new google.maps.Marker({
          position: e.latLng,
          map: map,
          title: "موقع المزرعة",
        });

        // Reverse geocode to get address
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: e.latLng }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            setAddress(results[0].formatted_address);
          }
        });
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-green-900">إضافة مزرعة جديدة</h1>
          <p className="text-green-700 mt-1">
            أضف مزرعتك وابدأ في إدارة عملياتك الزراعية
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
              <CardDescription>
                أدخل البيانات الأساسية للمزرعة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المزرعة *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مزرعة الأمل"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للمزرعة..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalArea">المساحة الإجمالية (م²) *</Label>
                <Input
                  id="totalArea"
                  type="number"
                  value={totalArea}
                  onChange={(e) => setTotalArea(e.target.value)}
                  placeholder="10000"
                  required
                />
                {totalArea && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {(parseFloat(totalArea) / 4200).toFixed(2)} فدان
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmType">نوع المزرعة</Label>
                <Select value={farmType} onValueChange={(value: any) => setFarmType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crop">محاصيل</SelectItem>
                    <SelectItem value="livestock">ثروة حيوانية</SelectItem>
                    <SelectItem value="mixed">مختلطة</SelectItem>
                    <SelectItem value="greenhouse">بيوت محمية</SelectItem>
                    <SelectItem value="organic">عضوية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-700" />
                معلومات الموقع
              </CardTitle>
              <CardDescription>
                حدد موقع المزرعة على الخريطة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="country">الدولة</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="اليمن"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">المحافظة/المنطقة</Label>
                <Input
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="صنعاء"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="سيتم ملؤه تلقائياً عند النقر على الخريطة"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label>الإحداثيات</Label>
                <Input
                  value={location}
                  placeholder="انقر على الخريطة لتحديد الموقع"
                  readOnly
                />
              </div>
            </CardContent>
          </Card>

          {/* Map */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>حدد موقع المزرعة على الخريطة</CardTitle>
              <CardDescription>
                انقر على الخريطة لتحديد موقع المزرعة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden border border-green-200">
                <MapView
                  onMapReady={handleMapReady}
                  initialCenter={{ lat: 15.5527, lng: 48.5164 }} // Yemen center
                  initialZoom={7}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="lg:col-span-2 flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/dashboard")}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="bg-green-700 hover:bg-green-800"
              disabled={createFarmMutation.isPending}
            >
              {createFarmMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  حفظ المزرعة
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

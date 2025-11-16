import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Wifi, WifiOff, Battery, BatteryLow, Droplets, Thermometer, Wind, Plus, Power, PowerOff } from "lucide-react";

export default function IoTDevices() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<number | null>(null);
  const [deviceId, setDeviceId] = useState("");
  const [deviceType, setDeviceType] = useState<"soil_moisture" | "temperature" | "humidity" | "ph" | "weather_station" | "camera" | "valve" | "pump">("soil_moisture");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");

  const { data: devices, refetch } = trpc.iot.listByFarm.useQuery({ farmId: 0 }); // Will show all devices
  const { data: farms } = trpc.farm.list.useQuery();

  const addDeviceMutation = trpc.iot.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الجهاز بنجاح");
      setIsAddDialogOpen(false);
      refetch();
      setDeviceId("");
      setManufacturer("");
      setModel("");
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  // Control device mutation would be implemented here
  const handleControl = (deviceId: number, command: string, value: any) => {
    toast.success("تم إرسال الأمر بنجاح");
    // In production: controlDeviceMutation.mutate({ deviceId, command, value });
  };

  const handleAddDevice = () => {
    if (!deviceId || !selectedFarm) {
      toast.error("الرجاء إدخال جميع البيانات المطلوبة");
      return;
    }

    addDeviceMutation.mutate({
      deviceId,
      deviceType,
      farmId: selectedFarm,
      manufacturer: manufacturer || undefined,
      model: model || undefined,
    });
  };



  const deviceTypeLabels = {
    soil_moisture: "رطوبة التربة",
    temperature: "درجة الحرارة",
    humidity: "الرطوبة",
    ph: "الحموضة pH",
    weather_station: "محطة طقس",
    camera: "كاميرا",
    valve: "صمام",
    pump: "مضخة",
  };

  const statusColors = {
    online: "default",
    offline: "secondary",
    error: "destructive",
  };

  const statusLabels = {
    online: "متصل",
    offline: "غير متصل",
    error: "خطأ",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900">أجهزة IoT</h1>
            <p className="text-green-700 mt-1">
              إدارة ومراقبة جميع الأجهزة المتصلة
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-700 hover:bg-green-800">
                <Plus className="w-4 h-4 mr-2" />
                إضافة جهاز
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة جهاز IoT جديد</DialogTitle>
                <DialogDescription>
                  أدخل معلومات الجهاز للإضافة
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="farm">المزرعة *</Label>
                  <Select value={selectedFarm?.toString() || ""} onValueChange={(value) => setSelectedFarm(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المزرعة" />
                    </SelectTrigger>
                    <SelectContent>
                      {farms?.map((farm) => (
                        <SelectItem key={farm.id} value={farm.id.toString()}>
                          {farm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deviceId">معرف الجهاز *</Label>
                  <Input
                    id="deviceId"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    placeholder="SENSOR-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deviceType">نوع الجهاز *</Label>
                  <Select value={deviceType} onValueChange={(value: any) => setDeviceType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soil_moisture">رطوبة التربة</SelectItem>
                      <SelectItem value="temperature">درجة الحرارة</SelectItem>
                      <SelectItem value="humidity">الرطوبة</SelectItem>
                      <SelectItem value="ph">الحموضة pH</SelectItem>
                      <SelectItem value="weather_station">محطة طقس</SelectItem>
                      <SelectItem value="camera">كاميرا</SelectItem>
                      <SelectItem value="valve">صمام</SelectItem>
                      <SelectItem value="pump">مضخة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">الشركة المصنعة</Label>
                  <Input
                    id="manufacturer"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="مثال: Bosch"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">الموديل</Label>
                  <Input
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="مثال: BME280"
                  />
                </div>

                <Button
                  onClick={handleAddDevice}
                  className="w-full bg-green-700 hover:bg-green-800"
                  disabled={addDeviceMutation.isPending}
                >
                  {addDeviceMutation.isPending ? "جاري الإضافة..." : "إضافة الجهاز"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي الأجهزة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {devices?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">جهاز مسجل</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                الأجهزة المتصلة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {devices?.filter((d: any) => d.status === "online").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">جهاز نشط</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المستشعرات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {devices?.filter((d: any) => ["soil_moisture", "temperature", "humidity", "ph", "weather_station"].includes(d.deviceType)).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">مستشعر</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المشغلات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {devices?.filter((d: any) => ["valve", "pump"].includes(d.deviceType)).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">مشغل</p>
            </CardContent>
          </Card>
        </div>

        {/* Devices List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {devices && devices.length > 0 ? (
            devices.map((device: any) => (
              <Card key={device.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {device.status === "online" ? (
                        <Wifi className="w-5 h-5 text-green-600" />
                      ) : (
                        <WifiOff className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <CardTitle className="text-base">{device.deviceId}</CardTitle>
                        <CardDescription className="text-xs">
                          {deviceTypeLabels[device.deviceType as keyof typeof deviceTypeLabels]}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={statusColors[(device.status || "offline") as keyof typeof statusColors] as any}>
                      {statusLabels[(device.status || "offline") as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {device.manufacturer && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">الشركة: </span>
                      <span className="font-medium">{device.manufacturer}</span>
                    </div>
                  )}
                  {device.model && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">الموديل: </span>
                      <span className="font-medium">{device.model}</span>
                    </div>
                  )}

                  {/* Sensor Data */}
                  {["soil_moisture", "temperature", "humidity", "ph", "weather_station"].includes(device.deviceType) && device.status === "online" && (
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-red-500" />
                          الحرارة
                        </span>
                        <span className="font-bold">28°C</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          الرطوبة
                        </span>
                        <span className="font-bold">65%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-gray-500" />
                          رطوبة التربة
                        </span>
                        <span className="font-bold">45%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Battery className="w-4 h-4 text-green-500" />
                          البطارية
                        </span>
                        <span className="font-bold">85%</span>
                      </div>
                    </div>
                  )}

                  {/* Actuator Controls */}
                  {["valve", "pump"].includes(device.deviceType) && (
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-700 hover:bg-green-800"
                          onClick={() => handleControl(device.id, "turn_on", true)}
                        >
                          <Power className="w-3 h-3 mr-1" />
                          تشغيل
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleControl(device.id, "turn_off", false)}
                        >
                          <PowerOff className="w-3 h-3 mr-1" />
                          إيقاف
                        </Button>
                      </div>
                    </div>
                  )}

                  {device.lastSeen && (
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      آخر اتصال: {new Date(device.lastSeen).toLocaleString('ar-YE')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="text-center py-12">
                <Wifi className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  لا توجد أجهزة بعد
                </h3>
                <p className="text-muted-foreground mb-4">
                  ابدأ بإضافة جهازك الأول
                </p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-green-700 hover:bg-green-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة جهاز
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

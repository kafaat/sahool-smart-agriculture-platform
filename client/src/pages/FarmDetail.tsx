import { useRoute, useLocation, Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { MapPin, Edit, Trash2, Plus, Sprout, Droplets, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function FarmDetail() {
  const [, params] = useRoute("/farms/:id");
  const [, setLocation] = useLocation();
  const farmId = params?.id ? parseInt(params.id) : 0;

  const { data: farm, isLoading } = trpc.farm.getById.useQuery({ id: farmId });
  const { data: fields } = trpc.field.listByFarm.useQuery({ farmId });
  const { data: devices } = trpc.iot.listByFarm.useQuery({ farmId });
  const { data: weather } = trpc.weather.getByFarm.useQuery({ farmId, limit: 7 });

  const deleteFarmMutation = trpc.farm.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المزرعة بنجاح");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  const handleDelete = () => {
    if (confirm("هل أنت متأكد من حذف هذه المزرعة؟ سيتم حذف جميع الحقول والبيانات المرتبطة بها.")) {
      deleteFarmMutation.mutate({ id: farmId });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Sprout className="w-12 h-12 text-green-700 animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  if (!farm) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-700">المزرعة غير موجودة</h2>
          <Button className="mt-4" onClick={() => setLocation("/dashboard")}>
            العودة للوحة التحكم
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const farmTypeLabels = {
    crop: "محاصيل",
    livestock: "ثروة حيوانية",
    mixed: "مختلطة",
    greenhouse: "بيوت محمية",
    organic: "عضوية",
  };

  const statusLabels = {
    active: "نشط",
    inactive: "غير نشط",
    maintenance: "صيانة",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
              <Sprout className="w-8 h-8 text-green-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-green-900">{farm.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant={farm.status === "active" ? "default" : "secondary"} className="bg-green-100 text-green-800">
                  {statusLabels[farm.status || "active"]}
                </Badge>
                <Badge variant="outline">
                  {farmTypeLabels[farm.farmType || "crop"]}
                </Badge>
                {farm.region && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {farm.region}, {farm.country}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLocation(`/farms/${farmId}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              تعديل
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              حذف
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المساحة الإجمالية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {(farm.totalArea / 4200).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                فدان ({farm.totalArea.toLocaleString()} م²)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                عدد الحقول
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {fields?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                حقل مسجل
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                الأجهزة المربوطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {devices?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                جهاز IoT
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                حالة الطقس
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                {weather && weather[0] ? `${weather[0].temperature}°` : "--"}
              </div>
              <p className="text-xs text-muted-foreground">
                درجة الحرارة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="fields" className="space-y-4">
          <TabsList>
            <TabsTrigger value="fields">الحقول</TabsTrigger>
            <TabsTrigger value="devices">الأجهزة</TabsTrigger>
            <TabsTrigger value="weather">الطقس</TabsTrigger>
            <TabsTrigger value="info">معلومات</TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">حقول المزرعة</h3>
              <Link href={`/farms/${farmId}/fields/new`}>
                <Button className="bg-green-700 hover:bg-green-800">
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة حقل
                </Button>
              </Link>
            </div>

            {fields && fields.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {fields.map((field) => (
                  <Link key={field.id} href={`/fields/${field.id}`}>
                    <Card className="hover:shadow-lg hover:border-green-300 transition-all cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{field.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {(field.area / 4200).toFixed(2)} فدان
                            </CardDescription>
                          </div>
                          <Badge variant={field.status === "active" ? "default" : "secondary"}>
                            {field.status === "active" ? "نشط" : field.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          {field.cropType && (
                            <div className="flex items-center gap-2">
                              <Sprout className="w-4 h-4 text-green-600" />
                              <span>{field.cropType}</span>
                            </div>
                          )}
                          {field.soilType && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span>تربة: {field.soilType}</span>
                            </div>
                          )}
                          {field.irrigationType && (
                            <div className="flex items-center gap-2">
                              <Droplets className="w-4 h-4 text-blue-600" />
                              <span>{field.irrigationType}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Sprout className="w-16 h-16 text-green-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    لا توجد حقول بعد
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    ابدأ بإضافة حقلك الأول
                  </p>
                  <Link href={`/farms/${farmId}/fields/new`}>
                    <Button className="bg-green-700 hover:bg-green-800">
                      <Plus className="w-4 h-4 mr-2" />
                      إضافة حقل
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <h3 className="text-lg font-semibold">أجهزة IoT المربوطة</h3>
            {devices && devices.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {devices.map((device) => (
                  <Card key={device.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{device.deviceId}</CardTitle>
                          <CardDescription>{device.deviceType}</CardDescription>
                        </div>
                        <Badge variant={device.status === "online" ? "default" : "secondary"}>
                          {device.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-1">
                        {device.manufacturer && <p>الشركة: {device.manufacturer}</p>}
                        {device.model && <p>الموديل: {device.model}</p>}
                        {device.location && <p>الموقع: {device.location}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    لا توجد أجهزة مربوطة بهذه المزرعة
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="weather" className="space-y-4">
            <h3 className="text-lg font-semibold">بيانات الطقس (آخر 7 أيام)</h3>
            {weather && weather.length > 0 ? (
              <div className="grid gap-4">
                {weather.map((w, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(w.timestamp).toLocaleDateString('ar-YE', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div className="flex gap-6">
                          {w.temperature && (
                            <div className="text-center">
                              <p className="text-2xl font-bold">{w.temperature}°</p>
                              <p className="text-xs text-muted-foreground">الحرارة</p>
                            </div>
                          )}
                          {w.humidity && (
                            <div className="text-center">
                              <p className="text-2xl font-bold">{w.humidity}%</p>
                              <p className="text-xs text-muted-foreground">الرطوبة</p>
                            </div>
                          )}
                          {w.rainfall && (
                            <div className="text-center">
                              <p className="text-2xl font-bold">{w.rainfall}mm</p>
                              <p className="text-xs text-muted-foreground">الأمطار</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    لا توجد بيانات طقس متاحة
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>معلومات المزرعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {farm.description && (
                  <div>
                    <h4 className="font-semibold mb-2">الوصف</h4>
                    <p className="text-muted-foreground">{farm.description}</p>
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">الموقع</h4>
                    <p className="text-muted-foreground">
                      {farm.address || `${farm.region}, ${farm.country}`}
                    </p>
                    {farm.location && (
                      <p className="text-xs text-muted-foreground mt-1">
                        الإحداثيات: {farm.location}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">تاريخ الإنشاء</h4>
                    <p className="text-muted-foreground">
                      {new Date(farm.createdAt).toLocaleDateString('ar-YE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

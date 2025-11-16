import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Satellite, Cloud, MessageSquare, Database, Zap, CheckCircle2, XCircle, Settings } from "lucide-react";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  enabled: boolean;
  status: "connected" | "disconnected" | "error";
  apiKeyRequired: boolean;
  features: string[];
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "sentinel-hub",
      name: "Sentinel Hub",
      description: "صور الأقمار الصناعية وتحليل NDVI للحقول",
      icon: <Satellite className="w-6 h-6" />,
      category: "gis",
      enabled: true,
      status: "connected",
      apiKeyRequired: true,
      features: ["صور NDVI", "تحليل صحة النباتات", "خرائط حرارية", "تاريخ التغطية"],
    },
    {
      id: "openweathermap",
      name: "OpenWeatherMap",
      description: "بيانات الطقس الحالية والتنبؤات المستقبلية",
      icon: <Cloud className="w-6 h-6" />,
      category: "weather",
      enabled: true,
      status: "connected",
      apiKeyRequired: true,
      features: ["الطقس الحالي", "توقعات 7 أيام", "تنبيهات الطقس", "بيانات تاريخية"],
    },
    {
      id: "twilio",
      name: "Twilio",
      description: "إرسال الرسائل النصية والإشعارات عبر SMS",
      icon: <MessageSquare className="w-6 h-6" />,
      category: "communication",
      enabled: false,
      status: "disconnected",
      apiKeyRequired: true,
      features: ["رسائل SMS", "رسائل WhatsApp", "مكالمات صوتية", "تأكيد ثنائي"],
    },
    {
      id: "soil-database",
      name: "قاعدة بيانات التربة العالمية",
      description: "معلومات تفصيلية عن أنواع التربة والخصائص",
      icon: <Database className="w-6 h-6" />,
      category: "data",
      enabled: true,
      status: "connected",
      apiKeyRequired: false,
      features: ["تحليل التربة", "توصيات الأسمدة", "خرائط التربة", "بيانات pH"],
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "أتمتة العمليات والتكامل مع 5000+ تطبيق",
      icon: <Zap className="w-6 h-6" />,
      category: "automation",
      enabled: false,
      status: "disconnected",
      apiKeyRequired: true,
      features: ["أتمتة المهام", "تكامل التطبيقات", "سير العمل", "الإشعارات"],
    },
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [apiKey, setApiKey] = useState("");

  const categoryLabels: Record<string, string> = {
    gis: "نظم المعلومات الجغرافية",
    weather: "الطقس",
    communication: "الاتصالات",
    data: "البيانات",
    automation: "الأتمتة",
  };

  const handleToggleIntegration = (id: string) => {
    setIntegrations(
      integrations.map((integration) =>
        integration.id === id
          ? { ...integration, enabled: !integration.enabled }
          : integration
      )
    );
    const integration = integrations.find((i) => i.id === id);
    if (integration) {
      toast.success(
        integration.enabled
          ? `تم تعطيل ${integration.name}`
          : `تم تفعيل ${integration.name}`
      );
    }
  };

  const handleConfigureIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setApiKey("");
  };

  const handleSaveConfiguration = () => {
    if (selectedIntegration && apiKey) {
      setIntegrations(
        integrations.map((integration) =>
          integration.id === selectedIntegration.id
            ? { ...integration, status: "connected", enabled: true }
            : integration
        )
      );
      toast.success(`تم حفظ إعدادات ${selectedIntegration.name}`);
      setSelectedIntegration(null);
      setApiKey("");
    }
  };

  const handleTestConnection = () => {
    toast.success("تم اختبار الاتصال بنجاح!");
  };

  const enabledCount = integrations.filter((i) => i.enabled).length;
  const connectedCount = integrations.filter((i) => i.status === "connected").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-green-900">مركز التكاملات</h1>
          <p className="text-green-700 mt-1">
            إدارة التكاملات الخارجية وخدمات الطرف الثالث
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي التكاملات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{integrations.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                مفعّلة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{enabledCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                متصلة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{connectedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                غير متصلة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                {integrations.length - connectedCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integrations Grid */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="gis">GIS</TabsTrigger>
            <TabsTrigger value="weather">الطقس</TabsTrigger>
            <TabsTrigger value="communication">الاتصالات</TabsTrigger>
            <TabsTrigger value="data">البيانات</TabsTrigger>
            <TabsTrigger value="automation">الأتمتة</TabsTrigger>
          </TabsList>

          {["all", "gis", "weather", "communication", "data", "automation"].map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {integrations
                  .filter((i) => category === "all" || i.category === category)
                  .map((integration) => (
                    <Card key={integration.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                              {integration.icon}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{integration.name}</CardTitle>
                              <Badge variant="outline" className="mt-1">
                                {categoryLabels[integration.category]}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {integration.status === "connected" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>

                        <div className="space-y-2">
                          <Label className="text-xs font-medium">الميزات:</Label>
                          <div className="flex flex-wrap gap-1">
                            {integration.features.map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={integration.enabled}
                              onCheckedChange={() =>
                                handleToggleIntegration(integration.id)
                              }
                            />
                            <Label className="text-sm">
                              {integration.enabled ? "مفعّل" : "معطّل"}
                            </Label>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleConfigureIntegration(integration)}
                              >
                                <Settings className="w-4 h-4 mr-2" />
                                إعداد
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>إعداد {integration.name}</DialogTitle>
                                <DialogDescription>
                                  قم بإدخال معلومات الاتصال والمصادقة
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                {integration.apiKeyRequired && (
                                  <div className="space-y-2">
                                    <Label htmlFor="apiKey">مفتاح API</Label>
                                    <Input
                                      id="apiKey"
                                      type="password"
                                      placeholder="أدخل مفتاح API"
                                      value={apiKey}
                                      onChange={(e) => setApiKey(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      يمكنك الحصول على مفتاح API من لوحة تحكم {integration.name}
                                    </p>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <Label>الميزات المتاحة:</Label>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {integration.features.map((feature, index) => (
                                      <li key={index} className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  onClick={handleTestConnection}
                                  className="flex-1"
                                >
                                  اختبار الاتصال
                                </Button>
                                <Button
                                  onClick={handleSaveConfiguration}
                                  className="flex-1 bg-green-700 hover:bg-green-800"
                                  disabled={integration.apiKeyRequired && !apiKey}
                                >
                                  حفظ
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

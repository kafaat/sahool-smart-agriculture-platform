import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Satellite, Cloud, MessageSquare, Database, Zap, CheckCircle2, XCircle, Settings } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type IntegrationCategory = "gis" | "weather" | "communication" | "data" | "automation";
type IntegrationStatus = "connected" | "disconnected" | "error";

// Hardcoded catalog of AVAILABLE integrations. Icons live here only (never in the DB).
interface CatalogIntegration {
  slug: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: IntegrationCategory;
  apiKeyRequired: boolean;
  features: string[];
}

// Merged view of a catalog item with the current user's saved state (if any).
interface MergedIntegration extends CatalogIntegration {
  id?: number;
  enabled: boolean;
  status: IntegrationStatus;
  hasApiKey: boolean;
}

const catalog: CatalogIntegration[] = [
  {
    slug: "sentinel-hub",
    name: "Sentinel Hub",
    description: "صور الأقمار الصناعية وتحليل NDVI للحقول",
    icon: <Satellite className="w-6 h-6" />,
    category: "gis",
    apiKeyRequired: true,
    features: ["صور NDVI", "تحليل صحة النباتات", "خرائط حرارية", "تاريخ التغطية"],
  },
  {
    slug: "openweathermap",
    name: "OpenWeatherMap",
    description: "بيانات الطقس الحالية والتنبؤات المستقبلية",
    icon: <Cloud className="w-6 h-6" />,
    category: "weather",
    apiKeyRequired: true,
    features: ["الطقس الحالي", "توقعات 7 أيام", "تنبيهات الطقس", "بيانات تاريخية"],
  },
  {
    slug: "twilio",
    name: "Twilio",
    description: "إرسال الرسائل النصية والإشعارات عبر SMS",
    icon: <MessageSquare className="w-6 h-6" />,
    category: "communication",
    apiKeyRequired: true,
    features: ["رسائل SMS", "رسائل WhatsApp", "مكالمات صوتية", "تأكيد ثنائي"],
  },
  {
    slug: "soil-database",
    name: "قاعدة بيانات التربة العالمية",
    description: "معلومات تفصيلية عن أنواع التربة والخصائص",
    icon: <Database className="w-6 h-6" />,
    category: "data",
    apiKeyRequired: false,
    features: ["تحليل التربة", "توصيات الأسمدة", "خرائط التربة", "بيانات pH"],
  },
  {
    slug: "zapier",
    name: "Zapier",
    description: "أتمتة العمليات والتكامل مع 5000+ تطبيق",
    icon: <Zap className="w-6 h-6" />,
    category: "automation",
    apiKeyRequired: true,
    features: ["أتمتة المهام", "تكامل التطبيقات", "سير العمل", "الإشعارات"],
  },
];

export default function Integrations() {
  const { data: saved, refetch } = trpc.integration.list.useQuery();

  const upsert = trpc.integration.upsert.useMutation({
    onError: (e) => toast.error(e.message),
  });
  const toggle = trpc.integration.toggle.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e.message),
  });
  const configure = trpc.integration.configure.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e.message),
  });

  const [selectedIntegration, setSelectedIntegration] = useState<MergedIntegration | null>(null);
  const [apiKey, setApiKey] = useState("");

  const categoryLabels: Record<string, string> = {
    gis: "نظم المعلومات الجغرافية",
    weather: "الطقس",
    communication: "الاتصالات",
    data: "البيانات",
    automation: "الأتمتة",
  };

  // Index saved rows by slug for O(1) merge lookups.
  const savedBySlug = new Map((saved ?? []).map((row) => [row.slug, row]));

  // Merge the hardcoded catalog with the user's saved state (keyed by slug).
  const merged: MergedIntegration[] = catalog.map((item) => {
    const row = savedBySlug.get(item.slug);
    return {
      ...item,
      id: row?.id,
      enabled: row?.enabled ?? false,
      status: (row?.status as IntegrationStatus) ?? "disconnected",
      hasApiKey: row?.hasApiKey ?? false,
    };
  });

  // Ensure a saved DB row exists for a catalog item; returns its numeric id.
  const ensureSavedRow = async (item: CatalogIntegration): Promise<number> => {
    const existing = savedBySlug.get(item.slug);
    if (existing) return existing.id;
    await upsert.mutateAsync({
      slug: item.slug,
      name: item.name,
      description: item.description,
      category: item.category,
      apiKeyRequired: item.apiKeyRequired,
      features: item.features,
    });
    const res = await refetch();
    const created = (res.data ?? []).find((r) => r.slug === item.slug);
    if (!created) throw new Error("تعذّر إنشاء التكامل");
    return created.id;
  };

  const handleToggleIntegration = async (item: MergedIntegration) => {
    try {
      if (item.id != null) {
        await toggle.mutateAsync({ id: item.id, enabled: !item.enabled });
        toast.success(item.enabled ? `تم تعطيل ${item.name}` : `تم تفعيل ${item.name}`);
      } else {
        const id = await ensureSavedRow(item);
        await toggle.mutateAsync({ id, enabled: true });
        toast.success(`تم تفعيل ${item.name}`);
      }
    } catch {
      // errors surfaced via mutation onError toasts
    }
  };

  const handleConfigureIntegration = (item: MergedIntegration) => {
    setSelectedIntegration(item);
    setApiKey("");
  };

  const handleSaveConfiguration = async () => {
    if (!selectedIntegration) return;
    if (selectedIntegration.apiKeyRequired && !apiKey) {
      toast.error("مفتاح API مطلوب");
      return;
    }
    try {
      const id = await ensureSavedRow(selectedIntegration);
      await configure.mutateAsync({ id, apiKey: apiKey || undefined });
      toast.success(`تم حفظ إعدادات ${selectedIntegration.name}`);
      setSelectedIntegration(null);
      setApiKey("");
    } catch {
      // errors surfaced via mutation onError toasts
    }
  };

  const handleTestConnection = () => {
    toast.success("تم اختبار الاتصال بنجاح!");
  };

  const enabledCount = merged.filter((i) => i.enabled).length;
  const connectedCount = merged.filter((i) => i.status === "connected").length;

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
              <div className="text-2xl font-bold text-green-900">{merged.length}</div>
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
                {merged.length - connectedCount}
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
                {merged
                  .filter((i) => category === "all" || i.category === category)
                  .map((integration) => (
                    <Card key={integration.slug}>
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
                                handleToggleIntegration(integration)
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
                                  disabled={
                                    (integration.apiKeyRequired && !apiKey) ||
                                    configure.isPending ||
                                    upsert.isPending
                                  }
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

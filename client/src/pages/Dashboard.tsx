import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Sprout, MapPin, Droplets, TrendingUp, AlertCircle, Lightbulb, Plus } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: overview, isLoading } = trpc.dashboard.overview.useQuery();
  const { data: alerts } = trpc.alert.list.useQuery({ unreadOnly: true });
  const { data: recommendations } = trpc.recommendation.list.useQuery();

  const pendingRecommendations = recommendations?.filter(r => r.status === "pending") || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Sprout className="w-12 h-12 text-green-700 animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900">
              مرحباً، {user?.name || "المزارع"}
            </h1>
            <p className="text-green-700 mt-1">
              إليك نظرة عامة على مزارعك اليوم
            </p>
          </div>
          <Link href="/farms/new">
            <Button className="bg-green-700 hover:bg-green-800">
              <Plus className="w-4 h-4 mr-2" />
              إضافة مزرعة جديدة
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                إجمالي المزارع
              </CardTitle>
              <MapPin className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {overview?.totalFarms || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                مزرعة نشطة
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                المساحة الإجمالية
              </CardTitle>
              <Sprout className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {((overview?.totalArea || 0) / 4200).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                فدان ({overview?.totalArea || 0} م²)
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">
                التنبيهات
              </CardTitle>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">
                {overview?.unreadAlerts || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                تنبيه جديد
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                التوصيات
              </CardTitle>
              <Lightbulb className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {overview?.pendingRecommendations || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                توصية قيد الانتظار
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Farms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-700" />
                مزارعك
              </CardTitle>
              <CardDescription>
                آخر المزارع المضافة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overview?.farms && overview.farms.length > 0 ? (
                <div className="space-y-4">
                  {overview.farms.map((farm) => (
                    <Link key={farm.id} href={`/farms/${farm.id}`}>
                      <div className="flex items-center justify-between p-4 border border-green-100 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Sprout className="w-6 h-6 text-green-700" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-900">{farm.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {((farm.totalArea) / 4200).toFixed(1)} فدان • {farm.region || farm.country}
                            </p>
                          </div>
                        </div>
                        <Badge variant={farm.status === "active" ? "default" : "secondary"} className="bg-green-100 text-green-800">
                          {farm.status === "active" ? "نشط" : "غير نشط"}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sprout className="w-16 h-16 text-green-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    لا توجد مزارع بعد
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    ابدأ بإضافة مزرعتك الأولى
                  </p>
                  <Link href="/farms/new">
                    <Button className="bg-green-700 hover:bg-green-800">
                      <Plus className="w-4 h-4 mr-2" />
                      إضافة مزرعة
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-700" />
                التنبيهات الأخيرة
              </CardTitle>
              <CardDescription>
                تنبيهات تتطلب انتباهك
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts && alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 border border-amber-100 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.severity === "critical" ? "bg-red-500" :
                        alert.severity === "warning" ? "bg-amber-500" :
                        "bg-blue-500"
                      }`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alert.message.substring(0, 80)}...
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {alert.alertType}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    لا توجد تنبيهات جديدة
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-700" />
                التوصيات الذكية
              </CardTitle>
              <CardDescription>
                توصيات مبنية على الذكاء الاصطناعي لتحسين إنتاجيتك
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRecommendations.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {pendingRecommendations.slice(0, 4).map((rec) => (
                    <div key={rec.id} className="p-4 border border-purple-100 rounded-lg bg-purple-50/50">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {rec.recommendationType}
                        </Badge>
                        <Badge variant={
                          rec.priority === "high" ? "destructive" :
                          rec.priority === "medium" ? "default" :
                          "secondary"
                        } className="text-xs">
                          {rec.priority === "high" ? "عالية" : rec.priority === "medium" ? "متوسطة" : "منخفضة"}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-sm mb-2">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        {rec.description.substring(0, 100)}...
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          تطبيق
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          تجاهل
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lightbulb className="w-16 h-16 text-green-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    لا توجد توصيات جديدة في الوقت الحالي
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

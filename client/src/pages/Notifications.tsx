import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, CheckCheck, Droplets, Cloud, Bug, Wrench, FileText, AlertTriangle, Info, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

function formatRelativeTime(date: Date | string): string {
  const then = new Date(date).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));

  if (diffSec < 60) return "الآن";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `منذ ${diffHour} ساعة`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `منذ ${diffDay} يوم`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `منذ ${diffMonth} شهر`;
  const diffYear = Math.floor(diffMonth / 12);
  return `منذ ${diffYear} سنة`;
}

function isToday(date: Date | string): boolean {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function Notifications() {
  const { data, refetch } = trpc.notification.list.useQuery();
  const notifications = data ?? [];

  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e.message),
  });
  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.notification.delete.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e.message),
  });
  const clearAllMutation = trpc.notification.clearAll.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e.message),
  });

  const typeIcons: Record<string, React.ReactNode> = {
    irrigation: <Droplets className="w-4 h-4" />,
    weather: <Cloud className="w-4 h-4" />,
    disease: <Bug className="w-4 h-4" />,
    equipment: <Wrench className="w-4 h-4" />,
    report: <FileText className="w-4 h-4" />,
  };

  const typeLabels: Record<string, string> = {
    irrigation: "ري",
    weather: "طقس",
    disease: "مرض",
    equipment: "معدات",
    report: "تقرير",
  };

  const typeColors: Record<string, string> = {
    irrigation: "bg-blue-100 text-blue-800",
    weather: "bg-purple-100 text-purple-800",
    disease: "bg-red-100 text-red-800",
    equipment: "bg-amber-100 text-amber-800",
    report: "bg-green-100 text-green-800",
  };

  const priorityLabels: Record<string, string> = {
    high: "عالية",
    medium: "متوسطة",
    low: "منخفضة",
  };

  const priorityColors: Record<string, "destructive" | "default" | "secondary"> = {
    high: "destructive",
    medium: "default",
    low: "secondary",
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate({ id });
    toast.success("تم تحديد الإشعار كمقروء");
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
    toast.success("تم تحديد جميع الإشعارات كمقروءة");
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
    toast.success("تم حذف الإشعار");
  };

  const handleClearAll = () => {
    clearAllMutation.mutate();
    toast.success("تم حذف جميع الإشعارات");
  };

  const filterByType = (type: string) => {
    if (type === "all") return notifications;
    return notifications.filter((n) => n.type === type);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900">مركز الإشعارات</h1>
            <p className="text-green-700 mt-1">
              جميع التنبيهات والإشعارات في مكان واحد
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              تحديد الكل كمقروء
            </Button>
            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              <X className="w-4 h-4 mr-2" />
              حذف الكل
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{notifications.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                غير مقروءة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{unreadCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                أولوية عالية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">
                {notifications.filter((n) => n.priority === "high").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                اليوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {notifications.filter((n) => isToday(n.createdAt)).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              الكل ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="irrigation">
              ري ({filterByType("irrigation").length})
            </TabsTrigger>
            <TabsTrigger value="weather">
              طقس ({filterByType("weather").length})
            </TabsTrigger>
            <TabsTrigger value="disease">
              أمراض ({filterByType("disease").length})
            </TabsTrigger>
            <TabsTrigger value="equipment">
              معدات ({filterByType("equipment").length})
            </TabsTrigger>
            <TabsTrigger value="report">
              تقارير ({filterByType("report").length})
            </TabsTrigger>
          </TabsList>

          {["all", "irrigation", "weather", "disease", "equipment", "report"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="space-y-3">
              {filterByType(tabValue).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">لا توجد إشعارات</p>
                  </CardContent>
                </Card>
              ) : (
                filterByType(tabValue).map((notification) => (
                  <Card
                    key={notification.id}
                    className={!notification.isRead ? "border-l-4 border-l-green-600" : ""}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2 rounded-lg ${
                            typeColors[notification.type]
                          }`}
                        >
                          {typeIcons[notification.type]}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-green-900">
                                  {notification.title}
                                </h3>
                                {!notification.isRead && (
                                  <Badge variant="default" className="text-xs">
                                    جديد
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={priorityColors[notification.priority]}>
                                {priorityLabels[notification.priority]}
                              </Badge>
                              {!notification.isRead && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(notification.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <div
                                className={`px-2 py-0.5 rounded ${
                                  typeColors[notification.type]
                                }`}
                              >
                                {typeLabels[notification.type]}
                              </div>
                            </span>
                            <span>{formatRelativeTime(notification.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

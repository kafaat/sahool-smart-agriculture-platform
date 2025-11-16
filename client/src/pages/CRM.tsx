import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserPlus, Phone, Mail, MapPin, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function CRM() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - Customers
  const customers = [
    {
      id: 1,
      name: "أحمد محمد",
      email: "ahmed@example.com",
      phone: "+967 777 123 456",
      location: "صنعاء",
      farmsCount: 2,
      totalArea: 15,
      status: "active",
      lastContact: "منذ يومين",
      lifetimeValue: 45000,
    },
    {
      id: 2,
      name: "فاطمة حسن",
      email: "fatima@example.com",
      phone: "+967 777 234 567",
      location: "تعز",
      farmsCount: 3,
      totalArea: 25,
      status: "active",
      lastContact: "منذ أسبوع",
      lifetimeValue: 78000,
    },
    {
      id: 3,
      name: "شركة الزراعة الحديثة",
      email: "modern@agri.com",
      phone: "+967 777 345 678",
      location: "عدن",
      farmsCount: 15,
      totalArea: 200,
      status: "vip",
      lastContact: "منذ ساعة",
      lifetimeValue: 350000,
    },
  ];

  // Mock data - Activities
  const activities = [
    {
      id: 1,
      customer: "أحمد محمد",
      type: "call",
      description: "مكالمة هاتفية - استفسار عن نظام الري",
      date: "2024-01-20 10:30",
      status: "completed",
    },
    {
      id: 2,
      customer: "فاطمة حسن",
      type: "meeting",
      description: "اجتماع ميداني - زيارة المزرعة",
      date: "2024-01-22 14:00",
      status: "scheduled",
    },
    {
      id: 3,
      customer: "شركة الزراعة الحديثة",
      type: "email",
      description: "إرسال عرض سعر - نظام IoT متكامل",
      date: "2024-01-19 09:15",
      status: "completed",
    },
  ];

  // Mock data - Pipeline
  const pipelineDeals = [
    {
      id: 1,
      customer: "أحمد محمد",
      title: "نظام ري ذكي",
      value: 25000,
      stage: "proposal",
      probability: 60,
      expectedClose: "2024-02-15",
    },
    {
      id: 2,
      customer: "شركة الزراعة الحديثة",
      title: "نظام IoT متكامل",
      value: 150000,
      stage: "negotiation",
      probability: 80,
      expectedClose: "2024-02-01",
    },
    {
      id: 3,
      customer: "فاطمة حسن",
      title: "مستشعرات تربة",
      value: 15000,
      stage: "qualified",
      probability: 40,
      expectedClose: "2024-03-01",
    },
  ];

  const stageLabels: Record<string, string> = {
    lead: "عميل محتمل",
    qualified: "مؤهل",
    proposal: "عرض سعر",
    negotiation: "تفاوض",
    won: "تم الإغلاق",
    lost: "خسارة",
  };

  const stageColors: Record<string, "default" | "secondary" | "destructive"> = {
    lead: "secondary",
    qualified: "default",
    proposal: "default",
    negotiation: "default",
    won: "default",
    lost: "destructive",
  };

  const activityTypeLabels: Record<string, string> = {
    call: "مكالمة",
    meeting: "اجتماع",
    email: "بريد",
    task: "مهمة",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900">إدارة العملاء (CRM)</h1>
            <p className="text-green-700 mt-1">
              إدارة العلاقات مع العملاء والمزارعين
            </p>
          </div>
          <Button className="bg-green-700 hover:bg-green-800">
            <UserPlus className="w-4 h-4 mr-2" />
            إضافة عميل
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي العملاء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{customers.length}</div>
              <p className="text-xs text-muted-foreground">عميل نشط</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                الصفقات النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{pipelineDeals.length}</div>
              <p className="text-xs text-muted-foreground">صفقة قيد التنفيذ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                القيمة المتوقعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {pipelineDeals.reduce((sum, deal) => sum + deal.value, 0).toLocaleString()} ريال
              </div>
              <p className="text-xs text-muted-foreground">من الصفقات النشطة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                الأنشطة هذا الشهر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{activities.length}</div>
              <p className="text-xs text-muted-foreground">نشاط</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="customers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="customers">العملاء</TabsTrigger>
            <TabsTrigger value="pipeline">مسار المبيعات</TabsTrigger>
            <TabsTrigger value="activities">الأنشطة</TabsTrigger>
          </TabsList>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>قائمة العملاء</CardTitle>
                <CardDescription>جميع العملاء والمزارعين المسجلين</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="البحث عن عميل..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العميل</TableHead>
                      <TableHead>الموقع</TableHead>
                      <TableHead>المزارع</TableHead>
                      <TableHead>المساحة</TableHead>
                      <TableHead>القيمة الإجمالية</TableHead>
                      <TableHead>آخر تواصل</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {customer.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {customer.location}
                          </div>
                        </TableCell>
                        <TableCell>{customer.farmsCount}</TableCell>
                        <TableCell>{customer.totalArea} فدان</TableCell>
                        <TableCell className="font-medium">
                          {customer.lifetimeValue.toLocaleString()} ريال
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {customer.lastContact}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            عرض التفاصيل
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>مسار المبيعات</CardTitle>
                <CardDescription>الصفقات النشطة ومراحلها</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الصفقة</TableHead>
                      <TableHead>العميل</TableHead>
                      <TableHead>القيمة</TableHead>
                      <TableHead>المرحلة</TableHead>
                      <TableHead>احتمالية النجاح</TableHead>
                      <TableHead>الإغلاق المتوقع</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pipelineDeals.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium">{deal.title}</TableCell>
                        <TableCell>{deal.customer}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-muted-foreground" />
                            {deal.value.toLocaleString()} ريال
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stageColors[deal.stage]}>
                            {stageLabels[deal.stage]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-600"
                                style={{ width: `${deal.probability}%` }}
                              />
                            </div>
                            <span className="text-sm">{deal.probability}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {deal.expectedClose}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            تحديث
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>سجل الأنشطة</CardTitle>
                <CardDescription>جميع التفاعلات مع العملاء</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>النوع</TableHead>
                      <TableHead>العميل</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {activityTypeLabels[activity.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{activity.customer}</TableCell>
                        <TableCell>{activity.description}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {activity.date}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              activity.status === "completed" ? "default" : "secondary"
                            }
                          >
                            {activity.status === "completed" ? "مكتمل" : "مجدول"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

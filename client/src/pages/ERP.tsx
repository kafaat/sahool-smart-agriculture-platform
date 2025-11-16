import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, ShoppingCart, ClipboardList, Plus, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function ERP() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - Inventory
  const inventoryItems = [
    {
      id: 1,
      name: "سماد NPK 20-20-20",
      category: "أسمدة",
      quantity: 450,
      unit: "كجم",
      minStock: 200,
      price: 150,
      location: "مخزن A",
      status: "in_stock",
    },
    {
      id: 2,
      name: "بذور قمح محسنة",
      category: "بذور",
      quantity: 85,
      unit: "كجم",
      minStock: 100,
      price: 250,
      location: "مخزن B",
      status: "low_stock",
    },
    {
      id: 3,
      name: "مبيد حشري عضوي",
      category: "مبيدات",
      quantity: 15,
      unit: "لتر",
      minStock: 50,
      price: 320,
      location: "مخزن C",
      status: "critical",
    },
    {
      id: 4,
      name: "خراطيم ري بالتنقيط",
      category: "معدات",
      quantity: 2500,
      unit: "متر",
      minStock: 1000,
      price: 5,
      location: "مخزن A",
      status: "in_stock",
    },
  ];

  // Mock data - Procurement
  const purchaseOrders = [
    {
      id: "PO-001",
      supplier: "شركة الأسمدة الحديثة",
      items: "سماد NPK، سماد عضوي",
      totalAmount: 45000,
      status: "pending",
      orderDate: "2024-01-18",
      expectedDelivery: "2024-01-25",
    },
    {
      id: "PO-002",
      supplier: "مؤسسة البذور المحسنة",
      items: "بذور قمح، بذور ذرة",
      totalAmount: 28000,
      status: "approved",
      orderDate: "2024-01-15",
      expectedDelivery: "2024-01-22",
    },
    {
      id: "PO-003",
      supplier: "شركة المعدات الزراعية",
      items: "خراطيم ري، رشاشات",
      totalAmount: 62000,
      status: "delivered",
      orderDate: "2024-01-10",
      expectedDelivery: "2024-01-20",
    },
  ];

  // Mock data - Work Orders
  const workOrders = [
    {
      id: "WO-001",
      field: "حقل القمح الشمالي",
      task: "حراثة وتسوية",
      assignedTo: "فريق الميكنة",
      status: "in_progress",
      priority: "high",
      startDate: "2024-01-20",
      dueDate: "2024-01-22",
      progress: 60,
    },
    {
      id: "WO-002",
      field: "حقل الذرة الجنوبي",
      task: "تسميد عضوي",
      assignedTo: "فريق الأسمدة",
      status: "scheduled",
      priority: "medium",
      startDate: "2024-01-23",
      dueDate: "2024-01-24",
      progress: 0,
    },
    {
      id: "WO-003",
      field: "حقل الخضروات",
      task: "رش مبيدات عضوية",
      assignedTo: "فريق الحماية",
      status: "completed",
      priority: "high",
      startDate: "2024-01-18",
      dueDate: "2024-01-19",
      progress: 100,
    },
  ];

  const statusLabels: Record<string, string> = {
    in_stock: "متوفر",
    low_stock: "مخزون منخفض",
    critical: "حرج",
    pending: "قيد الانتظار",
    approved: "معتمد",
    delivered: "تم التسليم",
    in_progress: "قيد التنفيذ",
    scheduled: "مجدول",
    completed: "مكتمل",
  };

  const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
    in_stock: "default",
    low_stock: "secondary",
    critical: "destructive",
    pending: "secondary",
    approved: "default",
    delivered: "default",
    in_progress: "default",
    scheduled: "secondary",
    completed: "default",
  };

  const priorityLabels: Record<string, string> = {
    low: "منخفضة",
    medium: "متوسطة",
    high: "عالية",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900">نظام ERP</h1>
            <p className="text-green-700 mt-1">
              إدارة المخزون والمشتريات وأوامر العمل
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي المخزون
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{inventoryItems.length}</div>
              <p className="text-xs text-muted-foreground">صنف</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                مخزون منخفض
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                {inventoryItems.filter((i) => i.status !== "in_stock").length}
              </div>
              <p className="text-xs text-muted-foreground">صنف يحتاج تجديد</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                طلبات الشراء النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {purchaseOrders.filter((p) => p.status !== "delivered").length}
              </div>
              <p className="text-xs text-muted-foreground">طلب</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                أوامر العمل النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {workOrders.filter((w) => w.status !== "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">أمر عمل</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">المخزون</TabsTrigger>
            <TabsTrigger value="procurement">المشتريات</TabsTrigger>
            <TabsTrigger value="workorders">أوامر العمل</TabsTrigger>
          </TabsList>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>إدارة المخزون</CardTitle>
                    <CardDescription>جميع الأصناف والمواد</CardDescription>
                  </div>
                  <Button className="bg-green-700 hover:bg-green-800">
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة صنف
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="البحث عن صنف..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الصنف</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>الحد الأدنى</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>الموقع</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {item.quantity < item.minStock ? (
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                            ) : null}
                            {item.quantity} {item.unit}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.minStock} {item.unit}
                        </TableCell>
                        <TableCell>{item.price} ريال</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[item.status]}>
                            {statusLabels[item.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            تعديل
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Procurement Tab */}
          <TabsContent value="procurement" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>طلبات الشراء</CardTitle>
                    <CardDescription>جميع طلبات الشراء من الموردين</CardDescription>
                  </div>
                  <Button className="bg-green-700 hover:bg-green-800">
                    <Plus className="w-4 h-4 mr-2" />
                    طلب شراء جديد
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الطلب</TableHead>
                      <TableHead>المورد</TableHead>
                      <TableHead>الأصناف</TableHead>
                      <TableHead>المبلغ الإجمالي</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>تاريخ الطلب</TableHead>
                      <TableHead>التسليم المتوقع</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.supplier}</TableCell>
                        <TableCell className="text-sm">{order.items}</TableCell>
                        <TableCell className="font-medium">
                          {order.totalAmount.toLocaleString()} ريال
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[order.status]}>
                            {statusLabels[order.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {order.orderDate}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {order.expectedDelivery}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            عرض
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Orders Tab */}
          <TabsContent value="workorders" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>أوامر العمل الحقلية</CardTitle>
                    <CardDescription>جميع المهام والأعمال الحقلية</CardDescription>
                  </div>
                  <Button className="bg-green-700 hover:bg-green-800">
                    <Plus className="w-4 h-4 mr-2" />
                    أمر عمل جديد
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الأمر</TableHead>
                      <TableHead>الحقل</TableHead>
                      <TableHead>المهمة</TableHead>
                      <TableHead>المسؤول</TableHead>
                      <TableHead>الأولوية</TableHead>
                      <TableHead>التقدم</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.field}</TableCell>
                        <TableCell>{order.task}</TableCell>
                        <TableCell className="text-sm">{order.assignedTo}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.priority === "high" ? "destructive" : "secondary"
                            }
                          >
                            {priorityLabels[order.priority]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-600"
                                style={{ width: `${order.progress}%` }}
                              />
                            </div>
                            <span className="text-sm">{order.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[order.status]}>
                            {statusLabels[order.status]}
                          </Badge>
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

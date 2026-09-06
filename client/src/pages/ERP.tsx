import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, ShoppingCart, ClipboardList, Plus, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type InventoryStatus = "in_stock" | "low_stock" | "critical";
type POStatus = "pending" | "approved" | "delivered" | "cancelled";
type WOStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
type Priority = "low" | "medium" | "high";

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("ar-YE");
}

function toDateOrUndefined(v: string): Date | undefined {
  return v ? new Date(v) : undefined;
}

export default function ERP() {
  const [searchQuery, setSearchQuery] = useState("");

  // --- Data queries (default undefined -> []) ---
  const { data: inventoryData, refetch: refetchInventory } = trpc.erp.listInventory.useQuery();
  const { data: purchaseOrdersData, refetch: refetchPurchaseOrders } = trpc.erp.listPurchaseOrders.useQuery();
  const { data: workOrdersData, refetch: refetchWorkOrders } = trpc.erp.listWorkOrders.useQuery();

  const inventoryItems = inventoryData ?? [];
  const purchaseOrders = purchaseOrdersData ?? [];
  const workOrders = workOrdersData ?? [];

  // ==========================================================================
  // Inventory create/edit state
  // ==========================================================================
  const [isInvDialogOpen, setIsInvDialogOpen] = useState(false);
  const [invName, setInvName] = useState("");
  const [invCategory, setInvCategory] = useState("");
  const [invQuantity, setInvQuantity] = useState("");
  const [invUnit, setInvUnit] = useState("");
  const [invMinStock, setInvMinStock] = useState("");
  const [invPrice, setInvPrice] = useState("");
  const [invLocation, setInvLocation] = useState("");
  const [invStatus, setInvStatus] = useState<InventoryStatus>("in_stock");

  const [editInv, setEditInv] = useState<{
    id: number;
    name: string;
    category: string;
    quantity: string;
    unit: string;
    minStock: string;
    price: string;
    location: string;
    status: InventoryStatus;
  } | null>(null);

  const createInventory = trpc.erp.createInventory.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الصنف بنجاح");
      setIsInvDialogOpen(false);
      setInvName("");
      setInvCategory("");
      setInvQuantity("");
      setInvUnit("");
      setInvMinStock("");
      setInvPrice("");
      setInvLocation("");
      setInvStatus("in_stock");
      refetchInventory();
    },
    onError: (e) => toast.error(`خطأ: ${e.message}`),
  });

  const updateInventory = trpc.erp.updateInventory.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الصنف بنجاح");
      setEditInv(null);
      refetchInventory();
    },
    onError: (e) => toast.error(`خطأ: ${e.message}`),
  });

  const deleteInventory = trpc.erp.deleteInventory.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الصنف");
      refetchInventory();
    },
    onError: (e) => toast.error(`خطأ: ${e.message}`),
  });

  const handleCreateInventory = () => {
    if (!invName) {
      toast.error("الرجاء إدخال اسم الصنف");
      return;
    }
    createInventory.mutate({
      name: invName,
      category: invCategory || undefined,
      quantity: Number(invQuantity) || 0,
      unit: invUnit || undefined,
      minStock: Number(invMinStock) || 0,
      price: Number(invPrice) || 0,
      location: invLocation || undefined,
      status: invStatus,
    });
  };

  const handleUpdateInventory = () => {
    if (!editInv) return;
    updateInventory.mutate({
      id: editInv.id,
      name: editInv.name || undefined,
      category: editInv.category || undefined,
      quantity: Number(editInv.quantity) || 0,
      unit: editInv.unit || undefined,
      minStock: Number(editInv.minStock) || 0,
      price: Number(editInv.price) || 0,
      location: editInv.location || undefined,
      status: editInv.status,
    });
  };

  // ==========================================================================
  // Purchase order create/edit state
  // ==========================================================================
  const [isPoDialogOpen, setIsPoDialogOpen] = useState(false);
  const [poCode, setPoCode] = useState("");
  const [poSupplier, setPoSupplier] = useState("");
  const [poItems, setPoItems] = useState("");
  const [poTotalAmount, setPoTotalAmount] = useState("");
  const [poStatus, setPoStatus] = useState<POStatus>("pending");
  const [poOrderDate, setPoOrderDate] = useState("");
  const [poExpectedDelivery, setPoExpectedDelivery] = useState("");

  const [editPo, setEditPo] = useState<{
    id: number;
    supplier: string;
    items: string;
    totalAmount: string;
    status: POStatus;
    orderDate: string;
    expectedDelivery: string;
  } | null>(null);

  const createPurchaseOrder = trpc.erp.createPurchaseOrder.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء طلب الشراء بنجاح");
      setIsPoDialogOpen(false);
      setPoCode("");
      setPoSupplier("");
      setPoItems("");
      setPoTotalAmount("");
      setPoStatus("pending");
      setPoOrderDate("");
      setPoExpectedDelivery("");
      refetchPurchaseOrders();
    },
    onError: (e) => toast.error(`خطأ: ${e.message}`),
  });

  const updatePurchaseOrder = trpc.erp.updatePurchaseOrder.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث طلب الشراء بنجاح");
      setEditPo(null);
      refetchPurchaseOrders();
    },
    onError: (e) => toast.error(`خطأ: ${e.message}`),
  });

  const deletePurchaseOrder = trpc.erp.deletePurchaseOrder.useMutation({
    onSuccess: () => {
      toast.success("تم حذف طلب الشراء");
      refetchPurchaseOrders();
    },
    onError: (e) => toast.error(`خطأ: ${e.message}`),
  });

  const handleCreatePurchaseOrder = () => {
    createPurchaseOrder.mutate({
      code: poCode || `PO-${Date.now()}`,
      supplier: poSupplier || undefined,
      items: poItems || undefined,
      totalAmount: Number(poTotalAmount) || 0,
      status: poStatus,
      orderDate: toDateOrUndefined(poOrderDate),
      expectedDelivery: toDateOrUndefined(poExpectedDelivery),
    });
  };

  const handleUpdatePurchaseOrder = () => {
    if (!editPo) return;
    updatePurchaseOrder.mutate({
      id: editPo.id,
      supplier: editPo.supplier || undefined,
      items: editPo.items || undefined,
      totalAmount: Number(editPo.totalAmount) || 0,
      status: editPo.status,
      orderDate: toDateOrUndefined(editPo.orderDate),
      expectedDelivery: toDateOrUndefined(editPo.expectedDelivery),
    });
  };

  // ==========================================================================
  // Work order create/edit state
  // ==========================================================================
  const [isWoDialogOpen, setIsWoDialogOpen] = useState(false);
  const [woCode, setWoCode] = useState("");
  const [woField, setWoField] = useState("");
  const [woTask, setWoTask] = useState("");
  const [woAssignedTo, setWoAssignedTo] = useState("");
  const [woStatus, setWoStatus] = useState<WOStatus>("scheduled");
  const [woPriority, setWoPriority] = useState<Priority>("medium");
  const [woStartDate, setWoStartDate] = useState("");
  const [woDueDate, setWoDueDate] = useState("");
  const [woProgress, setWoProgress] = useState("");

  const [editWo, setEditWo] = useState<{
    id: number;
    field: string;
    task: string;
    assignedTo: string;
    status: WOStatus;
    priority: Priority;
    startDate: string;
    dueDate: string;
    progress: string;
  } | null>(null);

  const createWorkOrder = trpc.erp.createWorkOrder.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء أمر العمل بنجاح");
      setIsWoDialogOpen(false);
      setWoCode("");
      setWoField("");
      setWoTask("");
      setWoAssignedTo("");
      setWoStatus("scheduled");
      setWoPriority("medium");
      setWoStartDate("");
      setWoDueDate("");
      setWoProgress("");
      refetchWorkOrders();
    },
    onError: (e) => toast.error(`خطأ: ${e.message}`),
  });

  const updateWorkOrder = trpc.erp.updateWorkOrder.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث أمر العمل بنجاح");
      setEditWo(null);
      refetchWorkOrders();
    },
    onError: (e) => toast.error(`خطأ: ${e.message}`),
  });

  const deleteWorkOrder = trpc.erp.deleteWorkOrder.useMutation({
    onSuccess: () => {
      toast.success("تم حذف أمر العمل");
      refetchWorkOrders();
    },
    onError: (e) => toast.error(`خطأ: ${e.message}`),
  });

  const handleCreateWorkOrder = () => {
    createWorkOrder.mutate({
      code: woCode || `WO-${Date.now()}`,
      field: woField || undefined,
      task: woTask || undefined,
      assignedTo: woAssignedTo || undefined,
      status: woStatus,
      priority: woPriority,
      startDate: toDateOrUndefined(woStartDate),
      dueDate: toDateOrUndefined(woDueDate),
      progress: Number(woProgress) || 0,
    });
  };

  const handleUpdateWorkOrder = () => {
    if (!editWo) return;
    updateWorkOrder.mutate({
      id: editWo.id,
      field: editWo.field || undefined,
      task: editWo.task || undefined,
      assignedTo: editWo.assignedTo || undefined,
      status: editWo.status,
      priority: editWo.priority,
      startDate: toDateOrUndefined(editWo.startDate),
      dueDate: toDateOrUndefined(editWo.dueDate),
      progress: Number(editWo.progress) || 0,
    });
  };

  // ==========================================================================
  // Enum label / color maps (kept intact)
  // ==========================================================================
  const statusLabels: Record<string, string> = {
    in_stock: "متوفر",
    low_stock: "مخزون منخفض",
    critical: "حرج",
    pending: "قيد الانتظار",
    approved: "معتمد",
    delivered: "تم التسليم",
    cancelled: "ملغي",
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
    cancelled: "destructive",
    in_progress: "default",
    scheduled: "secondary",
    completed: "default",
  };

  const priorityLabels: Record<string, string> = {
    low: "منخفضة",
    medium: "متوسطة",
    high: "عالية",
  };

  const filteredInventory = inventoryItems.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.category ?? "").toLowerCase().includes(q)
    );
  });

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
                  <Dialog open={isInvDialogOpen} onOpenChange={setIsInvDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-700 hover:bg-green-800">
                        <Plus className="w-4 h-4 mr-2" />
                        إضافة صنف
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>إضافة صنف جديد</DialogTitle>
                        <DialogDescription>أدخل بيانات الصنف للإضافة</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="invName">اسم الصنف *</Label>
                          <Input id="invName" value={invName} onChange={(e) => setInvName(e.target.value)} placeholder="مثال: سماد NPK" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="invCategory">الفئة</Label>
                            <Input id="invCategory" value={invCategory} onChange={(e) => setInvCategory(e.target.value)} placeholder="أسمدة" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="invUnit">الوحدة</Label>
                            <Input id="invUnit" value={invUnit} onChange={(e) => setInvUnit(e.target.value)} placeholder="كجم" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="invQuantity">الكمية</Label>
                            <Input id="invQuantity" type="number" value={invQuantity} onChange={(e) => setInvQuantity(e.target.value)} placeholder="0" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="invMinStock">الحد الأدنى</Label>
                            <Input id="invMinStock" type="number" value={invMinStock} onChange={(e) => setInvMinStock(e.target.value)} placeholder="0" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="invPrice">السعر (ريال)</Label>
                            <Input id="invPrice" type="number" value={invPrice} onChange={(e) => setInvPrice(e.target.value)} placeholder="0" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="invLocation">الموقع</Label>
                            <Input id="invLocation" value={invLocation} onChange={(e) => setInvLocation(e.target.value)} placeholder="مخزن A" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="invStatus">الحالة</Label>
                          <Select value={invStatus} onValueChange={(v: InventoryStatus) => setInvStatus(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="in_stock">متوفر</SelectItem>
                              <SelectItem value="low_stock">مخزون منخفض</SelectItem>
                              <SelectItem value="critical">حرج</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={handleCreateInventory}
                          className="w-full bg-green-700 hover:bg-green-800"
                          disabled={createInventory.isPending}
                        >
                          {createInventory.isPending ? "جاري الإضافة..." : "إضافة الصنف"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
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
                    {filteredInventory.map((item) => (
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
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setEditInv({
                                  id: item.id,
                                  name: item.name,
                                  category: item.category ?? "",
                                  quantity: String(item.quantity),
                                  unit: item.unit ?? "",
                                  minStock: String(item.minStock),
                                  price: String(item.price),
                                  location: item.location ?? "",
                                  status: item.status,
                                })
                              }
                            >
                              تعديل
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteInventory.mutate({ id: item.id })}
                            >
                              حذف
                            </Button>
                          </div>
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
                  <Dialog open={isPoDialogOpen} onOpenChange={setIsPoDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-700 hover:bg-green-800">
                        <Plus className="w-4 h-4 mr-2" />
                        طلب شراء جديد
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>طلب شراء جديد</DialogTitle>
                        <DialogDescription>أدخل بيانات طلب الشراء</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="poCode">رقم الطلب</Label>
                          <Input id="poCode" value={poCode} onChange={(e) => setPoCode(e.target.value)} placeholder="يُنشأ تلقائياً إن ترك فارغاً" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="poSupplier">المورد</Label>
                          <Input id="poSupplier" value={poSupplier} onChange={(e) => setPoSupplier(e.target.value)} placeholder="اسم المورد" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="poItems">الأصناف</Label>
                          <Input id="poItems" value={poItems} onChange={(e) => setPoItems(e.target.value)} placeholder="سماد NPK، سماد عضوي" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="poTotalAmount">المبلغ الإجمالي (ريال)</Label>
                          <Input id="poTotalAmount" type="number" value={poTotalAmount} onChange={(e) => setPoTotalAmount(e.target.value)} placeholder="0" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="poStatus">الحالة</Label>
                          <Select value={poStatus} onValueChange={(v: POStatus) => setPoStatus(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">قيد الانتظار</SelectItem>
                              <SelectItem value="approved">معتمد</SelectItem>
                              <SelectItem value="delivered">تم التسليم</SelectItem>
                              <SelectItem value="cancelled">ملغي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="poOrderDate">تاريخ الطلب</Label>
                            <Input id="poOrderDate" type="date" value={poOrderDate} onChange={(e) => setPoOrderDate(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="poExpectedDelivery">التسليم المتوقع</Label>
                            <Input id="poExpectedDelivery" type="date" value={poExpectedDelivery} onChange={(e) => setPoExpectedDelivery(e.target.value)} />
                          </div>
                        </div>
                        <Button
                          onClick={handleCreatePurchaseOrder}
                          className="w-full bg-green-700 hover:bg-green-800"
                          disabled={createPurchaseOrder.isPending}
                        >
                          {createPurchaseOrder.isPending ? "جاري الإنشاء..." : "إنشاء الطلب"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
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
                        <TableCell className="font-medium">{order.code}</TableCell>
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
                          {formatDate(order.orderDate)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(order.expectedDelivery)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setEditPo({
                                  id: order.id,
                                  supplier: order.supplier ?? "",
                                  items: order.items ?? "",
                                  totalAmount: String(order.totalAmount),
                                  status: order.status,
                                  orderDate: order.orderDate ? new Date(order.orderDate).toISOString().slice(0, 10) : "",
                                  expectedDelivery: order.expectedDelivery ? new Date(order.expectedDelivery).toISOString().slice(0, 10) : "",
                                })
                              }
                            >
                              تعديل
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deletePurchaseOrder.mutate({ id: order.id })}
                            >
                              حذف
                            </Button>
                          </div>
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
                  <Dialog open={isWoDialogOpen} onOpenChange={setIsWoDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-700 hover:bg-green-800">
                        <Plus className="w-4 h-4 mr-2" />
                        أمر عمل جديد
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>أمر عمل جديد</DialogTitle>
                        <DialogDescription>أدخل بيانات أمر العمل</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="woCode">رقم الأمر</Label>
                          <Input id="woCode" value={woCode} onChange={(e) => setWoCode(e.target.value)} placeholder="يُنشأ تلقائياً إن ترك فارغاً" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="woField">الحقل</Label>
                            <Input id="woField" value={woField} onChange={(e) => setWoField(e.target.value)} placeholder="حقل القمح الشمالي" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="woTask">المهمة</Label>
                            <Input id="woTask" value={woTask} onChange={(e) => setWoTask(e.target.value)} placeholder="حراثة وتسوية" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="woAssignedTo">المسؤول</Label>
                          <Input id="woAssignedTo" value={woAssignedTo} onChange={(e) => setWoAssignedTo(e.target.value)} placeholder="فريق الميكنة" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="woStatus">الحالة</Label>
                            <Select value={woStatus} onValueChange={(v: WOStatus) => setWoStatus(v)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="scheduled">مجدول</SelectItem>
                                <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                                <SelectItem value="completed">مكتمل</SelectItem>
                                <SelectItem value="cancelled">ملغي</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="woPriority">الأولوية</Label>
                            <Select value={woPriority} onValueChange={(v: Priority) => setWoPriority(v)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">منخفضة</SelectItem>
                                <SelectItem value="medium">متوسطة</SelectItem>
                                <SelectItem value="high">عالية</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="woStartDate">تاريخ البدء</Label>
                            <Input id="woStartDate" type="date" value={woStartDate} onChange={(e) => setWoStartDate(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="woDueDate">تاريخ الاستحقاق</Label>
                            <Input id="woDueDate" type="date" value={woDueDate} onChange={(e) => setWoDueDate(e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="woProgress">التقدم (%)</Label>
                          <Input id="woProgress" type="number" value={woProgress} onChange={(e) => setWoProgress(e.target.value)} placeholder="0" />
                        </div>
                        <Button
                          onClick={handleCreateWorkOrder}
                          className="w-full bg-green-700 hover:bg-green-800"
                          disabled={createWorkOrder.isPending}
                        >
                          {createWorkOrder.isPending ? "جاري الإنشاء..." : "إنشاء الأمر"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
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
                        <TableCell className="font-medium">{order.code}</TableCell>
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
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setEditWo({
                                  id: order.id,
                                  field: order.field ?? "",
                                  task: order.task ?? "",
                                  assignedTo: order.assignedTo ?? "",
                                  status: order.status,
                                  priority: order.priority,
                                  startDate: order.startDate ? new Date(order.startDate).toISOString().slice(0, 10) : "",
                                  dueDate: order.dueDate ? new Date(order.dueDate).toISOString().slice(0, 10) : "",
                                  progress: String(order.progress),
                                })
                              }
                            >
                              تحديث
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteWorkOrder.mutate({ id: order.id })}
                            >
                              حذف
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Inventory Edit Dialog */}
        <Dialog open={editInv !== null} onOpenChange={(open) => !open && setEditInv(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل الصنف</DialogTitle>
              <DialogDescription>تحديث بيانات الصنف</DialogDescription>
            </DialogHeader>
            {editInv && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editInvName">اسم الصنف *</Label>
                  <Input id="editInvName" value={editInv.name} onChange={(e) => setEditInv({ ...editInv, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editInvCategory">الفئة</Label>
                    <Input id="editInvCategory" value={editInv.category} onChange={(e) => setEditInv({ ...editInv, category: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editInvUnit">الوحدة</Label>
                    <Input id="editInvUnit" value={editInv.unit} onChange={(e) => setEditInv({ ...editInv, unit: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editInvQuantity">الكمية</Label>
                    <Input id="editInvQuantity" type="number" value={editInv.quantity} onChange={(e) => setEditInv({ ...editInv, quantity: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editInvMinStock">الحد الأدنى</Label>
                    <Input id="editInvMinStock" type="number" value={editInv.minStock} onChange={(e) => setEditInv({ ...editInv, minStock: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editInvPrice">السعر (ريال)</Label>
                    <Input id="editInvPrice" type="number" value={editInv.price} onChange={(e) => setEditInv({ ...editInv, price: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editInvLocation">الموقع</Label>
                    <Input id="editInvLocation" value={editInv.location} onChange={(e) => setEditInv({ ...editInv, location: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editInvStatus">الحالة</Label>
                  <Select value={editInv.status} onValueChange={(v: InventoryStatus) => setEditInv({ ...editInv, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">متوفر</SelectItem>
                      <SelectItem value="low_stock">مخزون منخفض</SelectItem>
                      <SelectItem value="critical">حرج</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleUpdateInventory} className="w-full bg-green-700 hover:bg-green-800" disabled={updateInventory.isPending}>
                  {updateInventory.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Purchase Order Edit Dialog */}
        <Dialog open={editPo !== null} onOpenChange={(open) => !open && setEditPo(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل طلب الشراء</DialogTitle>
              <DialogDescription>تحديث بيانات طلب الشراء</DialogDescription>
            </DialogHeader>
            {editPo && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editPoSupplier">المورد</Label>
                  <Input id="editPoSupplier" value={editPo.supplier} onChange={(e) => setEditPo({ ...editPo, supplier: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPoItems">الأصناف</Label>
                  <Input id="editPoItems" value={editPo.items} onChange={(e) => setEditPo({ ...editPo, items: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPoTotalAmount">المبلغ الإجمالي (ريال)</Label>
                  <Input id="editPoTotalAmount" type="number" value={editPo.totalAmount} onChange={(e) => setEditPo({ ...editPo, totalAmount: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPoStatus">الحالة</Label>
                  <Select value={editPo.status} onValueChange={(v: POStatus) => setEditPo({ ...editPo, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="approved">معتمد</SelectItem>
                      <SelectItem value="delivered">تم التسليم</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editPoOrderDate">تاريخ الطلب</Label>
                    <Input id="editPoOrderDate" type="date" value={editPo.orderDate} onChange={(e) => setEditPo({ ...editPo, orderDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editPoExpectedDelivery">التسليم المتوقع</Label>
                    <Input id="editPoExpectedDelivery" type="date" value={editPo.expectedDelivery} onChange={(e) => setEditPo({ ...editPo, expectedDelivery: e.target.value })} />
                  </div>
                </div>
                <Button onClick={handleUpdatePurchaseOrder} className="w-full bg-green-700 hover:bg-green-800" disabled={updatePurchaseOrder.isPending}>
                  {updatePurchaseOrder.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Work Order Edit Dialog */}
        <Dialog open={editWo !== null} onOpenChange={(open) => !open && setEditWo(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تحديث أمر العمل</DialogTitle>
              <DialogDescription>تحديث بيانات أمر العمل</DialogDescription>
            </DialogHeader>
            {editWo && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editWoField">الحقل</Label>
                    <Input id="editWoField" value={editWo.field} onChange={(e) => setEditWo({ ...editWo, field: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editWoTask">المهمة</Label>
                    <Input id="editWoTask" value={editWo.task} onChange={(e) => setEditWo({ ...editWo, task: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editWoAssignedTo">المسؤول</Label>
                  <Input id="editWoAssignedTo" value={editWo.assignedTo} onChange={(e) => setEditWo({ ...editWo, assignedTo: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editWoStatus">الحالة</Label>
                    <Select value={editWo.status} onValueChange={(v: WOStatus) => setEditWo({ ...editWo, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">مجدول</SelectItem>
                        <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                        <SelectItem value="completed">مكتمل</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editWoPriority">الأولوية</Label>
                    <Select value={editWo.priority} onValueChange={(v: Priority) => setEditWo({ ...editWo, priority: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">منخفضة</SelectItem>
                        <SelectItem value="medium">متوسطة</SelectItem>
                        <SelectItem value="high">عالية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editWoStartDate">تاريخ البدء</Label>
                    <Input id="editWoStartDate" type="date" value={editWo.startDate} onChange={(e) => setEditWo({ ...editWo, startDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editWoDueDate">تاريخ الاستحقاق</Label>
                    <Input id="editWoDueDate" type="date" value={editWo.dueDate} onChange={(e) => setEditWo({ ...editWo, dueDate: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editWoProgress">التقدم (%)</Label>
                  <Input id="editWoProgress" type="number" value={editWo.progress} onChange={(e) => setEditWo({ ...editWo, progress: e.target.value })} />
                </div>
                <Button onClick={handleUpdateWorkOrder} className="w-full bg-green-700 hover:bg-green-800" disabled={updateWorkOrder.isPending}>
                  {updateWorkOrder.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

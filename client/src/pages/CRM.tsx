import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserPlus, Phone, Mail, MapPin, TrendingUp, Calendar, DollarSign, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Stage = "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
type ActivityType = "call" | "meeting" | "email" | "task";
type ActivityStatus = "scheduled" | "completed" | "cancelled";
type CustomerStatus = "active" | "vip" | "inactive";

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("ar-YE");
}

export default function CRM() {
  const [searchQuery, setSearchQuery] = useState("");

  // --- Live data ---
  const { data: customersData, refetch: refetchCustomers } = trpc.crm.listCustomers.useQuery();
  const { data: activitiesData, refetch: refetchActivities } = trpc.crm.listActivities.useQuery();
  const { data: dealsData, refetch: refetchDeals } = trpc.crm.listDeals.useQuery();

  const customers = customersData ?? [];
  const activities = activitiesData ?? [];
  const pipelineDeals = dealsData ?? [];

  // --- Customer form ---
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");
  const [customerFarmsCount, setCustomerFarmsCount] = useState("0");
  const [customerTotalArea, setCustomerTotalArea] = useState("0");
  const [customerStatus, setCustomerStatus] = useState<CustomerStatus>("active");
  const [customerLifetimeValue, setCustomerLifetimeValue] = useState("0");

  const createCustomer = trpc.crm.createCustomer.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة العميل بنجاح");
      setIsCustomerDialogOpen(false);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setCustomerLocation("");
      setCustomerFarmsCount("0");
      setCustomerTotalArea("0");
      setCustomerStatus("active");
      setCustomerLifetimeValue("0");
      refetchCustomers();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteCustomer = trpc.crm.deleteCustomer.useMutation({
    onSuccess: () => {
      toast.success("تم حذف العميل");
      refetchCustomers();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleAddCustomer = () => {
    if (!customerName.trim()) {
      toast.error("الرجاء إدخال اسم العميل");
      return;
    }
    createCustomer.mutate({
      name: customerName.trim(),
      email: customerEmail || undefined,
      phone: customerPhone || undefined,
      location: customerLocation || undefined,
      farmsCount: parseInt(customerFarmsCount) || 0,
      totalArea: parseInt(customerTotalArea) || 0,
      status: customerStatus,
      lifetimeValue: parseInt(customerLifetimeValue) || 0,
    });
  };

  // --- Deal create form ---
  const [isDealDialogOpen, setIsDealDialogOpen] = useState(false);
  const [dealTitle, setDealTitle] = useState("");
  const [dealCustomerName, setDealCustomerName] = useState("");
  const [dealValue, setDealValue] = useState("0");
  const [dealStage, setDealStage] = useState<Stage>("lead");
  const [dealProbability, setDealProbability] = useState("0");

  const createDeal = trpc.crm.createDeal.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الصفقة بنجاح");
      setIsDealDialogOpen(false);
      setDealTitle("");
      setDealCustomerName("");
      setDealValue("0");
      setDealStage("lead");
      setDealProbability("0");
      refetchDeals();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleAddDeal = () => {
    if (!dealTitle.trim()) {
      toast.error("الرجاء إدخال عنوان الصفقة");
      return;
    }
    createDeal.mutate({
      title: dealTitle.trim(),
      customerName: dealCustomerName || undefined,
      value: parseInt(dealValue) || 0,
      stage: dealStage,
      probability: parseInt(dealProbability) || 0,
    });
  };

  // --- Deal update ---
  const [editDeal, setEditDeal] = useState<{ id: number; stage: Stage; probability: string } | null>(null);

  const updateDeal = trpc.crm.updateDeal.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الصفقة");
      setEditDeal(null);
      refetchDeals();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteDeal = trpc.crm.deleteDeal.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الصفقة");
      refetchDeals();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleUpdateDeal = () => {
    if (!editDeal) return;
    updateDeal.mutate({
      id: editDeal.id,
      stage: editDeal.stage,
      probability: parseInt(editDeal.probability) || 0,
    });
  };

  // --- Activity create form ---
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [activityCustomerName, setActivityCustomerName] = useState("");
  const [activityType, setActivityType] = useState<ActivityType>("call");
  const [activityDescription, setActivityDescription] = useState("");

  const createActivity = trpc.crm.createActivity.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة النشاط بنجاح");
      setIsActivityDialogOpen(false);
      setActivityCustomerName("");
      setActivityType("call");
      setActivityDescription("");
      refetchActivities();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateActivity = trpc.crm.updateActivity.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث النشاط");
      refetchActivities();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteActivity = trpc.crm.deleteActivity.useMutation({
    onSuccess: () => {
      toast.success("تم حذف النشاط");
      refetchActivities();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleAddActivity = () => {
    createActivity.mutate({
      customerName: activityCustomerName || undefined,
      type: activityType,
      description: activityDescription || undefined,
      date: new Date(),
      status: "scheduled",
    });
  };

  const toggleActivityStatus = (id: number, current: ActivityStatus) => {
    updateActivity.mutate({
      id,
      status: current === "completed" ? "scheduled" : "completed",
    });
  };

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

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Derived stats
  const activeDealsCount = pipelineDeals.filter(
    (d) => d.stage !== "won" && d.stage !== "lost"
  ).length;
  const expectedValue = pipelineDeals
    .filter((d) => d.stage !== "won" && d.stage !== "lost")
    .reduce((sum, deal) => sum + deal.value, 0);

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
          <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-700 hover:bg-green-800">
                <UserPlus className="w-4 h-4 mr-2" />
                إضافة عميل
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة عميل جديد</DialogTitle>
                <DialogDescription>أدخل معلومات العميل للإضافة</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">الاسم *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="اسم العميل"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">البريد الإلكتروني</Label>
                  <Input
                    id="customerEmail"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="example@mail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">الهاتف</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+967 777 000 000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerLocation">الموقع</Label>
                  <Input
                    id="customerLocation"
                    value={customerLocation}
                    onChange={(e) => setCustomerLocation(e.target.value)}
                    placeholder="المدينة"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerFarmsCount">عدد المزارع</Label>
                    <Input
                      id="customerFarmsCount"
                      type="number"
                      value={customerFarmsCount}
                      onChange={(e) => setCustomerFarmsCount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerTotalArea">المساحة (فدان)</Label>
                    <Input
                      id="customerTotalArea"
                      type="number"
                      value={customerTotalArea}
                      onChange={(e) => setCustomerTotalArea(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerStatus">الحالة</Label>
                    <Select value={customerStatus} onValueChange={(v: CustomerStatus) => setCustomerStatus(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="vip">مميز</SelectItem>
                        <SelectItem value="inactive">غير نشط</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerLifetimeValue">القيمة الإجمالية</Label>
                    <Input
                      id="customerLifetimeValue"
                      type="number"
                      value={customerLifetimeValue}
                      onChange={(e) => setCustomerLifetimeValue(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddCustomer}
                  className="w-full bg-green-700 hover:bg-green-800"
                  disabled={createCustomer.isPending}
                >
                  {createCustomer.isPending ? "جاري الإضافة..." : "إضافة العميل"}
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
              <div className="text-2xl font-bold text-blue-900">{activeDealsCount}</div>
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
                {expectedValue.toLocaleString()} ريال
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
                    {filteredCustomers.map((customer) => (
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
                          {formatDate(customer.lastContact)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              عرض التفاصيل
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteCustomer.mutate({ id: customer.id })}
                              disabled={deleteCustomer.isPending}
                            >
                              <Trash2 className="w-3 h-3" />
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

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>مسار المبيعات</CardTitle>
                    <CardDescription>الصفقات النشطة ومراحلها</CardDescription>
                  </div>
                  <Dialog open={isDealDialogOpen} onOpenChange={setIsDealDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-700 hover:bg-green-800">
                        <Plus className="w-4 h-4 mr-2" />
                        إضافة صفقة
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>إضافة صفقة جديدة</DialogTitle>
                        <DialogDescription>أدخل معلومات الصفقة</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="dealTitle">عنوان الصفقة *</Label>
                          <Input
                            id="dealTitle"
                            value={dealTitle}
                            onChange={(e) => setDealTitle(e.target.value)}
                            placeholder="مثال: نظام ري ذكي"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dealCustomerName">العميل</Label>
                          <Input
                            id="dealCustomerName"
                            value={dealCustomerName}
                            onChange={(e) => setDealCustomerName(e.target.value)}
                            placeholder="اسم العميل"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="dealValue">القيمة</Label>
                            <Input
                              id="dealValue"
                              type="number"
                              value={dealValue}
                              onChange={(e) => setDealValue(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dealProbability">احتمالية النجاح %</Label>
                            <Input
                              id="dealProbability"
                              type="number"
                              value={dealProbability}
                              onChange={(e) => setDealProbability(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dealStage">المرحلة</Label>
                          <Select value={dealStage} onValueChange={(v: Stage) => setDealStage(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(stageLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={handleAddDeal}
                          className="w-full bg-green-700 hover:bg-green-800"
                          disabled={createDeal.isPending}
                        >
                          {createDeal.isPending ? "جاري الإضافة..." : "إضافة الصفقة"}
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
                        <TableCell>{deal.customerName}</TableCell>
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
                          {formatDate(deal.expectedClose)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setEditDeal({
                                  id: deal.id,
                                  stage: deal.stage,
                                  probability: String(deal.probability),
                                })
                              }
                            >
                              تحديث
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteDeal.mutate({ id: deal.id })}
                              disabled={deleteDeal.isPending}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Update Deal Dialog */}
            <Dialog open={editDeal !== null} onOpenChange={(open) => !open && setEditDeal(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>تحديث الصفقة</DialogTitle>
                  <DialogDescription>تعديل مرحلة الصفقة واحتمالية النجاح</DialogDescription>
                </DialogHeader>
                {editDeal && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="editStage">المرحلة</Label>
                      <Select
                        value={editDeal.stage}
                        onValueChange={(v: Stage) => setEditDeal({ ...editDeal, stage: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(stageLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editProbability">احتمالية النجاح %</Label>
                      <Input
                        id="editProbability"
                        type="number"
                        value={editDeal.probability}
                        onChange={(e) => setEditDeal({ ...editDeal, probability: e.target.value })}
                      />
                    </div>
                    <Button
                      onClick={handleUpdateDeal}
                      className="w-full bg-green-700 hover:bg-green-800"
                      disabled={updateDeal.isPending}
                    >
                      {updateDeal.isPending ? "جاري التحديث..." : "حفظ التغييرات"}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>سجل الأنشطة</CardTitle>
                    <CardDescription>جميع التفاعلات مع العملاء</CardDescription>
                  </div>
                  <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-700 hover:bg-green-800">
                        <Plus className="w-4 h-4 mr-2" />
                        إضافة نشاط
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>إضافة نشاط جديد</DialogTitle>
                        <DialogDescription>سجل تفاعلاً مع عميل</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="activityCustomerName">العميل</Label>
                          <Input
                            id="activityCustomerName"
                            value={activityCustomerName}
                            onChange={(e) => setActivityCustomerName(e.target.value)}
                            placeholder="اسم العميل"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="activityType">النوع</Label>
                          <Select value={activityType} onValueChange={(v: ActivityType) => setActivityType(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(activityTypeLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="activityDescription">الوصف</Label>
                          <Textarea
                            id="activityDescription"
                            value={activityDescription}
                            onChange={(e) => setActivityDescription(e.target.value)}
                            placeholder="تفاصيل النشاط"
                          />
                        </div>
                        <Button
                          onClick={handleAddActivity}
                          className="w-full bg-green-700 hover:bg-green-800"
                          disabled={createActivity.isPending}
                        >
                          {createActivity.isPending ? "جاري الإضافة..." : "إضافة النشاط"}
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
                      <TableHead>النوع</TableHead>
                      <TableHead>العميل</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
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
                        <TableCell className="font-medium">{activity.customerName}</TableCell>
                        <TableCell>{activity.description}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(activity.date)}
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
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                toggleActivityStatus(activity.id, activity.status as ActivityStatus)
                              }
                              disabled={updateActivity.isPending}
                            >
                              {activity.status === "completed" ? "إعادة جدولة" : "إكمال"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteActivity.mutate({ id: activity.id })}
                              disabled={deleteActivity.isPending}
                            >
                              <Trash2 className="w-3 h-3" />
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
      </div>
    </DashboardLayout>
  );
}

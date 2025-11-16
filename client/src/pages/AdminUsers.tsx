import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserPlus, Search, MoreVertical, Shield, Ban, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  // Mock data
  const users = [
    {
      id: 1,
      name: "أحمد محمد علي",
      email: "ahmed@example.com",
      phone: "+967 777 123 456",
      role: "farmer_small",
      status: "active",
      farmsCount: 2,
      lastLogin: "منذ ساعتين",
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "فاطمة حسن",
      email: "fatima@example.com",
      phone: "+967 777 234 567",
      role: "farmer_medium",
      status: "active",
      farmsCount: 5,
      lastLogin: "منذ يوم",
      createdAt: "2024-01-10",
    },
    {
      id: 3,
      name: "شركة الزراعة الحديثة",
      email: "modern@agri.com",
      phone: "+967 777 345 678",
      role: "enterprise",
      status: "active",
      farmsCount: 25,
      lastLogin: "منذ 3 ساعات",
      createdAt: "2023-12-01",
    },
    {
      id: 4,
      name: "وزارة الزراعة - صنعاء",
      email: "gov@agriculture.gov.ye",
      phone: "+967 777 456 789",
      role: "government",
      status: "active",
      farmsCount: 0,
      lastLogin: "منذ أسبوع",
      createdAt: "2023-11-15",
    },
    {
      id: 5,
      name: "خالد عبدالله",
      email: "khaled@example.com",
      phone: "+967 777 567 890",
      role: "farmer_small",
      status: "suspended",
      farmsCount: 1,
      lastLogin: "منذ شهر",
      createdAt: "2024-01-05",
    },
  ];

  const roleLabels: Record<string, string> = {
    user: "مستخدم عادي",
    admin: "مدير النظام",
    farmer_small: "مزارع صغير",
    farmer_medium: "مزارع متوسط",
    enterprise: "شركة زراعية",
    government: "جهة حكومية",
  };

  const statusLabels: Record<string, string> = {
    active: "نشط",
    suspended: "موقوف",
    pending: "قيد المراجعة",
  };

  const statusColors: Record<string, "default" | "destructive" | "secondary"> = {
    active: "default",
    suspended: "destructive",
    pending: "secondary",
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    toast.success("تم إضافة المستخدم بنجاح");
    setIsAddDialogOpen(false);
  };

  const handleSuspendUser = (userId: number) => {
    toast.success("تم إيقاف المستخدم");
  };

  const handleActivateUser = (userId: number) => {
    toast.success("تم تفعيل المستخدم");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900">إدارة المستخدمين</h1>
            <p className="text-green-700 mt-1">
              إدارة حسابات المستخدمين والصلاحيات
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-700 hover:bg-green-800">
                <UserPlus className="w-4 h-4 mr-2" />
                إضافة مستخدم
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                <DialogDescription>
                  أدخل معلومات المستخدم الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل *</Label>
                  <Input id="name" placeholder="أحمد محمد" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <Input id="email" type="email" placeholder="ahmed@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input id="phone" placeholder="+967 777 123 456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">نوع المستخدم *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farmer_small">مزارع صغير</SelectItem>
                      <SelectItem value="farmer_medium">مزارع متوسط</SelectItem>
                      <SelectItem value="enterprise">شركة زراعية</SelectItem>
                      <SelectItem value="government">جهة حكومية</SelectItem>
                      <SelectItem value="admin">مدير النظام</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddUser}
                  className="w-full bg-green-700 hover:bg-green-800"
                >
                  إضافة المستخدم
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
                إجمالي المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{users.length}</div>
              <p className="text-xs text-muted-foreground">مستخدم مسجل</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المستخدمون النشطون
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {users.filter((u) => u.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">مستخدم نشط</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المزارعون
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {users.filter((u) => u.role.includes("farmer")).length}
              </div>
              <p className="text-xs text-muted-foreground">مزارع</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                الشركات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {users.filter((u) => u.role === "enterprise").length}
              </div>
              <p className="text-xs text-muted-foreground">شركة</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث بالاسم أو البريد الإلكتروني..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="تصفية حسب النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="farmer_small">مزارع صغير</SelectItem>
                  <SelectItem value="farmer_medium">مزارع متوسط</SelectItem>
                  <SelectItem value="enterprise">شركة زراعية</SelectItem>
                  <SelectItem value="government">جهة حكومية</SelectItem>
                  <SelectItem value="admin">مدير النظام</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة المستخدمين</CardTitle>
            <CardDescription>
              {filteredUsers.length} مستخدم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>المزارع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>آخر دخول</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground">{user.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{roleLabels[user.role]}</Badge>
                    </TableCell>
                    <TableCell>{user.farmsCount}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[user.status]}>
                        {statusLabels[user.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.lastLogin}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.status === "active" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSuspendUser(user.id)}
                          >
                            <Ban className="w-3 h-3 mr-1" />
                            إيقاف
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivateUser(user.id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            تفعيل
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Shield className="w-3 h-3 mr-1" />
                          الصلاحيات
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

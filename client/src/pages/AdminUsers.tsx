import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Search, Ban, CheckCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const ROLE_VALUES = ["user", "admin", "farmer_small", "farmer_medium", "enterprise", "government"] as const;
type RoleValue = (typeof ROLE_VALUES)[number];

export default function AdminUsers() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  const { data, refetch } = trpc.admin.listUsers.useQuery();
  const users = data ?? [];

  const updateStatus = trpc.admin.updateUserStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث صلاحية المستخدم");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

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

  const formatDate = (value: string | Date | null | undefined) => {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("ar", { year: "numeric", month: "short", day: "numeric" });
  };

  const filteredUsers = users.filter((user) => {
    const name = user.name ?? "";
    const email = user.email ?? "";
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleSuspendUser = (userId: number) => {
    updateStatus.mutate(
      { id: userId, status: "suspended" },
      { onSuccess: () => toast.success("تم إيقاف المستخدم") }
    );
  };

  const handleActivateUser = (userId: number) => {
    updateStatus.mutate(
      { id: userId, status: "active" },
      { onSuccess: () => toast.success("تم تفعيل المستخدم") }
    );
  };

  const handleRoleChange = (userId: number, role: string) => {
    updateRole.mutate({ id: userId, role: role as RoleValue });
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
                  طريقة تسجيل المستخدمين
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-start gap-3 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                <Info className="w-5 h-5 shrink-0 text-green-700" />
                <p>
                  لا يمكن إضافة المستخدمين يدوياً. يقوم المستخدمون بالتسجيل الذاتي عبر
                  تسجيل الدخول باستخدام حساباتهم. بعد التسجيل يمكنك إدارة صلاحياتهم
                  وحالتهم من هذه الصفحة.
                </p>
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
                {users.filter((u) => u.role.startsWith("farmer")).length}
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
                  <TableHead>الصلاحية</TableHead>
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
                        <div className="font-medium">{user.name ?? user.email ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground">{user.phone ?? "—"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{roleLabels[user.role] ?? user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_VALUES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {roleLabels[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[user.status]}>
                        {statusLabels[user.status] ?? user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.lastSignedIn)}
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

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Key, Plus, Copy, Eye, EyeOff, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface APIKey {
  id: string;
  name: string;
  key: string;
  scope: string;
  createdAt: string;
  lastUsed: string;
  expiresAt: string;
  status: "active" | "expired" | "revoked";
}

export default function APIKeys() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: "1",
      name: "Production API Key",
      key: "sahool_live_51234567890abcdefghijklmnop",
      scope: "full_access",
      createdAt: "2024-01-15",
      lastUsed: "منذ ساعتين",
      expiresAt: "2025-01-15",
      status: "active",
    },
    {
      id: "2",
      name: "Mobile App Key",
      key: "sahool_live_98765432109876543210987654",
      scope: "read_only",
      createdAt: "2024-01-10",
      lastUsed: "منذ يوم",
      expiresAt: "2024-12-31",
      status: "active",
    },
    {
      id: "3",
      name: "Testing Key",
      key: "sahool_test_abcdefghijklmnopqrstuvwxyz",
      scope: "limited",
      createdAt: "2023-12-01",
      lastUsed: "منذ شهر",
      expiresAt: "2024-01-01",
      status: "expired",
    },
  ]);

  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState("read_only");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const scopeLabels: Record<string, string> = {
    full_access: "وصول كامل",
    read_only: "قراءة فقط",
    limited: "محدود",
  };

  const scopeColors: Record<string, "default" | "secondary" | "destructive"> = {
    full_access: "destructive",
    read_only: "default",
    limited: "secondary",
  };

  const statusLabels: Record<string, string> = {
    active: "نشط",
    expired: "منتهي",
    revoked: "ملغي",
  };

  const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
    active: "default",
    expired: "secondary",
    revoked: "destructive",
  };

  const handleToggleShowKey = (id: string) => {
    setShowKey({ ...showKey, [id]: !showKey[id] });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("تم نسخ المفتاح إلى الحافظة");
  };

  const handleCreateKey = () => {
    if (!newKeyName) {
      toast.error("يرجى إدخال اسم للمفتاح");
      return;
    }

    const newKey: APIKey = {
      id: (apiKeys.length + 1).toString(),
      name: newKeyName,
      key: `sahool_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      scope: newKeyScope,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "لم يستخدم بعد",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "active",
    };

    setApiKeys([...apiKeys, newKey]);
    toast.success("تم إنشاء المفتاح بنجاح");
    setNewKeyName("");
    setNewKeyScope("read_only");
    setIsDialogOpen(false);
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(
      apiKeys.map((key) =>
        key.id === id ? { ...key, status: "revoked" as const } : key
      )
    );
    toast.success("تم إلغاء المفتاح");
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id));
    toast.success("تم حذف المفتاح");
  };

  const activeKeysCount = apiKeys.filter((k) => k.status === "active").length;
  const expiredKeysCount = apiKeys.filter((k) => k.status === "expired").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900">إدارة مفاتيح API</h1>
            <p className="text-green-700 mt-1">
              إنشاء وإدارة مفاتيح الوصول لواجهة برمجة التطبيقات
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-700 hover:bg-green-800">
                <Plus className="w-4 h-4 mr-2" />
                إنشاء مفتاح جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إنشاء مفتاح API جديد</DialogTitle>
                <DialogDescription>
                  أنشئ مفتاح وصول جديد لواجهة برمجة التطبيقات
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">اسم المفتاح</Label>
                  <Input
                    id="keyName"
                    placeholder="مثال: Production API Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keyScope">نطاق الصلاحيات</Label>
                  <Select value={newKeyScope} onValueChange={setNewKeyScope}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read_only">قراءة فقط</SelectItem>
                      <SelectItem value="limited">محدود</SelectItem>
                      <SelectItem value="full_access">وصول كامل</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    حدد مستوى الصلاحيات المسموح بها لهذا المفتاح
                  </p>
                </div>
              </div>
              <Button
                onClick={handleCreateKey}
                className="w-full bg-green-700 hover:bg-green-800"
              >
                إنشاء المفتاح
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي المفاتيح
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{apiKeys.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                نشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{activeKeysCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                منتهية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{expiredKeysCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                ملغاة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">
                {apiKeys.filter((k) => k.status === "revoked").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Keys Table */}
        <Card>
          <CardHeader>
            <CardTitle>مفاتيح API</CardTitle>
            <CardDescription>جميع مفاتيح الوصول المنشأة</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>المفتاح</TableHead>
                  <TableHead>الصلاحيات</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>آخر استخدام</TableHead>
                  <TableHead>تاريخ الانتهاء</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {showKey[apiKey.id]
                            ? apiKey.key
                            : `${apiKey.key.substring(0, 12)}...`}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleShowKey(apiKey.id)}
                        >
                          {showKey[apiKey.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyKey(apiKey.key)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={scopeColors[apiKey.scope]}>
                        {scopeLabels[apiKey.scope]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {apiKey.createdAt}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {apiKey.lastUsed}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {apiKey.expiresAt}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[apiKey.status]}>
                        {statusLabels[apiKey.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {apiKey.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRevokeKey(apiKey.id)}
                          >
                            إلغاء
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteKey(apiKey.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>كيفية الاستخدام</CardTitle>
            <CardDescription>دليل سريع لاستخدام مفاتيح API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. إنشاء مفتاح جديد</h3>
              <p className="text-sm text-muted-foreground">
                انقر على زر "إنشاء مفتاح جديد" واختر نطاق الصلاحيات المناسب لاحتياجاتك.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">2. استخدام المفتاح في طلبات API</h3>
              <p className="text-sm text-muted-foreground mb-2">
                أضف المفتاح في رأس الطلب (Header) كالتالي:
              </p>
              <code className="block bg-gray-100 p-3 rounded text-xs">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>
            <div>
              <h3 className="font-medium mb-2">3. الأمان</h3>
              <p className="text-sm text-muted-foreground">
                احفظ مفاتيح API بشكل آمن ولا تشاركها علناً. في حالة تسريب المفتاح، قم بإلغائه فوراً وإنشاء مفتاح جديد.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

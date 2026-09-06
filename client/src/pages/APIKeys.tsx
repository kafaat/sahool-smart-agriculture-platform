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
import { Copy, Plus, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type Scope = "full_access" | "read_only" | "limited";

export default function APIKeys() {
  const { data: apiKeys = [], refetch } = trpc.apiKey.list.useQuery();

  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState<Scope>("read_only");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const createKey = trpc.apiKey.create.useMutation({
    onSuccess: (res) => {
      setCreatedKey(res.key);
      toast.success("تم إنشاء المفتاح بنجاح");
      setNewKeyName("");
      setNewKeyScope("read_only");
      setIsDialogOpen(false);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const revokeKey = trpc.apiKey.revoke.useMutation({
    onSuccess: () => {
      toast.success("تم إلغاء المفتاح");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteKey = trpc.apiKey.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المفتاح");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

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

  const formatDate = (value: Date | string | null | undefined) => {
    if (!value) return "—";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toISOString().split("T")[0];
  };

  const handleCopyKey = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("تم النسخ إلى الحافظة");
  };

  const handleCreateKey = () => {
    if (!newKeyName) {
      toast.error("يرجى إدخال اسم للمفتاح");
      return;
    }
    createKey.mutate({ name: newKeyName, scope: newKeyScope });
  };

  const handleRevokeKey = (id: number) => {
    revokeKey.mutate({ id });
  };

  const handleDeleteKey = (id: number) => {
    deleteKey.mutate({ id });
  };

  const activeKeysCount = apiKeys.filter((k) => k.status === "active").length;
  const expiredKeysCount = apiKeys.filter((k) => k.status === "expired").length;
  const revokedKeysCount = apiKeys.filter((k) => k.status === "revoked").length;

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
                  <Select value={newKeyScope} onValueChange={(v) => setNewKeyScope(v as Scope)}>
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
                disabled={createKey.isPending}
                className="w-full bg-green-700 hover:bg-green-800"
              >
                إنشاء المفتاح
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {/* One-time created key dialog */}
        <Dialog open={createdKey !== null} onOpenChange={(open) => { if (!open) setCreatedKey(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تم إنشاء المفتاح بنجاح</DialogTitle>
              <DialogDescription>
                انسخ هذا المفتاح الآن واحفظه في مكان آمن. لن يتم عرضه مرة أخرى.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                تحذير: هذا هو المفتاح الكامل. لأسباب أمنية لن تتمكن من رؤيته مرة أخرى بعد إغلاق هذه النافذة.
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all text-xs bg-gray-100 px-2 py-2 rounded">
                  {createdKey}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => createdKey && handleCopyKey(createdKey)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={() => setCreatedKey(null)}
                className="w-full bg-green-700 hover:bg-green-800"
              >
                لقد حفظت المفتاح
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
                {revokedKeysCount}
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
                          {apiKey.keyPrefix}••••••••
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="نسخ بادئة المفتاح"
                          onClick={() => handleCopyKey(apiKey.keyPrefix)}
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
                      {formatDate(apiKey.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {apiKey.lastUsed ? formatDate(apiKey.lastUsed) : "لم يُستخدم بعد"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(apiKey.expiresAt)}
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

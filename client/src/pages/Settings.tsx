import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Bell, Moon, Sun, Globe, Shield, Key } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    whatsapp: true,
  });

  const [notificationTypes, setNotificationTypes] = useState({
    irrigation: true,
    weather: true,
    diseases: true,
    equipment: false,
    reports: true,
  });

  const handleSaveGeneral = () => {
    toast.success("تم حفظ الإعدادات العامة");
  };

  const handleSaveNotifications = () => {
    toast.success("تم حفظ إعدادات الإشعارات");
  };

  const handleSaveSecurity = () => {
    toast.success("تم حفظ إعدادات الأمان");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-green-900">الإعدادات</h1>
          <p className="text-green-700 mt-1">
            إدارة إعدادات الحساب والتفضيلات
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="appearance">المظهر</TabsTrigger>
            <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
                <CardDescription>إدارة معلومات الحساب الأساسية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">الاسم الكامل</Label>
                    <Input id="fullName" defaultValue="أحمد محمد علي" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" type="email" defaultValue="ahmed@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input id="phone" defaultValue="+967 777 123 456" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">اللغة</Label>
                    <Select defaultValue="ar">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">المنطقة الزمنية</Label>
                    <Select defaultValue="asia/riyadh">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asia/riyadh">توقيت الرياض (GMT+3)</SelectItem>
                        <SelectItem value="asia/sanaa">توقيت صنعاء (GMT+3)</SelectItem>
                        <SelectItem value="africa/cairo">توقيت القاهرة (GMT+2)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">العملة</Label>
                    <Select defaultValue="sar">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sar">ريال سعودي (SAR)</SelectItem>
                        <SelectItem value="yer">ريال يمني (YER)</SelectItem>
                        <SelectItem value="egp">جنيه مصري (EGP)</SelectItem>
                        <SelectItem value="usd">دولار أمريكي (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <Button onClick={handleSaveGeneral} className="bg-green-700 hover:bg-green-800">
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات المظهر</CardTitle>
                <CardDescription>تخصيص مظهر المنصة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">الوضع</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      اختر بين الوضع الفاتح والداكن
                    </p>
                    <div className="flex gap-4">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        onClick={toggleTheme}
                        className="flex-1"
                      >
                        <Sun className="w-4 h-4 mr-2" />
                        فاتح
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        onClick={toggleTheme}
                        className="flex-1"
                      >
                        <Moon className="w-4 h-4 mr-2" />
                        داكن
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="fontSize">حجم الخط</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">صغير</SelectItem>
                        <SelectItem value="medium">متوسط</SelectItem>
                        <SelectItem value="large">كبير</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>الرسوم المتحركة</Label>
                      <p className="text-sm text-muted-foreground">
                        تفعيل التأثيرات البصرية والانتقالات
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>الوضع المضغوط</Label>
                      <p className="text-sm text-muted-foreground">
                        عرض المزيد من المحتوى في الشاشة
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الإشعارات</CardTitle>
                <CardDescription>إدارة تفضيلات الإشعارات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base mb-3 block">قنوات الإشعارات</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>البريد الإلكتروني</Label>
                        <p className="text-sm text-muted-foreground">
                          استقبال الإشعارات عبر البريد
                        </p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, email: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>إشعارات الدفع</Label>
                        <p className="text-sm text-muted-foreground">
                          إشعارات فورية على المتصفح
                        </p>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, push: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>الرسائل النصية (SMS)</Label>
                        <p className="text-sm text-muted-foreground">
                          إشعارات عبر الرسائل القصيرة
                        </p>
                      </div>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, sms: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>واتساب</Label>
                        <p className="text-sm text-muted-foreground">
                          إشعارات عبر تطبيق واتساب
                        </p>
                      </div>
                      <Switch
                        checked={notifications.whatsapp}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, whatsapp: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base mb-3 block">أنواع الإشعارات</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>تنبيهات الري</Label>
                      <Switch
                        checked={notificationTypes.irrigation}
                        onCheckedChange={(checked) =>
                          setNotificationTypes({ ...notificationTypes, irrigation: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>تحذيرات الطقس</Label>
                      <Switch
                        checked={notificationTypes.weather}
                        onCheckedChange={(checked) =>
                          setNotificationTypes({ ...notificationTypes, weather: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>كشف الأمراض</Label>
                      <Switch
                        checked={notificationTypes.diseases}
                        onCheckedChange={(checked) =>
                          setNotificationTypes({ ...notificationTypes, diseases: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>صيانة المعدات</Label>
                      <Switch
                        checked={notificationTypes.equipment}
                        onCheckedChange={(checked) =>
                          setNotificationTypes({ ...notificationTypes, equipment: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>التقارير الدورية</Label>
                      <Switch
                        checked={notificationTypes.reports}
                        onCheckedChange={(checked) =>
                          setNotificationTypes({ ...notificationTypes, reports: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <Button onClick={handleSaveNotifications} className="bg-green-700 hover:bg-green-800">
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الأمان والخصوصية</CardTitle>
                <CardDescription>إدارة إعدادات الأمان والمصادقة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base mb-3 block">تغيير كلمة المرور</Label>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>المصادقة الثنائية (2FA)</Label>
                      <p className="text-sm text-muted-foreground">
                        طبقة أمان إضافية لحسابك
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>تسجيل الدخول بالبصمة</Label>
                      <p className="text-sm text-muted-foreground">
                        استخدام البصمة الحيوية للدخول
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base mb-3 block">الجلسات النشطة</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Chrome - Windows</p>
                          <p className="text-sm text-muted-foreground">آخر نشاط: منذ ساعتين</p>
                        </div>
                        <Button variant="outline" size="sm">
                          إنهاء
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Safari - iPhone</p>
                          <p className="text-sm text-muted-foreground">آخر نشاط: منذ يوم</p>
                        </div>
                        <Button variant="outline" size="sm">
                          إنهاء
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <Button onClick={handleSaveSecurity} className="bg-green-700 hover:bg-green-800">
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { FileText, Download, TrendingUp, TrendingDown, DollarSign, Droplets, Zap } from "lucide-react";

export default function Reports() {
  const [selectedFarm, setSelectedFarm] = useState<number | null>(null);
  const [reportPeriod, setReportPeriod] = useState<"daily" | "weekly" | "monthly" | "seasonal">("weekly");

  const { data: farms } = trpc.farm.list.useQuery();
  const { data: overview } = trpc.dashboard.overview.useQuery();

  // Mock data for charts (in production, this would come from API)
  const waterUsageData = [
    { day: "السبت", usage: 450 },
    { day: "الأحد", usage: 520 },
    { day: "الاثنين", usage: 380 },
    { day: "الثلاثاء", usage: 490 },
    { day: "الأربعاء", usage: 410 },
    { day: "الخميس", usage: 530 },
    { day: "الجمعة", usage: 350 },
  ];

  const productivityData = [
    { month: "يناير", yield: 2.3 },
    { month: "فبراير", yield: 2.5 },
    { month: "مارس", yield: 2.8 },
    { month: "أبريل", yield: 3.1 },
    { month: "مايو", yield: 2.9 },
    { month: "يونيو", yield: 3.2 },
  ];

  const costBreakdown = [
    { category: "البذور", amount: 15000, percentage: 25 },
    { category: "الأسمدة", amount: 12000, percentage: 20 },
    { category: "المبيدات", amount: 9000, percentage: 15 },
    { category: "المياه", amount: 6000, percentage: 10 },
    { category: "الطاقة", amount: 8000, percentage: 13 },
    { category: "العمالة", amount: 10000, percentage: 17 },
  ];

  const handleDownloadReport = (type: string) => {
    // In production, this would generate and download actual report
    alert(`سيتم تحميل تقرير ${type}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900">التقارير والتحليلات</h1>
            <p className="text-green-700 mt-1">
              تقارير شاملة عن الأداء والإنتاجية
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={reportPeriod} onValueChange={(value: any) => setReportPeriod(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">يومي</SelectItem>
                <SelectItem value="weekly">أسبوعي</SelectItem>
                <SelectItem value="monthly">شهري</SelectItem>
                <SelectItem value="seasonal">موسمي</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-green-700 hover:bg-green-800">
              <Download className="w-4 h-4 mr-2" />
              تصدير التقرير
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                الإنتاجية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">2.8 طن/فدان</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +12% عن الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                استهلاك المياه
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">3,130 م³</div>
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3" />
                -8% عن الأسبوع الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                التكاليف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">60,000 ريال</div>
              <p className="text-xs text-muted-foreground mt-1">
                هذا الموسم
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" />
                استهلاك الطاقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">1,250 kWh</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3" />
                -5% عن الشهر الماضي
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="water" className="space-y-4">
          <TabsList>
            <TabsTrigger value="water">استهلاك المياه</TabsTrigger>
            <TabsTrigger value="productivity">الإنتاجية</TabsTrigger>
            <TabsTrigger value="costs">التكاليف</TabsTrigger>
            <TabsTrigger value="downloads">تحميل التقارير</TabsTrigger>
          </TabsList>

          <TabsContent value="water" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>استهلاك المياه الأسبوعي</CardTitle>
                <CardDescription>
                  متوسط الاستهلاك اليومي بالمتر المكعب
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {waterUsageData.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium">{item.day}</div>
                      <div className="flex-1">
                        <div className="h-8 bg-blue-100 rounded-lg relative overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-lg flex items-center justify-end pr-2 text-white text-sm font-medium"
                            style={{ width: `${(item.usage / 600) * 100}%` }}
                          >
                            {item.usage} م³
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">التحليل</h4>
                  <p className="text-sm text-muted-foreground">
                    استهلاك المياه في نطاق طبيعي. يوم الخميس سجل أعلى استهلاك (530 م³) بسبب ارتفاع درجة الحرارة.
                    يُنصح بتقليل الري يوم الجمعة للحفاظ على التوازن.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="productivity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الإنتاجية الشهرية</CardTitle>
                <CardDescription>
                  الإنتاجية بالطن لكل فدان
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {productivityData.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium">{item.month}</div>
                      <div className="flex-1">
                        <div className="h-8 bg-green-100 rounded-lg relative overflow-hidden">
                          <div
                            className="h-full bg-green-600 rounded-lg flex items-center justify-end pr-2 text-white text-sm font-medium"
                            style={{ width: `${(item.yield / 4) * 100}%` }}
                          >
                            {item.yield} طن
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">التحليل</h4>
                  <p className="text-sm text-muted-foreground">
                    الإنتاجية في تحسن مستمر. شهر يونيو سجل أعلى إنتاجية (3.2 طن/فدان) وهو أعلى من المتوسط الإقليمي بنسبة 18%.
                    يُتوقع استمرار هذا الأداء الجيد في الأشهر القادمة.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تحليل التكاليف</CardTitle>
                <CardDescription>
                  توزيع التكاليف حسب الفئة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costBreakdown.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-muted-foreground">
                          {item.amount.toLocaleString()} ريال ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-600 rounded-full"
                          style={{ width: `${item.percentage * 4}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold mb-2">التحليل</h4>
                  <p className="text-sm text-muted-foreground">
                    إجمالي التكاليف: 60,000 ريال. أعلى بند هو البذور (25%). يُنصح بالبحث عن موردين بأسعار تنافسية
                    لتقليل التكاليف بنسبة 10-15%.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downloads" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => handleDownloadReport("يومي")}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-green-700" />
                    <div>
                      <CardTitle className="text-base">التقرير اليومي</CardTitle>
                      <CardDescription className="text-xs">
                        حالة الري، صحة المحصول، التنبيهات
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    تحميل PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => handleDownloadReport("أسبوعي")}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-700" />
                    <div>
                      <CardTitle className="text-base">التقرير الأسبوعي</CardTitle>
                      <CardDescription className="text-xs">
                        استهلاك المياه والطاقة، التكاليف
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    تحميل Excel
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => handleDownloadReport("شهري")}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-purple-700" />
                    <div>
                      <CardTitle className="text-base">التقرير الشهري</CardTitle>
                      <CardDescription className="text-xs">
                        الإنتاجية، المقارنة، التوقعات
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    تحميل PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => handleDownloadReport("موسمي")}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-amber-700" />
                    <div>
                      <CardTitle className="text-base">التقرير الموسمي</CardTitle>
                      <CardDescription className="text-xs">
                        إجمالي الإنتاجية، هامش الربح
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    تحميل PDF + Excel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

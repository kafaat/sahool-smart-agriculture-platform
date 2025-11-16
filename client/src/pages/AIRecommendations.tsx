import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Lightbulb, Sprout, Droplets, Bug, TrendingUp, Loader2, Sparkles, CheckCircle, XCircle } from "lucide-react";
import { Streamdown } from "streamdown";

export default function AIRecommendations() {
  const [selectedFarm, setSelectedFarm] = useState<number | null>(null);
  const [selectedField, setSelectedField] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const { data: farms } = trpc.farm.list.useQuery();
  const { data: fields } = trpc.field.listByFarm.useQuery(
    { farmId: selectedFarm! },
    { enabled: !!selectedFarm }
  );
  const { data: recommendations } = trpc.recommendation.list.useQuery();

  const updateStatusMutation = trpc.recommendation.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة التوصية");
    },
  });

  const pendingRecommendations = recommendations?.filter(r => r.status === "pending") || [];
  const acceptedRecommendations = recommendations?.filter(r => r.status === "accepted") || [];
  const completedRecommendations = recommendations?.filter(r => r.status === "completed") || [];

  const handleAskAI = async () => {
    if (!question.trim()) {
      toast.error("الرجاء إدخال سؤالك");
      return;
    }

    setIsAsking(true);
    setAiResponse("");

    try {
      // Simulate AI response (in production, this would call the LLM API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResponse = `بناءً على تحليل البيانات المتاحة، إليك التوصيات:

## التحليل
${question}

## التوصيات الذكية

### 1. توصية الري
- **الموعد المثالي**: الساعة 6 صباحاً و 6 مساءً
- **الكمية المقترحة**: 50-60 لتر/م² يومياً
- **السبب**: درجة الحرارة المرتفعة (32°م) والرطوبة المنخفضة (45%)

### 2. توصية التسميد
- **النوع**: NPK 20-20-20
- **الكمية**: 5 كجم/فدان
- **التوقيت**: بعد 3 أيام من الآن
- **الطريقة**: رش ورقي في الصباح الباكر

### 3. الوقاية من الآفات
- **المخاطر المحتملة**: دودة ورق القطن (احتمالية 65%)
- **الإجراء الوقائي**: رش المبيد الحيوي BT
- **التوقيت**: خلال 5-7 أيام

### 4. التنبؤ بالإنتاجية
- **الإنتاجية المتوقعة**: 2.8 طن/فدان
- **مقارنة بالمتوسط**: +15% أعلى من المتوسط الإقليمي
- **موعد الحصاد المتوقع**: بعد 45-50 يوم

## ملاحظات إضافية
- مراقبة رطوبة التربة يومياً
- فحص النباتات أسبوعياً للكشف المبكر عن الأمراض
- تسجيل جميع العمليات الزراعية للتحليل المستقبلي`;

      setAiResponse(mockResponse);
    } catch (error) {
      toast.error("حدث خطأ أثناء الحصول على التوصية");
    } finally {
      setIsAsking(false);
    }
  };

  const recommendationTypeLabels: Record<string, string> = {
    irrigation: "ري",
    fertilization: "تسميد",
    pest_control: "مكافحة آفات",
    planting: "زراعة",
    harvesting: "حصاد",
    general: "عام",
  };

  const priorityColors: Record<string, string> = {
    high: "destructive",
    medium: "default",
    low: "secondary",
  };

  const priorityLabels: Record<string, string> = {
    high: "عالية",
    medium: "متوسطة",
    low: "منخفضة",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-green-900 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-amber-500" />
            التوصيات الذكية
          </h1>
          <p className="text-green-700 mt-1">
            احصل على توصيات مبنية على الذكاء الاصطناعي لتحسين إنتاجيتك
          </p>
        </div>

        {/* AI Assistant */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-purple-700" />
              المساعد الذكي الزراعي
            </CardTitle>
            <CardDescription>
              اسأل أي سؤال عن مزرعتك واحصل على توصيات فورية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">اختر المزرعة (اختياري)</label>
                <Select value={selectedFarm?.toString() || ""} onValueChange={(value) => setSelectedFarm(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع المزارع" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms?.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id.toString()}>
                        {farm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFarm && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">اختر الحقل (اختياري)</label>
                  <Select value={selectedField?.toString() || ""} onValueChange={(value) => setSelectedField(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع الحقول" />
                    </SelectTrigger>
                    <SelectContent>
                      {fields?.map((field) => (
                        <SelectItem key={field.id} value={field.id.toString()}>
                          {field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">اسأل سؤالك</label>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="مثال: ما هو أفضل وقت للري؟ كيف أحسن إنتاجية القمح؟ هل يجب أن أسمد الآن؟"
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAskAI}
                disabled={isAsking}
                className="bg-purple-700 hover:bg-purple-800"
              >
                {isAsking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    احصل على توصية
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setQuestion("");
                  setAiResponse("");
                }}
              >
                مسح
              </Button>
            </div>

            {aiResponse && (
              <div className="mt-6 p-4 bg-white rounded-lg border-2 border-purple-200">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  التوصية الذكية
                </h4>
                <div className="prose prose-sm max-w-none">
                  <Streamdown>{aiResponse}</Streamdown>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Recommendations */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-300">
            <CardHeader className="pb-3">
              <Droplets className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle className="text-base">توصية الري</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                احصل على جدول ري مثالي لحقولك
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-300">
            <CardHeader className="pb-3">
              <Sprout className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle className="text-base">توصية المحاصيل</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                أفضل المحاصيل لتربتك ومناخك
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-300">
            <CardHeader className="pb-3">
              <Bug className="w-8 h-8 text-red-600 mb-2" />
              <CardTitle className="text-base">كشف الأمراض</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                ارفع صورة واحصل على تشخيص فوري
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-300">
            <CardHeader className="pb-3">
              <TrendingUp className="w-8 h-8 text-amber-600 mb-2" />
              <CardTitle className="text-base">تنبؤ الإنتاجية</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                توقع كمية المحصول قبل الحصاد
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>التوصيات قيد الانتظار ({pendingRecommendations.length})</CardTitle>
            <CardDescription>
              توصيات تتطلب مراجعتك واتخاذ قرار
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRecommendations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingRecommendations.map((rec) => (
                  <div key={rec.id} className="p-4 border-2 border-amber-200 rounded-lg bg-amber-50/50">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        {recommendationTypeLabels[rec.recommendationType]}
                      </Badge>
                      <Badge variant={priorityColors[rec.priority || "medium"] as any} className="text-xs">
                        {priorityLabels[rec.priority || "medium"]}
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-2">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {rec.description}
                    </p>
                    {rec.confidence && (
                      <p className="text-xs text-muted-foreground mb-3">
                        مستوى الثقة: {(rec.confidence * 100).toFixed(0)}%
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-700 hover:bg-green-800"
                        onClick={() => updateStatusMutation.mutate({ id: rec.id, status: "accepted" })}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        قبول
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ id: rec.id, status: "rejected" })}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        رفض
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Lightbulb className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  لا توجد توصيات قيد الانتظار
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accepted & Completed */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">التوصيات المقبولة ({acceptedRecommendations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {acceptedRecommendations.length > 0 ? (
                <div className="space-y-3">
                  {acceptedRecommendations.slice(0, 5).map((rec) => (
                    <div key={rec.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm">{rec.title}</h5>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ id: rec.id, status: "completed" })}
                        >
                          تم التنفيذ
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  لا توجد توصيات مقبولة
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">التوصيات المنفذة ({completedRecommendations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {completedRecommendations.length > 0 ? (
                <div className="space-y-3">
                  {completedRecommendations.slice(0, 5).map((rec) => (
                    <div key={rec.id} className="p-3 border rounded-lg bg-green-50">
                      <h5 className="font-medium text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {rec.title}
                      </h5>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  لا توجد توصيات منفذة
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

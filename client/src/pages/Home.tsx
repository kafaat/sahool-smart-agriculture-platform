import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Cloud, Droplets, TrendingUp, BarChart3, MapPin, Bell, Settings } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="flex flex-col items-center gap-4">
          <Sprout className="w-16 h-16 text-green-700 animate-pulse" />
          <p className="text-green-700 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                <Sprout className="w-4 h-4" />
                منصة الزراعة الذكية
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-green-900 leading-tight">
                منصة سهول
                <span className="block text-green-700 mt-2">للزراعة المستدامة</span>
              </h1>
              
              <p className="text-xl text-green-700 leading-relaxed">
                بيئة رقمية متكاملة تعتمد على الذكاء الاصطناعي وإنترنت الأشياء لإدارة العمليات الزراعية بكفاءة استثنائية. زيادة في الإنتاجية بنسبة 40% وتقليل استهلاك الموارد بنسبة 35%.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-green-700 hover:bg-green-800 text-white px-8 py-6 text-lg"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  ابدأ الآن مجاناً
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-green-700 text-green-700 hover:bg-green-50 px-8 py-6 text-lg"
                >
                  شاهد العرض التوضيحي
                </Button>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-900">2M+</div>
                  <div className="text-sm text-green-600">مستخدم نشط</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-900">15</div>
                  <div className="text-sm text-green-600">دولة</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-900">40%</div>
                  <div className="text-sm text-green-600">زيادة الإنتاجية</div>
                </div>
              </div>
            </div>
            
            {/* Right Image/Illustration */}
            <div className="relative">
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-white/90 backdrop-blur border-0">
                    <CardHeader className="pb-3">
                      <Droplets className="w-8 h-8 text-blue-600 mb-2" />
                      <CardTitle className="text-lg">الري الذكي</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-700">-30%</p>
                      <p className="text-xs text-muted-foreground">استهلاك المياه</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/90 backdrop-blur border-0">
                    <CardHeader className="pb-3">
                      <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                      <CardTitle className="text-lg">الإنتاجية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-700">+40%</p>
                      <p className="text-xs text-muted-foreground">زيادة المحصول</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/90 backdrop-blur border-0">
                    <CardHeader className="pb-3">
                      <Cloud className="w-8 h-8 text-purple-600 mb-2" />
                      <CardTitle className="text-lg">التنبؤ الجوي</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-700">7-10</p>
                      <p className="text-xs text-muted-foreground">أيام مسبقاً</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/90 backdrop-blur border-0">
                    <CardHeader className="pb-3">
                      <BarChart3 className="w-8 h-8 text-amber-600 mb-2" />
                      <CardTitle className="text-lg">التحليلات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-700">50+</p>
                      <p className="text-xs text-muted-foreground">مؤشر أداء</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-green-900 mb-4">
                ميزات منصة سهول
              </h2>
              <p className="text-xl text-green-700 max-w-3xl mx-auto">
                حلول متكاملة للمزارعين والشركات والحكومات
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all">
                <CardHeader>
                  <MapPin className="w-12 h-12 text-green-700 mb-4" />
                  <CardTitle className="text-xl">خرائط تفاعلية</CardTitle>
                  <CardDescription>
                    تحليلات جغرافية فورية بدقة 10 أمتار مع صور الأقمار الصناعية
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all">
                <CardHeader>
                  <Droplets className="w-12 h-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">إدارة الري</CardTitle>
                  <CardDescription>
                    توصيات يومية للري بناءً على بيانات 15 مستشعراً ميدانياً
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all">
                <CardHeader>
                  <Cloud className="w-12 h-12 text-purple-600 mb-4" />
                  <CardTitle className="text-xl">التنبؤ بالطقس</CardTitle>
                  <CardDescription>
                    نظام تحذير مبكر من التغيرات المناخية قبل 7-10 أيام
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all">
                <CardHeader>
                  <Bell className="w-12 h-12 text-amber-600 mb-4" />
                  <CardTitle className="text-xl">تنبيهات ذكية</CardTitle>
                  <CardDescription>
                    إشعارات فورية للأمراض والآفات قبل ظهورها بأيام
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all">
                <CardHeader>
                  <BarChart3 className="w-12 h-12 text-green-700 mb-4" />
                  <CardTitle className="text-xl">تحليلات متقدمة</CardTitle>
                  <CardDescription>
                    تقارير شاملة وتنبؤات بأسعار المحاصيل بدقة 85%
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all">
                <CardHeader>
                  <Settings className="w-12 h-12 text-gray-700 mb-4" />
                  <CardTitle className="text-xl">أتمتة كاملة</CardTitle>
                  <CardDescription>
                    تحكم آلي في أنظمة الري والتسميد عبر IoT
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-green-700 to-emerald-800 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              ابدأ رحلتك نحو الزراعة الذكية اليوم
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              انضم إلى آلاف المزارعين الذين يستخدمون منصة سهول لتحسين إنتاجيتهم وتقليل التكاليف
            </p>
            <Button 
              size="lg" 
              className="bg-white text-green-700 hover:bg-green-50 px-8 py-6 text-lg font-semibold"
              onClick={() => window.location.href = getLoginUrl()}
            >
              إنشاء حساب مجاني
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user - redirect to dashboard
  window.location.href = "/dashboard";
  return null;
}

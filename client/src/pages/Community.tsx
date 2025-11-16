import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageCircle, BookOpen, ShoppingBag, Plus, Send, ThumbsUp, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function Community() {
  const [newPostContent, setNewPostContent] = useState("");

  // Mock data
  const groups = [
    { id: 1, name: "مزارعي القمح - اليمن", members: 245, posts: 89, category: "محصول" },
    { id: 2, name: "الزراعة العضوية", members: 189, posts: 156, category: "تقنية" },
    { id: 3, name: "مزارعي صنعاء", members: 312, posts: 234, category: "موقع" },
    { id: 4, name: "مبتدئين في الزراعة", members: 567, posts: 423, category: "خبرة" },
  ];

  const posts = [
    {
      id: 1,
      author: "أحمد محمد",
      avatar: "أ",
      time: "منذ ساعتين",
      content: "هل يمكن استخدام السماد العضوي مع القمح في هذا الوقت من السنة؟",
      likes: 12,
      comments: 5,
      group: "مزارعي القمح - اليمن",
    },
    {
      id: 2,
      author: "فاطمة علي",
      avatar: "ف",
      time: "منذ 4 ساعات",
      content: "حصاد ممتاز هذا الموسم! شكراً لتوصيات المنصة الذكية 🌾",
      likes: 28,
      comments: 9,
      group: "الزراعة العضوية",
    },
    {
      id: 3,
      author: "خالد حسن",
      avatar: "خ",
      time: "منذ يوم",
      content: "أبحث عن مضخة ري مستعملة بحالة جيدة. من لديه؟",
      likes: 7,
      comments: 3,
      group: "مزارعي صنعاء",
    },
  ];

  const knowledgeBase = [
    { id: 1, title: "دليل زراعة القمح في اليمن", category: "محاصيل", views: 1234 },
    { id: 2, title: "كيفية تشخيص أمراض النباتات", category: "صحة النبات", views: 892 },
    { id: 3, title: "أنظمة الري الحديثة", category: "تقنيات", views: 756 },
    { id: 4, title: "التسميد العضوي", category: "تربة", views: 645 },
  ];

  const marketplace = [
    { id: 1, title: "مضخة ري 5 حصان", price: 15000, seller: "محمد أحمد", location: "صنعاء" },
    { id: 2, title: "بذور قمح عضوي - 50 كجم", price: 8000, seller: "فاطمة علي", location: "ذمار" },
    { id: 3, title: "نظام ري بالتنقيط", price: 25000, seller: "خالد حسن", location: "إب" },
  ];

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast.error("الرجاء كتابة محتوى المنشور");
      return;
    }
    toast.success("تم نشر المنشور بنجاح!");
    setNewPostContent("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-green-900">المجتمع الزراعي</h1>
          <p className="text-green-700 mt-1">
            تواصل مع المزارعين وشارك خبراتك
          </p>
        </div>

        <Tabs defaultValue="groups" className="space-y-4">
          <TabsList>
            <TabsTrigger value="groups">المجموعات</TabsTrigger>
            <TabsTrigger value="posts">المنشورات</TabsTrigger>
            <TabsTrigger value="knowledge">قاعدة المعرفة</TabsTrigger>
            <TabsTrigger value="marketplace">السوق</TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">مجموعاتي</h3>
              <Button className="bg-green-700 hover:bg-green-800">
                <Plus className="w-4 h-4 mr-2" />
                إنشاء مجموعة
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {groups.map((group) => (
                <Card key={group.id} className="hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{group.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          <Badge variant="outline" className="text-xs">
                            {group.category}
                          </Badge>
                        </CardDescription>
                      </div>
                      <Users className="w-5 h-5 text-green-700" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <span>{group.members} عضو</span>
                      <span>{group.posts} منشور</span>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      عرض المجموعة
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            {/* Create Post */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">إنشاء منشور جديد</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="شارك خبرتك أو اطرح سؤالاً..."
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={handleCreatePost} className="bg-green-700 hover:bg-green-800">
                    <Send className="w-4 h-4 mr-2" />
                    نشر
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {post.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{post.author}</h4>
                            <p className="text-xs text-muted-foreground">
                              {post.group} • {post.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{post.content}</p>
                    <div className="flex gap-4 pt-2 border-t">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ThumbsUp className="w-4 h-4" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <MessageSquare className="w-4 h-4" />
                        {post.comments}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">قاعدة المعارف الزراعية</h3>
              <Input
                placeholder="ابحث في المقالات..."
                className="max-w-xs"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {knowledgeBase.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-6 h-6 text-green-700 flex-shrink-0" />
                      <div className="flex-1">
                        <CardTitle className="text-base">{article.title}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          <Badge variant="outline" className="text-xs">
                            {article.category}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {article.views.toLocaleString()} مشاهدة
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">السوق المحلي</h3>
              <Button className="bg-green-700 hover:bg-green-800">
                <Plus className="w-4 h-4 mr-2" />
                إضافة عرض
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {marketplace.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <ShoppingBag className="w-6 h-6 text-green-700 flex-shrink-0" />
                      <div className="flex-1">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {item.seller} • {item.location}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-900">
                        {item.price.toLocaleString()} ريال
                      </span>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        تواصل
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

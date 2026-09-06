import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, MessageCircle, BookOpen, ShoppingBag, Plus, Send, ThumbsUp, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

function formatRelativeTime(value: string | number | Date): string {
  const date = new Date(value);
  const time = date.getTime();
  if (Number.isNaN(time)) return "";
  const diff = Date.now() - time;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `منذ ${days} يوم`;
  return date.toLocaleDateString("ar");
}

function getAvatar(name?: string | null): string {
  const trimmed = (name ?? "").trim();
  return trimmed.length > 0 ? trimmed.charAt(0) : "؟";
}

export default function Community() {
  const [newPostContent, setNewPostContent] = useState("");

  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupCategory, setGroupCategory] = useState("");

  const [listingDialogOpen, setListingDialogOpen] = useState(false);
  const [listingTitle, setListingTitle] = useState("");
  const [listingPrice, setListingPrice] = useState("");
  const [listingLocation, setListingLocation] = useState("");

  // Data from tRPC
  const { data: groupsData, refetch: refetchGroups } = trpc.community.listGroups.useQuery();
  const { data: postsData, refetch: refetchPosts } = trpc.community.listPosts.useQuery();
  const { data: articlesData } = trpc.community.listArticles.useQuery();
  const { data: listingsData, refetch: refetchListings } = trpc.community.listListings.useQuery();

  const groups = groupsData ?? [];
  const posts = postsData ?? [];
  const knowledgeBase = articlesData ?? [];
  const marketplace = listingsData ?? [];

  const createGroup = trpc.community.createGroup.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء المجموعة بنجاح!");
      setGroupName("");
      setGroupCategory("");
      setGroupDialogOpen(false);
      refetchGroups();
    },
    onError: (e) => toast.error(e.message),
  });

  const createPost = trpc.community.createPost.useMutation({
    onSuccess: () => {
      toast.success("تم نشر المنشور بنجاح!");
      setNewPostContent("");
      refetchPosts();
    },
    onError: (e) => toast.error(e.message),
  });

  const likePost = trpc.community.likePost.useMutation({
    onSuccess: () => refetchPosts(),
    onError: (e) => toast.error(e.message),
  });

  const createListing = trpc.community.createListing.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة العرض بنجاح!");
      setListingTitle("");
      setListingPrice("");
      setListingLocation("");
      setListingDialogOpen(false);
      refetchListings();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast.error("الرجاء كتابة محتوى المنشور");
      return;
    }
    createPost.mutate({ content: newPostContent });
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast.error("الرجاء إدخال اسم المجموعة");
      return;
    }
    createGroup.mutate({
      name: groupName,
      category: groupCategory.trim() ? groupCategory : undefined,
    });
  };

  const handleCreateListing = () => {
    if (!listingTitle.trim()) {
      toast.error("الرجاء إدخال عنوان العرض");
      return;
    }
    const price = Number(listingPrice);
    if (!Number.isFinite(price) || price < 0) {
      toast.error("الرجاء إدخال سعر صحيح");
      return;
    }
    createListing.mutate({
      title: listingTitle,
      price,
      location: listingLocation.trim() ? listingLocation : undefined,
    });
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
              <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-700 hover:bg-green-800">
                    <Plus className="w-4 h-4 mr-2" />
                    إنشاء مجموعة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إنشاء مجموعة جديدة</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">اسم المجموعة</label>
                      <Input
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="اسم المجموعة"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">التصنيف</label>
                      <Input
                        value={groupCategory}
                        onChange={(e) => setGroupCategory(e.target.value)}
                        placeholder="مثال: محصول، تقنية، موقع"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleCreateGroup}
                      disabled={createGroup.isPending}
                      className="bg-green-700 hover:bg-green-800"
                    >
                      إنشاء
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                      <span>{group.postsCount} منشور</span>
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
                  <Button
                    onClick={handleCreatePost}
                    disabled={createPost.isPending}
                    className="bg-green-700 hover:bg-green-800"
                  >
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
                          {getAvatar(post.authorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{post.authorName}</h4>
                            <p className="text-xs text-muted-foreground">
                              {post.groupName} • {formatRelativeTime(post.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{post.content}</p>
                    <div className="flex gap-4 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => likePost.mutate({ id: post.id })}
                      >
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
              <Dialog open={listingDialogOpen} onOpenChange={setListingDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-700 hover:bg-green-800">
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة عرض
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة عرض جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">العنوان</label>
                      <Input
                        value={listingTitle}
                        onChange={(e) => setListingTitle(e.target.value)}
                        placeholder="عنوان العرض"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">السعر (ريال)</label>
                      <Input
                        type="number"
                        value={listingPrice}
                        onChange={(e) => setListingPrice(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الموقع</label>
                      <Input
                        value={listingLocation}
                        onChange={(e) => setListingLocation(e.target.value)}
                        placeholder="المدينة"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleCreateListing}
                      disabled={createListing.isPending}
                      className="bg-green-700 hover:bg-green-800"
                    >
                      إضافة
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                          {item.sellerName} • {item.location}
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

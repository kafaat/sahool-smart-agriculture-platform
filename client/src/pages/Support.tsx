import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageCircle, Video, FileText, Send, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";

export default function Support() {
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketPriority, setTicketPriority] = useState<"low" | "medium" | "high">("medium");
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: "assistant", content: "مرحباً! أنا المساعد الذكي لمنصة سهول. كيف يمكنني مساعدتك اليوم؟" },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const { data: myTickets = [], refetch: refetchTickets } = trpc.support.listTickets.useQuery();
  const { data: faqItems = [] } = trpc.support.listFaq.useQuery();

  const createTicketMutation = trpc.support.createTicket.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء التذكرة بنجاح! سنرد عليك قريباً");
      setTicketSubject("");
      setTicketDescription("");
      setTicketPriority("medium");
      refetchTickets();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateStatusMutation = trpc.support.updateTicketStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة التذكرة");
      refetchTickets();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleCreateTicket = () => {
    if (!ticketSubject || !ticketDescription) {
      toast.error("الرجاء ملء جميع الحقول");
      return;
    }
    createTicketMutation.mutate({
      subject: ticketSubject,
      description: ticketDescription,
      priority: ticketPriority,
    });
  };

  const formatDate = (value: Date | string | number) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("ar", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusLabels = {
    open: "مفتوح",
    in_progress: "قيد المعالجة",
    resolved: "محلول",
    closed: "مغلق",
  };

  const statusColors = {
    open: "destructive",
    in_progress: "default",
    resolved: "secondary",
    closed: "outline",
  };

  const priorityLabels = {
    low: "منخفضة",
    medium: "متوسطة",
    high: "عالية",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-green-900">الدعم الفني</h1>
          <p className="text-green-700 mt-1">
            نحن هنا لمساعدتك في أي وقت
          </p>
        </div>

        <Tabs defaultValue="chatbot" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chatbot">الدردشة الذكية</TabsTrigger>
            <TabsTrigger value="tickets">تذاكر الدعم</TabsTrigger>
            <TabsTrigger value="faq">الأسئلة الشائعة</TabsTrigger>
            <TabsTrigger value="resources">مصادر المساعدة</TabsTrigger>
          </TabsList>

          <TabsContent value="chatbot" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-700" />
                  المساعد الذكي للدعم
                </CardTitle>
                <CardDescription>
                  اطرح أي سؤال واحصل على إجابة فورية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIChatBox
                  messages={chatMessages}
                  onSendMessage={(content) => {
                    setIsChatLoading(true);
                    setChatMessages(prev => [...prev, { role: "user", content }]);
                    // Simulate AI response
                    setTimeout(() => {
                      setChatMessages(prev => [...prev, {
                        role: "assistant",
                        content: "شكراً لسؤالك! أنا هنا للمساعدة. في البيئة الحقيقية، سيتم الرد عليك بواسطة الذكاء الاصطناعي."
                      }]);
                      setIsChatLoading(false);
                    }, 1000);
                  }}
                  isLoading={isChatLoading}
                  placeholder="اكتب سؤالك هنا..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Create Ticket */}
              <Card>
                <CardHeader>
                  <CardTitle>إنشاء تذكرة دعم جديدة</CardTitle>
                  <CardDescription>
                    سنرد عليك خلال 24 ساعة
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">الموضوع *</Label>
                    <Input
                      id="subject"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="مثال: مشكلة في تسجيل الدخول"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">الأولوية</Label>
                    <Select value={ticketPriority} onValueChange={(value: any) => setTicketPriority(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">منخفضة</SelectItem>
                        <SelectItem value="medium">متوسطة</SelectItem>
                        <SelectItem value="high">عالية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف *</Label>
                    <Textarea
                      id="description"
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      placeholder="اشرح المشكلة بالتفصيل..."
                      rows={5}
                    />
                  </div>

                  <Button
                    onClick={handleCreateTicket}
                    disabled={createTicketMutation.isPending}
                    className="w-full bg-green-700 hover:bg-green-800"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    إرسال التذكرة
                  </Button>
                </CardContent>
              </Card>

              {/* My Tickets */}
              <Card>
                <CardHeader>
                  <CardTitle>تذاكري</CardTitle>
                  <CardDescription>
                    تذاكر الدعم الخاصة بك
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myTickets.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        لا توجد تذاكر بعد
                      </p>
                    ) : (
                      myTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm">{ticket.subject}</h4>
                            <Badge variant={statusColors[ticket.status as keyof typeof statusColors] as any}>
                              {statusLabels[ticket.status as keyof typeof statusLabels]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              {ticket.status === "resolved" ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : ticket.status === "in_progress" ? (
                                <Clock className="w-3 h-3" />
                              ) : (
                                <AlertCircle className="w-3 h-3" />
                              )}
                              {priorityLabels[ticket.priority as keyof typeof priorityLabels]}
                            </span>
                            <span>#{ticket.id}</span>
                            <span>{formatDate(ticket.updatedAt ?? ticket.createdAt)}</span>
                          </div>
                          <Select
                            value={ticket.status}
                            onValueChange={(value: any) =>
                              updateStatusMutation.mutate({ id: ticket.id, status: value })
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">{statusLabels.open}</SelectItem>
                              <SelectItem value="in_progress">{statusLabels.in_progress}</SelectItem>
                              <SelectItem value="resolved">{statusLabels.resolved}</SelectItem>
                              <SelectItem value="closed">{statusLabels.closed}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-green-700" />
                  الأسئلة الشائعة
                </CardTitle>
                <CardDescription>
                  إجابات سريعة للأسئلة الأكثر شيوعاً
                </CardDescription>
              </CardHeader>
              <CardContent>
                {faqItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    لا توجد أسئلة شائعة حالياً
                  </p>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item) => (
                      <AccordionItem key={item.id} value={`item-${item.id}`}>
                        <AccordionTrigger className="text-right">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-all cursor-pointer">
                <CardHeader>
                  <FileText className="w-8 h-8 text-green-700 mb-2" />
                  <CardTitle className="text-base">دليل المستخدم</CardTitle>
                  <CardDescription className="text-xs">
                    دليل شامل لاستخدام جميع ميزات المنصة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    تحميل PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all cursor-pointer">
                <CardHeader>
                  <Video className="w-8 h-8 text-blue-700 mb-2" />
                  <CardTitle className="text-base">فيديوهات تعليمية</CardTitle>
                  <CardDescription className="text-xs">
                    شروحات فيديو خطوة بخطوة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    مشاهدة الآن
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all cursor-pointer">
                <CardHeader>
                  <MessageCircle className="w-8 h-8 text-purple-700 mb-2" />
                  <CardTitle className="text-base">الدردشة المباشرة</CardTitle>
                  <CardDescription className="text-xs">
                    تحدث مع فريق الدعم مباشرة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    بدء محادثة
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

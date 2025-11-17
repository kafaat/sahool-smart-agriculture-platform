# دليل تشغيل منصة سهول الزراعية الذكية باستخدام Docker

## المتطلبات الأساسية

- Docker (الإصدار 20.10 أو أحدث)
- Docker Compose (الإصدار 2.0 أو أحدث)

## التشغيل السريع

### 1. استنساخ المشروع

```bash
git clone https://github.com/kafaat/sahool-smart-agriculture-platform.git
cd sahool-smart-agriculture-platform
```

### 2. تشغيل المشروع

```bash
docker-compose up -d
```

سيقوم Docker Compose بـ:
- تنزيل صور Docker اللازمة
- بناء صورة التطبيق
- إنشاء قاعدة بيانات MySQL
- تشغيل التطبيق على المنفذ 3000

### 3. الوصول إلى المنصة

افتح المتصفح وانتقل إلى:
```
http://localhost:3000
```

## الأوامر المفيدة

### عرض السجلات (Logs)

```bash
# عرض سجلات جميع الخدمات
docker-compose logs -f

# عرض سجلات التطبيق فقط
docker-compose logs -f app

# عرض سجلات قاعدة البيانات فقط
docker-compose logs -f mysql
```

### إيقاف المشروع

```bash
# إيقاف مؤقت
docker-compose stop

# إيقاف وحذف الحاويات
docker-compose down

# إيقاف وحذف الحاويات والبيانات
docker-compose down -v
```

### إعادة بناء المشروع

```bash
# إعادة بناء بعد تعديل الكود
docker-compose up -d --build
```

### الدخول إلى حاوية التطبيق

```bash
docker exec -it sahool_app sh
```

### الدخول إلى قاعدة البيانات

```bash
docker exec -it sahool_mysql mysql -u sahool_user -p
# كلمة المرور: sahool_pass_2024
```

## المتغيرات البيئية

يمكنك تخصيص المتغيرات البيئية في ملف `docker-compose.yml`:

```yaml
environment:
  - DATABASE_URL=mysql://sahool_user:sahool_pass_2024@mysql:3306/sahool_db
  - JWT_SECRET=your-super-secret-jwt-key-change-in-production
  - VITE_APP_TITLE=منصة سهول الزراعية الذكية
```

**⚠️ مهم:** تأكد من تغيير `JWT_SECRET` في بيئة الإنتاج!

## البيانات المستمرة

البيانات محفوظة في Docker volumes:
- `mysql_data`: بيانات قاعدة البيانات

لحذف البيانات بالكامل:
```bash
docker-compose down -v
```

## استكشاف الأخطاء

### المشكلة: التطبيق لا يعمل

```bash
# تحقق من حالة الحاويات
docker-compose ps

# عرض السجلات
docker-compose logs -f app
```

### المشكلة: قاعدة البيانات لا تعمل

```bash
# تحقق من صحة قاعدة البيانات
docker-compose exec mysql mysqladmin ping -h localhost -u root -p
```

### المشكلة: المنفذ 3000 مستخدم

قم بتغيير المنفذ في `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # استخدم 8080 بدلاً من 3000
```

## الإنتاج (Production)

للنشر في بيئة الإنتاج:

1. غيّر كلمات المرور في `docker-compose.yml`
2. غيّر `JWT_SECRET` إلى قيمة عشوائية قوية
3. استخدم متغيرات بيئية خارجية بدلاً من القيم المباشرة
4. فعّل HTTPS باستخدام Nginx أو Traefik
5. قم بعمل نسخ احتياطية منتظمة لقاعدة البيانات

## الدعم

للمساعدة والدعم، يرجى فتح issue على GitHub:
https://github.com/kafaat/sahool-smart-agriculture-platform/issues

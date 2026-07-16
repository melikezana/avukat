# Av. İdris Dağkesen Web Sitesi

Next.js 14 App Router, TypeScript, TailwindCSS ve MDX tabanlı avukat web sitesi. Site; dijital kartvizit, uzmanlık alanları vitrini ve anlaşılır hukuk yazıları platformu olarak tasarlandı.

## Kurulum

```bash
npm install
npm run dev
```

Geliştirme sunucusu varsayılan olarak `http://localhost:3000` adresinde açılır.

## Supabase Kurulumu

Supabase bağlantısı `lib/supabase/config.ts`, `lib/supabase/client.ts` ve `lib/supabase/server.ts` yardımcıları üzerinden kurulur. Browser ve server client'ları aynı public proje URL'i ve publishable key değerini kullanır.

Yerel geliştirme için `.env.local` dosyasına şu alanları ekleyin:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_xxxxxxxxxxxxxxxxxxxxx"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_or_service_role_xxxxxxxxxxxxxxxxxxxxx"
SUPABASE_SECRET_KEY="sb_secret_xxxxxxxxxxxxxxxxxxxxx"
```

Bu değerler eksikse Supabase client oluşturulurken hangi environment variable'ın eksik olduğunu belirten açıklayıcı bir hata üretilir. Örnek değerler için `.env.example` dosyasını kullanın; gerçek anahtarları GitHub'a eklemeyin.

### Makale CMS migration

Admin makale yönetimi Supabase `public.articles` tablosunu ve `article-images` Storage bucket'ını kullanır. SEO alanları ve içerik görseli klasörü için aşağıdaki SQL dosyasını Supabase panelindeki SQL Editor'da manuel olarak çalıştırın:

```text
supabase/migrations/20260714223000_add_article_cms_seo_fields.sql
```

Bu dosya otomatik çalıştırılmadı. Migration `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` ile şu alanları ekler: `seo_title`, `seo_description`, `canonical_url`, `og_image_url`, `focus_keyword`, `author_name`. Ayrıca `article-images` bucket politikalarında `article-covers/` yanında `article-content/` klasörüne de izin verir.

Makale silme işlemi yalnızca `articles` kaydını siler; kapak görseli veya içerik görselleri Storage üzerinden otomatik kaldırılmaz. Kullanılmayan Storage dosyaları için ileride ayrı, güvenli ve referans kontrolü yapan bir temizlik sistemi kurulmalıdır.

### Karar PDF alanları ve Storage bucket

Karar PDF'i, karar künyesi ve PDF bağlantısı alanları için aşağıdaki migration dosyasını Supabase SQL Editor'da manuel olarak çalıştırın:

```text
supabase/migrations/20260716090000_add_article_decision_pdf_fields.sql
```

Bu dosya otomatik çalıştırılmaz. Migration `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` ile `decision_pdf_url`, `decision_pdf_title`, `decision_court`, `decision_case_no`, `decision_number` ve `decision_date` kolonlarını ekler.

PDF yükleme için Supabase Dashboard > Storage bölümünde `legal-documents` adında public bir bucket oluşturun. Bucket public değilse makale detayında kullanılacak public PDF URL'i üretilemez. Admin formundaki PDF yükleme işlemi dosyaları bu bucket içinde `court-decisions/` klasörüne güvenli ve benzersiz dosya adıyla yükler.

Karar makalesi eklemek için admin panelinde makaleyi oluşturun veya düzenleyin, `Karar Bilgileri` accordion alanındaki mahkeme/esas/karar/tarih bilgilerini doldurun, ardından `Karar PDF'i` accordion alanında PDF URL girin ya da PDF dosyası yükleyin. Yükleme yalnızca oturum açmış admin için açıktır, sadece `application/pdf` kabul eder ve en fazla 15 MB dosya yükler. PDF kaldırma butonu yalnızca makale kaydındaki bağlantıyı temizler; Storage dosyasını otomatik silmez.

Open Graph görsel URL'i boş bırakılırsa sistem kapak görseli URL'ini fallback olarak kullanır. Canonical URL manuel girilmezse kayıt sırasında makale slug'ından otomatik canonical URL üretilir.

## Üretim build

```bash
npm run build
npm run start
```

## Yeni makale ekleme

1. `content/articles` klasörüne yeni bir `.mdx` dosyası ekleyin.
2. Dosya adını URL slug olacak şekilde yazın: `ornek-makale-basligi.mdx`.
3. Dosyanın başına şu frontmatter alanlarını ekleyin:

```mdx
---
title: "Makale Başlığı"
slug: "ornek-makale-basligi"
date: "2026-07-10"
excerpt: "Kısa makale özeti."
category: "Genel Hukuk"
coverImage: "/images/articles/hukuk-okuryazarligi.svg"
readingTime: 4
author: "Av. İdris Dağkesen"
metaTitle: "SEO başlığı"
metaDescription: "SEO açıklaması"
---

Makale içeriği buraya yazılır.
```

`summary` veya `excerpt` alanlarından biri yeterlidir; yeni makalelerde `excerpt` tercih edilebilir. `slug` yazılmazsa dosya adı URL olarak kullanılır. `metaTitle` boş bırakılırsa sistem başlığı, `metaDescription` boş bırakılırsa `excerpt`/`summary` metnini kullanır. `readingTime` yazılmazsa okuma süresi otomatik hesaplanır.

Kapak görseli `public/images/articles` altında yoksa site kategoriye göre bordo, lacivert ve kırık altın tonlarında CSS fallback kapak üretir. Gerçek `coverImage` dosyası eklendiğinde aynı frontmatter yolu üzerinden otomatik kullanılmaya başlar.

## Renk Paleti

Ana renk tokenları `tailwind.config.ts` içinde tanımlıdır:

- Background / krem: `background` - `#FAF7F1`
- Primary / navy-black: `primary` - `#0A1628`
- Accent 1 / bordo marka rengi: `accent-1` - `#7A1F2B`
- Accent 2 / koyu kırık altın: `accent-2` - `#8B6A2F`
- Text muted: `text-muted` ve `muted` - `#5C5854`

Bordo renk CTA butonları, aktif menü bağlantıları, alıntı kutuları, ayraç çizgileri ve ikon vurgularında kullanılır. Kırık altın daha çok ince border, küçük ikon detayı ve hover vurgusu için ayrılmıştır.

## Portre Fotoğrafı

Portre görseli `public/images/idris-dagkesen.jpg` yolundan kullanılır. Ana sayfa hero alanı, hakkımda sayfası, makale detayındaki yazar kutusu ve küçük avatar yüzeyleri bu dosyaya bağlıdır.

Güncel portre kare kadrajlıdır. Büyük görsel alanları ve küçük avatarlar bu kare görsele göre ayarlanmıştır. Görsel `next/image` ile blur placeholder ve responsive `sizes` değerleriyle optimize edilir.

## Fontlar

Font aileleri `app/layout.tsx` içinde `next/font/google` ile yüklenir. `display: "swap"` ve `latin-ext` alt kümesi kullanılır; font değişkenleri layout üzerinden `--font-display` ve `--font-body` olarak atanır.

`app/globals.css` içinde aynı değişkenler için sistem fallback değerleri tutulur. Böylece font yüklenmesi gecikirse layout shift oluşmadan okunabilir fallback devreye girer.

Başlık fontu için `Playfair Display`, gövde metni için `Inter` kullanılır.

## İletişim Formu

Form `app/api/contact/route.ts` API route'una gönderim yapar ve doğrulanan mesajları Supabase `public.contact_messages` tablosuna kaydeder. Gerçek e-posta gönderimi admin panelindeki mesaj yanıt akışında Resend üzerinden yapılır.

Gerçek e-posta gönderimi için `.env.local` dosyasına şu alanları ekleyin:

```bash
RESEND_API_KEY="re_xxxxxxxxx"
CONTACT_EMAIL="Av.idrisdagkesen@gmail.com"
EMAIL_FROM="Av. İdris Dağkesen <iletisim@idrisdagkesen.com>"
CONTACT_FROM_EMAIL="Av.idrisdagkesen@gmail.com"
NEXT_PUBLIC_SITE_URL="https://www.idrisdagkesen.com"
```

Örnek ortam değişkenleri için `.env.example` dosyasını kullanın. Gerçek API anahtarlarını bu dosyaya ya da GitHub'a eklemeyin.

## Analytics

Sayfa görüntüleme takibi için Vercel Analytics kullanılır. `app/layout.tsx` içinde `@vercel/analytics/next` bileşeni yer alır. Bu kurulum kişisel veri, reklam çerezi veya pazarlama profili toplamaz; amaç hangi sayfa ve makalelerin daha çok okunduğunu genel düzeyde görmektir.

Vercel üzerinde ek bir ortam değişkeni gerekmez. Site Vercel'e deploy edildiğinde Analytics panelinden proje bazında etkinleştirilebilir.

## Vercel Ortam Değişkenleri

Vercel panelinde proje ayarlarından `Settings > Environment Variables` bölümüne aşağıdaki değerleri ekleyin:

| Değişken | Zorunluluk | Açıklama |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Zorunlu | Üretim alan adı. Örnek: `https://www.idrisdagkesen.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase kullanımı için zorunlu | Supabase proje URL'i. Örnek: `https://your-project-ref.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase kullanımı için zorunlu | Supabase publishable key değeri. |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin görsel yükleme için zorunlu | Sunucu tarafında, yönetici oturumu doğrulandıktan sonra `article-images` Storage bucket'ına yazmak için kullanılan gizli Supabase anahtarı. Client'a gönderilmez. |
| `SUPABASE_SECRET_KEY` | Alternatif admin anahtarı | `SUPABASE_SERVICE_ROLE_KEY` yoksa upload route'u bu değeri kullanır. Client'a gönderilmez. |
| `RESEND_API_KEY` | Admin yanıt e-postası için zorunlu | Admin panelinden gelen mesaj sahibine gerçek e-posta yanıtı göndermek için Resend API anahtarı. |
| `CONTACT_EMAIL` | Önerilir | Form mesajlarının gideceği adres. |
| `EMAIL_FROM` | Önerilir | Admin panelinden gönderilen yanıtlarda kullanılacak doğrulanmış gönderen. Örnek: `Av. İdris Dağkesen <iletisim@idrisdagkesen.com>` |
| `CONTACT_FROM_EMAIL` | Geriye dönük destek | Eski gönderici değişkeni. `EMAIL_FROM` yoksa fallback olarak kullanılabilir. |

Admin girişi Supabase Auth e-posta/şifre akışıyla yapılır. Ayrı admin kullanıcı adı, şifre hash'i veya oturum sırrı değişkeni kullanılmaz.

Değerleri Production, Preview ve Development ortamları için ayrı ayrı tanımlayabilirsiniz. Gizli değerleri kod deposuna eklemeyin.

## Vercel'e Deploy Adımları

1. GitHub deposunu Vercel'e bağlayın.
2. Framework olarak Next.js seçili olduğundan emin olun.
3. Build komutu `npm run build`, install komutu `npm install` olarak kalabilir.
4. `Settings > Environment Variables` bölümüne yukarıdaki değişkenleri ekleyin.
5. İlk deploy tamamlandıktan sonra Vercel'in verdiği geçici URL üzerinden siteyi kontrol edin.
6. Gerçek domain bağlandıktan sonra `NEXT_PUBLIC_SITE_URL` değerini canlı domain ile güncelleyin ve yeniden deploy alın.

Deploy öncesinde yerelde `npm run lint` ve `npm run build` komutlarının hatasız geçtiğini doğrulayın.

## Custom Domain Bağlama

1. Vercel'de projeyi açın ve `Settings > Domains` bölümüne girin.
2. Kullanmak istediğiniz alan adını ekleyin: örnek `www.idrisdagkesen.com`.
3. Vercel'in verdiği DNS kaydını alan adı sağlayıcınızın paneline girin. Genellikle `www` için `CNAME` kaydı kullanılır.
4. Kök alan adı da kullanılacaksa Vercel'in gösterdiği `A` veya `CNAME` yönlendirmesini ayrıca ekleyin.
5. DNS yayılımı tamamlandıktan sonra Vercel otomatik SSL sertifikasını üretir.
6. Domain aktif olunca `NEXT_PUBLIC_SITE_URL` değerini canlı domain ile aynı olacak şekilde güncelleyin ve yeniden deploy alın.

DNS değişiklikleri bazı sağlayıcılarda birkaç dakika, bazılarında birkaç saat sürebilir.

## İletişim Bilgileri

Sitede görünen telefon, e-posta, WhatsApp ve sosyal medya bağlantıları `lib/site-profile.ts` içinde tek merkezden yönetilir.

- Telefon: `0534 052 80 99`
- WhatsApp: `https://wa.me/905340528099`
- E-posta: `Av.idrisdagkesen@gmail.com`
- Instagram: `https://instagram.com/av.idrisdagkesen`
- X: `https://x.com/avidrisdagkesen`

## SEO

- Makale sayfalarında SEO başlığı ve açıklaması frontmatter üzerinden otomatik üretilir.
- `app/sitemap.ts` ile `/sitemap.xml` oluşturulur.
- `app/robots.ts` ile `/robots.txt` oluşturulur.
- Site URL'i için `NEXT_PUBLIC_SITE_URL` değişkenini ayarlayın.

## Canlı Yayın Öncesi Ortam Değişkenleri

Ana üretim domaini:

```bash
NEXT_PUBLIC_SITE_URL=https://www.idrisdagkesen.com
```

| Değişken | Zorunlu mu? | Public/Secret | Nereden alınır ve ne işe yarar? | Vercel ortamı |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Zorunlu | Public | Canonical, sitemap, robots, Open Graph ve JSON-LD için ana site URL'i. | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | Zorunlu | Public | Supabase Project Settings > API bölümündeki proje URL'i. | Tümü |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Zorunlu | Public | Supabase publishable/anon key. Browser ve SSR public client için kullanılır. | Tümü |
| `SUPABASE_SECRET_KEY` | Admin işlemleri için zorunlu | Secret | Server-side admin/storage işlemleri için Supabase secret/service role key. Client'a yazılmaz. | Production ve güvenli Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Alternatif secret | Secret | `SUPABASE_SECRET_KEY` yerine veya onunla birlikte kullanılabilir. | Production ve güvenli Preview |
| `GOOGLE_SITE_VERIFICATION` | Opsiyonel | Secret sayılmaz | Google Search Console meta doğrulama değeri. Boşsa meta etiketi üretilmez. | Production |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Opsiyonel | Public | GA4 Admin > Data streams bölümündeki `G-...` Measurement ID. GTM tanımlıysa doğrudan GA4 devre dışı kalır. | Production |
| `NEXT_PUBLIC_GTM_ID` | Opsiyonel | Public | Google Tag Manager container ID (`GTM-...`). GA4'ü GTM üzerinden yönetmek için kullanılır. | Production |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` | Opsiyonel | Public | Google Maps > Paylaş > Harita yerleştir bölümündeki `https://www.google.com/maps/embed...` URL'i. | Production |
| `RESEND_API_KEY` | Gerçek e-posta için zorunlu | Secret | Resend API Keys bölümünden alınır. | Production |
| `EMAIL_FROM` | Gerçek e-posta için önerilir | Secret sayılmaz ama server-only tutulmalı | Resend'de doğrulanmış gönderen. Örnek: `Av. İdris Dağkesen <iletisim@idrisdagkesen.com>`. | Production |
| `CONTACT_EMAIL` | Önerilir | Secret sayılmaz | Yanıtların `reply_to` adresi ve iletişim adresi. | Production |

Gerçek secret/API key değerlerini kaynak koda, README'ye veya client componentlerine yazmayın.

## Google Search Console

1. Google Search Console'da Domain property veya `https://www.idrisdagkesen.com` için URL-prefix property oluşturun.
2. Domain property için DNS TXT kaydı, URL-prefix için meta etiketi doğrulaması kullanın. Meta doğrulamada verilen değeri `GOOGLE_SITE_VERIFICATION` olarak Vercel'e ekleyin.
3. Doğrulama tamamlandıktan sonra `https://www.idrisdagkesen.com/sitemap.xml` adresini gönderin.
4. HTTPS ve `www` sürümünün aktif olduğunu, root domainin `www` adresine 308 ile yönlendiğini kontrol edin.

Search Console mülk oluşturma, DNS kaydı ekleme ve Google tarafındaki doğrulama Codex tarafından dış serviste otomatik tamamlanamaz; alan adı ve Google hesabı sahibi tarafından yapılmalıdır.

## GA4, GTM ve Çerez/KVKK Notu

İki kullanım yöntemi desteklenir:

- A) Doğrudan GA4: `NEXT_PUBLIC_GA_MEASUREMENT_ID` girilir, `NEXT_PUBLIC_GTM_ID` boş kalır.
- B) GTM üzerinden GA4: `NEXT_PUBLIC_GTM_ID` girilir, GA4 tag'i GTM içinde yönetilir.

`NEXT_PUBLIC_GTM_ID` varsa kod doğrudan GA4 scriptini varsayılan olarak yüklemez. İkisini aynı anda etkinleştirmek veya GTM içinde ayrıca page view tetiklemek çift ölçüm oluşturabilir. Google scriptleri production dışında çalışmaz ve kullanıcı analitik tercihi kabul edilmeden yüklenmez. GA4/GTM kullanımı çerez ve KVKK yükümlülüğü doğurabileceğinden yayına alınmadan önce hukuki/KVKK danışmanlığı alınmalıdır.

Vercel Analytics ve Speed Insights root layout'a eklenmiştir. Vercel panelinde proje bazında ayrıca etkinleştirilmesi gerekebilir.

## Google Maps Embed

1. Google Maps'te ofis konumunu açın.
2. Paylaş > Harita yerleştir bölümünden iframe kodunu alın.
3. Kodun tamamını değil, sadece `src` içindeki `https://www.google.com/maps/embed...` URL'ini `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` olarak Vercel'e girin.
4. Ofis adresi kesin değilse değişkeni boş bırakın; site kurumsal placeholder göstermeye devam eder.

## Resend ile Admin Yanıtları

Admin mesaj yanıt sistemi `RESEND_API_KEY`, `EMAIL_FROM` ve `CONTACT_EMAIL` değerleri varsa gerçek e-posta gönderir. Eksikse kullanıcıya yapılandırma eksik mesajı gösterir. Resend domain doğrulaması Resend panelinde manuel yapılmalıdır; gönderici domain doğrulanmadan production e-posta gönderimi çalışmayabilir veya kısıtlanabilir.

Yanıt tarihi ve yanıt metni için şu migration Supabase SQL Editor'da manuel çalıştırılmalıdır:

```text
supabase/migrations/20260714_production_features.sql
```

Bu migration otomatik çalıştırılmadı.

## Yasal Metinler

Şu public sayfalar taslak olarak eklendi:

- `/gizlilik`
- `/kvkk-aydinlatma`
- `/kullanim-kosullari`

Bu metinler profesyonel taslak niteliğindedir. Yayına alınmadan önce hukukçu tarafından gözden geçirilmelidir.

## Yedekleme Planı

- Supabase'in otomatik yedekleme özelliklerini proje planına göre kontrol edin.
- Veritabanı exportlarını düzenli alın.
- Storage dosyalarını veritabanından ayrı yedekleyin.
- GitHub repository yedeğini koruyun.
- Environment variable listesini güvenli bir parola yöneticisinde saklayın; secret değerleri repoya eklemeyin.
- Aylık manuel yedek kontrolü yapın.
- Belirli aralıklarla restore testi planlayın.

Opsiyonel export scriptleri:

```bash
npx tsx scripts/export-articles.ts
npx tsx scripts/export-contact-messages.ts
```

Scriptler `SUPABASE_SERVICE_ROLE_KEY` veya `SUPABASE_SECRET_KEY` değerini environment variable'dan okur ve çıktıları `backups/` klasörüne yazar. `backups/` git dışında bırakılmıştır.

## Canlıda Manuel Test Edilecek URL'ler

- `https://www.idrisdagkesen.com/`
- `https://www.idrisdagkesen.com/hakkimda`
- `https://www.idrisdagkesen.com/uzmanlik-alanlari`
- `https://www.idrisdagkesen.com/makaleler`
- `https://www.idrisdagkesen.com/iletisim`
- `https://www.idrisdagkesen.com/gizlilik`
- `https://www.idrisdagkesen.com/kvkk-aydinlatma`
- `https://www.idrisdagkesen.com/kullanim-kosullari`
- `https://www.idrisdagkesen.com/sitemap.xml`
- `https://www.idrisdagkesen.com/robots.txt`
- `https://www.idrisdagkesen.com/yonetim-giris`

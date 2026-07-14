# QA Raporu

Tarih: 2026-07-14

Kapsam: Statik kod incelemesi, `npm run lint` ve `npm run build`. Talimat gereği `npm run dev`, arka plan sunucusu, Lighthouse, tarayıcı otomasyonu, gerçek e-posta gönderimi, Supabase migration çalıştırma ve Vercel deploy yapılmadı.

## PUBLIC

- [x] Ana sayfa route'u build edildi.
- [x] Hakkımda route'u build edildi.
- [x] Uzmanlık alanları route'u build edildi.
- [x] Makale listesi route'u build edildi.
- [x] MDX makale detay route'ları build edildi.
- [x] Gizlilik/KVKK/Kullanım Koşulları sayfaları eklendi ve build edildi.
- [x] 404, loading, error ve global-error yüzeyleri eklendi.
- [ ] Supabase published makaleler canlı veritabanıyla manuel test gerekli.
- [ ] Taslakların public sitede görünmediği canlı veritabanıyla manuel test gerekli.
- [ ] İletişim formu gerçek Supabase ortamında manuel test gerekli.

## SEO

- [x] Canonical URL merkezi `NEXT_PUBLIC_SITE_URL` config'ine bağlandı.
- [x] Global Open Graph ve Twitter Card metadata eklendi.
- [x] Dinamik `opengraph-image`, `twitter-image`, `icon`, `apple-icon` ve manifest eklendi.
- [x] Person, WebSite ve LegalService JSON-LD ana sayfaya eklendi.
- [x] Breadcrumb görsel nav ve BreadcrumbList JSON-LD public alt sayfalara eklendi.
- [x] Article/BlogPosting schema MDX ve Supabase published makaleler için üretilecek şekilde güncellendi.
- [x] `sitemap.xml` public sayfalar, yasal sayfalar, MDX ve Supabase published makaleleri içerir.
- [x] `robots.txt` production dışı preview ortamlarında noindex/disallow davranışı kullanır.
- [ ] Search Console doğrulaması dış serviste manuel yapılmalı.
- [ ] Canlı `sitemap.xml` ve `robots.txt` URL'leri deploy sonrası manuel açılmalı.

## ADMIN

- [x] `/admin` sayfaları middleware ile Supabase oturumuna bağlı kalıyor.
- [x] Admin login server-side route'a taşındı ve rate limit eklendi.
- [x] Admin dashboard gerçek Supabase sayımlarını ve son kayıtları göstermeye hazır.
- [x] Mesaj listeleme, durum değiştirme, silme ve yanıt API'lerinde same-origin/rate-limit kontrolleri var.
- [x] Resend yanıt sistemi `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_EMAIL` ile server-side çalışacak şekilde hazır.
- [x] Medya kütüphanesi bucket listeleme, URL/HTML kopyalama ve güvenli silme API'si içeriyor.
- [ ] Makale oluşturma/taslak/yayınlama/düzenleme/silme gerçek Supabase ortamında manuel test edilmeli.
- [ ] Görsel yükleme ve medya silme canlı bucket üzerinde manuel test edilmeli.
- [ ] E-posta yanıtı Resend domain doğrulaması sonrası manuel test edilmeli.

## GÜVENLİK

- [x] Secret key client koduna eklenmedi.
- [x] Contact form honeypot, Zod validation, same-origin ve rate-limit içeriyor.
- [x] Admin login, upload, mesaj ve medya mutasyonlarında rate-limit var.
- [x] Resend API key yalnızca server route içinde kullanılıyor.
- [x] Security headers ve CSP `next.config.mjs` üzerinden eklendi.
- [x] Server error loglarında Supabase `code`, `message`, `details`, `hint` alanları kritik yerlerde korunuyor.
- [x] Supabase migration dosyası RLS, index ve reply alanlarını idempotent şekilde içeriyor.
- [ ] RLS politikaları Supabase SQL Editor'da migration çalıştırıldıktan sonra manuel doğrulanmalı.
- [ ] Client bundle secret taraması deploy çıktısında manuel doğrulanmalı.

## BUILD

- [x] `npm run lint` başarılı.
- [x] `npm run build` başarılı.
- [x] TypeScript hataları düzeltildi.
- [ ] Lighthouse çalıştırılmadı; canlı/preview ortamda manuel test gerekli.
- [ ] Tarayıcı responsive ve erişilebilirlik QA'sı manuel yapılmalı.

## Manuel Dış Servis Adımları

- Google Search Console property oluşturma ve DNS/meta doğrulama.
- `https://www.idrisdagkesen.com/sitemap.xml` gönderme.
- Vercel Analytics ve Speed Insights panel aktivasyonu.
- GA4 veya GTM ölçüm yapılandırması ve KVKK/çerez uygunluk değerlendirmesi.
- Resend domain doğrulaması.
- Supabase SQL Editor'da `supabase/migrations/20260714_production_features.sql` çalıştırma.

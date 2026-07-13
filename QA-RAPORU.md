# QA Raporu

Tarih: 2026-07-13

Bu rapor yalnızca statik dosya incelemesi, kod düzenlemesi, `npm run lint` ve `npm run build` kapsamına göre hazırlanmıştır. Talimat gereği `npm run dev`, arka plan sunucusu, Lighthouse, tarayıcı otomasyonu, gerçek e-posta gönderimi ve Vercel deploy çalıştırılmamıştır.

## Kontrol Listesi

| Kontrol | Durum | Not |
| --- | --- | --- |
| Mobil, tablet ve masaüstü responsive yapı | Kod üzerinden doğrulandı | Tailwind grid/flex kırılımları ve responsive `sizes` değerleri kod üzerinden incelendi. Tarayıcıda görsel kontrol yapılmadığı için son görsel QA manuel yapılmalıdır. |
| Dahili linkler | Kod üzerinden doğrulandı | Navbar, footer, CTA, makale liste/detay ve 404 bağlantıları statik olarak kontrol edildi. |
| Sosyal medya, telefon, e-posta ve WhatsApp linkleri | Kod üzerinden doğrulandı | Linkler `lib/site-profile.ts` üzerinden merkezi yönetiliyor. Instagram/X URL'leri, telefon, mailto ve WhatsApp bağlantıları statik olarak mevcut; canlı tıklama testi yapılmadı. |
| Özel 404 sayfası | Tamamlandı | `app/not-found.tsx` eklendi ve site kimliğiyle uyumlu bağlantılar içeriyor. |
| Admin paneli koruması | Manuel test gerekli | Kod tabanında admin paneli veya admin login route'u bulunmadı. Admin modülü eklendiğinde koruma ayrıca test edilmelidir. |
| İletişim formu mail altyapısı | Kod üzerinden doğrulandı | Form `RESEND_API_KEY` ile Resend'e gönderim yapacak şekilde hazır. Gerçek mail gönderimi talimat gereği test edilmedi; manuel test gerekli. |
| Görsel optimizasyonu | Kod üzerinden doğrulandı | Projedeki görseller `next/image` ile kullanılıyor. Ana sayfa hero görselinde `priority` var; hero dışındaki görsellerde priority kullanılmıyor ve `sizes` değerleri mevcut. |
| Erişilebilirlik | Kod üzerinden doğrulandı | Image alt metinleri, iletişim formu `label/htmlFor/id` eşleşmeleri ve görünür `focus-visible` stilleri kod üzerinden kontrol edildi. Admin formu mevcut değil. |
| Analytics | Tamamlandı | `@vercel/analytics` eklendi ve root layout içine `Analytics` componenti yerleştirildi. Çerez bannerı veya özel kişisel takip kodu eklenmedi. |
| SEO | Kod üzerinden doğrulandı | Metadata, canonical, Open Graph, sitemap ve robots dosyaları mevcut. Yeni makaleler dosya olarak olmadığı için onların SEO çıktısı doğrulanamadı. |
| npm run lint | Tamamlandı | `npm run lint` hatasız geçti: ESLint uyarısı veya hatası yok. |
| npm run build | Tamamlandı | `npm run build` hatasız geçti. Build çıktısında mevcut 4 makale route'u üretildi; eksik iki MDX dosyası route olarak oluşmadı. |

## İçerik Entegrasyonu Notları

| Kontrol | Durum | Not |
| --- | --- | --- |
| `content/articles/gozaltina-alinirsaniz-haklariniz.mdx` | Manuel test gerekli | Dosya çalışma alanında bulunamadı; makale gövdesi olmadığı için frontmatter uyarlaması yapılamadı. |
| `content/articles/sirket-kurmadan-once-bilmeniz-gerekenler.mdx` | Manuel test gerekli | Dosya çalışma alanında bulunamadı; makale gövdesi olmadığı için frontmatter uyarlaması yapılamadı. |
| `content/site-metinleri-final.md` | Manuel test gerekli | Dosya çalışma alanında bulunamadı; final metinler ilgili component'lere birebir yerleştirilemedi. |
| Kategori filtresinde Ceza Hukuku ve Ticaret Hukuku | Tamamlandı | `lib/articles.ts` öncelikli kategori listesine iki kategori eklendi. |
| Uzmanlık Alanları 6 kart | Tamamlandı | Kira, İş, Aile, Ceza, Ticaret ve Gayrimenkul Hukuku kartları `lib/data/practice-areas.ts` içinde oluşturuldu. |

## Lighthouse

Durum: Manuel test gerekli

Talimat gereği Lighthouse çalıştırılmadı. Performance, Accessibility, Best Practices ve SEO skorları için canlı/preview ortamda tarayıcı üzerinden Lighthouse veya Vercel Speed Insights kontrolü ayrıca yapılmalıdır.

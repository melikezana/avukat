<<<<<<< HEAD
# Av. İdris Dağkesen Web Sitesi

Next.js 14 App Router, TypeScript, TailwindCSS ve MDX tabanlı avukat web sitesi. Site; dijital kartvizit, uzmanlık alanları vitrini ve anlaşılır hukuk yazıları platformu olarak tasarlandı.

## Kurulum

```bash
npm install
npm run dev
```

Geliştirme sunucusu varsayılan olarak `http://localhost:3000` adresinde açılır.

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

Form `app/api/contact/route.ts` API route'una gönderim yapar. Resend API anahtarı yoksa yerel geliştirmede önizleme modunda başarılı yanıt döner; gerçek e-posta gönderimi için Resend değişkenleri ayarlanmalıdır.

Gerçek e-posta gönderimi için `.env.local` dosyasına şu alanları ekleyin:

```bash
RESEND_API_KEY="re_xxxxxxxxx"
CONTACT_EMAIL="Av.idrisdagkesen@gmail.com"
CONTACT_FROM_EMAIL="Av.idrisdagkesen@gmail.com"
NEXT_PUBLIC_SITE_URL="https://www.idrisdagkesen.av.tr"
```

Örnek ortam değişkenleri için `.env.example` dosyasını kullanın. Gerçek API anahtarı, oturum sırrı veya şifre hash'i bu dosyaya ya da GitHub'a eklenmemelidir.

## Analytics

Sayfa görüntüleme takibi için Vercel Analytics kullanılır. `app/layout.tsx` içinde `@vercel/analytics/next` bileşeni yer alır. Bu kurulum kişisel veri, reklam çerezi veya pazarlama profili toplamaz; amaç hangi sayfa ve makalelerin daha çok okunduğunu genel düzeyde görmektir.

Vercel üzerinde ek bir ortam değişkeni gerekmez. Site Vercel'e deploy edildiğinde Analytics panelinden proje bazında etkinleştirilebilir.

## Vercel Ortam Değişkenleri

Vercel panelinde proje ayarlarından `Settings > Environment Variables` bölümüne aşağıdaki değerleri ekleyin:

| Değişken | Zorunluluk | Açıklama |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Zorunlu | Üretim alan adı. Örnek: `https://www.idrisdagkesen.av.tr` |
| `RESEND_API_KEY` | Gerçek mail için zorunlu | İletişim formunun e-posta göndermesi için Resend API anahtarı. |
| `CONTACT_EMAIL` | Önerilir | Form mesajlarının gideceği adres. |
| `CONTACT_FROM_EMAIL` | Önerilir | Resend'de doğrulanmış gönderici adresi. Yazılmazsa `CONTACT_EMAIL` kullanılır. |
| `ADMIN_PASSWORD_HASH` | Admin modülü varsa zorunlu | Bu kod tabanında şu an admin paneli yoktur; eklendiğinde düz şifre yerine hash saklanmalıdır. |
| `SESSION_SECRET` | Admin modülü varsa zorunlu | Admin oturumu imzalamak için uzun ve rastgele gizli değer. |

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
2. Kullanmak istediğiniz alan adını ekleyin: örnek `www.idrisdagkesen.av.tr`.
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
=======
# avukat
>>>>>>> ff695a55e49d21913d8ab3705ee4b43c1e462568

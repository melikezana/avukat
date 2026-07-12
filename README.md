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
- Accent 2 / kırık altın: `accent-2` - `#B8965A`
- Text muted: `text-muted` ve `muted` - `#5C5854`

Bordo renk CTA butonları, aktif menü bağlantıları, alıntı kutuları, ayraç çizgileri ve ikon vurgularında kullanılır. Kırık altın daha çok ince border, küçük ikon detayı ve hover vurgusu için ayrılmıştır.

## Portre Fotoğrafı

Portre görseli `public/images/idris-dagkesen.jpg` yolundan kullanılır. Ana sayfa hero alanı, hakkımda sayfası, makale detayındaki yazar kutusu ve küçük avatar yüzeyleri bu dosyaya bağlıdır.

Güncel portre kare kadrajlıdır. Büyük görsel alanları ve küçük avatarlar bu kare görsele göre ayarlanmıştır. Görsel `next/image` ile blur placeholder ve responsive `sizes` değerleriyle optimize edilir.

## Fontlar

Font aileleri `app/globals.css` içinde tanımlıdır:

```css
--font-display: "Playfair Display", "Fraunces", Georgia, serif;
--font-body: "Inter", "Manrope", "Segoe UI", Arial, sans-serif;
```

Başlık fontu için `--font-display`, gövde metni için `--font-body` değerini düzenleyebilirsiniz.

## İletişim Formu

Form `app/api/contact/route.ts` API route'una gönderim yapar. Resend API anahtarı yoksa yerel geliştirmede önizleme modunda çalışır ve mesajı konsola yazar.

Gerçek e-posta gönderimi için `.env.local` dosyasına şu alanları ekleyin:

```bash
RESEND_API_KEY="re_xxxxxxxxx"
CONTACT_TO_EMAIL="Av.idrisdagkesen@gmail.com"
CONTACT_FROM_EMAIL="Av.idrisdagkesen@gmail.com"
NEXT_PUBLIC_SITE_URL="https://www.idrisdagkesen.av.tr"
```

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

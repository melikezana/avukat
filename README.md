# Av. İdris Dağkesen Web Sitesi

Next.js 14 App Router, TypeScript, TailwindCSS ve MDX tabanlı premium avukat web sitesi. Site; dijital kartvizit, uzmanlık alanları vitrini ve sade dilli hukuk makaleleri yayın platformu olarak tasarlandı.

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
date: "2026-07-10"
summary: "Kısa makale özeti."
category: "Genel Hukuk"
coverImage: "/images/articles/hukuk-okuryazarligi.svg"
metaTitle: "SEO başlığı"
metaDescription: "SEO açıklaması"
---

Makale içeriği buraya yazılır.
```

`metaTitle` ve `metaDescription` boş bırakılırsa sistem başlık ve özeti kullanır.

## Renkleri değiştirme

Ana renk paleti `tailwind.config.ts` içinde bulunur:

- Lacivert: `navy.900`
- Altın/bronz: `gold.500`
- Krem zemin: `cream.50`

Bu değerleri değiştirdiğinizde tüm arayüz otomatik olarak yeni paleti kullanır.

## Fontları değiştirme

Font aileleri `app/globals.css` içinde tanımlıdır:

```css
--font-display: "Playfair Display", "Fraunces", Georgia, serif;
--font-body: "Inter", "Manrope", "Segoe UI", Arial, sans-serif;
```

Başlık fontu için `--font-display`, gövde metni için `--font-body` değerini düzenleyebilirsiniz.

## İletişim formu

Form `app/api/contact/route.ts` API route'una gönderim yapar. Resend API anahtarı yoksa yerel geliştirmede placeholder modda çalışır ve mesajı konsola yazar.

Gerçek e-posta gönderimi için `.env.local` dosyasına şu alanları ekleyin:

```bash
RESEND_API_KEY="re_xxxxxxxxx"
CONTACT_TO_EMAIL="info@idrisdagkesen.av.tr"
CONTACT_FROM_EMAIL="web@idrisdagkesen.av.tr"
NEXT_PUBLIC_SITE_URL="https://www.idrisdagkesen.av.tr"
```

## SEO

- Makale sayfalarında SEO başlığı ve açıklaması frontmatter üzerinden otomatik üretilir.
- `app/sitemap.ts` ile `/sitemap.xml` oluşturulur.
- `app/robots.ts` ile `/robots.txt` oluşturulur.
- Site URL'i için `NEXT_PUBLIC_SITE_URL` değişkenini ayarlayın.

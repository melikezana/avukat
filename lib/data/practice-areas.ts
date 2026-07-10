import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  FileSignature,
  HeartHandshake,
  Scale,
  ShieldAlert,
  Users
} from "lucide-react";

export const practiceAreas = [
  {
    slug: "ceza-hukuku",
    title: "Ceza Hukuku",
    summary: "Soruşturma ve kovuşturma süreçlerinde savunma stratejisi, ifade hazırlığı ve dosya takibi.",
    note: "Placeholder içerik, sonradan detaylandırılabilir.",
    icon: ShieldAlert
  },
  {
    slug: "aile-hukuku",
    title: "Aile Hukuku",
    summary: "Boşanma, velayet, nafaka, mal rejimi ve aile içi uyuşmazlıklarda süreç yönetimi.",
    note: "Ön görüşmede süreç ve olası riskler netleştirilir.",
    icon: HeartHandshake
  },
  {
    slug: "ticaret-hukuku",
    title: "Ticaret Hukuku",
    summary: "Şirketler, sözleşmeler, alacak takibi ve ticari uyuşmazlıklarda hukuki danışmanlık.",
    note: "Kurumsal ihtiyaçlara göre düzenlenebilir.",
    icon: Building2
  },
  {
    slug: "is-hukuku",
    title: "İş Hukuku",
    summary: "İşçi ve işveren uyuşmazlıkları, işe iade, tazminat ve sözleşme süreçleri.",
    note: "Arabuluculuk öncesi hazırlık desteklenir.",
    icon: BriefcaseBusiness
  },
  {
    slug: "miras-hukuku",
    title: "Miras Hukuku",
    summary: "Miras paylaşımı, tenkis, vasiyetname ve mirasçılık belgelerine ilişkin hukuki yol haritası.",
    note: "Aile ilişkilerini gözeten ölçülü yaklaşım.",
    icon: Users
  },
  {
    slug: "gayrimenkul-hukuku",
    title: "Gayrimenkul Hukuku",
    summary: "Kira, tahliye, tapu iptali, kat mülkiyeti ve taşınmaz uyuşmazlıklarında destek.",
    note: "Belgeler üzerinden ön değerlendirme yapılır.",
    icon: FileSignature
  },
  {
    slug: "tuketici-hukuku",
    title: "Tüketici Hukuku",
    summary: "Ayıplı mal, abonelik, mesafeli satış ve tüketici hakem heyeti süreçlerinde rehberlik.",
    note: "Vatandaş odaklı sade bilgilendirme.",
    icon: BadgeCheck
  },
  {
    slug: "idare-hukuku",
    title: "İdare Hukuku",
    summary: "İdari işlemlere itiraz, iptal davaları ve kamu kurumlarıyla yaşanan uyuşmazlıklar.",
    note: "Süre takibi özellikle önemlidir.",
    icon: Scale
  }
];

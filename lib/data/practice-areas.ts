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
    summary: "İfade, soruşturma ve dava süreçlerinde hakların korunmasına yönelik savunma ve danışmanlık desteği.",
    note: "İlk adım: dosyadaki iddiayı, delilleri ve süreleri birlikte netleştirmek.",
    icon: ShieldAlert
  },
  {
    slug: "aile-hukuku",
    title: "Aile Hukuku",
    summary: "Boşanma, velayet, nafaka ve mal paylaşımı gibi hassas konularda dikkatli ve ölçülü hukuki destek.",
    note: "Amaç: hem hakları hem de sürecin insani yönünü gözetmek.",
    icon: HeartHandshake
  },
  {
    slug: "ticaret-hukuku",
    title: "Ticaret Hukuku",
    summary: "Sözleşme, alacak, şirket ve ticari uyuşmazlıklarda riskleri doğru değerlendirmeye yönelik danışmanlık.",
    note: "Belgeler ayrıntılı incelenir, seçenekler anlaşılır şekilde anlatılır.",
    icon: Building2
  },
  {
    slug: "is-hukuku",
    title: "İş Hukuku",
    summary: "İşçi ve işveren uyuşmazlıklarında alacak, tazminat, işe iade ve arabuluculuk süreçlerine destek.",
    note: "Arabuluculuk öncesi talepler ve belgeler net bir liste halinde değerlendirilir.",
    icon: BriefcaseBusiness
  },
  {
    slug: "miras-hukuku",
    title: "Miras Hukuku",
    summary: "Miras paylaşımı, vasiyet, mirasçılık belgesi ve aile içi uyuşmazlıklarda hukuki yönlendirme.",
    note: "Haklar, belgeler ve olası yollar adım adım açıklanır.",
    icon: Users
  },
  {
    slug: "gayrimenkul-hukuku",
    title: "Gayrimenkul Hukuku",
    summary: "Kira, tahliye, tapu, apartman ve taşınmaz sorunlarında belgelere dayalı hukuki destek.",
    note: "Sözleşme, dekont ve yazışmalar birlikte değerlendirilir.",
    icon: FileSignature
  },
  {
    slug: "tuketici-hukuku",
    title: "Tüketici Hukuku",
    summary: "Ayıplı ürün, abonelik, mesafeli satış ve hakem heyeti başvurularında hukuki yol gösterme.",
    note: "Amaç: kişinin hakkını hangi yolla arayabileceğini açıkça anlaması.",
    icon: BadgeCheck
  },
  {
    slug: "idare-hukuku",
    title: "İdare Hukuku",
    summary: "Kamu kurumlarıyla yaşanan işlemler, itirazlar ve iptal davalarında süre odaklı destek.",
    note: "Kısa başvuru süreleri nedeniyle zamanlama özellikle önemlidir.",
    icon: Scale
  }
];

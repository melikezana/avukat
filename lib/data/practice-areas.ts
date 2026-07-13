import {
  BriefcaseBusiness,
  Building2,
  FileSignature,
  HeartHandshake,
  ShieldAlert,
  Home
} from "lucide-react";

export const practiceAreas = [
  {
    slug: "kira-hukuku",
    title: "Kira Hukuku",
    summary: "Kira bedeli, tahliye, depozito, aidat ve kira sözleşmesinden doğan uyuşmazlıklarda belge ve süre odaklı hukuki destek.",
    note: "İlk adım: sözleşme, ödeme kayıtları ve yazılı bildirimleri birlikte değerlendirmek.",
    icon: Home
  },
  {
    slug: "is-hukuku",
    title: "İş Hukuku",
    summary: "İşçi ve işveren uyuşmazlıklarında alacak, tazminat, işe iade ve arabuluculuk süreçlerine destek.",
    note: "Arabuluculuk öncesi talepler ve belgeler net bir liste halinde değerlendirilir.",
    icon: BriefcaseBusiness
  },
  {
    slug: "aile-hukuku",
    title: "Aile Hukuku",
    summary: "Boşanma, velayet, nafaka ve mal paylaşımı gibi hassas konularda dikkatli ve ölçülü hukuki destek.",
    note: "Amaç: hem hakları hem de sürecin insani yönünü gözetmek.",
    icon: HeartHandshake
  },
  {
    slug: "ceza-hukuku",
    title: "Ceza Hukuku",
    summary: "İfade, soruşturma ve dava süreçlerinde hakların korunmasına yönelik savunma ve danışmanlık desteği.",
    note: "İlk adım: dosyadaki iddiayı, delilleri ve süreleri birlikte netleştirmek.",
    icon: ShieldAlert
  },
  {
    slug: "ticaret-hukuku",
    title: "Ticaret Hukuku",
    summary: "Sözleşme, alacak, şirket ve ticari uyuşmazlıklarda riskleri doğru değerlendirmeye yönelik danışmanlık.",
    note: "Belgeler ayrıntılı incelenir, seçenekler anlaşılır şekilde anlatılır.",
    icon: Building2
  },
  {
    slug: "gayrimenkul-hukuku",
    title: "Gayrimenkul Hukuku",
    summary: "Kira, tahliye, tapu, apartman ve taşınmaz sorunlarında belgelere dayalı hukuki destek.",
    note: "Sözleşme, dekont ve yazışmalar birlikte değerlendirilir.",
    icon: FileSignature
  }
];

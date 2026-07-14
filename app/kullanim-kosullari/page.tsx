import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description: "Av. İdris Dağkesen web sitesi kullanım koşulları ve genel bilgilendirme sınırları.",
  alternates: {
    canonical: "/kullanim-kosullari"
  }
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Koşullar"
      title="Kullanım Koşulları"
      currentHref="/kullanim-kosullari"
      description="Bu koşullar, sitedeki hukuk yazılarının ve iletişim formunun hangi sınırlar içinde kullanıldığını açıklar."
      sections={[
        {
          title: "Genel bilgilendirme",
          body: (
            <p>
              Bu sitedeki içerikler genel bilgilendirme amacı taşır. Hiçbir metin, somut olayınıza ilişkin hukuki danışmanlık, avukat-müvekkil ilişkisi veya sonuç garantisi anlamına gelmez.
            </p>
          )
        },
        {
          title: "İçeriklerin kullanımı",
          body: (
            <p>
              Yazılar kaynak gösterilmeden çoğaltılamaz. Güncel mevzuat, yargı kararları ve olayın özellikleri farklı sonuçlar doğurabileceğinden içerikler tek başına işlem yapma dayanağı olarak kullanılmamalıdır.
            </p>
          )
        },
        {
          title: "İletişim formu",
          body: (
            <p>
              Form üzerinden gönderilen bilgiler ön değerlendirme içindir. Acil süreler, dava ve başvuru tarihleri için doğrudan profesyonel hukuki destek alınmalıdır.
            </p>
          )
        },
        {
          title: "Bağlantılar",
          body: (
            <p>
              Gizlilik ve veri işleme bilgileri için <Link href="/gizlilik">Gizlilik Politikası</Link> ve <Link href="/kvkk-aydinlatma">KVKK Aydınlatma Metni</Link> sayfalarını inceleyebilirsiniz.
            </p>
          )
        }
      ]}
    />
  );
}

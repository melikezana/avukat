import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { contactInfo } from "@/lib/site-profile";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "Av. İdris Dağkesen web sitesinin gizlilik ve kişisel veri işleme bilgilendirmesi.",
  alternates: {
    canonical: "/gizlilik"
  }
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Gizlilik"
      title="Gizlilik Politikası"
      currentHref="/gizlilik"
      description="Bu metin site ziyaretleri ve iletişim formu kullanımı sırasında işlenen veriler hakkında profesyonel taslak bilgilendirme sunar."
      sections={[
        {
          title: "Kapsam",
          body: (
            <p>
              Bu politika, Av. İdris Dağkesen web sitesinin ziyaret edilmesi, hukuk yazılarının incelenmesi ve iletişim formu üzerinden talep iletilmesi sırasında ortaya çıkabilecek veri işleme faaliyetlerini açıklar.
            </p>
          )
        },
        {
          title: "Toplanan bilgiler",
          body: (
            <p>
              İletişim formunda ad soyad, e-posta adresi, konu ve mesaj içeriği işlenebilir. Site, zorunlu olmayan pazarlama izni toplamaz ve gereksiz kişisel veri istememeyi amaçlar.
            </p>
          )
        },
        {
          title: "Analitik tercihleri",
          body: (
            <p>
              Google Analytics veya Google Tag Manager yalnızca ilgili ortam değişkenleri tanımlıysa ve kullanıcı analitik tercihini kabul ederse yüklenir. Vercel Analytics ve Speed Insights, performans ve genel kullanım ölçümü için Vercel altyapısı üzerinden çalışabilir.
            </p>
          )
        },
        {
          title: "İletişim",
          body: (
            <p>
              Gizlilikle ilgili talepleriniz için <a href={contactInfo.emailHref}>{contactInfo.email}</a> adresinden veya <Link href="/iletisim">iletişim sayfasından</Link> ulaşabilirsiniz.
            </p>
          )
        }
      ]}
    />
  );
}

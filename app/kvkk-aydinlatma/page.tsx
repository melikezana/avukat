import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { contactInfo } from "@/lib/site-profile";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "İletişim formu ve web sitesi kullanımı için KVKK aydınlatma metni taslağı.",
  alternates: {
    canonical: "/kvkk-aydinlatma"
  }
};

export default function KvkkPage() {
  return (
    <LegalPage
      eyebrow="KVKK"
      title="KVKK Aydınlatma Metni"
      currentHref="/kvkk-aydinlatma"
      description="Bu metin 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında bilgilendirme amacıyla hazırlanmış taslak niteliktedir."
      sections={[
        {
          title: "Veri sorumlusu",
          body: (
            <p>
              Bu taslak kapsamında veri sorumlusu Av. İdris Dağkesen olarak kabul edilmiştir. Nihai yayın öncesinde unvan, adres ve iletişim bilgilerinin hukukçu tarafından kontrol edilmesi gerekir.
            </p>
          )
        },
        {
          title: "İşleme amaçları",
          body: (
            <p>
              İletişim taleplerinin değerlendirilmesi, randevu ve geri dönüş süreçlerinin yürütülmesi, hukuki hizmet talebinin ilk aşamada anlaşılması ve site güvenliğinin sağlanması amaçlarıyla sınırlı veri işlenebilir.
            </p>
          )
        },
        {
          title: "Saklama yaklaşımı",
          body: (
            <p>
              İletişim mesajları, talebin değerlendirilmesi ve olası uyuşmazlıkların yönetimi için gerekli makul süre boyunca saklanmalıdır. Kesin saklama süresi ofis politikasına göre belirlenmeli ve düzenli olarak gözden geçirilmelidir.
            </p>
          )
        },
        {
          title: "Haklarınız",
          body: (
            <p>
              KVKK kapsamındaki başvuru haklarınızı kullanmak için <a href={contactInfo.emailHref}>{contactInfo.email}</a> adresine yazabilir veya <Link href="/iletisim">iletişim formunu</Link> kullanabilirsiniz.
            </p>
          )
        }
      ]}
    />
  );
}

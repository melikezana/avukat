import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ArticleCreateForm } from "@/components/admin/article-create-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Yeni Makale"
};

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/yonetim-giris?next=/admin/makaleler/yeni");
  }
}

export default async function NewAdminArticlePage() {
  await requireAdmin();

  return (
    <section>
      <div className="mb-6">
        <Link
          href="/admin/makaleler"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-gold)] transition hover:text-[var(--color-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Makalelere dön
        </Link>
        <h2 className="font-display text-2xl font-bold tracking-normal text-[var(--color-navy)]">Yeni Makale</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5a52]">Yeni içerik bilgilerini düzenleyin.</p>
      </div>

      <ArticleCreateForm />
    </section>
  );
}

import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Yönetim Girişi"
};

type AdminLoginPageProps = {
  searchParams?: {
    next?: string;
  };
};

export default function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-12 text-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-slate-950 text-white">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-normal">Yönetim Girişi</h1>
            <p className="mt-1 text-sm text-slate-600">Oturum doğrulaması gereklidir.</p>
          </div>
        </div>
        <AdminLoginForm nextPath={searchParams?.next} />
      </div>
    </section>
  );
}

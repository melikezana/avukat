import type { Metadata } from "next";
import { MediaLibrary, type MediaItem } from "@/components/admin/media-library";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Medya Kütüphanesi"
};

export const dynamic = "force-dynamic";

type AdminUploadsPageProps = {
  searchParams?: {
    folder?: string;
    q?: string;
    page?: string;
  };
};

type StorageListItem = {
  name: string;
  id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: {
    size?: number;
  } | null;
};

const folders = ["article-covers", "article-content"] as const;
const pageSize = 30;

function getActiveFolder(value?: string) {
  return value === "article-covers" || value === "article-content" ? value : "all";
}

function getActivePage(value?: string) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

async function getMediaItems(folderFilter: string, query: string, page: number) {
  try {
    const adminSupabase = createSupabaseAdminClient();
    const selectedFolders = folderFilter === "all" ? folders : [folderFilter as (typeof folders)[number]];
    const results = await Promise.all(
      selectedFolders.map(async (folder) => {
        const { data, error } = await adminSupabase.storage.from("article-images").list(folder, {
          limit: 1000,
          sortBy: {
            column: "created_at",
            order: "desc"
          }
        });

        if (error) {
          console.error("[admin.media.list]", {
            folder,
            status: error.status,
            statusCode: error.statusCode,
            message: error.message
          });

          return [] as MediaItem[];
        }

        return ((data ?? []) as StorageListItem[])
          .filter((item) => item.name)
          .map((item) => {
            const path = `${folder}/${item.name}`;
            const {
              data: { publicUrl }
            } = adminSupabase.storage.from("article-images").getPublicUrl(path);

            return {
              name: item.name,
              path,
              folder,
              publicUrl,
              size: item.metadata?.size ?? null,
              createdAt: item.created_at || item.updated_at || null
            } satisfies MediaItem;
          });
      })
    );

    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
    const allItems = results
      .flat()
      .filter((item) => !normalizedQuery || item.name.toLocaleLowerCase("tr-TR").includes(normalizedQuery))
      .sort((first, second) => new Date(second.createdAt ?? 0).getTime() - new Date(first.createdAt ?? 0).getTime());
    const start = (page - 1) * pageSize;

    return {
      items: allItems.slice(start, start + pageSize),
      total: allItems.length,
      loadError: false
    };
  } catch (error) {
    console.error("[admin.media.list]", error);

    return {
      items: [],
      total: 0,
      loadError: true
    };
  }
}

function buildPageHref(searchParams: AdminUploadsPageProps["searchParams"], page: number) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value) {
      params.set(key, value);
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }

  const query = params.toString();
  return query ? `/admin/yuklemeler?${query}` : "/admin/yuklemeler";
}

export default async function AdminUploadsPage({ searchParams }: AdminUploadsPageProps) {
  const activeFolder = getActiveFolder(searchParams?.folder);
  const activeQuery = searchParams?.q?.trim() ?? "";
  const activePage = getActivePage(searchParams?.page);
  const { items, total, loadError } = await getMediaItems(activeFolder, activeQuery, activePage);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold tracking-normal text-[var(--color-navy)]">Medya Kütüphanesi</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5a52]">
          `article-images` bucketındaki kapak ve içerik görsellerini yönetin. Silme işlemi önce makale kullanımı kontrol eder.
        </p>
      </div>

      <form className="mb-5 grid gap-3 rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] p-4 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end">
        <div>
          <label htmlFor="media-search" className="text-xs font-bold uppercase tracking-wide text-[#6c6254]">
            Dosya adı
          </label>
          <input
            id="media-search"
            name="q"
            type="search"
            defaultValue={activeQuery}
            placeholder="Dosya ara"
            className="mt-2 min-h-10 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)] focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          />
        </div>
        <div>
          <label htmlFor="media-folder" className="text-xs font-bold uppercase tracking-wide text-[#6c6254]">
            Klasör
          </label>
          <select
            id="media-folder"
            name="folder"
            defaultValue={activeFolder}
            className="mt-2 min-h-10 w-full rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-sm text-[var(--color-navy)] focus:border-[#c8a45d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          >
            <option value="all">Tümü</option>
            <option value="article-covers">article-covers</option>
            <option value="article-content">article-content</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-10 items-center justify-center rounded-[6px] bg-[var(--color-navy)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--color-navy-deep)]"
        >
          Filtrele
        </button>
      </form>

      {loadError ? (
        <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">
          Medya kütüphanesi şu anda yüklenemiyor. Supabase secret key ve bucket ayarlarını kontrol edin.
        </div>
      ) : (
        <>
          <MediaLibrary items={items} />
          <div className="mt-5 flex flex-col gap-3 rounded-[8px] border border-[#d8c7a8] bg-[#fffaf0] px-4 py-3 text-sm font-semibold text-[#6c6254] sm:flex-row sm:items-center sm:justify-between">
            <span>
              Toplam {total} kayıt, sayfa {Math.min(activePage, pageCount)} / {pageCount}
            </span>
            <div className="flex gap-2">
              <a
                href={buildPageHref(searchParams, Math.max(1, activePage - 1))}
                aria-disabled={activePage <= 1}
                className={`inline-flex min-h-9 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-xs font-bold text-[var(--color-navy)] ${activePage <= 1 ? "pointer-events-none opacity-50" : "hover:border-[#c8a45d]"}`}
              >
                Önceki
              </a>
              <a
                href={buildPageHref(searchParams, Math.min(pageCount, activePage + 1))}
                aria-disabled={activePage >= pageCount}
                className={`inline-flex min-h-9 items-center justify-center rounded-[6px] border border-[#d8c7a8] bg-white px-3 py-2 text-xs font-bold text-[var(--color-navy)] ${activePage >= pageCount ? "pointer-events-none opacity-50" : "hover:border-[#c8a45d]"}`}
              >
                Sonraki
              </a>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

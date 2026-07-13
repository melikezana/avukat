import { NextResponse } from "next/server";
import { getArticleBySlug } from "@/lib/articles";
import { routeErrorResponse, validationErrorResponse } from "@/lib/api/responses";
import { adminUnauthorizedResponse, requireAdminRequest } from "@/lib/admin/request";
import { ArticleStoreError, deleteArticleFile, updateArticleFile } from "@/lib/admin/articles-store";
import { articlePatchSchema } from "@/lib/admin/article-validation";

export const runtime = "nodejs";

type ArticleRouteParams = {
  params: {
    slug: string;
  };
};

export async function GET(_request: Request, { params }: ArticleRouteParams) {
  try {
    if (!(await requireAdminRequest())) {
      return adminUnauthorizedResponse();
    }

    const article = getArticleBySlug(params.slug);

    if (!article) {
      return NextResponse.json({ ok: false, message: "Makale bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, article });
  } catch (error) {
    return routeErrorResponse(error, "admin.articles.detail");
  }
}

export async function PATCH(request: Request, { params }: ArticleRouteParams) {
  try {
    if (!(await requireAdminRequest())) {
      return adminUnauthorizedResponse();
    }

    const parsed = articlePatchSchema.safeParse(await request.json());

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const article = await updateArticleFile(params.slug, parsed.data);

    return NextResponse.json({ ok: true, article });
  } catch (error) {
    if (error instanceof ArticleStoreError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }

    return routeErrorResponse(error, "admin.articles.update");
  }
}

export async function DELETE(_request: Request, { params }: ArticleRouteParams) {
  try {
    if (!(await requireAdminRequest())) {
      return adminUnauthorizedResponse();
    }

    const article = await deleteArticleFile(params.slug);

    return NextResponse.json({ ok: true, article });
  } catch (error) {
    if (error instanceof ArticleStoreError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }

    return routeErrorResponse(error, "admin.articles.delete");
  }
}

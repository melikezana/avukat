import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAllArticles } from "@/lib/articles";
import { routeErrorResponse, validationErrorResponse } from "@/lib/api/responses";
import { adminUnauthorizedResponse, requireAdminRequest } from "@/lib/admin/request";
import { ArticleStoreError, createArticleFile } from "@/lib/admin/articles-store";
import { articlePayloadSchema } from "@/lib/admin/article-validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!(await requireAdminRequest())) {
      return adminUnauthorizedResponse();
    }

    return NextResponse.json({ ok: true, articles: getAllArticles() });
  } catch (error) {
    return routeErrorResponse(error, "admin.articles.list");
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdminRequest())) {
      return adminUnauthorizedResponse();
    }

    const parsed = articlePayloadSchema.safeParse(await request.json());

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const article = await createArticleFile(parsed.data);

    return NextResponse.json({ ok: true, article }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    if (error instanceof ArticleStoreError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }

    return routeErrorResponse(error, "admin.articles.create");
  }
}

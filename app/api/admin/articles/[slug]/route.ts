import { NextResponse } from "next/server";
import { getArticleBySlug } from "@/lib/articles";
import { routeErrorResponse } from "@/lib/api/responses";
import {
  adminUnauthorizedResponse,
  adminWriteDisabledResponse,
  requireAdminRequest
} from "@/lib/admin/request";

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

export async function PATCH() {
  try {
    if (!(await requireAdminRequest())) {
      return adminUnauthorizedResponse();
    }

    return adminWriteDisabledResponse();
  } catch (error) {
    return routeErrorResponse(error, "admin.articles.update");
  }
}

export async function DELETE() {
  try {
    if (!(await requireAdminRequest())) {
      return adminUnauthorizedResponse();
    }

    return adminWriteDisabledResponse();
  } catch (error) {
    return routeErrorResponse(error, "admin.articles.delete");
  }
}

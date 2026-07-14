import { NextResponse } from "next/server";
import { getAllArticles } from "@/lib/articles";
import { routeErrorResponse } from "@/lib/api/responses";
import {
  adminUnauthorizedResponse,
  adminWriteDisabledResponse,
  requireAdminRequest
} from "@/lib/admin/request";

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

export async function POST() {
  try {
    if (!(await requireAdminRequest())) {
      return adminUnauthorizedResponse();
    }

    return adminWriteDisabledResponse();
  } catch (error) {
    return routeErrorResponse(error, "admin.articles.create");
  }
}

import { NextRequest } from "next/server";
import { forwardRequest } from "@/lib/bff-proxy";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return forwardRequest(request, `/users/${id}${request.nextUrl.search}`);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return forwardRequest(request, `/users/${id}`);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return forwardRequest(request, `/users/${id}`);
}

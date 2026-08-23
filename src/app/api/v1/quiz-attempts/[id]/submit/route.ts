import { NextRequest } from "next/server";
import { forwardRequest } from "@/lib/bff-proxy";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return forwardRequest(request, `/quiz-attempts/${id}/submit`);
}
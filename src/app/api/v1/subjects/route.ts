import { NextRequest } from "next/server";
import { forwardRequest } from "@/lib/bff-proxy";

export async function GET(request: NextRequest) {
  return forwardRequest(request, `/subjects${request.nextUrl.search}`);
}
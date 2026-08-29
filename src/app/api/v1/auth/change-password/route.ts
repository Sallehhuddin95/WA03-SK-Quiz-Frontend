import { NextRequest } from "next/server";
import { forwardRequest } from "@/lib/bff-proxy";

export async function POST(request: NextRequest) {
  return forwardRequest(request, "/auth/change-password");
}

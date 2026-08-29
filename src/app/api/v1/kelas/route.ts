import { NextRequest } from "next/server";
import { forwardRequest } from "@/lib/bff-proxy";

export async function GET(request: NextRequest) {
  return forwardRequest(request, "/kelas");
}

export async function POST(request: NextRequest) {
  return forwardRequest(request, "/kelas");
}
